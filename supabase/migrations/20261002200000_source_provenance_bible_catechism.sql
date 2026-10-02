alter table public.bible_chapters
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists source_retrieved_at timestamptz;

alter table public.bible_verses
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists source_retrieved_at timestamptz;

alter table public.catechism_official
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists source_retrieved_at timestamptz;

create index if not exists idx_bible_chapters_source_retrieved_at
  on public.bible_chapters(source_retrieved_at);

create index if not exists idx_catechism_official_source_retrieved_at
  on public.catechism_official(source_retrieved_at);
