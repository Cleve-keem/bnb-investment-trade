-- =============================================================================
-- 007_investments.sql
-- A user's subscription to an investment plan.
-- Snapshot values (ROI, plan name, duration) are stored so historical
-- investments remain unchanged even if the plan changes later.
-- =============================================================================

create table if not exists public.investments (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.users(id)
        on delete cascade,

    wallet_id uuid not null
        references public.wallets(id)
        on delete restrict,

    plan_id uuid not null
        references public.investment_plans(id)
        on delete restrict,

    reference text
        not null
        unique,

    plan_name text
        not null,

    duration_days integer
        not null
        check (duration_days > 0),

    amount numeric(18,2)
        not null
        check (amount > 0),

    roi_percentage numeric(5,2)
        not null
        check (roi_percentage > 0),

    expected_profit numeric(18,2)
        not null
        check (expected_profit >= 0),

    total_return numeric(18,2)
        not null
        check (total_return = amount + expected_profit),

    status public.investment_status
        not null
        default 'pending',

    metadata jsonb
        not null
        default '{}'::jsonb,

    started_at timestamptz,

    matures_at timestamptz,

    completed_at timestamptz,

    cancelled_at timestamptz,

    created_at timestamptz
        not null
        default timezone('utc', now()),

    updated_at timestamptz
        not null
        default timezone('utc', now()),

    constraint investments_matures_after_start
        check (
            matures_at is null
            or started_at is null
            or matures_at > started_at
        ),

    constraint investments_completed_requires_timestamp
        check (
            status <> 'completed'
            or completed_at is not null
        ),

    constraint investments_cancelled_requires_timestamp
        check (
            status <> 'cancelled'
            or cancelled_at is not null
        )

);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.investments is
'Stores every investment created by users. Snapshot fields preserve historical accuracy even if investment plans change later.';

comment on column public.investments.reference is
'Unique business reference visible to users (e.g. INV-20260801-000001).';

comment on column public.investments.plan_name is
'Snapshot of the investment plan name at the time of investment.';

comment on column public.investments.duration_days is
'Snapshot of the investment duration in days.';

comment on column public.investments.roi_percentage is
'Snapshot of the ROI percentage at investment creation.';

comment on column public.investments.expected_profit is
'Calculated profit expected at maturity.';

comment on column public.investments.total_return is
'Principal plus expected profit.';

comment on column public.investments.metadata is
'Additional investment information stored as JSON.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists investments_user_idx
    on public.investments(user_id);

create index if not exists investments_wallet_idx
    on public.investments(wallet_id);

create index if not exists investments_plan_idx
    on public.investments(plan_id);

create index if not exists investments_status_idx
    on public.investments(status);

create index if not exists investments_reference_idx
    on public.investments(reference);

create index if not exists investments_created_at_idx
    on public.investments(created_at desc);

create index if not exists investments_active_maturity_idx
    on public.investments(matures_at)
    where status = 'active';

-- -- =============================================================================
-- -- 007_investments.sql
-- -- A user's active or completed subscription to an investment plan.
-- -- roi_percentage/expected_profit are SNAPSHOTS taken at creation time, so a
-- -- later change to investment_plans.roi_percentage never retroactively
-- -- changes an existing investment.
-- -- =============================================================================

-- create table if not exists public.investments (
--   id               uuid primary key default gen_random_uuid(),
--   user_id          uuid not null references public.users(id) on delete cascade,
--   wallet_id        uuid not null references public.wallets(id) on delete restrict,
--   plan_id          uuid not null references public.investment_plans(id) on delete restrict,
--   amount           numeric(18,2) not null check (amount > 0),
--   roi_percentage   numeric(5,2) not null check (roi_percentage > 0),
--   expected_profit  numeric(18,2) not null check (expected_profit >= 0),
--   total_return     numeric(18,2) not null check (total_return >= 0),
--   status           public.investment_status not null default 'pending',
--   started_at       timestamptz,
--   matures_at       timestamptz,
--   completed_at     timestamptz,
--   created_at       timestamptz not null default now(),

--   constraint investments_matures_after_start
--     check (matures_at is null or started_at is null or matures_at > started_at),
--   constraint investments_total_return_consistent
--     check (total_return = amount + expected_profit)
-- );

-- comment on table public.investments is 'User subscriptions to investment plans, from pending through completed.';
-- comment on column public.investments.roi_percentage is 'Snapshot of the plan ROI % at the time the investment was created.';

-- create index if not exists investments_user_id_idx on public.investments(user_id);
-- create index if not exists investments_plan_id_idx on public.investments(plan_id);
-- create index if not exists investments_status_idx on public.investments(status);
-- create index if not exists investments_matures_at_active_idx
--   on public.investments(matures_at) where status = 'active';