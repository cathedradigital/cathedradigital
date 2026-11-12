-- Restore missing schema dependencies for RPCs referenced by the Cathedra Digital app.
--
-- IMPORTANT:
--   * This migration is applied separately from the RPC stub migration.
--   * It is idempotent for fresh databases and databases with partial drift.
--   * It creates data structures only. RPC bodies that were not present in the
--     database cannot be reconstructed safely from their names alone.
--   * Review data-volume, RLS and production rollout policy before applying.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Shared helper types
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'editorial_status_enum'
  ) THEN
    CREATE TYPE public.editorial_status_enum AS ENUM (
      'draft', 'editorial_review', 'doctrinal_review', 'published', 'archived'
    );
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- Editorial columns referenced by the missing review RPCs and admin screens
-- ---------------------------------------------------------------------------

ALTER TABLE public.saints
  ADD COLUMN IF NOT EXISTS editorial_status public.editorial_status_enum,
  ADD COLUMN IF NOT EXISTS editorial_author uuid,
  ADD COLUMN IF NOT EXISTS editorial_reviewer uuid,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS iconography jsonb;

ALTER TABLE public.saints
  ALTER COLUMN editorial_status SET DEFAULT 'draft'::public.editorial_status_enum;

ALTER TABLE public.glossary
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE public.journeys
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

UPDATE public.journeys
SET slug = COALESCE(slug, regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL;

ALTER TABLE public.catechism_official
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS texto_base text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

UPDATE public.catechism_official
SET texto_base = COALESCE(texto_base, content)
WHERE texto_base IS NULL;

CREATE INDEX IF NOT EXISTS saints_editorial_status_idx
  ON public.saints (editorial_status, editorial_score DESC);
CREATE INDEX IF NOT EXISTS glossary_status_published_at_idx
  ON public.glossary (status, published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS journeys_slug_uidx
  ON public.journeys (slug)
  WHERE slug IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Bible translation catalog and import jobs
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bible_translation_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'pt-BR',
  translation text NOT NULL,
  author text,
  year_published integer,
  license text NOT NULL,
  attribution text NOT NULL,
  source_url text,
  file_url text,
  notes text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'importing', 'ready', 'failed', 'archived')),
  is_primary boolean NOT NULL DEFAULT false,
  pcl_status text NOT NULL DEFAULT 'pending',
  books_count integer NOT NULL DEFAULT 0,
  chapters_count integer NOT NULL DEFAULT 0,
  verses_count integer NOT NULL DEFAULT 0,
  imported_at timestamptz,
  certified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bible_translation_sources_primary_uidx
  ON public.bible_translation_sources (is_primary)
  WHERE is_primary = true AND status <> 'archived';

CREATE TABLE IF NOT EXISTS public.bible_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.bible_translation_sources(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  progress integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  current_book text,
  message text,
  error text,
  verification jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bible_books
  ADD COLUMN IF NOT EXISTS translation_id uuid REFERENCES public.bible_translation_sources(id);
ALTER TABLE public.bible_chapters
  ADD COLUMN IF NOT EXISTS translation_id uuid REFERENCES public.bible_translation_sources(id);
ALTER TABLE public.bible_verses
  ADD COLUMN IF NOT EXISTS translation_id uuid REFERENCES public.bible_translation_sources(id);

CREATE INDEX IF NOT EXISTS bible_import_jobs_source_status_idx
  ON public.bible_import_jobs (source_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS bible_verses_translation_idx
  ON public.bible_verses (translation_id, chapter_id, number);

-- ---------------------------------------------------------------------------
-- Nexus contributions and editorial import/coverage support
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.nexus_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_abbr text NOT NULL,
  chapter integer NOT NULL CHECK (chapter > 0),
  verse integer CHECK (verse IS NULL OR verse > 0),
  connection_type text NOT NULL
    CHECK (connection_type IN ('catechism', 'bible', 'document', 'theology', 'cross_ref')),
  reference_id text,
  reference_title text NOT NULL,
  summary text NOT NULL,
  contributor_notes text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nexus_chapter_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_abbr text NOT NULL,
  chapter integer NOT NULL CHECK (chapter > 0),
  testament text,
  is_empty boolean NOT NULL DEFAULT true,
  connections_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_abbr, chapter)
);

CREATE TABLE IF NOT EXISTS public.nexus_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  filename text,
  total_rows integer NOT NULL DEFAULT 0,
  inserted_rows integer NOT NULL DEFAULT 0,
  skipped_rows integer NOT NULL DEFAULT 0,
  error_rows integer NOT NULL DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id uuid REFERENCES public.bible_verses(id) ON DELETE CASCADE,
  book_abbr text NOT NULL,
  chapter integer NOT NULL CHECK (chapter > 0),
  verse integer CHECK (verse IS NULL OR verse > 0),
  category text NOT NULL,
  reference_title text NOT NULL,
  reference_id text,
  summary text,
  source text NOT NULL DEFAULT 'editorial',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  editor_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nexus_contributions_review_idx
  ON public.nexus_contributions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS nexus_coverage_book_chapter_idx
  ON public.nexus_chapter_coverage (book_abbr, chapter);

-- ---------------------------------------------------------------------------
-- Bible audit and retention support
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bible_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_audit_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_audit_security_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL,
  compliance_score integer,
  issues_found jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.bible_audit_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  target text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  priority_threshold integer NOT NULL DEFAULT 0,
  channel text NOT NULL DEFAULT 'webhook',
  priority integer NOT NULL DEFAULT 0,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  retry_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  is_latest boolean NOT NULL DEFAULT true,
  has_secret boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_audit_notification_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.bible_audit_notifications(id) ON DELETE CASCADE,
  version integer NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, version)
);

CREATE TABLE IF NOT EXISTS public.bible_audit_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.bible_audit_notifications(id) ON DELETE SET NULL,
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_status integer,
  response_body text,
  duration_ms integer,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text,
  verification_details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.bible_audit_security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'info',
  category text,
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_audit_a11y_config (
  id text PRIMARY KEY,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_audit_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_audit_log_retention_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  retention_days integer NOT NULL DEFAULT 90 CHECK (retention_days BETWEEN 1 AND 3650),
  auto_cleanup_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.bible_audit_log_cleanup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by text NOT NULL,
  retention_days integer NOT NULL,
  rows_deleted integer NOT NULL DEFAULT 0,
  duration_ms integer,
  status text NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.bible_audit_log_retention_config (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS bible_audit_action_logs_created_idx
  ON public.bible_audit_action_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS bible_audit_action_logs_action_idx
  ON public.bible_audit_action_logs (action, created_at DESC);
CREATE INDEX IF NOT EXISTS bible_audit_webhook_deliveries_delivered_idx
  ON public.bible_audit_webhook_deliveries (delivered_at DESC);

-- ---------------------------------------------------------------------------
-- PostgreSQL statistics snapshots and notification queue support
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pg_stat_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  taken_at timestamptz NOT NULL DEFAULT now(),
  label text,
  note text,
  window_seconds integer,
  total_calls bigint,
  total_exec_ms numeric,
  row_count integer,
  rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pg_stat_snapshot_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  enabled boolean NOT NULL DEFAULT false,
  interval_minutes integer NOT NULL DEFAULT 60 CHECK (interval_minutes BETWEEN 5 AND 1440),
  retention_days integer NOT NULL DEFAULT 30 CHECK (retention_days BETWEEN 1 AND 365),
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_message text,
  consecutive_failures integer NOT NULL DEFAULT 0,
  notify_webhook_url text,
  notify_slack_webhook_url text,
  last_notified_at timestamptz,
  last_notification_error text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.bible_audit_notifications(id) ON DELETE SET NULL,
  channel text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'cancelled')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_channel_gates (
  channel text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.pg_stat_snapshot_config (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS pg_stat_snapshots_taken_idx
  ON public.pg_stat_snapshots (taken_at DESC);
CREATE INDEX IF NOT EXISTS notification_queue_status_idx
  ON public.notification_queue (status, available_at);

-- ---------------------------------------------------------------------------
-- Unified public-library view
-- ---------------------------------------------------------------------------

DROP VIEW IF EXISTS public.library_items_v1;

CREATE VIEW public.library_items_v1
WITH (security_invoker = true)
AS
  SELECT
    'saint_work'::text AS library_kind,
    (s.id || ':' || (w.ordinality - 1))::text AS id,
    (s.id || ':' || (w.ordinality - 1))::text AS slug,
    COALESCE(NULLIF(w.work->>'title', ''), s.name) AS title,
    s.name AS author_label,
    ('/santos/' || s.id)::text AS author_href,
    COALESCE(s.category, 'santos') AS category,
    NULL::integer AS year,
    COALESCE(w.work->>'description', s.bio) AS synopsis,
    NULL::text[] AS themes,
    'internal'::text AS access_type,
    s.image AS cover_image_url,
    0::integer AS reading_minutes,
    0::integer AS chapter_count,
    CASE WHEN s.editorial_status = 'published' THEN 'complete' ELSE 'minimal' END::text AS ficha_completeness,
    false AS is_public_domain,
    'pt-BR'::text AS language,
    ('/santos/' || s.id)::text AS href,
    s.editorial_score,
    s.updated_at
  FROM public.saints AS s
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(s.works) = 'array' THEN s.works ELSE '[]'::jsonb END
  ) WITH ORDINALITY AS w(work, ordinality)
  WHERE s.status <> 'merged'

  UNION ALL

  SELECT
    CASE WHEN sc.type = 'magisterium' THEN 'magisterium' ELSE 'patristic' END::text,
    sc.id::text,
    COALESCE(sc.reference_id, sc.id::text),
    COALESCE(sc.title, 'Sem título'),
    COALESCE(sc.metadata->>'author', 'Igreja'),
    COALESCE(sc.metadata->>'author_href', '/biblioteca'),
    COALESCE(sc.metadata->>'category', sc.type),
    NULL::integer,
    sc.content_text,
    sc.tags,
    'internal'::text,
    sc.metadata->>'cover_image_url',
    0::integer,
    0::integer,
    'minimal'::text,
    false,
    COALESCE(sc.metadata->>'language', 'pt-BR'),
    CASE WHEN sc.type = 'magisterium'
      THEN '/magisterium/' || COALESCE(sc.reference_id, sc.id::text)
      ELSE '/biblioteca/padres/' || COALESCE(sc.reference_id, sc.id::text)
    END,
    0::integer,
    sc.created_at
  FROM public.spiritual_contents AS sc
  WHERE sc.type IN ('magisterium', 'patristics')

  UNION ALL

  SELECT
    'classic'::text,
    c.id::text,
    c.slug,
    c.title,
    COALESCE(c.hero_quote_author, 'Cathedra Digital'),
    '/biblioteca',
    c.category,
    NULL::integer,
    COALESCE(c.subtitle, c.description),
    NULL::text[],
    'summary_only'::text,
    c.cover,
    COALESCE(c.estimated_reading_time_minutes, 0),
    0::integer,
    CASE WHEN c.status = 'published' THEN 'complete' ELSE 'stub' END::text,
    false,
    'pt-BR'::text,
    '/colecoes/' || c.slug,
    0::integer,
    c.updated_at
  FROM public.collections AS c
  WHERE c.status = 'published';

GRANT SELECT ON public.library_items_v1 TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security baseline
-- ---------------------------------------------------------------------------

ALTER TABLE public.bible_translation_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_chapter_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_notification_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_a11y_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_log_retention_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_audit_log_cleanup_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pg_stat_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pg_stat_snapshot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channel_gates ENABLE ROW LEVEL SECURITY;

-- Public users may submit a Nexus suggestion and read only their own pending row.
DROP POLICY IF EXISTS nexus_contributions_insert_own ON public.nexus_contributions;
CREATE POLICY nexus_contributions_insert_own
  ON public.nexus_contributions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS nexus_contributions_select_own ON public.nexus_contributions;
CREATE POLICY nexus_contributions_select_own
  ON public.nexus_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Approved Nexus content is public; administrative review remains protected by
-- the missing approve/reject RPCs and their eventual SECURITY DEFINER bodies.
DROP POLICY IF EXISTS nexus_contributions_select_approved ON public.nexus_contributions;
CREATE POLICY nexus_contributions_select_approved
  ON public.nexus_contributions FOR SELECT TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS nexus_coverage_public_read ON public.nexus_chapter_coverage;
CREATE POLICY nexus_coverage_public_read
  ON public.nexus_chapter_coverage FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS bible_translation_sources_authenticated_read ON public.bible_translation_sources;
CREATE POLICY bible_translation_sources_authenticated_read
  ON public.bible_translation_sources FOR SELECT TO authenticated
  USING (true);

-- No broad client policies are created for audit, queue, snapshot or config
-- tables. Their future admin RPCs must enforce has_role('admin')/equivalent.
