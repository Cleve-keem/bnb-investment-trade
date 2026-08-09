-- =============================================================================
-- 021_helper_functions.sql
-- Shared helper functions used throughout the application.
--
-- Responsibilities:
--   • Generate business references
--   • Read system settings
--   • Read maintenance mode
--   • Calculate ROI
--   • Calculate maturity dates
--   • Validate investment requests
-- =============================================================================


-- =============================================================================
-- Reference Sequence
-- =============================================================================

create sequence if not exists public.reference_seq;

revoke all on sequence public.reference_seq from public;


-- =============================================================================
-- Generate Business Reference
-- Example:
-- INV-20260801-000001
-- WD-20260801-000002
-- ADM-20260801-000003
-- =============================================================================

create or replace function public.generate_reference(
    p_prefix text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_reference text;
begin
    if p_prefix is null or trim(p_prefix) = '' then
        raise exception 'Reference prefix cannot be empty.';
    end if;

    v_reference :=
        upper(trim(p_prefix))
        || '-'
        || to_char(timezone('utc', now()), 'YYYYMMDD')
        || '-'
        || lpad(nextval('public.reference_seq')::text, 6, '0');

    return v_reference;
end;
$$;

revoke all on function public.generate_reference(text) from public;
grant execute on function public.generate_reference(text) to service_role;


-- =============================================================================
-- Get System Setting
-- =============================================================================

create or replace function public.get_setting(
    p_key text
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
    select value
    from public.system_settings
    where setting_key = p_key
    limit 1;
$$;

revoke all on function public.get_setting(text) from public;
grant execute on function public.get_setting(text)
to service_role;
-- grant execute on function public.get_setting(text) to authenticated, service_role;


-- =============================================================================
-- Get Numeric Setting
-- =============================================================================

create or replace function public.get_setting_numeric(
    p_key text
)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
    select
        case
            when value is null then null
            else (value #>> '{}')::numeric
        end
    from public.system_settings
    where setting_key = p_key
    limit 1;
$$;

revoke all on function public.get_setting_numeric(text) from public;
grant execute on function public.get_setting_numeric(text) to authenticated, service_role;


-- =============================================================================
-- Get Boolean Setting
-- =============================================================================

create or replace function public.get_setting_boolean(
    p_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        coalesce(
            (value #>> '{}')::boolean,
            false
        )
    from public.system_settings
    where setting_key = p_key
    limit 1;
$$;

revoke all on function public.get_setting_boolean(text) from public;
grant execute on function public.get_setting_boolean(text) to authenticated, service_role;


-- =============================================================================
-- Maintenance Mode
-- =============================================================================

create or replace function public.is_maintenance_mode()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        coalesce(
            public.get_setting_boolean('maintenance_mode'),
            false
        );
$$;

revoke all on function public.is_maintenance_mode() from public;
grant execute on function public.is_maintenance_mode() to authenticated, service_role;


-- =============================================================================
-- ROI Calculator
-- =============================================================================

create or replace function public.calculate_roi(
    p_amount numeric,
    p_roi_percentage numeric
)
returns numeric(18,2)
language sql
immutable
as $$
    select round(
        p_amount * p_roi_percentage / 100,
        2
    );
$$;

revoke all on function public.calculate_roi(numeric,numeric) from public;
grant execute on function public.calculate_roi(numeric,numeric) to authenticated, service_role;


-- =============================================================================
-- Calculate Maturity Date
-- =============================================================================

create or replace function public.calculate_maturity_date(
    p_started_at timestamptz,
    p_duration_days integer
)
returns timestamptz
language sql
immutable
as $$
    select
        p_started_at
        + make_interval(days => p_duration_days);
$$;

revoke all on function public.calculate_maturity_date(timestamptz,integer) from public;
grant execute on function public.calculate_maturity_date(timestamptz,integer) to authenticated, service_role;


-- =============================================================================
-- Can User Invest?
-- Used by frontend to enable/disable Invest button.
-- =============================================================================

create or replace function public.can_invest(
    p_plan_id uuid,
    p_amount numeric
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.investment_plans p
        where
            p.id = p_plan_id
            and p.status = 'active'
            and p_amount > 0
            and p_amount >= p.minimum_amount
            and (
                p.maximum_amount is null
                or p_amount <= p.maximum_amount
            )
    )
    and exists (
        select 1
        from public.wallets w
        where
            w.user_id = auth.uid()
            and w.status = 'active'
    )
    and not public.is_maintenance_mode();
$$;

revoke all on function public.can_invest(uuid,numeric) from public;
grant execute on function public.can_invest(uuid,numeric) to authenticated, service_role;