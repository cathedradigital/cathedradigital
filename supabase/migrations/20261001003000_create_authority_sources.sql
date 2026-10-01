-- Cátedra · Acervo de Autoridade do Cáter
create table if not exists public.authority_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  source_type text not null check (source_type in ('sacred_scripture','catechism','magisterium','apostolic_tradition','patristic','saint','theology')),
  authority_class text not null check (authority_class in ('revelation','magisterium','tradition_witness','theological')),
  authority_label text not null,
  author text,
  citation text,
  description text not null,
  canonical_url text,
  language text not null default 'pt-BR',
  status text not null default 'published' check (status in ('draft','published','archived')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists authority_sources_type_idx on public.authority_sources(source_type, status);
alter table public.authority_sources enable row level security;
drop policy if exists "authority_sources_public_read" on public.authority_sources;
create policy "authority_sources_public_read" on public.authority_sources for select to anon, authenticated using (status = 'published');

insert into public.authority_sources
  (slug,title,source_type,authority_class,authority_label,author,citation,description,canonical_url,verified_at)
values
('sacred-scripture','Sagrada Escritura','sacred_scripture','revelation','Revelação divina','Sagrada Escritura','Catecismo da Igreja Católica, §§101–104','Fonte primária da Revelação escrita; o Cáter deve tratar a Escritura segundo a fé da Igreja e o contexto integral da Revelação.','https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/artcile_3.html',now()),
('catechism','Catecismo da Igreja Católica','catechism','magisterium','Síntese orgânica da doutrina católica','Igreja Católica','Catecismo da Igreja Católica, §11','Síntese orgânica dos conteúdos essenciais da doutrina católica, tendo como fontes principais a Escritura, os Padres, a liturgia e o Magistério.','https://www.vatican.va/content/catechism/en/prologue/iii_the_aim_and_intended_readership_of_the_catechism.html',now()),
('magisterium','Magistério da Igreja','magisterium','magisterium','Interpretação autêntica do depósito da fé','Papa e bispos em comunhão com ele','Catecismo da Igreja Católica, §§85 e 95','O Cáter deve distinguir claramente o ensinamento do Magistério de comentários, hipóteses ou opiniões teológicas.','https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/artcile_2/iii_the_interpretation_of_the_heritage_of_faith.html',now()),
('apostolic-tradition','Tradição Apostólica','apostolic_tradition','revelation','Depósito da fé','Igreja Católica','Catecismo da Igreja Católica, §§75–79','Transmissão viva do Evangelho recebido dos Apóstolos, distinta da Escritura e intimamente ligada a ela.','https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/artcile_2/i_the_apostolic_tradition.html',now()),
('patristic','Padres da Igreja','patristic','tradition_witness','Testemunho da Tradição','Padres da Igreja','Catecismo da Igreja Católica, §78','Testemunho histórico e teológico da vida, fé, doutrina e oração da Igreja; não deve ser apresentado automaticamente como definição magisterial.','https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/artcile_2/i_the_apostolic_tradition.html',now()),
('saints','Santos e Doutores da Igreja','saint','tradition_witness','Testemunho de santidade e doutrina','Santos e Doutores','Catecismo da Igreja Católica, §688','Testemunho espiritual e, quando aplicável, teológico de santos e doutores, sempre com autoria e obra verificáveis.','https://www.vatican.va/content/catechism/en/part_two/section_one/chapter_three/article_8/article_8.html',now()),
('theology','Teologia Católica','theology','theological','Pesquisa e aprofundamento teológico','Teólogos católicos','Catecismo da Igreja Católica, §94','Aprofundamento racional da fé. O Cáter deve identificar explicitamente a teologia como reflexão teológica, sem elevá-la ao nível do Magistério.','https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/artcile_2/iii_the_interpretation_of_the_heritage_of_faith.html',now())
on conflict (slug) do update set title=excluded.title,source_type=excluded.source_type,authority_class=excluded.authority_class,authority_label=excluded.authority_label,author=excluded.author, citation=excluded.citation,description=excluded.description,canonical_url=excluded.canonical_url,verified_at=excluded.verified_at,updated_at=now();

grant select on public.authority_sources to anon, authenticated;
grant all on public.authority_sources to service_role;
