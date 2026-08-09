-- =============================================================================
-- 008_withdrawal_requests.sql
-- User withdrawal requests.
-- Requests are created by users and processed only through secure database
-- RPC functions (approve_withdrawal / reject_withdrawal).
-- =============================================================================

create table if not exists public.withdrawal_requests (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.users(id)
        on delete cascade,

    wallet_id uuid not null
        references public.wallets(id)
        on delete restrict,

    reference text
        not null
        unique,

    amount numeric(18,2)
        not null
        check (amount > 0),

    currency char(3)
        not null
        default 'USD',

    reason text,

    status public.withdrawal_status
        not null
        default 'pending',

    decision_by uuid
        references public.users(id)
        on delete set null,

    decided_at timestamptz,

    processed_at timestamptz,

    rejection_reason text,

    metadata jsonb
        not null
        default '{}'::jsonb,

    created_at timestamptz
        not null
        default timezone('utc', now()),

    updated_at timestamptz
        not null
        default timezone('utc', now()),

    constraint withdrawal_requests_rejection_reason_required
        check (
            status <> 'rejected'
            or rejection_reason is not null
        ),

    constraint withdrawal_requests_decision_required
        check (
            status = 'pending'
            or (
                decision_by is not null
                and decided_at is not null
            )
        )

);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.withdrawal_requests is
'User withdrawal requests awaiting admin approval or rejection.';

comment on column public.withdrawal_requests.reference is
'Business reference visible to users (e.g. WD-20260801-000001).';

comment on column public.withdrawal_requests.decision_by is
'Administrator who approved or rejected the request.';

comment on column public.withdrawal_requests.decided_at is
'Timestamp when the withdrawal request was approved or rejected.';

comment on column public.withdrawal_requests.processed_at is
'Timestamp when wallet settlement was completed.';

comment on column public.withdrawal_requests.metadata is
'Additional withdrawal information stored as JSON.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists withdrawal_requests_user_idx
    on public.withdrawal_requests(user_id);

create index if not exists withdrawal_requests_wallet_idx
    on public.withdrawal_requests(wallet_id);

create index if not exists withdrawal_requests_status_idx
    on public.withdrawal_requests(status);

create index if not exists withdrawal_requests_reference_idx
    on public.withdrawal_requests(reference);

create index if not exists withdrawal_requests_created_at_idx
    on public.withdrawal_requests(created_at desc);

create index if not exists withdrawal_requests_decision_by_idx
    on public.withdrawal_requests(decision_by);

-- -- =============================================================================
-- -- 008_withdrawal_requests.sql
-- -- User-initiated requests to move virtual funds out of their wallet.
-- -- Approving/rejecting a request is handled exclusively by the
-- -- approve_withdrawal()/reject_withdrawal() RPC functions.
-- -- =============================================================================

-- create table if not exists public.withdrawal_requests (
--   id                 uuid primary key default gen_random_uuid(),
--   user_id            uuid not null references public.users(id) on delete cascade,
--   wallet_id          uuid not null references public.wallets(id) on delete restrict,
--   amount             numeric(18,2) not null check (amount > 0),
--   reason             text,
--   status             public.withdrawal_status not null default 'pending',
--   approved_by        uuid references public.users(id),
--   approved_at        timestamptz,
--   rejection_reason   text,
--   created_at         timestamptz not null default now(),

--   constraint withdrawal_requests_rejection_reason_required
--     check (status <> 'rejected' or rejection_reason is not null),
--   constraint withdrawal_requests_decision_fields_consistent
--     check (status = 'pending' or (approved_by is not null and approved_at is not null))
-- );

-- comment on table public.withdrawal_requests is 'User withdrawal requests, decided by an admin.';
-- comment on column public.withdrawal_requests.approved_by is 'Admin who approved OR rejected the request (decision actor).';
-- comment on column public.withdrawal_requests.approved_at is 'Timestamp of the decision, whichever way it went.';

-- create index if not exists withdrawal_requests_user_id_idx on public.withdrawal_requests(user_id);
-- create index if not exists withdrawal_requests_status_idx on public.withdrawal_requests(status);