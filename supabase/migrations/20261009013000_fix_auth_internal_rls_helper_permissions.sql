-- Policies reference auth_internal.has_role(uuid, app_role), so authenticated
-- sessions need schema USAGE and EXECUTE on this one boolean helper. Keep all
-- other internal SECURITY DEFINER functions private.
GRANT USAGE ON SCHEMA auth_internal TO authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA auth_internal FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth_internal.has_role(uuid, app_role) TO authenticated;

-- The profile policies previously resolved the unqualified helper to
-- public.has_role, whose EXECUTE grant is intentionally restricted to service_role.
-- Use the internal helper consistently instead of widening public.has_role.
DROP POLICY IF EXISTS profiles_insert_own_or_admin ON public.profiles;
CREATE POLICY profiles_insert_own_or_admin
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = id
  OR auth_internal.has_role((SELECT auth.uid()), 'admin'::app_role)
);

DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR auth_internal.has_role((SELECT auth.uid()), 'admin'::app_role)
);

DROP POLICY IF EXISTS profiles_update_own_or_admin ON public.profiles;
CREATE POLICY profiles_update_own_or_admin
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR auth_internal.has_role((SELECT auth.uid()), 'admin'::app_role)
)
WITH CHECK (
  (SELECT auth.uid()) = id
  OR auth_internal.has_role((SELECT auth.uid()), 'admin'::app_role)
);
