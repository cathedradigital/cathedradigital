-- Cátedra sacred corpus: source-controlled ingestion for saints, Fathers, popes and Church documents.
-- This migration stores provenance/rights metadata first. Content is ingested only from sources
-- whose reuse status has been explicitly verified.

create table if not exists public.corpus_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  publisher text,
  source_kind text not null check (source_kind in (
    'vatican', 'new_advent', 'internet_archive', 'wikisource', 'other'
  )),
  canonical_url text not null,
  language text not null default 'la',
  rights_status text not null default 'link_only' check (rights_status in (
    'public_domain', 'open_license', 'official_reference', 'link_only', 'unknown'
  )),
  rights_note text,
  verified_at timestamptz,
  status text not null default 'active' check (status in ('active','paused','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.corpus_people (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  person_kind text not null check (person_kind in ('saint','pope','father','doctor','theologian','biblical','other')),
  birth_year int,
  death_year int,
  feast_date text,
  papal_number int,
  papal_name text,
  biography text,
  canonical_url text,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.corpus_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.corpus_sources(id) on delete restrict,
  person_id uuid references public.corpus_people(id) on delete set null,
  slug text not null unique,
  title text not null,
  document_kind text not null check (document_kind in (
    'papal_document','church_document','patristic_work','saint_work',
    'biography','sermon','letter','homily','encyclical','council_text',
    'historical_record','bibliography','other'
  )),
  author_name text,
  original_language text,
  publication_year int,
  canonical_url text not null,
  rights_status text not null default 'link_only' check (rights_status in (
    'public_domain', 'open_license', 'official_reference', 'link_only', 'unknown'
  )),
  rights_note text,
  full_text text,
  excerpt text,
  checksum text,
  ingestion_status text not null default 'registered' check (ingestion_status in (
    'registered','verified','ingested','blocked','needs_review'
  )),
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.corpus_relations (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid not null references public.corpus_documents(id) on delete cascade,
  target_document_id uuid references public.corpus_documents(id) on delete cascade,
  target_person_id uuid references public.corpus_people(id) on delete cascade,
  relation_type text not null check (relation_type in (
    'written_by','about','quotes','comments_on','cites','develops',
    'witnesses','officially_promulgates','historically_follows','related_to'
  )),
  note text,
  confidence numeric(4,3) check (confidence is null or confidence between 0 and 1),
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  check ((target_document_id is not null) or (target_person_id is not null))
);

create table if not exists public.corpus_ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.corpus_sources(id) on delete cascade,
  requested_by text,
  scope text not null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','blocked')),
  items_found int not null default 0,
  items_ingested int not null default 0,
  items_skipped int not null default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists corpus_documents_source_idx on public.corpus_documents(source_id);
create index if not exists corpus_documents_person_idx on public.corpus_documents(person_id);
create index if not exists corpus_documents_kind_idx on public.corpus_documents(document_kind);
create index if not exists corpus_documents_status_idx on public.corpus_documents(status, ingestion_status);
create index if not exists corpus_people_kind_idx on public.corpus_people(person_kind, status);
create index if not exists corpus_relations_source_idx on public.corpus_relations(source_document_id);
create index if not exists corpus_relations_target_doc_idx on public.corpus_relations(target_document_id);
create index if not exists corpus_relations_target_person_idx on public.corpus_relations(target_person_id);

alter table public.corpus_sources enable row level security;
alter table public.corpus_people enable row level security;
alter table public.corpus_documents enable row level security;
alter table public.corpus_relations enable row level security;
alter table public.corpus_ingestion_jobs enable row level security;

create policy "published corpus sources are readable"
  on public.corpus_sources for select to anon, authenticated
  using (status = 'active');

create policy "published corpus people are readable"
  on public.corpus_people for select to anon, authenticated
  using (status = 'published');

create policy "published corpus documents are readable"
  on public.corpus_documents for select to anon, authenticated
  using (status = 'published' and ingestion_status in ('verified','ingested'));

create policy "published corpus relations are readable"
  on public.corpus_relations for select to anon, authenticated
  using (status = 'published');

create policy "service role manages corpus sources"
  on public.corpus_sources for all to service_role using (true) with check (true);

create policy "service role manages corpus people"
  on public.corpus_people for all to service_role using (true) with check (true);

create policy "service role manages corpus documents"
  on public.corpus_documents for all to service_role using (true) with check (true);

create policy "service role manages corpus relations"
  on public.corpus_relations for all to service_role using (true) with check (true);

create policy "service role manages ingestion jobs"
  on public.corpus_ingestion_jobs for all to service_role using (true) with check (true);

insert into public.corpus_sources
  (slug,title,publisher,source_kind,canonical_url,language,rights_status,rights_note,verified_at)
values
  ('vatican-holy-see','Santa Sé — Arquivo documental oficial','Holy See','vatican','https://www.vatican.va/','pt','official_reference',
   'Use como fonte canônica e referência. Não presumir domínio público para reprodução integral; preservar URL e direitos de cada documento.',now()),
  ('new-advent-catholic-encyclopedia','The Catholic Encyclopedia','New Advent','new_advent','https://www.newadvent.org/cathen/','en','public_domain',
   'Edição histórica de 1907–1912; verificar a situação do texto/edição concreta antes de redistribuição.',now()),
  ('internet-archive-public-domain','Internet Archive — coleções verificadas','Internet Archive','internet_archive','https://archive.org/','en','public_domain',
   'Somente itens cuja própria ficha/licença confirme domínio público ou licença compatível.',now())
on conflict (slug) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  canonical_url = excluded.canonical_url,
  rights_status = excluded.rights_status,
  rights_note = excluded.rights_note,
  verified_at = excluded.verified_at,
  updated_at = now();

insert into public.corpus_people
  (slug,display_name,person_kind,papal_number,papal_name,biography,canonical_url)
values
  ('leo-xiv','Leão XIV','pope',267,'Leão XIV',
   'Robert Francis Prevost. Eleito em 8 de maio de 2025; 267º sucessor de São Pedro.',
   'https://www.vatican.va/content/leo-xiv/pt.html')
on conflict (slug) do update set
  display_name = excluded.display_name,
  papal_number = excluded.papal_number,
  papal_name = excluded.papal_name,
  biography = excluded.biography,
  canonical_url = excluded.canonical_url,
  updated_at = now();

insert into public.corpus_documents
  (source_id,person_id,slug,title,document_kind,author_name,canonical_url,rights_status,rights_note,excerpt,ingestion_status)
select s.id,p.id,'leo-xiv-vatican-profile','Leão XIV — página documental oficial','biography','Santa Sé',
  'https://www.vatican.va/content/leo-xiv/pt.html','official_reference',
  'Referência oficial; conteúdo integral não deve ser copiado sem verificar os termos aplicáveis.',
  'Página oficial com biografia e índice de documentos do pontificado.',
  'verified'
from public.corpus_sources s, public.corpus_people p
where s.slug='vatican-holy-see' and p.slug='leo-xiv'
on conflict (slug) do update set
  canonical_url=excluded.canonical_url,
  ingestion_status='verified',
  updated_at=now();
