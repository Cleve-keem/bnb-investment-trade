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

create type public.wallet_transaction_type as enum (
    'admin_credit',
    'admin_debit',
    'investment_debit',
    'investment_return',
    'profit_payout',
    'withdrawal_debit',
    'withdrawal_reversal',
    'referral_reward',
    'bonus',
    'adjustment_credit',
    'adjustment_debit'
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

create type public.adjustment_type as enum (
    'credit_correction',
    'debit_correction',
    'manual_bonus',
    'manual_penalty',
    'other'
);