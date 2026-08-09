-- =============================================================================
-- 006_investment_plans.sql
-- Investment products created by admins (e.g. Silver Plan, Gold Plan).
-- =============================================================================

create table if not exists public.investment_plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique check (length(trim(name)) > 0),
  description     text,
  minimum_amount  numeric(18,2) not null check (minimum_amount > 0),
  maximum_amount  numeric(18,2) check (maximum_amount is null or maximum_amount >= minimum_amount),
  roi_percentage  numeric(5,2) not null check (roi_percentage > 0 and roi_percentage <= 100),
  duration_days   integer not null check (duration_days > 0),
  status          public.plan_status not null default 'active',
  image_url       text,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

comment on table public.investment_plans is 'Admin-managed investment products users can subscribe to.';

create index if not exists investment_plans_status_idx on public.investment_plans(status);