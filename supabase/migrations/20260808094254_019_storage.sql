-- =============================================================================
-- 019_storage.sql
-- Storage buckets and policies
--
-- Buckets:
--   avatars     -> public read, owner/admin write
--   plan-images -> public read, admin-only write
--
-- IMPORTANT:
-- storage.objects is managed by Supabase Storage.
-- Do NOT alter the table itself or enable/disable RLS here.
-- Supabase manages RLS on storage.objects.
-- =============================================================================


-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

insert into storage.buckets (
    id,
    name,
    public
)
values
    (
        'avatars',
        'avatars',
        true
    ),
    (
        'plan-images',
        'plan-images',
        true
    )
on conflict (id) do nothing;


-- =============================================================================
-- DROP EXISTING POLICIES
-- =============================================================================
-- Makes this migration safe to rerun in environments where these policies
-- already exist.

drop policy if exists "avatars_public_read"
on storage.objects;

drop policy if exists "avatars_owner_insert"
on storage.objects;

drop policy if exists "avatars_owner_update"
on storage.objects;

drop policy if exists "avatars_owner_delete"
on storage.objects;

drop policy if exists "plan_images_public_read"
on storage.objects;

drop policy if exists "plan_images_admin_insert"
on storage.objects;

drop policy if exists "plan_images_admin_update"
on storage.objects;

drop policy if exists "plan_images_admin_delete"
on storage.objects;


-- =============================================================================
-- AVATARS
-- =============================================================================
-- Anyone can view avatars because the bucket is public.
-- Users can only upload/update/delete files inside their own user folder.
-- Admins can manage avatar files as well.
--
-- Expected path:
--
-- avatars/<user_id>/photo.jpg
--
-- Example:
--
-- avatars/550e8400-e29b-41d4-a716-446655440000/profile.webp
-- =============================================================================


create policy "avatars_public_read"
on storage.objects
for select
using (
    bucket_id = 'avatars'
);


create policy "avatars_owner_insert"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'avatars'
    and (
        (storage.foldername(name))[1] = auth.uid()::text
        or public.is_admin()
    )
    and lower(storage.extension(name))
        in ('jpg', 'jpeg', 'png', 'webp')
);


create policy "avatars_owner_update"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'avatars'
    and (
        (storage.foldername(name))[1] = auth.uid()::text
        or public.is_admin()
    )
)
with check (
    bucket_id = 'avatars'
    and (
        (storage.foldername(name))[1] = auth.uid()::text
        or public.is_admin()
    )
);


create policy "avatars_owner_delete"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'avatars'
    and (
        (storage.foldername(name))[1] = auth.uid()::text
        or public.is_admin()
    )
);


-- =============================================================================
-- INVESTMENT PLAN IMAGES
-- =============================================================================
-- Anyone can view plan images because the bucket is public.
-- Only admins can upload/update/delete plan images.
--
-- Expected path:
--
-- plan-images/<filename>
-- =============================================================================


create policy "plan_images_public_read"
on storage.objects
for select
using (
    bucket_id = 'plan-images'
);


create policy "plan_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'plan-images'
    and public.is_admin()
    and lower(storage.extension(name))
        in ('jpg', 'jpeg', 'png', 'webp')
);


create policy "plan_images_admin_update"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'plan-images'
    and public.is_admin()
)
with check (
    bucket_id = 'plan-images'
    and public.is_admin()
);


create policy "plan_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'plan-images'
    and public.is_admin()
);