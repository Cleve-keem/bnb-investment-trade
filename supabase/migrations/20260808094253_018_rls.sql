-- =============================================================================
-- 018_rls.sql
-- Row Level Security Policies
--
-- Principles:
-- - Users can only read their own data.
-- - Admins can access all business data.
-- - Financial tables are immutable from the client.
-- - All money movement happens through SECURITY DEFINER RPC functions.
-- =============================================================================

-- ============================================================================
-- USERS
-- ============================================================================

alter table public.users enable row level security;
alter table public.users force row level security;

create policy "users_select_own_or_admin"
on public.users
for select
using (
    id = auth.uid()
    or public.is_admin()
);

create policy "users_update_own_or_admin"
on public.users
for update
using (
    id = auth.uid()
    or public.is_admin()
)
with check (
    id = auth.uid()
    or public.is_admin()
);

-- No INSERT policy.
-- User records are created automatically after signup.

---------------------------------------------------------------
-- WALLETS
---------------------------------------------------------------

alter table public.wallets enable row level security;
alter table public.wallets force row level security;

create policy "wallets_select_own_or_admin"
on public.wallets
for select
using (
    user_id = auth.uid()
    or public.is_admin()
);

-- No INSERT/UPDATE/DELETE policy.
-- Wallets are managed only through RPC functions.

---------------------------------------------------------------
-- WALLET TRANSACTIONS
---------------------------------------------------------------

alter table public.wallet_transactions enable row level security;
alter table public.wallet_transactions force row level security;

create policy "wallet_transactions_select_own_or_admin"
on public.wallet_transactions
for select
using (
    wallet_id in (
        select id
        from public.wallets
        where user_id = auth.uid()
    )
    or public.is_admin()
);

-- No write policies.
-- Ledger is append-only.

---------------------------------------------------------------
-- INVESTMENT PLANS
---------------------------------------------------------------

alter table public.investment_plans enable row level security;
alter table public.investment_plans force row level security;

create policy "investment_plans_select_active_or_admin"
on public.investment_plans
for select
using (
    status = 'active'
    or public.is_admin()
);

create policy "investment_plans_admin_manage"
on public.investment_plans
for all
using (
    public.is_admin()
)
with check (
    public.is_admin()
);

---------------------------------------------------------------
-- INVESTMENTS
---------------------------------------------------------------

alter table public.investments enable row level security;
alter table public.investments force row level security;

create policy "investments_select_own_or_admin"
on public.investments
for select
using (
    user_id = auth.uid()
    or public.is_admin()
);

-- No INSERT/UPDATE/DELETE policy.
-- Investments are created via create_investment().

---------------------------------------------------------------
-- WITHDRAWAL REQUESTS
---------------------------------------------------------------

alter table public.withdrawal_requests enable row level security;
alter table public.withdrawal_requests force row level security;

create policy "withdrawal_requests_select_own_or_admin"
on public.withdrawal_requests
for select
using (
    user_id = auth.uid()
    or public.is_admin()
);

-- NO INSERT POLICY.
-- Users must call request_withdrawal().

-- NO UPDATE POLICY.
-- Admins must call approve_withdrawal()/reject_withdrawal().

---------------------------------------------------------------
-- NOTIFICATIONS
---------------------------------------------------------------

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

create policy "notifications_select_own_or_admin"
on public.notifications
for select
using (
    user_id = auth.uid()
    or public.is_admin()
);

-- No UPDATE policy.
-- Users should mark notifications as read through an RPC.

---------------------------------------------------------------
-- REFERRALS
---------------------------------------------------------------

alter table public.referrals enable row level security;
alter table public.referrals force row level security;

create policy "referrals_select_related_or_admin"
on public.referrals
for select
using (
    referrer_id = auth.uid()
    or referred_user_id = auth.uid()
    or public.is_admin()
);

---------------------------------------------------------------
-- OTP VERIFICATIONS
---------------------------------------------------------------

alter table public.otp_verifications enable row level security;
alter table public.otp_verifications force row level security;

-- Intentionally NO policies.
-- Access only through SECURITY DEFINER functions.

---------------------------------------------------------------
-- USER DEVICES
---------------------------------------------------------------

alter table public.user_devices enable row level security;
alter table public.user_devices force row level security;

create policy "user_devices_select_own_or_admin"
on public.user_devices
for select
using (
    user_id = auth.uid()
    or public.is_admin()
);

-- No INSERT policy.
-- Devices are registered through register_device().

-- No UPDATE policy.
-- Device trust is managed by backend.

---------------------------------------------------------------
-- AUDIT LOGS
---------------------------------------------------------------

alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

create policy "audit_logs_admin_only"
on public.audit_logs
for select
using (
    public.is_admin()
);

---------------------------------------------------------------
-- ADMIN WALLET ADJUSTMENTS
---------------------------------------------------------------

alter table public.admin_wallet_adjustments enable row level security;
alter table public.admin_wallet_adjustments force row level security;

create policy "admin_wallet_adjustments_admin_only"
on public.admin_wallet_adjustments
for select
using (
    public.is_admin()
);

---------------------------------------------------------------
-- SYSTEM SETTINGS
---------------------------------------------------------------

alter table public.system_settings enable row level security;
alter table public.system_settings force row level security;

create policy "system_settings_select_public_or_admin"
on public.system_settings
for select
using (
    is_public = true
    or public.is_admin()
);

create policy "system_settings_admin_insert"
on public.system_settings
for insert
with check (
    public.is_admin()
);

create policy "system_settings_admin_update"
on public.system_settings
for update
using (
    public.is_admin()
)
with check (
    public.is_admin()
);

create policy "system_settings_admin_delete"
on public.system_settings
for delete
using (
    public.is_admin()
);