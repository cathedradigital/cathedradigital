REVOKE ALL ON TABLE public.bible_favorites FROM anon, public, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.bible_favorites TO authenticated;
GRANT ALL ON TABLE public.bible_favorites TO service_role;
