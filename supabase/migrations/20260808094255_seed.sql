-- =============================================================================
-- 020_seed.sql
-- Baseline seed data
--
-- This migration inserts the default system settings and investment plans
-- required by the application.
--
-- Safe to re-run because all inserts use ON CONFLICT DO NOTHING.
-- =============================================================================


-- =============================================================================
-- SYSTEM SETTINGS
-- =============================================================================

insert into public.system_settings (
    setting_key,
    value,
    value_type,
    category,
    description
)
values
(
    'default_currency',
    to_jsonb('USD'::text),
    'string',
    'financial',
    'Default platform currency'
),
(
    'currency_symbol',
    to_jsonb('$'::text),
    'string',
    'financial',
    'Default platform currency symbol'
),
(
    'maintenance_mode',
    to_jsonb(false),
    'boolean',
    'system',
    'Enable or disable the platform'
),
(
    'min_withdrawal_amount',
    to_jsonb(1000),
    'number',
    'financial',
    'Minimum withdrawal amount'
),
(
    'max_withdrawal_amount',
    to_jsonb(2000000),
    'number',
    'financial',
    'Maximum withdrawal amount'
),
(
    'otp_expiry_minutes',
    to_jsonb(10),
    'number',
    'security',
    'OTP expiry time'
),
(
    'signup_bonus',
    to_jsonb(1000),
    'number',
    'rewards',
    'Bonus credited after successful registration'
),
(
    'daily_login_bonus',
    to_jsonb(100),
    'number',
    'rewards',
    'Daily login reward'
),
(
    'daily_reward_day_7_amount',
    to_jsonb(10000),
    'number',
    'rewards',
    'Seven-day streak reward'
),
(
    'referral_reward_amount',
    to_jsonb(5000),
    'number',
    'rewards',
    'Reward for successful referral'
)
on conflict (setting_key) do nothing;


-- =============================================================================
-- INVESTMENT PLANS
-- =============================================================================

insert into public.investment_plans (
    name,
    description,
    minimum_amount,
    maximum_amount,
    roi_percentage,
    duration_days,
    status
)
values
(
    'Starter Plan',
    'Best for new investors. 5% ROI after 14 days.',
    1000,
    50000,
    5,
    14,
    'active'
),
(
    'Silver Plan',
    '8% ROI after 30 days.',
    10000,
    500000,
    8,
    30,
    'active'
),
(
    'Gold Plan',
    '15% ROI after 90 days.',
    100000,
    5000000,
    15,
    90,
    'active'
),
(
    'Platinum Plan',
    '25% ROI after 180 days.',
    500000,
    10000000,
    25,
    180,
    'active'
)
on conflict (name) do nothing;