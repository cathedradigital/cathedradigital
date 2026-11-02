-- Restore the SEO data contract used by SEOHead and the admin SEO screens.
-- Public clients can read only the safe projection; credentials stay in the
-- RLS-protected base table and are intentionally excluded from the view.

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null default 'Cátedra Digital',
  site_description text not null default 'Aprofunde sua fé católica com a Bíblia, o Catecismo, o Magistério e a tradição da Igreja.',
  site_keywords text not null default '',
  ga4_measurement_id text,
  gsc_verification_code text,
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
  opening_hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_settings enable row level security;
revoke all on table public.seo_settings from anon, authenticated;
grant select, insert, update, delete on table public.seo_settings to authenticated;
drop policy if exists seo_settings_admin_all on public.seo_settings;
create policy seo_settings_admin_all on public.seo_settings
  for all to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role))
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create or replace view public.public_seo_settings
with (security_barrier = true)
as
select
  id,
  site_title,
  site_description,
  site_keywords,
  og_image_url,
  twitter_handle,
  json_ld_schema,
  business_name,
  business_address,
  business_phone,
  business_whatsapp,
  business_email,
  google_maps_url,
  latitude,
  longitude,
  opening_hours
from public.seo_settings;

grant select on public.public_seo_settings to anon, authenticated;

create table if not exists public.site_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_keywords enable row level security;
revoke all on table public.site_keywords from anon, authenticated;
grant select on table public.site_keywords to anon, authenticated;
grant insert, update, delete on table public.site_keywords to authenticated;
drop policy if exists site_keywords_public_active_read on public.site_keywords;
create policy site_keywords_public_active_read on public.site_keywords
  for select to anon, authenticated
  using (is_active = true);
drop policy if exists site_keywords_admin_all on public.site_keywords;
create policy site_keywords_admin_all on public.site_keywords
  for all to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role))
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create table if not exists public.seo_audits (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  score integer,
  findings jsonb not null default '[]'::jsonb,
  meta_tags jsonb,
  headings jsonb,
  links jsonb,
  created_at timestamptz not null default now()
);

create index if not exists seo_audits_created_at_idx
  on public.seo_audits (created_at desc);
alter table public.seo_audits enable row level security;
revoke all on table public.seo_audits from anon, authenticated;
grant select, insert, update, delete on table public.seo_audits to authenticated;
drop policy if exists seo_audits_admin_all on public.seo_audits;
create policy seo_audits_admin_all on public.seo_audits
  for all to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role))
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

insert into public.seo_settings (site_title, site_description, site_keywords, og_image_url, twitter_handle)
select
  'Cátedra Digital',
  'Aprofunde sua fé católica com a Bíblia, o Catecismo, o Magistério e a tradição da Igreja.',
  '',
  'https://isojguvcnfncokoxoauk.supabase.co/storage/v1/object/public/public-assets/og-home.png',
  '@cathedradigital'
where not exists (select 1 from public.seo_settings);
