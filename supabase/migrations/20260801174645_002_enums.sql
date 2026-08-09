-- =============================================================================
-- 002_enums.sql
-- All PostgreSQL enums used across the schema, in place of free-form strings.
-- =============================================================================

create type public.user_role as enum (
  'user',
  'admin',
  'super_admin'
);

create type public.user_status as enum (
  'active',
  'suspended',
  'deleted'
);

create type public.wallet_status as enum (
  'active',
  'frozen',
  'closed'
);

create type public.audit_action_status as enum (
    'success',
    'failed'
);

-- Every ledger entry is tagged with exactly one of these.
create type public.wallet_transaction_type as enum (
  'admin_credit',       -- admin manually credits a user
  'admin_debit',        -- admin manually debits a user
  'investment_debit',   -- principal leaves the wallet to fund an investment
  'investment_return',  -- principal returned to wallet at maturity
  'profit_payout',      -- ROI profit credited at maturity
  'withdrawal_debit',   -- approved withdrawal leaves the wallet
  'withdrawal_reversal',
  'referral_reward',    -- referral bonus credited
  'bonus',              -- platform-wide bonus credited
  'adjustment_credit',  -- administrative correction (credit)
  'adjustment_debit'    -- administrative correction (debit)
);

create type public.investment_status as enum (
  'pending',
  'active',
  'completed',
  'cancelled'
);

create type public.plan_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.withdrawal_status as enum (
  'pending',
  'approved',
  'rejected',
  'completed'
);

create type public.notification_type as enum (
  'wallet_credit',
  'wallet_debit',
  'investment_created',
  'investment_matured',
  'withdrawal_approved',
  'withdrawal_rejected',
  'referral_reward',
  'bonus',
  'system'
);

create type public.otp_purpose as enum (
    'email_verification',
    'login',
    'password_reset',
    'withdrawal_confirmation'
);

create type public.otp_delivery_method as enum (
    'email',
    'sms'
);

create type public.referral_status as enum (
  'pending',
  'completed',
  'cancelled'
);

-- Used by admin_wallet_adjustments to classify *why* an admin moved money.
create type public.adjustment_type as enum (
  'credit_correction',
  'debit_correction',
  'manual_bonus',
  'manual_penalty',
  'other'
);