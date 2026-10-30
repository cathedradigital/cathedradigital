-- Create the user-scoped favorites table used by useDevotionalFavorites.
-- Enforce one last-read mark per user without changing existing rows.

CREATE TABLE IF NOT EXISTS public.bible_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_type text NOT NULL,
  content_id text NOT NULL,
  title text,
  content text,
  url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bible_favorites_user_content_unique UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE public.bible_favorites ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.bible_favorites FROM anon, public;
GRANT SELECT, INSERT, DELETE ON TABLE public.bible_favorites TO authenticated;
GRANT ALL ON TABLE public.bible_favorites TO service_role;

DROP POLICY IF EXISTS bible_favorites_select_own ON public.bible_favorites;
DROP POLICY IF EXISTS bible_favorites_insert_own ON public.bible_favorites;
DROP POLICY IF EXISTS bible_favorites_delete_own ON public.bible_favorites;

CREATE POLICY bible_favorites_select_own
  ON public.bible_favorites FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY bible_favorites_insert_own
  ON public.bible_favorites FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY bible_favorites_delete_own
  ON public.bible_favorites FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS bible_favorites_user_created_idx
  ON public.bible_favorites (user_id, created_at DESC);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.reading_marks
    WHERE is_last_read = true
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate last-read rows exist; reconcile before adding the unique index';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS reading_marks_one_last_read_per_user_idx
  ON public.reading_marks (user_id)
  WHERE is_last_read = true;
