-- =============================================================================
-- 016_triggers.sql
-- Trigger functions and triggers for automatic data management.
--
-- Responsibilities:
--   • Automatically maintain updated_at timestamps
--   • Auto-create a public.users profile after auth.users signup
--   • Auto-create a wallet for every new user
--   • Keep wallet.last_transaction_at in sync
--   • Prevent updates/deletes on append-only tables
--   • Prevent users from escalating their own privileges
-- =============================================================================


-- =============================================================================
-- Generic updated_at trigger
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();


drop trigger if exists wallets_set_updated_at on public.wallets;
create trigger wallets_set_updated_at
before update on public.wallets
for each row
execute function public.set_updated_at();


drop trigger if exists investment_plans_set_updated_at on public.investment_plans;
create trigger investment_plans_set_updated_at
before update on public.investment_plans
for each row
execute function public.set_updated_at();

drop trigger if exists system_settings_set_updated_at
on public.system_settings;

create trigger system_settings_set_updated_at
before update on public.system_settings
for each row
execute function public.set_updated_at();

-- =============================================================================
-- Automatically create wallet
-- =============================================================================

create or replace function public.handle_new_user_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.wallets (
        user_id
    )
    values (
        new.id
    )
    on conflict (user_id) do nothing;

    return new;

end;
$$;

drop trigger if exists on_user_created_create_wallet
on public.users;

create trigger on_user_created_create_wallet
after insert on public.users
for each row
execute function public.handle_new_user_wallet();


-- =============================================================================
-- Update wallet last_transaction_at automatically
-- =============================================================================

create or replace function public.update_wallet_last_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.wallets
    set
        last_transaction_at = new.created_at
    where id = new.wallet_id;

    if not found then
        raise exception
            'Wallet % does not exist for transaction %',
            new.wallet_id,
            new.id;
    end if;

    return new;
end;
$$;


drop trigger if exists wallet_transactions_update_wallet_time
on public.wallet_transactions;

create trigger wallet_transactions_update_wallet_time
after insert on public.wallet_transactions
for each row
execute function public.update_wallet_last_transaction();


-- =============================================================================
-- Prevent updates/deletes on append-only tables
-- =============================================================================

create or replace function public.block_ledger_mutation()
returns trigger
language plpgsql
as $$
begin

    raise exception
        '% is append-only. % operation is not permitted.',
        tg_table_name,
        tg_op;

end;
$$;


drop trigger if exists wallet_transactions_no_update
on public.wallet_transactions;

create trigger wallet_transactions_no_update
before update on public.wallet_transactions
for each row
execute function public.block_ledger_mutation();


drop trigger if exists wallet_transactions_no_delete
on public.wallet_transactions;

create trigger wallet_transactions_no_delete
before delete on public.wallet_transactions
for each row
execute function public.block_ledger_mutation();


drop trigger if exists audit_logs_no_update
on public.audit_logs;

create trigger audit_logs_no_update
before update on public.audit_logs
for each row
execute function public.block_ledger_mutation();


drop trigger if exists audit_logs_no_delete
on public.audit_logs;

create trigger audit_logs_no_delete
before delete on public.audit_logs
for each row
execute function public.block_ledger_mutation();


-- =============================================================================
-- Prevent privilege escalation
-- =============================================================================

create or replace function public.prevent_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if public.is_admin() then
        return new;
    end if;

    if new.role is distinct from old.role
        or new.status is distinct from old.status
    then
        raise exception
            'Only administrators may change role or account status.';
    end if;

    return new;
end;
$$;


drop trigger if exists users_prevent_privilege_escalation
on public.users;

create trigger users_prevent_privilege_escalation
before update on public.users
for each row
execute function public.prevent_privilege_escalation();

