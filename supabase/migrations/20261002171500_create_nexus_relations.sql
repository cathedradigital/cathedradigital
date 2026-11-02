-- Cátedra Digital · Nexus v1
-- Restores the canonical curated graph contract already consumed by the application.
-- No relations are seeded here: an empty graph is preferable to fabricated links.

create table if not exists public.nexus_relations (
  id uuid primary key default gen_random_uuid(),
  relation_type text not null check (relation_type in (
    'cites',
    'explains',
    'contrasts',
    'fulfills',
    'commemorates',
    'see_also',
    'wrote',
    'exemplifies',
    'related_to',
    'inspired_by'
  )),
  source_kind text not null check (source_kind in (
    'bible_verse',
    'catechism_paragraph',
    'magisterium_doc',
    'patristic',
    'saint',
    'saint_work',
    'glossary',
    'prayer',
    'journey',
    'liturgy',
    'other'
  )),
  source_ref jsonb not null,
  target_kind text not null check (target_kind in (
    'bible_verse',
    'catechism_paragraph',
    'magisterium_doc',
    'patristic',
    'saint',
    'saint_work',
    'glossary',
    'prayer',
    'journey',
    'liturgy',
    'other'
  )),
  target_ref jsonb not null,
  attributed_to text,
  note text,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  unique (relation_type, source_kind, source_ref, target_kind, target_ref)
);

create index if not exists nexus_relations_source_idx
  on public.nexus_relations(source_kind, status);
create index if not exists nexus_relations_target_idx
  on public.nexus_relations(target_kind, status);
create index if not exists nexus_relations_source_ref_gin_idx
  on public.nexus_relations using gin(source_ref);
create index if not exists nexus_relations_target_ref_gin_idx
  on public.nexus_relations using gin(target_ref);

alter table public.nexus_relations enable row level security;

drop policy if exists "nexus_relations_public_read" on public.nexus_relations;
create policy "nexus_relations_public_read"
  on public.nexus_relations
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "nexus_relations_admin_all" on public.nexus_relations;
create policy "nexus_relations_admin_all"
  on public.nexus_relations
  for all
  to authenticated
  using (auth_internal.has_role(auth.uid(), 'admin'::public.app_role))
  with check (auth_internal.has_role(auth.uid(), 'admin'::public.app_role));

grant select on public.nexus_relations to anon, authenticated;
grant all on public.nexus_relations to service_role;