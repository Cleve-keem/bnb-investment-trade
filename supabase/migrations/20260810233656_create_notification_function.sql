-- =============================================================================
-- create_notification_function.sql
-- Centralized helper for creating user notifications.
-- =============================================================================

create or replace function public.create_notification(
    p_user_id uuid,
    p_title text,
    p_body text,
    p_notification_type public.notification_type
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_notification_id uuid;
begin

    if p_user_id is null then
        raise exception 'Notification user_id cannot be null';
    end if;

    if p_title is null or btrim(p_title) = '' then
        raise exception 'Notification title cannot be empty';
    end if;

    insert into public.notifications (
        user_id,
        title,
        body,
        notification_type
    )
    values (
        p_user_id,
        p_title,
        p_body,
        p_notification_type
    )
    returning id into v_notification_id;

    return v_notification_id;
end;
$$;

comment on function public.create_notification(
    uuid,
    text,
    text,
    public.notification_type
) is
'Creates a notification for a user and returns the notification ID.';