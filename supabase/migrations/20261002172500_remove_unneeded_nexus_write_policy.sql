-- Cátedra Digital · Nexus read-only runtime surface
-- Curated relations are consumed by the application; mutations are handled by
-- trusted ingestion/admin tooling rather than the browser client.
drop policy if exists "nexus_relations_admin_all" on public.nexus_relations;
drop policy if exists "nexus_relations_admin_write" on public.nexus_relations;
