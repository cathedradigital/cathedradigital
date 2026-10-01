-- Seed inicial do acervo histórico da Cátedra.
-- Conteúdo textual integral NÃO é armazenado aqui: apenas metadados, proveniência
-- e referências. Textos reutilizáveis serão ingeridos on-demand após verificação.

insert into public.corpus_sources
  (slug, title, publisher, source_kind, canonical_url, language, rights_status, rights_note, verified_at, status)
values
  (
    'vatican-pontiffs',
    'Supreme Pontiffs — Holy See',
    'Holy See',
    'vatican',
    'https://www.vatican.va/content/vatican/pt/holy-father.html',
    'pt',
    'official_reference',
    'Lista oficial dos pontífices romanos. Usar como fonte de referência e não como autorização automática para reproduzir textos.',
    now(),
    'published'
  ),
  (
    'new-advent-fathers-index',
    'The Fathers of the Church — New Advent',
    'New Advent',
    'new_advent',
    'https://www.newadvent.org/fathers/',
    'en',
    'public_domain',
    'Candidatos de domínio público devem ser verificados por obra/edição antes da ingestão integral.',
    now(),
    'published'
  )
on conflict (slug) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_kind = excluded.source_kind,
  canonical_url = excluded.canonical_url,
  rights_status = excluded.rights_status,
  rights_note = excluded.rights_note,
  verified_at = excluded.verified_at,
  status = excluded.status;

insert into public.corpus_people
  (slug, display_name, person_kind, canonical_url, status)
values
  ('clemente-romano', 'Clemente de Roma', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('inacio-de-antioquia', 'Inácio de Antioquia', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('policarpo-de-esmirna', 'Policarpo de Esmirna', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('hermas', 'Hermas', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('justino-martir', 'Justino Mártir', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('irineu-de-liao', 'Irineu de Lião', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('cipriano-de-cartago', 'Cipriano de Cartago', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('atanasio-de-alexandria', 'Atanásio de Alexandria', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('basilio-magno', 'Basílio Magno', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('gregorio-nazianzeno', 'Gregório Nazianzeno', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('gregorio-de-nissa', 'Gregório de Nissa', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('joao-crisostomo', 'João Crisóstomo', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('ambrosio-de-milao', 'Ambrósio de Milão', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('jeronimo', 'Jerônimo', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('agostinho-de-hipona', 'Agostinho de Hipona', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('leao-magno', 'Leão Magno', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('gregorio-magno', 'Gregório Magno', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('cirilo-de-jerusalem', 'Cirilo de Jerusalém', 'father', 'https://www.newadvent.org/fathers/', 'published'),
  ('hilario-de-poitiers', 'Hilário de Poitiers', 'doctor', 'https://www.newadvent.org/fathers/', 'published'),
  ('joao-damasceno', 'João Damasceno', 'doctor', 'https://www.newadvent.org/fathers/', 'published')
on conflict (slug) do update set
  display_name = excluded.display_name,
  person_kind = excluded.person_kind,
  canonical_url = excluded.canonical_url,
  status = excluded.status;

insert into public.corpus_documents
  (source_id, person_id, slug, title, document_kind, author, language, canonical_url,
   rights_status, rights_note, excerpt, ingestion_status, status)
select
  s.id,
  p.id,
  x.slug,
  x.title,
  x.document_kind::public.corpus_document_kind,
  x.author,
  'en',
  'https://www.newadvent.org/fathers/',
  'public_domain',
  'Registro bibliográfico inicial. Verificar a edição concreta antes de armazenar texto integral.',
  x.excerpt,
  'verified',
  'published'
from public.corpus_sources s
cross join lateral (
  values
    ('first-letter-clement', 'First Epistle of Clement to the Corinthians', 'patristic_work', 'Clement of Rome', 'Padres Apostólicos; registro inicial para recuperação e ingestão controlada.'),
    ('letters-ignatius-antioch', 'Letters of Ignatius of Antioch', 'patristic_work', 'Ignatius of Antioch', 'Padres Apostólicos; conjunto de cartas, com ingestão posterior por obra.'),
    ('letter-polycarp-philippians', 'Letter of Polycarp to the Philippians', 'patristic_work', 'Polycarp of Smyrna', 'Padres Apostólicos; registro inicial.'),
    ('shepherd-hermas', 'The Shepherd of Hermas', 'patristic_work', 'Hermas', 'Padres Apostólicos; registro inicial.'),
    ('first-apology-justin', 'First Apology', 'patristic_work', 'Justin Martyr', 'Patrística; registro inicial.'),
    ('against-heresies-irenaeus', 'Against Heresies', 'patristic_work', 'Irenaeus of Lyons', 'Patrística; registro inicial.'),
    ('letters-cyprian', 'Letters of Cyprian', 'patristic_work', 'Cyprian of Carthage', 'Patrística; registro inicial.'),
    ('on-incarnation-athanasius', 'On the Incarnation', 'patristic_work', 'Athanasius of Alexandria', 'Patrística; registro inicial.'),
    ('on-holy-spirit-basil', 'On the Holy Spirit', 'patristic_work', 'Basil the Great', 'Patrística; registro inicial.'),
    ('orations-gregory-nazianzen', 'Orations', 'patristic_work', 'Gregory Nazianzen', 'Patrística; registro inicial.'),
    ('great-catechetical-discourse-gregory-nyssa', 'The Great Catechetical Discourse', 'patristic_work', 'Gregory of Nyssa', 'Patrística; registro inicial.'),
    ('homilies-john-chrysostom', 'Homilies of John Chrysostom', 'patristic_work', 'John Chrysostom', 'Patrística; registro inicial.'),
    ('on-the-mysteries-ambrose', 'On the Mysteries', 'patristic_work', 'Ambrose of Milan', 'Patrística; registro inicial.'),
    ('confessions-augustine', 'Confessions', 'saint_work', 'Augustine of Hippo', 'Escrito de santo; registro inicial.'),
    ('de-doctrina-christiana-augustine', 'On Christian Doctrine', 'saint_work', 'Augustine of Hippo', 'Escrito de santo; registro inicial.'),
    ('letters-leo-great', 'Letters of Leo the Great', 'papal_document', 'Leo the Great', 'Documento papal antigo; registro inicial.'),
    ('pastoral-rule-gregory-great', 'Pastoral Rule', 'saint_work', 'Gregory the Great', 'Escrito de santo; registro inicial.'),
    ('catechetical-lectures-cyril-jerusalem', 'Catechetical Lectures', 'patristic_work', 'Cyril of Jerusalem', 'Patrística; registro inicial.'),
    ('on-the-trinity-hilary', 'On the Trinity', 'patristic_work', 'Hilary of Poitiers', 'Patrística; registro inicial.'),
    ('exposition-orthodox-faith-john-damascene', 'An Exact Exposition of the Orthodox Faith', 'saint_work', 'John of Damascus', 'Escrito de santo; registro inicial.')
) as x(slug, title, document_kind, author, excerpt)
join public.corpus_people p on p.slug = case x.author
  when 'Clement of Rome' then 'clemente-romano'
  when 'Ignatius of Antioch' then 'inacio-de-antioquia'
  when 'Polycarp of Smyrna' then 'policarpo-de-esmirna'
  when 'Hermas' then 'hermas'
  when 'Justin Martyr' then 'justino-martir'
  when 'Irenaeus of Lyons' then 'irineu-de-liao'
  when 'Cyprian of Carthage' then 'cipriano-de-cartago'
  when 'Athanasius of Alexandria' then 'atanasio-de-alexandria'
  when 'Basil the Great' then 'basilio-magno'
  when 'Gregory Nazianzen' then 'gregorio-nazianzeno'
  when 'Gregory of Nyssa' then 'gregorio-de-nissa'
  when 'John Chrysostom' then 'joao-crisostomo'
  when 'Ambrose of Milan' then 'ambrosio-de-milao'
  when 'Augustine of Hippo' then 'agostinho-de-hipona'
  when 'Leo the Great' then 'leao-magno'
  when 'Gregory the Great' then 'gregorio-magno'
  when 'Cyril of Jerusalem' then 'cirilo-de-jerusalem'
  when 'Hilary of Poitiers' then 'hilario-de-poitiers'
  when 'John of Damascus' then 'joao-damasceno'
end
where s.slug = 'new-advent-fathers-index'
on conflict (slug) do update set
  source_id = excluded.source_id,
  person_id = excluded.person_id,
  title = excluded.title,
  document_kind = excluded.document_kind,
  author = excluded.author,
  canonical_url = excluded.canonical_url,
  rights_status = excluded.rights_status,
  rights_note = excluded.rights_note,
  excerpt = excluded.excerpt,
  ingestion_status = excluded.ingestion_status,
  status = excluded.status;

-- O diretório oficial de pontífices passa a ser uma fonte do corpus.
insert into public.corpus_documents
  (source_id, slug, title, document_kind, author, language, canonical_url,
   rights_status, rights_note, excerpt, ingestion_status, status)
select
  id,
  'supreme-pontiffs-directory',
  'Lista dos Sumos Pontífices',
  'historical_record',
  'Santa Sé',
  'pt',
  canonical_url,
  'official_reference',
  'Fonte oficial para cronologia dos pontífices; dados históricos devem permanecer atribuídos à Santa Sé.',
  'Diretório oficial dos pontífices romanos, de Pedro a Leão XIV.',
  'verified',
  'published'
from public.corpus_sources
where slug = 'vatican-pontiffs'
on conflict (slug) do update set
  source_id = excluded.source_id,
  title = excluded.title,
  document_kind = excluded.document_kind,
  author = excluded.author,
  canonical_url = excluded.canonical_url,
  rights_status = excluded.rights_status,
  rights_note = excluded.rights_note,
  excerpt = excluded.excerpt,
  ingestion_status = excluded.ingestion_status,
  status = excluded.status;
