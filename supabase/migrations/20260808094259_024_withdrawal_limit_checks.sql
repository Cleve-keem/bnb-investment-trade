-- =============================================================================
-- 023_referral_functions.sql
-- Completes referrals and rewards the referrer.
--
-- Reward amount is read from system_settings.
-- Reward is paid exactly once.
-- =============================================================================


-- =============================================================================
-- reward_referrer()
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
            '$%s has been credited to your wallet for a successful referral.',
            to_char(v_reward, 'FM999999999990.00')
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
    -- Lock the most recent referral defensively
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
    -- Prevent completing cancelled referrals
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
    -- Mark referral completed
    --------------------------------------------------------------------------
    update public.referrals
    set
        status = 'completed',
        updated_at = timezone('utc', now())
    where id = v_ref.id
    returning *
    into v_ref;

    --------------------------------------------------------------------------
    -- Reward referrer
    --
    -- A reward failure must not undo referral completion.
    --------------------------------------------------------------------------
    begin

        v_ref := public.reward_referrer(v_ref.id);

    exception
        when others then

            perform public.log_audit(
                null,
                'reward_referrer_failed',
                'referral',
                v_ref.id,
                jsonb_build_object(
                    'error', sqlerrm
                )
            );

    end;

    --------------------------------------------------------------------------
    -- Audit completion
    --------------------------------------------------------------------------
    perform public.log_audit(
        null,
        'complete_referral',
        'referral',
        v_ref.id,
        jsonb_build_object(
            'referred_user_id',
            p_referred_user_id
        )
    );

    return v_ref;

end;
$$;

revoke all on function public.complete_referral(uuid) from public;
grant execute on function public.complete_referral(uuid) to service_role;
