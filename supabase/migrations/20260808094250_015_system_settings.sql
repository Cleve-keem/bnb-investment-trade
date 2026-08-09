-- =============================================================================
-- 015_system_settings.sql
-- Stores configurable application settings that administrators can update
-- without deploying new code.
-- =============================================================================

create table if not exists public.system_settings (

    id uuid primary key
        default gen_random_uuid(),

    setting_key text
        not null
        unique check (length(trim(setting_key)) > 0),

    value jsonb
        not null,

    value_type text
        not null
        default 'string'
        check (value_type in ('string', 'number', 'boolean', 'json')),

    category text
        not null
        default 'general',

    description text,

    is_public boolean
        not null
        default false,

    metadata jsonb
        not null
        default '{}'::jsonb,

    updated_by uuid
        references public.users(id)
        on delete set null,

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

comment on table public.system_settings is
'Stores platform-wide configuration values editable by administrators without requiring a new deployment.';

comment on column public.system_settings.setting_key is
'Unique configuration key.';

comment on column public.system_settings.value is
'Configuration value stored as JSON.';

comment on column public.system_settings.value_type is
'Expected data type of the configuration value (string, number, boolean, json).';

comment on column public.system_settings.category is
'Logical grouping used by the admin settings page.';

comment on column public.system_settings.is_public is
'Whether the setting may be exposed to the frontend application.';

comment on column public.system_settings.updated_by is
'Administrator who last modified this setting.';

comment on column public.system_settings.metadata is
'Additional configuration metadata.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists system_settings_category_idx
    on public.system_settings(category);

create index if not exists system_settings_public_idx
    on public.system_settings(is_public);

create index if not exists system_settings_updated_by_idx
    on public.system_settings(updated_by);

-- -- =============================================================================
-- -- 015_system_settings.sql
-- -- System-wide configuration values, editable by admins without a deploy.
-- -- =============================================================================

-- create table if not exists public.system_settings (
--   id             uuid primary key default gen_random_uuid(),
--   key            text not null unique,
--   value          jsonb not null,
--   description    text,
--   updated_by     uuid references public.users(id),
--   updated_at     timestamptz not null default now()
-- );

-- comment on table public.system_settings is 'Key/value store for platform configuration (e.g. min withdrawal amount).';