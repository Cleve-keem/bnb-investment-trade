-- =============================================================================
-- 022_otp_functions.sql
-- Secure OTP generation and verification.
--
-- Only the service_role can generate OTPs.
-- Authenticated users can verify OTPs.
--
-- Improvements:
-- • Invalidates previous OTPs
-- • Maximum 5 attempts
-- • Burns OTP after max attempts
-- • Logs failed and successful verification
-- • UTC timestamps
-- =============================================================================


-- =============================================================================
-- GENERATE OTP
-- =============================================================================

create or replace function public.generate_otp(
    p_user_id uuid,
    p_purpose public.otp_purpose
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_code text;
    v_expiry_minutes numeric;
begin
    if p_user_id is null then
        raise exception 'generate_otp: user id is required';
    end if;

    if not exists (
        select 1
        from public.users
        where id = p_user_id
    ) then
        raise exception 'generate_otp: user not found';
    end if;

    --------------------------------------------------------------------------
    -- Invalidate previous unused OTPs
    --------------------------------------------------------------------------
    update public.otp_verifications
    set verified_at = timezone('utc', now())
    where user_id = p_user_id
      and purpose = p_purpose
      and verified_at is null;

    --------------------------------------------------------------------------
    -- Generate random 6-digit code
    --------------------------------------------------------------------------
    v_code :=
    lpad(
        (
            ('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint
            % 1000000
        )::text,
        6,
        '0'
    );

    v_expiry_minutes :=
        coalesce(public.get_setting_numeric('otp_expiry_minutes'), 10);

    --------------------------------------------------------------------------
    -- Store ONLY the bcrypt hash
    --------------------------------------------------------------------------
    insert into public.otp_verifications
    (
        user_id,
        otp_code_hash,
        purpose,
        expires_at
    )
    values
    (
        p_user_id,
        extensions.crypt(
            v_code,
            extensions.gen_salt('bf')
        ),
        p_purpose,
        timezone('utc', now())
            + make_interval(mins => v_expiry_minutes::int)
    );

    --------------------------------------------------------------------------
    -- Audit
    --------------------------------------------------------------------------
    perform public.log_audit(
        p_user_id,
        'generate_otp',
        'otp_verification',
        p_user_id,
        jsonb_build_object(
            'purpose',
            p_purpose
        )
    );

    return v_code;
end;
$$;

revoke all on function public.generate_otp(uuid, public.otp_purpose) from public;
grant execute on function public.generate_otp(uuid, public.otp_purpose) to service_role;


-- =============================================================================
-- VERIFY OTP
-- =============================================================================

create or replace function public.verify_otp(
    p_user_id uuid,
    p_purpose public.otp_purpose,
    p_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_otp public.otp_verifications;
begin

    if auth.role() <> 'service_role'
        and auth.uid() is distinct from p_user_id then
        raise exception 'verify_otp: unauthorized';
    end if;

    if p_code is null or length(trim(p_code)) = 0 then
        return false;
    end if;

    --------------------------------------------------------------------------
    -- Lock latest OTP
    --------------------------------------------------------------------------
    select *
    into v_otp
    from public.otp_verifications
    where user_id = p_user_id
      and purpose = p_purpose
      and verified_at is null
    order by created_at desc
    limit 1
    for update;

    if not found then
        return false;
    end if;

    --------------------------------------------------------------------------
    -- Expired
    --------------------------------------------------------------------------
    if v_otp.expires_at < timezone('utc', now()) then

        update public.otp_verifications
        set verified_at = timezone('utc', now())
        where id = v_otp.id;

        return false;
    end if;

    --------------------------------------------------------------------------
    -- Too many attempts
    --------------------------------------------------------------------------
    if v_otp.attempts >= 5 then
        return false;
    end if;

    --------------------------------------------------------------------------
    -- Invalid OTP
    --------------------------------------------------------------------------
    if extensions.crypt(p_code, v_otp.otp_code_hash)
        <> v_otp.otp_code_hash then

        update public.otp_verifications
        set attempts = attempts + 1
        where id = v_otp.id;

        ----------------------------------------------------------------------
        -- Burn OTP after fifth failure
        ----------------------------------------------------------------------
        update public.otp_verifications
        set verified_at = timezone('utc', now())
        where id = v_otp.id
          and attempts >= 5;

        perform public.log_audit(
            p_user_id,
            'verify_otp_failed',
            'otp_verification',
            v_otp.id,
            jsonb_build_object(
                'purpose', p_purpose,
                'attempts', v_otp.attempts + 1
            )
        );

        return false;
    end if;

    --------------------------------------------------------------------------
    -- Success
    --------------------------------------------------------------------------
    update public.otp_verifications
    set verified_at = timezone('utc', now())
    where id = v_otp.id;

    perform public.log_audit(
        p_user_id,
        'verify_otp_success',
        'otp_verification',
        v_otp.id,
        jsonb_build_object(
            'purpose', p_purpose
        )
    );

    return true;
end;
$$;

revoke all on function public.verify_otp(uuid, public.otp_purpose, text) from public;
grant execute on function public.verify_otp(uuid, public.otp_purpose, text) to authenticated, service_role;