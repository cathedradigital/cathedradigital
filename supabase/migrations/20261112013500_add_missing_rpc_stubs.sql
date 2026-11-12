-- Stub RPC implementations for functions referenced by the application but
-- absent from the connected Supabase schema.
--
-- These are deliberately conservative defaults:
--   * admin operations require the existing public.is_admin() guard;
--   * read-only stubs return empty/safe results when no source data exists;
--   * mutating stubs perform only the minimal database operation required by
--     the current UI contract;
--   * replace each stub with the domain implementation before enabling any
--     automated production workflow.

-- ---------------------------------------------------------------------------
-- Shared helpers and small schema compatibility additions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public._stub_require_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT COALESCE(public.is_admin(), false) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public._stub_require_admin() FROM PUBLIC;

ALTER TABLE IF EXISTS public.bible_import_jobs
  ADD COLUMN IF NOT EXISTS audit_log jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS public.notification_queue
  ADD COLUMN IF NOT EXISTS target_url text,
  ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_status_code integer,
  ADD COLUMN IF NOT EXISTS last_request_id bigint,
  ADD COLUMN IF NOT EXISTS succeeded_at timestamptz;

CREATE TABLE IF NOT EXISTS public.notification_queue_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_queue_id uuid NOT NULL REFERENCES public.notification_queue(id) ON DELETE CASCADE,
  attempt_no integer NOT NULL,
  event text NOT NULL,
  status_code integer,
  error_msg text,
  next_attempt_at timestamptz,
  request_id bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glossary_permissions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('editor', 'reviewer', 'admin')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- PostgreSQL statistics and snapshot administration
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_get_pg_stat_snapshot_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE r jsonb;
BEGIN
  PERFORM public._stub_require_admin();
  SELECT to_jsonb(c) INTO r FROM public.pg_stat_snapshot_config c WHERE c.id = true;
  RETURN COALESCE(r, jsonb_build_object(
    'enabled', false, 'interval_minutes', 60, 'retention_days', 30,
    'last_run_at', null, 'last_success_at', null, 'last_error_at', null,
    'last_error_message', null, 'consecutive_failures', 0,
    'notify_webhook_url', null, 'notify_slack_webhook_url', null,
    'last_notified_at', null, 'last_notification_error', null
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_pg_stat_snapshot_config(
  p_enabled boolean DEFAULT false,
  p_interval_minutes integer DEFAULT 60,
  p_retention_days integer DEFAULT 30,
  p_notify_webhook_url text DEFAULT null,
  p_notify_slack_webhook_url text DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE r jsonb;
BEGIN
  PERFORM public._stub_require_admin();
  IF p_interval_minutes NOT BETWEEN 5 AND 1440 THEN
    RAISE EXCEPTION 'interval_minutes must be between 5 and 1440';
  END IF;
  IF p_retention_days NOT BETWEEN 1 AND 365 THEN
    RAISE EXCEPTION 'retention_days must be between 1 and 365';
  END IF;
  INSERT INTO public.pg_stat_snapshot_config (
    id, enabled, interval_minutes, retention_days,
    notify_webhook_url, notify_slack_webhook_url, updated_by, updated_at
  ) VALUES (
    true, p_enabled, p_interval_minutes, p_retention_days,
    NULLIF(p_notify_webhook_url, ''), NULLIF(p_notify_slack_webhook_url, ''),
    auth.uid(), now()
  )
  ON CONFLICT (id) DO UPDATE SET
    enabled = excluded.enabled,
    interval_minutes = excluded.interval_minutes,
    retention_days = excluded.retention_days,
    notify_webhook_url = excluded.notify_webhook_url,
    notify_slack_webhook_url = excluded.notify_slack_webhook_url,
    updated_by = excluded.updated_by,
    updated_at = now();
  SELECT to_jsonb(c) INTO r FROM public.pg_stat_snapshot_config c WHERE c.id = true;
  RETURN r;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_capture_pg_stat_snapshot(
  p_label text DEFAULT null,
  p_note text DEFAULT null,
  p_limit integer DEFAULT 200
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE snapshot_id uuid;
BEGIN
  PERFORM public._stub_require_admin();
  INSERT INTO public.pg_stat_snapshots (label, note, window_seconds, total_calls, total_exec_ms, row_count, rows)
  VALUES (NULLIF(p_label, ''), NULLIF(p_note, ''), 0, 0, 0, 0, '[]'::jsonb)
  RETURNING id INTO snapshot_id;
  UPDATE public.pg_stat_snapshot_config
  SET last_run_at = now(), last_success_at = now(), last_error_at = null,
      last_error_message = null, consecutive_failures = 0, updated_at = now()
  WHERE id = true;
  RETURN snapshot_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_pg_stat_statements(
  p_order_by text DEFAULT 'total_exec_time',
  p_limit integer DEFAULT 100,
  p_min_calls bigint DEFAULT 0
)
RETURNS TABLE (
  query text,
  calls bigint,
  total_exec_ms numeric,
  mean_exec_ms numeric,
  max_exec_ms numeric,
  min_exec_ms numeric,
  stddev_exec_ms numeric,
  rows_returned bigint,
  shared_blks_hit bigint,
  shared_blks_read bigint,
  stats_since timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  -- Safe empty result until pg_stat_statements collection is wired to policy.
  RETURN QUERY SELECT
    ''::text, 0::bigint, 0::numeric, 0::numeric, 0::numeric, 0::numeric,
    0::numeric, 0::bigint, 0::bigint, 0::bigint, null::timestamptz
  WHERE false;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_pg_stat_statements()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  -- Intentionally a no-op stub. Resetting the global extension requires a
  -- separately reviewed policy because it destroys the current measurement window.
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_explain_query(
  p_query text,
  p_analyze boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  IF p_query IS NULL OR p_query !~* '^\s*(select|with)\b' THEN
    RAISE EXCEPTION 'only SELECT/WITH statements are accepted by the stub';
  END IF;
  RETURN format('-- EXPLAIN stub: execution not performed.%s',
    CASE WHEN p_analyze THEN E'\n-- ANALYZE was requested but is disabled in this stub.' ELSE '' END);
END;
$$;

-- ---------------------------------------------------------------------------
-- Notification queue administration
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_list_pending_notifications(
  p_limit integer DEFAULT 100,
  p_status text DEFAULT null
)
RETURNS TABLE (
  id uuid, channel text, target_url text, payload jsonb, status text,
  attempts integer, max_attempts integer, next_attempt_at timestamptz,
  last_attempt_at timestamptz, last_error text, last_status_code integer,
  last_request_id bigint, created_at timestamptz, succeeded_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  RETURN QUERY
  SELECT q.id, q.channel, q.target_url, q.payload, q.status, q.attempts,
         q.max_attempts, q.next_attempt_at, q.last_attempt_at, q.last_error,
         q.last_status_code, q.last_request_id, q.created_at, q.succeeded_at
  FROM public.notification_queue q
  WHERE p_status IS NULL OR q.status = p_status
  ORDER BY q.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_notif_queue_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE r jsonb;
BEGIN
  PERFORM public._stub_require_admin();
  SELECT jsonb_build_object(
    'pending', count(*) FILTER (WHERE status = 'queued'),
    'in_flight', count(*) FILTER (WHERE status = 'sending'),
    'succeeded', count(*) FILTER (WHERE status = 'sent'),
    'failed', count(*) FILTER (WHERE status = 'failed'),
    'total', count(*)
  ) INTO r FROM public.notification_queue;
  RETURN COALESCE(r, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_notif_channel_gates_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE r jsonb;
BEGIN
  PERFORM public._stub_require_admin();
  SELECT jsonb_build_object(
    'generated_at', now(),
    'channels', COALESCE(jsonb_agg(jsonb_build_object(
      'channel', g.channel, 'enabled', g.enabled, 'blocked', false,
      'max_fail_rate', 1.0, 'window_minutes', 60, 'min_samples', 0,
      'max_attempts_default', 3,
      'metrics', jsonb_build_object('succeeded', 0, 'failed', 0, 'total', 0,
        'fail_rate', 0, 'earliest_failed_at', null, 'last_failed_at', null),
      'eta_unblock_at', null, 'reason', null
    )), '[]'::jsonb)
  ) INTO r
  FROM public.notification_channel_gates g;
  RETURN r;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_notif_validate_channel(
  p_channel text,
  p_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  IF p_channel NOT IN ('webhook', 'slack') THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'unsupported channel', 'checks', '[]'::jsonb);
  END IF;
  IF p_url IS NULL OR p_url !~* '^https://' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'URL must use HTTPS', 'checks', '[]'::jsonb);
  END IF;
  RETURN jsonb_build_object('valid', true, 'reason', 'URL accepted by stub validation',
    'host', regexp_replace(p_url, '^https://([^/]+).*$','\1'), 'checks', '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_notif_send_test(p_channel text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE nid uuid; target text;
BEGIN
  PERFORM public._stub_require_admin();
  SELECT CASE WHEN p_channel = 'slack' THEN notify_slack_webhook_url ELSE notify_webhook_url END
  INTO target FROM public.pg_stat_snapshot_config WHERE id = true;
  INSERT INTO public.notification_queue (channel, target_url, payload, status)
  VALUES (p_channel, target, jsonb_build_object('type', 'test', 'created_at', now()), 'queued')
  RETURNING id INTO nid;
  RETURN jsonb_build_object('notification_id', nid, 'status', 'queued');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_retry_pending_notification(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  UPDATE public.notification_queue
  SET status = 'queued', attempts = 0, next_attempt_at = now(), last_error = null
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_notification_attempts(p_id uuid)
RETURNS TABLE (
  id uuid, attempt_no integer, event text, status_code integer,
  error_msg text, next_attempt_at timestamptz, request_id bigint, created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  RETURN QUERY SELECT a.id, a.attempt_no, a.event, a.status_code, a.error_msg,
    a.next_attempt_at, a.request_id, a.created_at
  FROM public.notification_queue_attempts a
  WHERE a.notification_queue_id = p_id
  ORDER BY a.created_at DESC;
END;
$$;

-- ---------------------------------------------------------------------------
-- Bible readiness, coverage and phases
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bible_canonical_coverage()
RETURNS TABLE (
  abbrev text, name text, testament text, canonical_type text,
  expected_chapters integer, chapters_present bigint, verses_total bigint,
  english_verse_count bigint, coverage_pct numeric, status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT b.abbrev, b.name, b.testament, b.canonical_type,
    b.chapters_count,
    count(DISTINCT c.id), count(v.id), 0::bigint,
    CASE WHEN b.chapters_count = 0 THEN 0::numeric
         ELSE round(100.0 * count(DISTINCT c.id) / b.chapters_count, 2) END,
    CASE WHEN count(DISTINCT c.id) = 0 THEN 'missing'
         WHEN count(DISTINCT c.id) < b.chapters_count THEN 'partial'
         ELSE 'ok' END
  FROM public.bible_books b
  LEFT JOIN public.bible_chapters c ON c.book_id = b.id
  LEFT JOIN public.bible_verses v ON v.chapter_id = c.id
  GROUP BY b.id, b.abbrev, b.name, b.testament, b.canonical_type, b.chapters_count
  ORDER BY b.abbrev;
$$;

CREATE OR REPLACE FUNCTION public.bible_translations_readiness()
RETURNS TABLE (
  id uuid, code text, name text, author text, year_published integer,
  status text, is_primary boolean, books_count integer, chapters_count integer,
  verses_count integer, imported_at timestamptz, certified_at timestamptz,
  ready boolean, reason text, sprint1_passed boolean, gate_blocked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.id, s.code, s.name, s.author, s.year_published, s.status,
    s.is_primary, s.books_count, s.chapters_count, s.verses_count,
    s.imported_at, s.certified_at,
    (s.status = 'ready' AND s.certified_at IS NOT NULL) AS ready,
    CASE WHEN s.status <> 'ready' THEN 'source is not ready'
         WHEN s.certified_at IS NULL THEN 'source is not certified'
         ELSE null END AS reason,
    (s.status = 'ready') AS sprint1_passed,
    false AS gate_blocked
  FROM public.bible_translation_sources s
  ORDER BY s.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_active_primary_translation()
RETURNS TABLE (id uuid, code text, name text, translation text, status text, pcl_status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.id, s.code, s.name, s.translation, s.status, s.pcl_status
  FROM public.bible_translation_sources s
  WHERE s.is_primary = true AND s.status <> 'archived'
  ORDER BY s.updated_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_bible_phase_summary()
RETURNS TABLE (
  translation_id uuid, translation_code text, translation_name text,
  translation_status text, pipeline_stage text, is_primary boolean, phase text,
  expected_books integer, expected_chapters integer, actual_books bigint,
  actual_chapters bigint, actual_verses bigint, status text,
  certified_at timestamptz, ice_score numeric, check_verses boolean,
  check_references boolean, check_nexus boolean, check_popovers boolean,
  check_reader boolean, check_navigation boolean, check_continuity boolean,
  check_search boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT s.id, s.code, s.name, s.status,
    CASE WHEN s.is_primary THEN 'primary' ELSE s.status END,
    s.is_primary, p.phase,
    73, COALESCE(s.chapters_count, 0),
    count(DISTINCT b.id), count(DISTINCT c.id), count(v.id),
    CASE WHEN s.certified_at IS NOT NULL THEN 'certified' ELSE 'pending' END,
    s.certified_at, null::numeric,
    (s.verses_count > 0), false, false, false, false, false, false, false
  FROM public.bible_translation_sources s
  CROSS JOIN (VALUES ('verses'), ('references'), ('nexus'), ('popovers'), ('reader'), ('navigation'), ('continuity'), ('search')) p(phase)
  LEFT JOIN public.bible_books b ON b.translation_id = s.id
  LEFT JOIN public.bible_chapters c ON c.translation_id = s.id
  LEFT JOIN public.bible_verses v ON v.translation_id = s.id
  GROUP BY s.id, s.code, s.name, s.status, s.is_primary, s.chapters_count,
    s.verses_count, s.certified_at, p.phase;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_bible_audit_action_logs(
  p_triggered_by text DEFAULT 'manual',
  p_override_days integer DEFAULT null
)
RETURNS TABLE (rows_deleted integer, retention_days integer, status text, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE days integer; started timestamptz := clock_timestamp(); deleted_count integer;
BEGIN
  PERFORM public._stub_require_admin();
  SELECT COALESCE(p_override_days, retention_days) INTO days
  FROM public.bible_audit_log_retention_config WHERE id = true;
  days := GREATEST(1, LEAST(COALESCE(days, 90), 3650));
  DELETE FROM public.bible_audit_action_logs
  WHERE created_at < now() - make_interval(days => days);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO public.bible_audit_log_cleanup_runs
    (triggered_by, retention_days, rows_deleted, duration_ms, status)
  VALUES (p_triggered_by, days, deleted_count,
    extract(milliseconds from clock_timestamp() - started)::integer, 'succeeded');
  RETURN QUERY SELECT deleted_count, days, 'succeeded'::text, null::text;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT 0, days, 'failed'::text, SQLERRM;
END;
$$;

-- ---------------------------------------------------------------------------
-- Nexus editorial transitions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.approve_nexus_contribution(
  _contribution_id uuid,
  _reviewer_notes text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  UPDATE public.nexus_contributions
  SET status = 'approved', reviewer_id = auth.uid(), reviewer_notes = _reviewer_notes,
      reviewed_at = now(), updated_at = now()
  WHERE id = _contribution_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_nexus_contribution(
  _contribution_id uuid,
  _reviewer_notes text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  UPDATE public.nexus_contributions
  SET status = 'rejected', reviewer_id = auth.uid(), reviewer_notes = _reviewer_notes,
      reviewed_at = now(), updated_at = now()
  WHERE id = _contribution_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.saints_advance_editorial_stage(
  _saint_id text,
  _next_status public.editorial_status_enum,
  _note text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public._stub_require_admin();
  UPDATE public.saints
  SET editorial_status = _next_status,
      published_at = CASE WHEN _next_status = 'published' THEN COALESCE(published_at, now()) ELSE published_at END,
      updated_at = now()
  WHERE id = _saint_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Search and library RPCs
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.search_library_items(
  p_query text DEFAULT null,
  p_kinds text[] DEFAULT null,
  p_access text DEFAULT null,
  p_completeness text[] DEFAULT null,
  p_limit integer DEFAULT 24,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  library_kind text, id text, slug text, title text, author_label text,
  author_href text, category text, year integer, synopsis text, themes text[],
  access_type text, cover_image_url text, reading_minutes integer,
  chapter_count integer, ficha_completeness text, is_public_domain boolean,
  language text, href text, total_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT v.library_kind, v.id, v.slug, v.title, v.author_label, v.author_href,
    v.category, v.year, v.synopsis, v.themes, v.access_type, v.cover_image_url,
    v.reading_minutes, v.chapter_count, v.ficha_completeness, v.is_public_domain,
    v.language, v.href, count(*) OVER ()
  FROM public.library_items_v1 v
  WHERE (NULLIF(trim(p_query), '') IS NULL OR
         concat_ws(' ', v.title, v.author_label, v.category, v.synopsis) ILIKE '%' || p_query || '%')
    AND (p_kinds IS NULL OR v.library_kind = ANY(p_kinds))
    AND (p_access IS NULL OR v.access_type = p_access)
    AND (p_completeness IS NULL OR v.ficha_completeness = ANY(p_completeness))
  ORDER BY v.title
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 24), 100))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

CREATE OR REPLACE FUNCTION public.global_search_v2(
  p_query text,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id text, title text, subtitle text, content text, item_type text, slug text, rank real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM (
    SELECT s.id::text, s.name, COALESCE(s.title, ''), COALESCE(s.bio, ''), 'saint'::text, s.id::text, 1.0::real
    FROM public.saints s
    WHERE s.status <> 'merged' AND concat_ws(' ', s.name, s.title, s.bio) ILIKE '%' || p_query || '%'
    UNION ALL
    SELECT g.id::text, g.term, COALESCE(g.category, ''), COALESCE(g.short_definition, g.definition, ''), 'glossary', g.slug, 1.0::real
    FROM public.glossary g
    WHERE g.status = 'published' AND concat_ws(' ', g.term, g.short_definition, g.definition) ILIKE '%' || p_query || '%'
    UNION ALL
    SELECT j.id::text, j.title, COALESCE(j.subtitle, ''), COALESCE(j.description, ''), 'journey', COALESCE(j.slug, j.id::text), 1.0::real
    FROM public.journeys j
    WHERE j.status = 'published' AND concat_ws(' ', j.title, j.subtitle, j.description) ILIKE '%' || p_query || '%'
  ) q
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));
$$;

-- ---------------------------------------------------------------------------
-- Editorial scoring and identity/audit helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.resolve_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.glossary_role_for(_uid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE WHEN public.has_role(_uid, 'admin'::public.app_role) THEN 'admin'
    ELSE (SELECT gp.role FROM public.glossary_permissions gp WHERE gp.user_id = _uid LIMIT 1)
  END;
$$;

CREATE OR REPLACE FUNCTION public.log_bible_audit_action(
  p_action text,
  p_entity_type text DEFAULT null,
  p_entity_id text DEFAULT null,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE id_out uuid;
BEGIN
  INSERT INTO public.bible_audit_action_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, COALESCE(p_metadata, '{}'::jsonb))
  RETURNING id INTO id_out;
  RETURN id_out;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_rls_denial(
  p_table text,
  p_action text,
  p_reason text DEFAULT null,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE id_out uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN null; END IF;
  INSERT INTO public.bible_audit_action_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'rls.denial', p_table, p_action,
    jsonb_build_object('reason', p_reason, 'context', COALESCE(p_context, '{}'::jsonb)))
  RETURNING id INTO id_out;
  RETURN id_out;
END;
$$;

CREATE OR REPLACE FUNCTION public.collections_metrics_v1()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'total_collections', (SELECT count(*) FROM public.collections WHERE status = 'published'),
    'total_items', (SELECT count(*) FROM public.collection_items),
    'by_track', COALESCE((SELECT jsonb_object_agg(COALESCE(track, 'sem_trilha'), n) FROM (
      SELECT track, count(*) n FROM public.collections WHERE status = 'published' GROUP BY track
    ) x), '{}'::jsonb),
    'top_started', '[]'::jsonb,
    'top_completed', '[]'::jsonb,
    'avg_completion_minutes', 0,
    'generated_at', now()
  );
$$;

CREATE OR REPLACE FUNCTION public.editorial_correction_priority(_entity text)
RETURNS TABLE (
  slug text, term text, area text, status text, ice integer, editorial integer,
  nexus integer, missing_deep boolean, missing_faq boolean, missing_logos boolean,
  missing_bible boolean, missing_cic boolean, missing_fathers boolean,
  missing_count integer, effort_tier text, inbound_refs integer,
  impact_tier text, priority text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT g.slug, g.term, g.category, g.status, 0, g.doctrinal_weight,
    0, g.deep_interpretation IS NULL, g.faq IS NULL, g.logos_meditation IS NULL,
    COALESCE(cardinality(g.bible_verses), 0) = 0,
    COALESCE(cardinality(g.catechism_references), 0) = 0,
    COALESCE(cardinality(g.fathers_refs), 0) = 0,
    ((g.deep_interpretation IS NULL)::integer + (g.faq IS NULL)::integer +
      (g.logos_meditation IS NULL)::integer + (COALESCE(cardinality(g.bible_verses),0)=0)::integer +
      (COALESCE(cardinality(g.catechism_references),0)=0)::integer +
      (COALESCE(cardinality(g.fathers_refs),0)=0)::integer),
    'unknown', 0, 'unknown', 'stub'
  FROM public.glossary g
  WHERE _entity = 'glossary'
  ORDER BY g.term;
$$;

CREATE OR REPLACE FUNCTION public.glossary_correction_priority()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$ SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb) FROM public.editorial_correction_priority('glossary') x; $$;

CREATE OR REPLACE FUNCTION public.glossary_doctrinal_coverage()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'status', x.status, 'count', x.row_count, 'avg_doctrinal_weight', x.avg_doctrinal_weight
  ) ORDER BY x.status), '[]'::jsonb)
  FROM (
    SELECT status, count(*) AS row_count, avg(doctrinal_weight) AS avg_doctrinal_weight
    FROM public.glossary
    GROUP BY status
  ) x;
$$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public._stub_require_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_library_items(text, text[], text, text[], integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.global_search_v2(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_library_items(text, text[], text, text[], integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bible_canonical_coverage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bible_translations_readiness() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_primary_translation() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bible_canonical_coverage() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_rls_denial(text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_bible_audit_action(text, text, text, jsonb) TO authenticated;
