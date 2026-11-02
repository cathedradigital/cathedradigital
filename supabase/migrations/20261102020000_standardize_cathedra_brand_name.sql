-- Standardize the public-facing institutional name to "Cathedra Digital".
-- Only exact legacy brand values are changed; custom business names and user data remain untouched.

begin;

alter table public.seo_settings
  alter column site_title set default 'Cathedra Digital';

alter table public.public_seo_settings
  alter column site_title set default 'Cathedra Digital';

update public.seo_settings
set
  site_title = case
    when site_title in ('Cátedra Digital', 'Catedra Digital', 'CATEDRA DIGITAL') then 'Cathedra Digital'
    else site_title
  end,
  business_name = case
    when business_name in ('Cátedra Digital', 'Catedra Digital', 'CATEDRA DIGITAL') then 'Cathedra Digital'
    else business_name
  end,
  json_ld_schema = case
    when json_ld_schema is not null then
      replace(
        replace(json_ld_schema::text, 'Cátedra Digital', 'Cathedra Digital'),
        'Catedra Digital',
        'Cathedra Digital'
      )::jsonb
    else null
  end,
  updated_at = now()
where
  site_title in ('Cátedra Digital', 'Catedra Digital', 'CATEDRA DIGITAL')
  or business_name in ('Cátedra Digital', 'Catedra Digital', 'CATEDRA DIGITAL')
  or json_ld_schema::text like '%Cátedra Digital%'
  or json_ld_schema::text like '%Catedra Digital%';

commit;
