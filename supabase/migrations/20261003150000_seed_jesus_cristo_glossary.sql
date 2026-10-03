-- Restore the Bible dictionary entries used by the inline glossary popover.
-- The definitions are concise editorial paraphrases grounded in the official
-- Catechism paragraphs already stored in public.catechism_official.

insert into public.glossary (
  term, slug, definition, short_definition, category, language, reference,
  catechism_references, editorial_completeness, doctrinal_weight, version
)
select * from (values
(
  'Jesus',
  'jesus',
  'Jesus é o nome do Filho de Deus feito homem, Salvador enviado pelo Pai. O Catecismo apresenta o anúncio de Jesus Cristo como o centro da transmissão da fé e destaca seu nome no coração da oração cristã.',
  'O Filho de Deus feito homem e Salvador.',
  'cristologia',
  'pt',
  'Catecismo da Igreja Católica §§422-435',
  array['422','425','434','435']::text[],
  'reviewed',
  5,
  1
),
(
  'Cristo',
  'cristo',
  'Cristo significa Messias, isto é, Ungido. O título se aplica a Jesus porque ele realiza plenamente a missão messiânica, exercendo a tríplice função de sacerdote, profeta e rei.',
  'Messias, o Ungido; título messiânico de Jesus.',
  'cristologia',
  'pt',
  'Catecismo da Igreja Católica §§436-440',
  array['436','437','439']::text[],
  'reviewed',
  5,
  1
)
) as v(term,slug,definition,short_definition,category,language,reference,catechism_references,editorial_completeness,doctrinal_weight,version)
where not exists (
  select 1 from public.glossary g where lower(g.term)=lower(v.term)
);