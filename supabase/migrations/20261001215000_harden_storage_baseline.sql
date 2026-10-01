-- Cathedra Digital production storage baseline.
-- Buckets are created idempotently here so production setup does not depend
-- on a browser/admin page running first.
--
-- Public URLs are intended for assets that are explicitly public. User-owned
-- avatar writes remain scoped to authenticated users and their own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('public-assets', 'public-assets', true, 52428800,
    array['image/jpeg','image/png','image/webp','application/pdf','video/mp4'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public assets: anyone can read, only administrators can write.
drop policy if exists "public_assets_read" on storage.objects;
create policy "public_assets_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'public-assets');

drop policy if exists "public_assets_admin_insert" on storage.objects;
create policy "public_assets_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'public-assets'
  and auth_internal.has_role(auth.uid(), 'admin'::public.app_role)
);

drop policy if exists "public_assets_admin_update" on storage.objects;
create policy "public_assets_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'public-assets'
  and auth_internal.has_role(auth.uid(), 'admin'::public.app_role)
)
with check (
  bucket_id = 'public-assets'
  and auth_internal.has_role(auth.uid(), 'admin'::public.app_role)
);

drop policy if exists "public_assets_admin_delete" on storage.objects;
create policy "public_assets_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'public-assets'
  and auth_internal.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Avatars: public read; authenticated users can manage only objects whose
-- first path segment is their own user id.
drop policy if exists "avatars_read" on storage.objects;
create policy "avatars_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_own_insert" on storage.objects;
create policy "avatars_own_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_own_update" on storage.objects;
create policy "avatars_own_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_own_delete" on storage.objects;
create policy "avatars_own_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
