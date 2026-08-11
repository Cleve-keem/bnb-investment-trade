-- =============================================================================
-- 025_reference_wireup.sql
-- Replaces the ad-hoc 'PREFIX-' || gen_random_uuid() references from
-- 016_functions.sql with the generate_reference() helper added in
-- 021_helper_functions.sql, so every reference is sortable/readable
-- (e.g. ADM-20260801-000012 instead of a raw UUID).
--
-- Also folds in review fixes for create_investment() / complete_investment():
--   • create_investment() now checks maintenance mode, wallet status, and
--     spendable balance explicitly, and uses a single captured timestamp
--     instead of calling now() twice.
--   • complete_investment() is now idempotent (returns early if already
--     completed instead of raising), checks wallet status before paying
--     out, and intentionally does NOT check maintenance mode -- money
--     owed to a user should still be paid out even during maintenance.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- admin_adjust_wallet(): was 'ADM-' || gen_random_uuid()
-- (unchanged behaviorally from the previous 025 -- no review items applied here)
-- -----------------------------------------------------------------------------
create or replace function public.admin_adjust_wallet(
    p_wallet_id        uuid,
    p_amount           numeric,
    p_adjustment_type  public.adjustment_type,
    p_reason           text,
    p_notes            text default null
)
returns public.admin_wallet_adjustments
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id  uuid := auth.uid();
    v_txn       uuid;
    v_adj       public.admin_wallet_adjustments;
    v_reference text := public.generate_reference('ADM');
begin

    --------------------------------------------------------------------------
    -- Authorization
    --------------------------------------------------------------------------

    if not public.is_admin() then
        raise exception
            'admin_adjust_wallet: caller is not an admin';
    end if;


    --------------------------------------------------------------------------
    -- Validate amount
    --------------------------------------------------------------------------

    if p_amount is null or p_amount = 0 then
        raise exception
            'admin_adjust_wallet: amount must be non-zero';
    end if;


    --------------------------------------------------------------------------
    -- Adjust wallet
    --
    -- Positive amount = credit
    -- Negative amount = debit
    --------------------------------------------------------------------------

    if p_amount > 0 then

        v_txn := public.credit_wallet(
            p_wallet_id,
            p_amount,
            'admin_credit',
            v_reference,
            p_reason,
            v_admin_id
        );

    else

        v_txn := public.debit_wallet(
            p_wallet_id,
            abs(p_amount),
            'admin_debit',
            v_reference,
            p_reason,
            v_admin_id
        );

    end if;


    --------------------------------------------------------------------------
    -- Record administrative adjustment
    --------------------------------------------------------------------------

    insert into public.admin_wallet_adjustments (
        wallet_transaction_id,
        admin_id,
        adjustment_type,
        reason,
        notes
    )
    values (
        v_txn,
        v_admin_id,
        p_adjustment_type,
        p_reason,
        p_notes
    )
    returning *
    into v_adj;


    --------------------------------------------------------------------------
    -- Notify wallet owner
    --------------------------------------------------------------------------

    perform public.create_notification(
        (
            select user_id
            from public.wallets
            where id = p_wallet_id
        ),
        case
            when p_amount > 0
                then 'Wallet Credited'
            else 'Wallet Debited'
        end,
        p_reason,
        case
            when p_amount > 0
                then 'wallet_credit'
            else 'wallet_debit'
        end::public.notification_type
    );


    --------------------------------------------------------------------------
    -- Audit
    --------------------------------------------------------------------------

    perform public.log_audit(
        v_admin_id,
        'admin_adjust_wallet',
        'wallet',
        p_wallet_id,
        jsonb_build_object(
            'amount', p_amount,
            'adjustment_type', p_adjustment_type,
            'reason', p_reason,
            'reference', v_reference
        )
    );


    return v_adj;

end;
$$;

-- -----------------------------------------------------------------------------
-- create_investment()
--   Review items applied:
--     #1 maintenance-mode check
--     #2 wallet status check
--     #3 explicit spendable-balance check
--     #4 single captured timestamp (v_started_at) instead of two now() calls
-- -----------------------------------------------------------------------------
create or replace function public.create_investment(
  p_plan_id  uuid,
  p_amount   numeric
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id     uuid := auth.uid();
  v_wallet      public.wallets;
  v_plan        public.investment_plans;
  v_profit      numeric(18,2);
  v_inv         public.investments;
  v_ref         text := public.generate_reference('INV');
  v_started_at  timestamptz := timezone('utc', now());
  v_spendable   numeric(18,2);
begin
  if v_user_id is null then
    raise exception 'create_investment: no authenticated user';
  end if;

  -- #1: an admin must be able to pause new investments platform-wide.
  if public.is_maintenance_mode() then
    raise exception 'create_investment: investments are temporarily disabled for maintenance';
  end if;

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then
    raise exception 'create_investment: wallet not found for current user';
  end if;

  -- #2: a frozen/closed wallet must not be able to invest.
  if v_wallet.status <> 'active' then
    raise exception 'create_investment: wallet is not active (status=%)', v_wallet.status;
  end if;

  select * into v_plan from public.investment_plans where id = p_plan_id for update;
  if not found or v_plan.status <> 'active' then
    raise exception 'create_investment: plan % is not available', p_plan_id;
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception
        'create_investment: amount must be greater than zero';
end if;

if p_amount < v_plan.minimum_amount
or (
    v_plan.maximum_amount is not null
    and p_amount > v_plan.maximum_amount
) then
    raise exception
        'create_investment: amount % outside plan bounds [%, %]',
        p_amount,
        v_plan.minimum_amount,
        v_plan.maximum_amount;
end if;

  -- #3: explicit, clear pre-check. debit_wallet() enforces this too, but this
  -- gives a cleaner error before we've done any other work, and correctly
  -- accounts for locked_balance rather than just raw balance.
  v_spendable := v_wallet.balance - v_wallet.locked_balance;
  if v_spendable < p_amount then
    raise exception 'create_investment: insufficient wallet balance (have %, need %)', v_spendable, p_amount;
  end if;

  v_profit := public.calculate_roi(p_amount, v_plan.roi_percentage);

  perform public.debit_wallet(
    v_wallet.id, p_amount, 'investment_debit', v_ref, 'Invested in ' || v_plan.name, v_user_id
  );

  -- #4: one captured timestamp used for both started_at and the maturity calc.
  insert into public.investments (
    user_id, wallet_id, plan_id, amount, roi_percentage,
    expected_profit, total_return, status, started_at, matures_at
  )
  values (
    v_user_id, v_wallet.id, p_plan_id, p_amount, v_plan.roi_percentage,
    v_profit, p_amount + v_profit, 'active', v_started_at,
    public.calculate_maturity_date(v_started_at, v_plan.duration_days)
  )
  returning * into v_inv;

  perform public.create_notification(
    v_user_id, 'Investment Successful',
    format('Your %s investment of %s (ref %s) is now active.', v_plan.name, p_amount, v_ref),
    'investment_created'
  );

  perform public.log_audit(v_user_id, 'create_investment', 'investment', v_inv.id,
    jsonb_build_object('plan_id', p_plan_id, 'amount', p_amount, 'reference', v_ref));

  return v_inv;
end;
$$;

-- =============================================================================
-- complete_investment()
-- Final reviewed version
--
-- Responsibilities:
--   • Complete a matured investment
--   • Return principal to the user's wallet
--   • Pay expected profit
--   • Prevent duplicate payouts
--   • Continue payouts during maintenance mode
--   • Verify wallet status before payout
--   • Record notification and audit information
-- =============================================================================

create or replace function public.complete_investment(
    p_investment_id uuid
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
    v_inv          public.investments;
    v_wallet       public.wallets;
    v_ref_ret      text;
    v_ref_prof     text;
    v_completed_at timestamptz := timezone('utc', now());
begin

    -- =========================================================================
    -- Lock investment
    -- =========================================================================

    select *
    into v_inv
    from public.investments
    where id = p_investment_id
    for update;

    if not found then
        raise exception
            'complete_investment: investment % not found',
            p_investment_id;
    end if;


    -- =========================================================================
    -- Idempotency
    -- If another worker already completed this investment, simply return it.
    -- =========================================================================

    if v_inv.status = 'completed' then
        return v_inv;
    end if;


    -- =========================================================================
    -- Only active investments can be completed
    -- =========================================================================

    if v_inv.status <> 'active' then
        raise exception
            'complete_investment: investment % is not active (status=%)',
            p_investment_id,
            v_inv.status;
    end if;


    -- =========================================================================
    -- Investment must be matured
    -- =========================================================================

    if v_inv.matures_at > v_completed_at then
        raise exception
            'complete_investment: investment % has not matured yet',
            p_investment_id;
    end if;


    -- =========================================================================
    -- Maintenance mode intentionally does NOT block completion.
    --
    -- Money already owed to the user must still be paid.
    -- =========================================================================


    -- =========================================================================
    -- Lock wallet and verify status
    -- =========================================================================

    select *
    into v_wallet
    from public.wallets
    where id = v_inv.wallet_id
    for update;

    if not found then
        raise exception
            'complete_investment: wallet % not found',
            v_inv.wallet_id;
    end if;


    if v_wallet.status <> 'active' then
        raise exception
            'complete_investment: wallet % is not active (status=%), cannot pay out',
            v_wallet.id,
            v_wallet.status;
    end if;


    -- =========================================================================
    -- Generate payout references only when payout is actually happening.
    -- This avoids consuming sequence numbers on idempotent early returns.
    -- =========================================================================

    v_ref_ret := public.generate_reference('INVRET');
    v_ref_prof := public.generate_reference('PROFIT');


    -- =========================================================================
    -- Return principal
    -- =========================================================================

    perform public.credit_wallet(
        v_inv.wallet_id,
        v_inv.amount,
        'investment_return',
        v_ref_ret,
        'Principal returned for investment ' || v_inv.id,
        null
    );


    -- =========================================================================
    -- Pay profit
    -- =========================================================================

    perform public.credit_wallet(
        v_inv.wallet_id,
        v_inv.expected_profit,
        'profit_payout',
        v_ref_prof,
        'Profit payout for investment ' || v_inv.id,
        null
    );


    -- =========================================================================
    -- Mark investment as completed
    -- =========================================================================

    update public.investments
    set
        status = 'completed',
        completed_at = v_completed_at
    where id = p_investment_id
    returning *
    into v_inv;


    -- =========================================================================
    -- Notification
    -- =========================================================================

    perform public.create_notification(
        v_inv.user_id,
        'Investment Matured',
        format(
            'Investment %s has matured. %s credited to your wallet.',
            v_inv.id,
            v_inv.total_return
        ),
        'investment_matured'
    );


    -- =========================================================================
    -- Audit
    -- =========================================================================

    perform public.log_audit(
        null,
        'complete_investment',
        'investment',
        v_inv.id,
        jsonb_build_object(
            'total_return', v_inv.total_return,
            'principal_reference', v_ref_ret,
            'profit_reference', v_ref_prof
        )
    );


    return v_inv;

end;
$$;