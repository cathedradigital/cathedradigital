-- Replace the unsafe owner-privileged view with a table containing only
-- public-safe SEO fields. This migration is idempotent for fresh installs
-- (where the prior migration may have created a view) and existing projects.

do $migration$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'public_seo_settings'
      and c.relkind = 'v'
  ) then
    execute 'drop view public.public_seo_settings';
  end if;
end
$migration$;

create table if not exists public.public_seo_settings (
  id uuid primary key,
  site_title text not null default 'Cátedra Digital',
  site_description text not null default 'Aprofunde sua fé católica com a Bíblia, o Catecismo, o Magistério e a tradição da Igreja.',
  site_keywords text not null default '',
  og_image_url text,
  twitter_handle text not null default '@cathedradigital',
  json_ld_schema jsonb,
  business_name text,
  business_address text,
  business_phone text,
  business_whatsapp text,
  business_email text,
  google_maps_url text,
  latitude double precision,
  longitude double precision,
  opening_hours text
);

alter table public.public_seo_settings enable row level security;
revoke all on table public.public_seo_settings from anon, authenticated;
grant select on table public.public_seo_settings to anon, authenticated;
grant insert, update, delete on table public.public_seo_settings to authenticated;

drop policy if exists public_seo_settings_public_read on public.public_seo_settings;
create policy public_seo_settings_public_read on public.public_seo_settings
  for select to anon, authenticated
  using (true);

drop policy if exists public_seo_settings_admin_all on public.public_seo_settings;
create policy public_seo_settings_admin_all on public.public_seo_settings
  for all to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role))
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create or replace function public.sync_public_seo_settings_projection()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if tg_op = 'DELETE' then
    delete from public.public_seo_settings where id = old.id;
    return old;
  end if;

  insert into public.public_seo_settings (
    id, site_title, site_description, site_keywords, og_image_url,
    twitter_handle, json_ld_schema, business_name, business_address,
    business_phone, business_whatsapp, business_email, google_maps_url,
    latitude, longitude, opening_hours
  ) values (
    new.id, new.site_title, new.site_description, new.site_keywords, new.og_image_url,
    new.twitter_handle, new.json_ld_schema, new.business_name, new.business_address,
    new.business_phone, new.business_whatsapp, new.business_email, new.google_maps_url,
    new.latitude, new.longitude, new.opening_hours
  )
  on conflict (id) do update set
    site_title = excluded.site_title,
    site_description = excluded.site_description,
    site_keywords = excluded.site_keywords,
    og_image_url = excluded.og_image_url,
    twitter_handle = excluded.twitter_handle,
    json_ld_schema = excluded.json_ld_schema,
    business_name = excluded.business_name,
    business_address = excluded.business_address,
    business_phone = excluded.business_phone,
    business_whatsapp = excluded.business_whatsapp,
    business_email = excluded.business_email,
    google_maps_url = excluded.google_maps_url,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    opening_hours = excluded.opening_hours;

  return new;
end
$function$;

drop trigger if exists sync_public_seo_settings_projection on public.seo_settings;
create trigger sync_public_seo_settings_projection
  after insert or update or delete on public.seo_settings
  for each row execute function public.sync_public_seo_settings_projection();

insert into public.public_seo_settings (
  id, site_title, site_description, site_keywords, og_image_url, twitter_handle,
  json_ld_schema, business_name, business_address, business_phone, business_whatsapp,
  business_email, google_maps_url, latitude, longitude, opening_hours
)
select
  id, site_title, site_description, site_keywords, og_image_url, twitter_handle,
  json_ld_schema, business_name, business_address, business_phone, business_whatsapp,
  business_email, google_maps_url, latitude, longitude, opening_hours
from public.seo_settings
on conflict (id) do update set
  site_title = excluded.site_title,
  site_description = excluded.site_description,
  site_keywords = excluded.site_keywords,
  og_image_url = excluded.og_image_url,
  twitter_handle = excluded.twitter_handle,
  json_ld_schema = excluded.json_ld_schema,
  business_name = excluded.business_name,
  business_address = excluded.business_address,
  business_phone = excluded.business_phone,
  business_whatsapp = excluded.business_whatsapp,
  business_email = excluded.business_email,
  google_maps_url = excluded.google_maps_url,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  opening_hours = excluded.opening_hours;
