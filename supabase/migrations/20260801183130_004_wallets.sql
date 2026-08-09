-- -- =============================================================================
-- -- 004_wallets.sql
-- -- One virtual wallet per user. Balance is NEVER written directly by the
-- -- frontend -- only via the credit_wallet()/debit_wallet() RPC functions
-- -- defined in 017_functions.sql.
-- -- =============================================================================

-- create table if not exists public.wallets (
--   id              uuid primary key default gen_random_uuid(),
--   user_id         uuid not null unique references public.users(id) on delete cascade,
--   balance         numeric(18,2) not null default 0 check (balance >= 0),
--   locked_balance  numeric(18,2) not null default 0 check (locked_balance >= 0),
--   currency        text char(3) not null default 'USD',
--   status          public.wallet_status not null default 'active',
--   last_transaction_at timestamptz,
--   created_at      timestamptz not null default timezone('utc', now()),
--   updated_at      timestamptz not null default timezone('utc', now()),

--   constraint wallets_locked_not_exceed_balance check (locked_balance <= balance)
-- );

-- comment on table public.wallets is 'Virtual wallet balances. Mutated only through credit_wallet()/debit_wallet().';
-- comment on column public.wallets.locked_balance is 'Portion of balance reserved (e.g. pending withdrawal), not spendable.';

-- create index if not exists wallets_user_id_idx on public.wallets(user_id);
-- create index if not exists wallets_status_idx on public.wallets(status);

-- =============================================================================
-- 004_wallets.sql
-- One virtual wallet per user.
-- Wallet balances are NEVER updated directly by the frontend.
-- All balance mutations must go through secure PostgreSQL RPC functions.
-- =============================================================================

create table if not exists public.wallets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references public.users(id) on delete cascade,
    balance numeric(18,2) not null default 0 check (balance >= 0),
    locked_balance numeric(18,2) not null default 0 check (locked_balance >= 0),
    currency char(3) not null default 'USD',
    status public.wallet_status not null default 'active',
    version bigint not null default 1,
    last_transaction_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),

    constraint wallets_locked_not_exceed_balance check (locked_balance <= balance),
    constraint wallets_currency_format check (currency ~ '^[A-Z]{3}$')
);

comment on table public.wallets is 'Stores each user''s virtual wallet. Balance changes must only occur through database RPC functions.';

comment on column public.wallets.balance is 'Current total wallet balance including locked funds.';

comment on column public.wallets.locked_balance is 'Portion of the balance reserved for pending operations and unavailable for spending.';

comment on column public.wallets.version is 'Optimistic locking version used to prevent concurrent wallet update conflicts.';

create index if not exists wallets_user_id_idx on public.wallets(user_id);
create index if not exists wallets_status_idx on public.wallets(status);