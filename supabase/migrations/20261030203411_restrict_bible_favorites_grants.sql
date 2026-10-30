-- Remove broad default grants from the authenticated role.
-- RLS does not protect TRUNCATE, so keep this table's privileges minimal.

REVOKE ALL ON TABLE public.bible_favorites FROM anon, public, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.bible_favorites TO authenticated;
GRANT ALL ON TABLE public.bible_favorites TO service_role;
