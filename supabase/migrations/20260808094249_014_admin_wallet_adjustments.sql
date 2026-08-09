-- =============================================================================
-- 014_admin_wallet_adjustments.sql
-- Records WHY an administrator manually adjusted a wallet balance.
-- Each adjustment maps one-to-one with a wallet ledger transaction.
-- =============================================================================

create table if not exists public.admin_wallet_adjustments (

    id uuid primary key
        default gen_random_uuid(),

    reference text
        not null
        unique,

    wallet_transaction_id uuid
        not null
        unique
        references public.wallet_transactions(id)
        on delete restrict,

    wallet_id uuid
        not null
        references public.wallets(id)
        on delete restrict,

    user_id uuid
        not null
        references public.users(id)
        on delete restrict,

    admin_id uuid
        not null
        references public.users(id)
        on delete restrict,

    adjustment_type public.adjustment_type
        not null,

    reason text
        not null,

    notes text,

    metadata jsonb
        not null
        default '{}'::jsonb,

    created_at timestamptz
        not null
        default timezone('utc', now()),

    updated_at timestamptz
        not null
        default timezone('utc', now())

);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.admin_wallet_adjustments is
'Stores the business reason for manual wallet adjustments performed by administrators. Each adjustment links to exactly one wallet ledger transaction.';

comment on column public.admin_wallet_adjustments.reference is
'Unique business reference for the adjustment.';

comment on column public.admin_wallet_adjustments.wallet_transaction_id is
'Associated immutable wallet ledger entry.';

comment on column public.admin_wallet_adjustments.wallet_id is
'Wallet affected by the adjustment.';

comment on column public.admin_wallet_adjustments.user_id is
'Owner of the affected wallet.';

comment on column public.admin_wallet_adjustments.admin_id is
'Administrator who performed the adjustment.';

comment on column public.admin_wallet_adjustments.adjustment_type is
'Classification of the manual adjustment.';

comment on column public.admin_wallet_adjustments.metadata is
'Additional adjustment information stored as JSON.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists admin_wallet_adjustments_wallet_idx
    on public.admin_wallet_adjustments(wallet_id);

create index if not exists admin_wallet_adjustments_user_idx
    on public.admin_wallet_adjustments(user_id);

create index if not exists admin_wallet_adjustments_admin_idx
    on public.admin_wallet_adjustments(admin_id);

create index if not exists admin_wallet_adjustments_type_idx
    on public.admin_wallet_adjustments(adjustment_type);

create index if not exists admin_wallet_adjustments_created_at_idx
    on public.admin_wallet_adjustments(created_at desc);

-- -- =============================================================================
-- -- 014_admin_wallet_adjustments.sql
-- -- Records WHY an admin manually moved money, linked 1:1 to the ledger entry
-- -- it produced in wallet_transactions. Keeps the general ledger clean while
-- -- still giving a dedicated audit trail for administrative actions.
-- -- =============================================================================

-- create table if not exists public.admin_wallet_adjustments (
--   id                       uuid primary key default gen_random_uuid(),
--   wallet_transaction_id    uuid not null unique references public.wallet_transactions(id) on delete restrict,
--   admin_id                 uuid not null references public.users(id),
--   adjustment_type          public.adjustment_type not null,
--   reason                   text not null,
--   notes                    text,
--   created_at               timestamptz not null default now()
-- );

-- comment on table public.admin_wallet_adjustments is 'One row per manual admin wallet adjustment, linked to its ledger entry.';

-- create index if not exists admin_wallet_adjustments_wallet_transaction_id_idx
--   on public.admin_wallet_adjustments(wallet_transaction_id);
-- create index if not exists admin_wallet_adjustments_admin_id_idx
--   on public.admin_wallet_adjustments(admin_id);