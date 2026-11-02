-- Cátedra Digital · Nexus policy hardening
-- Keep public SELECT separate from privileged writes to avoid duplicate SELECT policies.
drop policy if exists "nexus_relations_admin_all" on public.nexus_relations;
create policy "nexus_relations_admin_write"
  on public.nexus_relations
  for all
  to authenticated
  using ((select auth_internal.has_role(auth.uid(), 'admin'::public.app_role)))
  with check ((select auth_internal.has_role(auth.uid(), 'admin'::public.app_role)));
