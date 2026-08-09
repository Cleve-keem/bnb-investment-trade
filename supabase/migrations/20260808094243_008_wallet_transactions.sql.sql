-- =============================================================================
-- 008_wallet_transactions.sql
-- Immutable financial ledger.
-- Every wallet balance change writes exactly one row here.
-- Rows must NEVER be updated or deleted.
-- Immutability is enforced by triggers (017_triggers.sql).
-- =============================================================================

create table if not exists public.wallet_transactions (
  id                    uuid primary key default gen_random_uuid(),

  wallet_id             uuid not null
                        references public.wallets(id)
                        on delete restrict,

  amount                numeric(18,2) not null
                        check (amount <> 0),

  balance_before        numeric(18,2) not null
                        check (balance_before >= 0),

  balance_after         numeric(18,2) not null
                        check (balance_after >= 0),

  transaction_type      public.wallet_transaction_type not null,

  reference             text not null unique,

  description           text,

  currency              char(3) not null default 'USD',

  created_by            uuid
                        references public.users(id)
                        on delete set null,

  investment_id         uuid
                        references public.investments(id)
                        on delete set null,

  withdrawal_request_id uuid
                        references public.withdrawal_requests(id)
                        on delete set null,

  metadata              jsonb not null default '{}'::jsonb,

  reversed_transaction_id uuid
                        references public.wallet_transactions(id)
                        on delete set null,

  created_at            timestamptz not null
                        default timezone('utc', now()),

  constraint wallet_transactions_math_checks_out
    check (balance_after = balance_before + amount)
);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.wallet_transactions is
'Immutable append-only financial ledger. Every wallet balance change creates exactly one record.';

comment on column public.wallet_transactions.amount is
'Signed amount. Positive values represent credits, negative values represent debits.';

comment on column public.wallet_transactions.balance_before is
'Wallet balance immediately before this transaction.';

comment on column public.wallet_transactions.balance_after is
'Wallet balance immediately after this transaction.';

comment on column public.wallet_transactions.currency is
'ISO 4217 currency code (USD, NGN, EUR, etc.).';

comment on column public.wallet_transactions.reference is
'Unique idempotency reference such as INV-xxxxx or WD-xxxxx.';

comment on column public.wallet_transactions.metadata is
'Additional transaction-specific information stored as JSON.';

comment on column public.wallet_transactions.created_by is
'User (typically an admin) that initiated the transaction. NULL when generated automatically by the system.';

comment on column public.wallet_transactions.reversed_transaction_id is
'References the original transaction when this transaction reverses a previous ledger entry.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists wallet_transactions_wallet_created_idx
on public.wallet_transactions(wallet_id, created_at desc);

create index if not exists wallet_transactions_type_idx
on public.wallet_transactions(transaction_type);

create index if not exists wallet_transactions_created_by_idx
on public.wallet_transactions(created_by);

create index if not exists wallet_transactions_investment_idx
on public.wallet_transactions(investment_id);

create index if not exists wallet_transactions_withdrawal_idx
on public.wallet_transactions(withdrawal_request_id);

create index if not exists wallet_transactions_created_at_idx
on public.wallet_transactions(created_at desc);