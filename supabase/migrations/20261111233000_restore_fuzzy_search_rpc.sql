-- Restore the fuzzy-search RPCs used by /buscar and the related catalog pages.
-- These functions already exist in the production database but were missing from
-- the repository migrations, which caused schema drift for fresh environments.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.search_community_posts_fuzzy(
  search_query text,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id text,
  title text,
  content text,
  user_id uuid,
  category text,
  likes_count integer,
  status text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'extensions'
AS $function$
  WITH p AS (
    SELECT
      lower(btrim(coalesce(search_query, ''))) AS q,
      least(greatest(coalesce(result_limit, 10), 1), 50) AS lim
  )
  SELECT
    c.id::text,
    c.title,
    c.content,
    c.user_id,
    c.category,
    c.likes_count,
    c.status,
    c.created_at
  FROM public.community_posts AS c
  CROSS JOIN p
  WHERE p.q <> ''
    AND (c.status = 'approved' OR c.user_id = (select auth.uid()))
    AND c.parent_id IS NULL
    AND (
      lower(coalesce(c.title, '')) LIKE '%' || p.q || '%'
      OR lower(c.content) LIKE '%' || p.q || '%'
    )
  ORDER BY
    greatest(
      extensions.similarity(lower(coalesce(c.title, '')), p.q),
      extensions.similarity(lower(c.content), p.q)
    ) DESC,
    c.created_at DESC
  LIMIT (select lim FROM p)
$function$;

CREATE OR REPLACE FUNCTION public.search_glossary_fuzzy(
  search_query text,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  term text,
  definition text
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'extensions'
AS $function$
  WITH p AS (
    SELECT
      lower(btrim(coalesce(search_query, ''))) AS q,
      least(greatest(coalesce(result_limit, 10), 1), 50) AS lim
  )
  SELECT
    g.id,
    g.term,
    g.definition
  FROM public.glossary AS g
  CROSS JOIN p
  WHERE p.q <> ''
    AND (
      lower(g.term) LIKE '%' || p.q || '%'
      OR lower(g.definition) LIKE '%' || p.q || '%'
    )
  ORDER BY
    greatest(
      extensions.similarity(lower(g.term), p.q),
      extensions.similarity(lower(g.definition), p.q)
    ) DESC,
    g.term ASC
  LIMIT (select lim FROM p)
$function$;

CREATE OR REPLACE FUNCTION public.search_journeys_fuzzy(
  search_query text,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  title text,
  subtitle text,
  description text
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'extensions'
AS $function$
  WITH p AS (
    SELECT
      lower(btrim(coalesce(search_query, ''))) AS q,
      least(greatest(coalesce(result_limit, 10), 1), 50) AS lim
  )
  SELECT
    j.id,
    j.title,
    j.subtitle,
    j.description
  FROM public.journeys AS j
  CROSS JOIN p
  WHERE j.is_active = true
    AND p.q <> ''
    AND (
      lower(j.title) LIKE '%' || p.q || '%'
      OR lower(coalesce(j.subtitle, '')) LIKE '%' || p.q || '%'
      OR lower(j.description) LIKE '%' || p.q || '%'
    )
  ORDER BY
    greatest(
      extensions.similarity(lower(j.title), p.q),
      extensions.similarity(lower(coalesce(j.subtitle, '')), p.q),
      extensions.similarity(lower(j.description), p.q)
    ) DESC,
    j.sort_order ASC,
    j.title ASC
  LIMIT (select lim FROM p)
$function$;

CREATE OR REPLACE FUNCTION public.search_saints_fuzzy(
  search_query text,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id text,
  name text,
  title text
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'extensions'
AS $function$
  WITH p AS (
    SELECT
      lower(btrim(coalesce(search_query, ''))) AS q,
      least(greatest(coalesce(result_limit, 10), 1), 50) AS lim
  )
  SELECT
    s.id,
    s.name,
    s.title
  FROM public.saints AS s
  CROSS JOIN p
  WHERE p.q <> ''
    AND (
      lower(s.name) LIKE '%' || p.q || '%'
      OR lower(coalesce(s.title, '')) LIKE '%' || p.q || '%'
    )
  ORDER BY
    greatest(
      extensions.similarity(lower(s.name), p.q),
      extensions.similarity(lower(coalesce(s.title, '')), p.q)
    ) DESC,
    s.name ASC
  LIMIT (select lim FROM p)
$function$;

CREATE OR REPLACE FUNCTION public.search_tags_fuzzy(
  search_query text,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id text,
  label text,
  category text,
  slug text,
  emoji text
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'extensions'
AS $function$
  WITH p AS (
    SELECT
      lower(btrim(coalesce(search_query, ''))) AS q,
      least(greatest(coalesce(result_limit, 10), 1), 50) AS lim
  )
  SELECT
    t.id::text,
    t.name,
    t.category,
    t.slug,
    t.emoji
  FROM public.themes AS t
  CROSS JOIN p
  WHERE p.q <> ''
    AND (
      lower(t.name) LIKE '%' || p.q || '%'
      OR lower(coalesce(t.slug, '')) LIKE '%' || p.q || '%'
      OR lower(coalesce(t.description, '')) LIKE '%' || p.q || '%'
    )
  ORDER BY
    greatest(
      extensions.similarity(lower(t.name), p.q),
      extensions.similarity(lower(coalesce(t.slug, '')), p.q),
      extensions.similarity(lower(coalesce(t.description, '')), p.q)
    ) DESC,
    t.name ASC
  LIMIT (select lim FROM p)
$function$;

GRANT EXECUTE ON FUNCTION public.search_community_posts_fuzzy(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_glossary_fuzzy(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_journeys_fuzzy(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_saints_fuzzy(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_tags_fuzzy(text, integer) TO anon, authenticated;
