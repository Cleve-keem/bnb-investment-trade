-- =============================================================================
-- 003_users.sql
-- public.users extends auth.users with profile/app-level data.
-- One row per auth.users row (id is both PK and FK).
-- =============================================================================

create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           citext not null unique,
  username        citext unique,
  referral_code   text unique,
  full_name       text,
  phone           text unique,
  avatar_url      text,
  role            public.user_role not null default 'user',
  status          public.user_status not null default 'active',
  first_login     boolean not null default true,
  last_login_at   timestamptz,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now()),
  email_verified_at timestamptz,

 constraint users_phone_format
    check (
        phone is null
        or phone ~ '^\+?[0-9]{7,15}$'
    )
);

comment on table public.users is 'App-level profile data, one-to-one with auth.users.';
comment on column public.users.role is 'Authorization role: user or admin.';
comment on column public.users.status is 'Account lifecycle status, independent of auth.users.banned_until.';
comment on column public.users.first_login is 'True until the user completes initial profile setup.';

create index if not exists users_role_idx on public.users(role);
create index if not exists users_status_idx on public.users(status);