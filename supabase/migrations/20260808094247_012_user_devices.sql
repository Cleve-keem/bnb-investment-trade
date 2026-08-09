-- =============================================================================
-- 012_user_devices.sql
-- Stores devices used to access the platform.
-- Supports trusted devices, login history, and future MFA features.
-- =============================================================================

create table if not exists public.user_devices (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid
        not null
        references public.users(id)
        on delete cascade,

    device_id text
        not null,

    device_name text,

    device_fingerprint text,

    browser text,

    operating_system text,

    user_agent text,

    last_ip_address inet,

    country text,

    city text,

    trusted boolean
        not null
        default false,

    is_active boolean
        not null
        default true,

    last_used_at timestamptz
        not null
        default timezone('utc', now()),

    revoked_at timestamptz,

    metadata jsonb
        not null
        default '{}'::jsonb,

    created_at timestamptz
        not null
        default timezone('utc', now()),

    updated_at timestamptz
        not null
        default timezone('utc', now()),

    constraint user_devices_revocation_consistency
        check ((is_active = true and revoked_at is null) or (is_active = false and revoked_at is not null)
    ),

    constraint user_devices_user_device_unique
        unique (user_id, device_id)

);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.user_devices is
'Tracks devices that have accessed a user account for trusted-device recognition, security monitoring, and future MFA support.';

comment on column public.user_devices.device_id is
'Unique identifier assigned to the device.';

comment on column public.user_devices.device_fingerprint is
'Hashed fingerprint used to recognize returning devices.';

comment on column public.user_devices.trusted is
'Whether the device has been marked as trusted by the user or system.';

comment on column public.user_devices.is_active is
'False when the device has been revoked or removed.';

comment on column public.user_devices.last_ip_address is
'Most recent IP address used by this device.';

comment on column public.user_devices.metadata is
'Additional device information stored as JSON.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists user_devices_user_idx
    on public.user_devices(user_id);

create index if not exists user_devices_trusted_idx
    on public.user_devices(trusted);

create index if not exists user_devices_active_idx
    on public.user_devices(is_active);

create index if not exists user_devices_last_used_idx
    on public.user_devices(last_used_at desc);

create index if not exists user_devices_active_by_user_idx
    on public.user_devices(user_id, last_used_at desc) where is_active = true;

    
-- -- =============================================================================
-- -- 012_user_devices.sql
-- -- Devices a user has logged in from. Groundwork for trusted-device
-- -- recognition and future MFA.
-- -- =============================================================================

-- create table if not exists public.user_devices (
--   id                  uuid primary key default gen_random_uuid(),
--   user_id             uuid not null references public.users(id) on delete cascade,
--   device_name         text,
--   browser             text,
--   operating_system    text,
--   ip_address          inet,
--   trusted             boolean not null default false,
--   last_used_at        timestamptz not null default now(),
--   created_at          timestamptz not null default now()
-- );

-- comment on table public.user_devices is 'Known devices per user, for trusted-device / MFA features.';

-- create index if not exists user_devices_user_id_idx on public.user_devices(user_id);