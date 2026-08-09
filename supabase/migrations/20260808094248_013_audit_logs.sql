-- =============================================================================
-- 013_audit_logs.sql
-- Immutable audit trail for administrative and system actions.
-- Records are append-only and must never be updated or deleted.
-- =============================================================================

create table if not exists public.audit_logs (

    id uuid primary key
        default gen_random_uuid(),

    reference text
        not null
        unique,

    actor_id uuid
        references public.users(id)
        on delete set null,

    actor_role public.user_role,

    target_user_id uuid
        references public.users(id)
        on delete set null,

    action text
        not null,

    entity text
        not null,

    entity_id uuid,

    action_status public.audit_action_status
        not null
        default 'success',

    metadata jsonb
        not null
        default '{}'::jsonb,

    ip_address inet,

    user_agent text,

    request_id text,

    created_at timestamptz
        default timezone('utc', now())
        not null

);

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.audit_logs is
'Immutable audit trail of all administrative and system actions.';

comment on column public.audit_logs.reference is
'Unique business reference for the audit entry.';

comment on column public.audit_logs.actor_id is
'User who performed the action. NULL when performed by the system.';

comment on column public.audit_logs.actor_role is
'Snapshot of the actor''s role at the time of the action.';

comment on column public.audit_logs.target_user_id is
'User affected by the action, if applicable.';

comment on column public.audit_logs.action is
'Action performed (e.g. approve_withdrawal, suspend_user, create_plan).';

comment on column public.audit_logs.entity is
'Logical entity affected (wallet, investment, withdrawal_request, etc.).';

comment on column public.audit_logs.entity_id is
'Primary key of the affected entity.';

comment on column public.audit_logs.action_status is
'Whether the action completed successfully or failed.';

comment on column public.audit_logs.metadata is
'Additional audit details stored as JSON.';

comment on column public.audit_logs.request_id is
'Optional request identifier used for tracing API requests.';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists audit_logs_actor_idx
    on public.audit_logs(actor_id);

create index if not exists audit_logs_target_user_idx
    on public.audit_logs(target_user_id);

create index if not exists audit_logs_action_idx
    on public.audit_logs(action);

create index if not exists audit_logs_entity_idx
    on public.audit_logs(entity, entity_id);

create index if not exists audit_logs_created_at_idx
    on public.audit_logs(created_at desc);

create index if not exists audit_logs_request_id_idx
    on public.audit_logs(request_id);

-- -- =============================================================================
-- -- 013_audit_logs.sql
-- -- Append-only record of every admin (and system) action. Rows are never
-- -- updated or deleted (enforced by trigger in 018_triggers.sql).
-- -- =============================================================================

-- create table if not exists public.audit_logs (
--   id            uuid primary key default gen_random_uuid(),
--   actor_id      uuid references public.users(id) on delete set null,
--   action        text not null,
--   entity        text not null,
--   entity_id     uuid,
--   metadata      jsonb not null default '{}'::jsonb,
--   ip_address    inet,
--   user_agent    text,
--   created_at    timestamptz not null default now()
-- );

-- comment on table public.audit_logs is 'Append-only audit trail, written via log_audit().';
-- comment on column public.audit_logs.actor_id is 'NULL when the action was performed by a scheduled job/system process.';
-- comment on column public.audit_logs.entity is 'Logical entity name affected, e.g. wallet, investment, withdrawal_request.';

-- create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
-- create index if not exists audit_logs_entity_entity_id_idx on public.audit_logs(entity, entity_id);
-- create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);