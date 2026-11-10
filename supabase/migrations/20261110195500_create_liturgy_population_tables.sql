-- Storage for the daily liturgy population job.
-- Content is public read-only; writes are restricted to service_role.

create table if not exists public.liturgy_readings (
  id uuid primary key default gen_random_uuid(),
  iso_date date not null unique,
  celebration_title text not null default '',
  liturgical_color text not null default 'verde',
  day_description text not null default '',
  season text,
  first_reading jsonb,
  psalm jsonb,
  second_reading jsonb,
  gospel jsonb,
  source_url text not null,
  source_fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.liturgy_meditations (
  id uuid primary key default gen_random_uuid(),
  iso_date date not null,
  theme text,
  reading_key text,
  fathers jsonb not null default '[]'::jsonb,
  catechism jsonb not null default '[]'::jsonb,
  magisterium jsonb not null default '[]'::jsonb,
  logos jsonb,
  final_prayer text,
  church_history jsonb,
  action_of_day text,
  version integer,
  model text,
  provider text,
  prompt_hash text,
  generated_at timestamptz not null default now(),
  fallback boolean not null default false,
  fallback_code text,
  fallback_message text,
  fallback_source text,
  fallback_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.liturgy_meditations
  add column if not exists fallback boolean not null default false,
  add column if not exists fallback_code text,
  add column if not exists fallback_message text,
  add column if not exists fallback_source text,
  add column if not exists fallback_retry_at timestamptz;

create index if not exists liturgy_readings_iso_date_idx
  on public.liturgy_readings (iso_date);

create index if not exists liturgy_meditations_iso_date_idx
  on public.liturgy_meditations (iso_date);

create unique index if not exists liturgy_meditations_iso_date_unique_idx
  on public.liturgy_meditations (iso_date);

alter table public.liturgy_readings enable row level security;
alter table public.liturgy_meditations enable row level security;

drop policy if exists "Public can read liturgy readings" on public.liturgy_readings;
create policy "Public can read liturgy readings"
  on public.liturgy_readings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read liturgy meditations" on public.liturgy_meditations;
create policy "Public can read liturgy meditations"
  on public.liturgy_meditations
  for select
  to anon, authenticated
  using (true);

grant select on public.liturgy_readings to anon, authenticated;
grant select on public.liturgy_meditations to anon, authenticated;
grant all on public.liturgy_readings to service_role;
grant all on public.liturgy_meditations to service_role;

create or replace function public.touch_liturgy_readings_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists liturgy_readings_touch_updated_at on public.liturgy_readings;
create trigger liturgy_readings_touch_updated_at
before update on public.liturgy_readings
for each row execute function public.touch_liturgy_readings_updated_at();

revoke all on function public.touch_liturgy_readings_updated_at() from public;
