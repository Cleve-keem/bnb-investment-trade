-- =============================================================================
-- 025_reference_wireup.sql
-- Replaces the ad-hoc 'PREFIX-' || gen_random_uuid() references from
-- 016_functions.sql with the generate_reference() helper added in
-- 021_helper_functions.sql, so every reference is sortable/readable
-- (e.g. ADM-20260801-000012 instead of a raw UUID).
--
-- No columns, tables, or signatures change here -- purely swapping the
-- reference string that gets generated inside each function body.
-- =============================================================================

-- IMPORTANT:
-- credit_wallet(), debit_wallet(), and log_audit() must be defined before
-- the higher-level functions in this migration call them.
-- =============================================================================


-- =============================================================================
-- CORE WALLET CREDIT
-- =============================================================================

create or replace function public.credit_wallet(
    p_wallet_id uuid,
    p_amount numeric,
    p_transaction_type public.wallet_transaction_type,
    p_reference text,
    p_description text default null,
    p_created_by uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet public.wallets;
    v_balance_before numeric(18,2);
    v_balance_after numeric(18,2);
    v_transaction_id uuid;
    v_created_by uuid := p_created_by;
begin

    if p_amount <= 0 then
        raise exception
            'credit_wallet: amount must be greater than zero';
    end if;

    -- Lock wallet for concurrency safety.
    select *
    into v_wallet
    from public.wallets
    where id = p_wallet_id
    for update;

    if not found then
        raise exception
            'credit_wallet: wallet % not found',
            p_wallet_id;
    end if;

    if v_wallet.status <> 'active' then
        raise exception
            'credit_wallet: wallet % is not active',
            p_wallet_id;
    end if;

    v_balance_before := v_wallet.balance;
    v_balance_after := v_balance_before + p_amount;

    -- Update wallet balance.
    update public.wallets
    set
        balance = v_balance_after,
        version = version + 1,
        updated_at = timezone('utc', now())
    where id = p_wallet_id;

    -- Create immutable ledger entry.
    insert into public.wallet_transactions (
        wallet_id,
        amount,
        balance_before,
        balance_after,
        transaction_type,
        reference,
        description,
        currency,
        metadata,
        created_by
    )
    values (
        p_wallet_id,
        p_amount,
        v_balance_before,
        v_balance_after,
        p_transaction_type,
        p_reference,
        p_description,
        v_wallet.currency,
        '{}'::jsonb,
        v_created_by
    )
    returning id into v_transaction_id;

    return v_transaction_id;
end;
$$;


-- =============================================================================
-- CORE WALLET DEBIT
-- =============================================================================

create or replace function public.debit_wallet(
    p_wallet_id uuid,
    p_amount numeric,
    p_transaction_type public.wallet_transaction_type,
    p_reference text,
    p_description text default null,
    p_created_by uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_wallet public.wallets;
    v_balance_before numeric(18,2);
    v_balance_after numeric(18,2);
    v_spendable_balance numeric(18,2);
    v_transaction_id uuid;
    v_created_by uuid := p_created_by;
begin

    if p_amount <= 0 then
        raise exception
            'debit_wallet: amount must be greater than zero';
    end if;

    -- Lock wallet for concurrency safety.
    select *
    into v_wallet
    from public.wallets
    where id = p_wallet_id
    for update;

    if not found then
        raise exception
            'debit_wallet: wallet % not found',
            p_wallet_id;
    end if;

    if v_wallet.status <> 'active' then
        raise exception
            'debit_wallet: wallet % is not active',
            p_wallet_id;
    end if;

    v_balance_before := v_wallet.balance;

    -- Locked funds cannot be spent.
    v_spendable_balance :=
        v_wallet.balance - v_wallet.locked_balance;

    if p_amount > v_spendable_balance then
        raise exception
            'debit_wallet: insufficient spendable balance. Available: %, requested: %',
            v_spendable_balance,
            p_amount;
    end if;

    v_balance_after := v_balance_before - p_amount;

    -- Update wallet.
    update public.wallets
    set
        balance = v_balance_after,
        version = version + 1,
        updated_at = timezone('utc', now())
    where id = p_wallet_id;

    -- Create immutable ledger entry.
    insert into public.wallet_transactions (
        wallet_id,
        amount,
        balance_before,
        balance_after,
        transaction_type,
        reference,
        description,
        currency,
        created_by,
        metadata
    )
    values (
        p_wallet_id,
        -p_amount,
        v_balance_before,
        v_balance_after,
        p_transaction_type,
        p_reference,
        p_description,
        v_wallet.currency,
        v_created_by,
        '{}'::jsonb
    )
    returning id into v_transaction_id;

    return v_transaction_id;
end;
$$;


-- =============================================================================
-- CORE AUDIT LOGGER
-- =============================================================================

create or replace function public.log_audit(
    p_actor_id uuid,
    p_action text,
    p_entity text,
    p_entity_id uuid,
    p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_audit_id uuid;
    v_reference text;
    v_actor_role public.user_role;
    v_target_user_id uuid;
begin

    v_reference := 'AUD-' || upper(
    replace(gen_random_uuid()::text, '-', '')
);

    -- Get actor's role when an actor exists.
    if p_actor_id is not null then

        select role
        into v_actor_role
        from public.users
        where id = p_actor_id;

    end if;

    -- Try to identify the target user.
    v_target_user_id := p_actor_id;

    insert into public.audit_logs (
        id,
        reference,
        actor_id,
        actor_role,
        target_user_id,
        action,
        entity,
        entity_id,
        action_status,
        metadata
    )
    values (
        gen_random_uuid(),
        v_reference,
        p_actor_id,
        v_actor_role,
        v_target_user_id,
        p_action,
        p_entity,
        p_entity_id,
        'success',
        coalesce(p_metadata, '{}'::jsonb)
    )
    returning id into v_audit_id;

    return v_audit_id;

end;
$$;

-- =============================================================================
-- ADMIN AUTHORIZATION
-- =============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.users
        where id = auth.uid()
          and role in ('admin', 'super_admin')
          and status = 'active'
    );
$$;

revoke all on function public.is_admin() from public;

grant execute on function public.is_admin()
to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- admin_adjust_wallet(): was 'ADM-' || gen_random_uuid()
-- -----------------------------------------------------------------------------
create or replace function public.admin_adjust_wallet(
    p_wallet_id       uuid,
    p_amount          numeric,
    p_adjustment_type public.adjustment_type,
    p_reason          text,
    p_notes           text default null
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

    if not public.is_admin() then
        raise exception
            'admin_adjust_wallet: caller is not an admin';
    end if;

    if p_amount = 0 then
        raise exception
            'admin_adjust_wallet: amount must be non-zero';
    end if;

    if not exists (
        select 1
        from public.wallets
        where id = p_wallet_id
    ) then
        raise exception
            'admin_adjust_wallet: wallet % not found',
            p_wallet_id;
    end if;

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

    insert into public.admin_wallet_adjustments (
        reference,
        wallet_transaction_id,
        wallet_id,
        user_id,
        admin_id,
        adjustment_type,
        reason,
        notes
    )
    values (
        v_reference,
        v_txn,
        p_wallet_id,
        (
            select user_id
            from public.wallets
            where id = p_wallet_id
        ),
        v_admin_id,
        p_adjustment_type,
        p_reason,
        p_notes
    )
    returning * into v_adj;

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
-- create_investment(): was 'INV-' || gen_random_uuid()
-- Also swaps the inline profit math for the calculate_roi() helper.
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
  v_user_id  uuid := auth.uid();
  v_wallet   public.wallets;
  v_plan     public.investment_plans;
  v_profit   numeric(18,2);
  v_inv      public.investments;
  v_ref      text := public.generate_reference('INV');
begin
  if v_user_id is null then
    raise exception 'create_investment: no authenticated user';
  end if;

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then
    raise exception 'create_investment: wallet not found for current user';
  end if;

  select * into v_plan from public.investment_plans where id = p_plan_id for update;
  if not found or v_plan.status <> 'active' then
    raise exception 'create_investment: plan % is not available', p_plan_id;
  end if;

  if p_amount <= 0 then
    raise exception
        'create_investment: amount must be greater than zero';
  end if;

  if p_amount < v_plan.minimum_amount
     or (v_plan.maximum_amount is not null and p_amount > v_plan.maximum_amount) then
    raise exception 'create_investment: amount % outside plan bounds [%, %]',
      p_amount, v_plan.minimum_amount, v_plan.maximum_amount;
  end if;

  v_profit := public.calculate_roi(p_amount, v_plan.roi_percentage);

  perform public.debit_wallet(
    v_wallet.id, p_amount, 'investment_debit', v_ref, 'Invested in ' || v_plan.name, v_user_id
  );

  insert into public.investments (
    user_id, wallet_id, plan_id, plan_name, duration_days, amount, roi_percentage,
    expected_profit, total_return, status, started_at, matures_at
  )
  values (
    v_user_id, v_wallet.id, p_plan_id, v_plan.name, v_plan.duration_days, p_amount, v_plan.roi_percentage, v_profit, p_amount + v_profit, 'active', now(),
    public.calculate_maturity_date(now(), v_plan.duration_days)
  )
  returning * into v_inv;

  perform public.create_notification(
    v_user_id, 'Investment Successful',
    format('Your %s investment of %s is now active.', v_plan.name, p_amount),
    'investment_created'
  );

  perform public.log_audit(v_user_id, 'create_investment', 'investment', v_inv.id,
    jsonb_build_object('plan_id', p_plan_id, 'amount', p_amount, 'reference', v_ref));

  return v_inv;
end;
$$;

-- -----------------------------------------------------------------------------
-- complete_investment(): was 'INVRET-' || v_inv.id and 'PROFIT-' || v_inv.id
-- -----------------------------------------------------------------------------
create or replace function public.complete_investment(
  p_investment_id  uuid
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv       public.investments;
  v_ref_ret   text := public.generate_reference('INVRET');
  v_ref_prof  text := public.generate_reference('PROFIT');
begin
  select * into v_inv from public.investments where id = p_investment_id for update;

  if not found then
    raise exception 'complete_investment: investment % not found', p_investment_id;
  end if;

  if v_inv.status <> 'active' then
    raise exception 'complete_investment: investment % is not active (status=%)', p_investment_id, v_inv.status;
  end if;

  if v_inv.matures_at > now() then
    raise exception 'complete_investment: investment % has not matured yet', p_investment_id;
  end if;

  perform public.credit_wallet(
    v_inv.wallet_id, v_inv.amount, 'investment_return',
    v_ref_ret, 'Principal returned for investment ' || v_inv.id, null
  );

  perform public.credit_wallet(
    v_inv.wallet_id, v_inv.expected_profit, 'profit_payout',
    v_ref_prof, 'Profit payout for investment ' || v_inv.id, null
  );

  update public.investments
    set status = 'completed', completed_at = now()
    where id = p_investment_id
    returning * into v_inv;

  perform public.create_notification(
    v_inv.user_id, 'Investment Matured',
    format('Your investment has matured. %s credited to your wallet.', v_inv.total_return),
    'investment_matured'
  );

  perform public.log_audit(null, 'complete_investment', 'investment', v_inv.id,
    jsonb_build_object('total_return', v_inv.total_return,
                        'principal_reference', v_ref_ret, 'profit_reference', v_ref_prof));

  return v_inv;
end;
$$;

-- Grants are unaffected by CREATE OR REPLACE -- all three keep the same
-- execute permissions set in 016_functions.sql.