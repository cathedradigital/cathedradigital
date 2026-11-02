-- Cátedra Digital: RLS query-plan hardening and missing FK indexes.
-- Authorization semantics are unchanged. The RLS predicates are wrapped in
-- scalar SELECTs so auth.uid() is evaluated once per statement, not per row.
-- Foreign-key indexes improve joins/deletes/updates on relationship columns.

DO $$
DECLARE
  p record;
  q text;
  w text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual, '') LIKE '%auth.uid()%'
           OR coalesce(with_check, '') LIKE '%auth.uid()%')
  LOOP
    q := CASE
      WHEN p.qual IS NULL THEN NULL
      ELSE replace(p.qual, 'auth.uid()', '(select auth.uid())')
    END;
    w := CASE
      WHEN p.with_check IS NULL THEN NULL
      ELSE replace(p.with_check, 'auth.uid()', '(select auth.uid())')
    END;

    IF q IS NOT NULL AND w IS NOT NULL THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING (%s) WITH CHECK (%s)',
        p.policyname, p.schemaname, p.tablename, q, w
      );
    ELSIF q IS NOT NULL THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING (%s)',
        p.policyname, p.schemaname, p.tablename, q
      );
    ELSE
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I WITH CHECK (%s)',
        p.policyname, p.schemaname, p.tablename, w
      );
    END IF;
  END LOOP;
END
$$;

CREATE INDEX IF NOT EXISTS corpus_ingestion_jobs_source_id_idx
  ON public.corpus_ingestion_jobs (source_id);

CREATE INDEX IF NOT EXISTS journey_progress_journey_id_idx
  ON public.journey_progress (journey_id);

CREATE INDEX IF NOT EXISTS journey_progress_step_id_idx
  ON public.journey_progress (step_id);

CREATE INDEX IF NOT EXISTS journey_steps_journey_id_idx
  ON public.journey_steps (journey_id);

CREATE INDEX IF NOT EXISTS prayer_sessions_prayer_id_idx
  ON public.prayer_sessions (prayer_id);

CREATE INDEX IF NOT EXISTS spiritual_journal_journey_id_idx
  ON public.spiritual_journal (journey_id);

CREATE INDEX IF NOT EXISTS spiritual_journal_step_id_idx
  ON public.spiritual_journal (step_id);

CREATE INDEX IF NOT EXISTS theme_contents_theme_id_idx
  ON public.theme_contents (theme_id);
