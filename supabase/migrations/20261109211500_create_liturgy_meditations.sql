-- Public, non-personal editorial content for the daily liturgy.
CREATE TABLE IF NOT EXISTS public.liturgy_meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_date date NOT NULL UNIQUE,
  theme text,
  reading_key text,
  fathers jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(fathers) = 'array'),
  catechism jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(catechism) = 'array'),
  magisterium jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(magisterium) = 'array'),
  logos jsonb CHECK (logos IS NULL OR jsonb_typeof(logos) = 'object'),
  final_prayer text,
  church_history jsonb CHECK (church_history IS NULL OR jsonb_typeof(church_history) = 'object'),
  action_of_day text,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  model text,
  provider text NOT NULL DEFAULT 'lovable',
  prompt_hash text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.liturgy_meditations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.liturgy_meditations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.liturgy_meditations TO anon, authenticated;
GRANT ALL ON TABLE public.liturgy_meditations TO service_role;

CREATE POLICY "Published liturgy meditations are publicly readable"
  ON public.liturgy_meditations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- At most two paid attempts per liturgical date per UTC day, with a short
-- lease to prevent concurrent anonymous page loads from duplicating work.
CREATE TABLE IF NOT EXISTS public.liturgy_meditation_generation_locks (
  iso_date date PRIMARY KEY,
  attempt_day date NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count BETWEEN 1 AND 2),
  lease_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.liturgy_meditation_generation_locks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.liturgy_meditation_generation_locks FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.liturgy_meditation_generation_locks TO service_role;

CREATE OR REPLACE FUNCTION public.claim_liturgy_meditation_generation(p_iso_date date)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claimed boolean := false;
  utc_day date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  INSERT INTO public.liturgy_meditation_generation_locks (iso_date, attempt_day, attempt_count, lease_until)
  VALUES (p_iso_date, utc_day, 1, now() + interval '5 minutes')
  ON CONFLICT (iso_date) DO UPDATE
    SET attempt_day = CASE
          WHEN public.liturgy_meditation_generation_locks.attempt_day < utc_day THEN utc_day
          ELSE public.liturgy_meditation_generation_locks.attempt_day
        END,
        attempt_count = CASE
          WHEN public.liturgy_meditation_generation_locks.attempt_day < utc_day THEN 1
          ELSE public.liturgy_meditation_generation_locks.attempt_count + 1
        END,
        lease_until = now() + interval '5 minutes',
        created_at = now()
    WHERE public.liturgy_meditation_generation_locks.lease_until <= now()
      AND (
        public.liturgy_meditation_generation_locks.attempt_day < utc_day
        OR public.liturgy_meditation_generation_locks.attempt_count < 2
      )
  RETURNING true INTO claimed;

  RETURN COALESCE(claimed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_liturgy_meditation_generation(date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_liturgy_meditation_generation(date) TO service_role;
