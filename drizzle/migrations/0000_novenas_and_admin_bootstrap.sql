CREATE TABLE public.novenas (
  slug text PRIMARY KEY,
  title text NOT NULL,
  latin text,
  patron text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Santos',
  summary text NOT NULL DEFAULT '',
  opening text NOT NULL DEFAULT '',
  closing text NOT NULL DEFAULT '',
  final_prayer text NOT NULL DEFAULT '',
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.novenas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.novenas TO authenticated;
GRANT ALL ON public.novenas TO service_role;
ALTER TABLE public.novenas ENABLE ROW LEVEL SECURITY;
CREATE POLICY novenas_public_read ON public.novenas FOR SELECT USING (is_published = true);
CREATE POLICY novenas_admin_all ON public.novenas FOR ALL TO authenticated
  USING (auth_internal.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth_internal.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_novenas_updated_at BEFORE UPDATE ON public.novenas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::public.app_role);
$$;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Primeiro usuário cadastrado pode se tornar admin apenas se ainda não houver nenhum admin.
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(424242);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin'::public.app_role);
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role);
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;