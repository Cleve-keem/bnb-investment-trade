-- =============================================================================
-- 010_referrals.sql
-- Tracks referral relationships and referral rewards.
-- Each user can only be referred once.
-- =============================================================================

create table if not exists public.referrals (

    id uuid primary key
        default gen_random_uuid(),

    referrer_id uuid
        not null
        references public.users(id)
        on delete cascade,

    referred_user_id uuid
        not null
        unique
        references public.users(id)
        on delete cascade,

    reference text
        not null
        unique,

    referral_code text
        not null,

    reward_amount numeric(18,2)
        not null
        default 0
        check (reward_amount >= 0),

    currency char(3)
        not null
        default 'USD',

    status public.referral_status
        not null
        default 'pending',

    reward_paid_at timestamptz,

    metadata jsonb
        not null
        default '{}'::jsonb,

    created_at timestamptz
        not null
        default timezone('utc', now()),

    updated_at timestamptz
        not null
        default timezone('utc', now()),

    constraint referrals_no_self_referral
        check (
            referrer_id <> referred_user_id
        ),

    constraint referrals_reward_status_consistency
    check (
        (status = 'completed' and reward_paid_at is not null)
        or
        (status <> 'completed' and reward_paid_at is null)
    )

);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.referrals is
'Tracks referral relationships and referral reward payments.';

comment on column public.referrals.reference is
'Unique business reference for the referral record.';

comment on column public.referrals.referral_code is
'Referral code used during registration.';

comment on column public.referrals.reward_amount is
'Reward credited to the referrer after successful completion.';

comment on column public.referrals.reward_paid_at is
'Timestamp when the referral reward was credited.';

comment on column public.referrals.metadata is
'Additional referral information stored as JSON.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists referrals_referrer_idx
    on public.referrals(referrer_id);

create index if not exists referrals_status_idx
    on public.referrals(status);

create index if not exists referrals_code_idx
    on public.referrals(referral_code);

create index if not exists referrals_created_at_idx
    on public.referrals(created_at desc);

-- -- =============================================================================
-- -- 010_referrals.sql
-- -- Tracks who referred whom, and the reward owed/paid to the referrer.
-- -- A referred user can only ever be referred once (unique referred_user_id).
-- -- =============================================================================

-- create table if not exists public.referrals (
--   id                  uuid primary key default gen_random_uuid(),
--   referrer_id         uuid not null references public.users(id) on delete cascade,
--   referred_user_id    uuid not null unique references public.users(id) on delete cascade,
--   referral_code       text not null,
--   reward_amount       numeric(18,2) not null default 0 check (reward_amount >= 0),
--   status              public.referral_status not null default 'pending',
--   created_at          timestamptz not null default now(),

--   constraint referrals_no_self_referral check (referrer_id <> referred_user_id)
-- );

-- comment on table public.referrals is 'One row per successful referral signup.';

-- create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);
-- create index if not exists referrals_referral_code_idx on public.referrals(referral_code);