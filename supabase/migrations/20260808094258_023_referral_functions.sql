-- =============================================================================
-- 023_referral_functions.sql
-- Completes referrals and rewards the referrer.
--
-- Reward amount is read from system_settings.
-- Reward is paid exactly once.
--
-- Review fixes applied:
--   #8  complete_referral() no longer fails the whole call if
--       reward_referrer() throws -- a referral reward hiccup must never
--       roll back the referral's own completion. The failure is caught
--       and logged instead of silently swallowed.
--   #11 complete_referral() now takes the most recent referral row and
--       locks it defensively, in case duplicate referral rows ever exist
--       for the same referred user.
-- =============================================================================


-- =============================================================================
-- reward_referrer()
-- (unchanged -- no review items applied here)
-- =============================================================================

create or replace function public.reward_referrer(
    p_referral_id uuid
)
returns public.referrals
language plpgsql
security definer
set search_path = public
as $$
declare
    v_ref public.referrals;
    v_wallet public.wallets;
    v_reference text;
    v_reward numeric;
begin
    --------------------------------------------------------------------------
    -- Lock referral
    --------------------------------------------------------------------------
    select *
    into v_ref
    from public.referrals
    where id = p_referral_id
    for update;

    if not found then
        raise exception
            'reward_referrer: referral % not found',
            p_referral_id;
    end if;

    --------------------------------------------------------------------------
    -- Only completed referrals may be rewarded
    --------------------------------------------------------------------------
    if v_ref.status <> 'completed' then
        raise exception
            'reward_referrer: referral is not completed';
    end if;

    --------------------------------------------------------------------------
    -- Already rewarded
    --------------------------------------------------------------------------
    if v_ref.reward_amount > 0 then
        return v_ref;
    end if;

    --------------------------------------------------------------------------
    -- Get reward amount from settings
    --------------------------------------------------------------------------
    v_reward :=
        coalesce(
            public.get_setting_numeric('referral_reward_amount'),
            0
        );

    if v_reward <= 0 then
        return v_ref;
    end if;

    --------------------------------------------------------------------------
    -- Referrer's wallet
    --------------------------------------------------------------------------
    select *
    into v_wallet
    from public.wallets
    where user_id = v_ref.referrer_id
    for update;

    if not found then
        raise exception
            'reward_referrer: wallet not found';
    end if;

    --------------------------------------------------------------------------
    -- Generate reference
    --------------------------------------------------------------------------
    v_reference :=
        public.generate_reference('REF');

    --------------------------------------------------------------------------
    -- Credit wallet
    --------------------------------------------------------------------------
    perform public.credit_wallet(
        v_wallet.id,
        v_reward,
        'referral_reward',
        v_reference,
        'Referral reward',
        null
    );

    --------------------------------------------------------------------------
    -- Store reward snapshot
    --------------------------------------------------------------------------
    update public.referrals
    set reward_amount = v_reward
    where id = v_ref.id
    returning *
    into v_ref;

    --------------------------------------------------------------------------
    -- Notify
    --------------------------------------------------------------------------
    perform public.create_notification(
        v_ref.referrer_id,
        'Referral Reward',
       format(
            '%s %s has been credited to your wallet for a successful referral.',
            v_wallet.currency,
            v_reward
        ),
        'referral_reward'
    );

    --------------------------------------------------------------------------
    -- Audit
    --------------------------------------------------------------------------
    perform public.log_audit(
        null,
        'reward_referrer',
        'referral',
        v_ref.id,
        jsonb_build_object(
            'reward_amount', v_reward,
            'reference', v_reference
        )
    );

    return v_ref;
end;
$$;

revoke all on function public.reward_referrer(uuid) from public;
grant execute on function public.reward_referrer(uuid) to service_role;


-- =============================================================================
-- complete_referral()
-- =============================================================================

create or replace function public.complete_referral(
    p_referred_user_id uuid
)
returns public.referrals
language plpgsql
security definer
set search_path = public
as $$
declare
    v_ref public.referrals;
begin
    --------------------------------------------------------------------------
    -- Lock referral
    -- #11: order by created_at desc + limit 1, defensively, in case
    -- duplicate referral rows somehow exist for this referred user.
    --------------------------------------------------------------------------
    select *
    into v_ref
    from public.referrals
    where referred_user_id = p_referred_user_id
    order by created_at desc
    limit 1
    for update;

    if not found then
        raise exception
            'complete_referral: referral not found';
    end if;

    --------------------------------------------------------------------------
    -- Prevent rewarding cancelled referrals
    --------------------------------------------------------------------------
    if v_ref.status = 'cancelled' then
        raise exception
            'complete_referral: referral was cancelled';
    end if;

    --------------------------------------------------------------------------
    -- Already completed
    --------------------------------------------------------------------------
    if v_ref.status = 'completed' then
        return v_ref;
    end if;

    --------------------------------------------------------------------------
    -- Mark completed
    --------------------------------------------------------------------------
    update public.referrals
    set status = 'completed',
        updated_at = timezone('utc', now())
    where id = v_ref.id
    returning *
    into v_ref;

    --------------------------------------------------------------------------
    -- Reward referrer
    -- #8: isolated. A reward failure (e.g. missing wallet, bad setting)
    -- must never roll back the referral's own completion -- the referral
    -- being "completed" is the source of truth. The failure is caught and
    -- logged so it can be found and reconciled later, rather than swallowed.
    --------------------------------------------------------------------------
    begin
        perform public.reward_referrer(v_ref.id);
    exception
        when others then
            perform public.log_audit(
                null,
                'reward_referrer_failed',
                'referral',
                v_ref.id,
                jsonb_build_object('error', sqlerrm)
            );
    end;

    --------------------------------------------------------------------------
    -- Audit
    --------------------------------------------------------------------------
    perform public.log_audit(
        null,
        'complete_referral',
        'referral',
        v_ref.id,
        jsonb_build_object(
            'referred_user_id', p_referred_user_id
        )
    );

    return v_ref;
end;
$$;

revoke all on function public.complete_referral(uuid) from public;
grant execute on function public.complete_referral(uuid) to service_role;