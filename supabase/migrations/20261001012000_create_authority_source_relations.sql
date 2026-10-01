-- Cátedra · Relações do Acervo de Autoridade
-- O Nexus descreve relações editoriais entre fontes; nunca altera o nível de autoridade.
create table if not exists public.authority_source_relations (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.authority_sources(id) on delete cascade,
  related_source_id uuid not null references public.authority_sources(id) on delete cascade,
  relation_type text not null check (relation_type in (
    'grounds',
    'interprets',
    'develops',
    'witnesses',
    'contextualizes',
    'echoes'
  )),
  note text,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  unique (source_id, related_source_id, relation_type),
  check (source_id <> related_source_id)
);

create index if not exists authority_rel_source_idx on public.authority_source_relations(source_id, status);
create index if not exists authority_rel_related_idx on public.authority_source_relations(related_source_id, status);

alter table public.authority_source_relations enable row level security;
drop policy if exists "authority_source_relations_public_read" on public.authority_source_relations;
create policy "authority_source_relations_public_read"
  on public.authority_source_relations
  for select to anon, authenticated
  using (status = 'published');

grant select on public.authority_source_relations to anon, authenticated;
grant all on public.authority_source_relations to service_role;

insert into public.authority_source_relations (source_id, related_source_id, relation_type, note)
select a.id, b.id, 'grounds',
  'A Tradição Apostólica e a Sagrada Escritura formam o depósito da Palavra de Deus; a relação é de integração, não de substituição.'
from public.authority_sources a, public.authority_sources b
where a.slug='apostolic-tradition' and b.slug='sacred-scripture'
on conflict do nothing;

insert into public.authority_source_relations (source_id, related_source_id, relation_type, note)
select a.id, b.id, 'interprets',
  'O Magistério exerce o serviço de interpretação autêntica da Palavra de Deus escrita ou transmitida na Tradição.'
from public.authority_sources a, public.authority_sources b
where a.slug='magisterium' and b.slug='sacred-scripture'
on conflict do nothing;

insert into public.authority_source_relations (source_id, related_source_id, relation_type, note)
select a.id, b.id, 'interprets',
  'O Magistério interpreta autenticamente a Palavra de Deus também na forma da Tradição.'
from public.authority_sources a, public.authority_sources b
where a.slug='magisterium' and b.slug='apostolic-tradition'
on conflict do nothing;

insert into public.authority_source_relations (source_id, related_source_id, relation_type, note)
select a.id, b.id, 'witnesses',
  'Os Padres são testemunhas da Tradição e ajudam a reconhecer sua transmissão histórica; isso não os transforma automaticamente em Magistério.'
from public.authority_sources a, public.authority_sources b
where a.slug='patristic' and b.slug='apostolic-tradition'
on conflict do nothing;

insert into public.authority_source_relations (source_id, related_source_id, relation_type, note)
select a.id, b.id, 'develops',
  'A investigação teológica pode aprofundar o conhecimento da verdade revelada, sem ser apresentada como definição magisterial.'
from public.authority_sources a, public.authority_sources b
where a.slug='theology' and b.slug='magisterium'
on conflict do nothing;

insert into public.authority_source_relations (source_id, related_source_id, relation_type, note)
select a.id, b.id, 'echoes',
  'Santos e Doutores podem testemunhar a fé vivida e, quando aplicável, oferecer ensinamento teológico identificável.'
from public.authority_sources a, public.authority_sources b
where a.slug='saints' and b.slug='apostolic-tradition'
on conflict do nothing;
