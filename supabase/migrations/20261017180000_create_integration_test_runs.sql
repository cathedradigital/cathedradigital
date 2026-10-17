-- Store the results produced by the admin integrations test panel.
-- Results are operational metadata and must remain admin-only.
create table if not exists public.integration_test_runs (
  id uuid primary key default gen_random_uuid(),
  integration_id text not null check (char_length(integration_id) between 1 and 100),
  ok boolean not null,
  message text not null default '' check (char_length(message) <= 500),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  tested_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists integration_test_runs_created_at_idx
  on public.integration_test_runs (created_at desc);

create index if not exists integration_test_runs_integration_created_at_idx
  on public.integration_test_runs (integration_id, created_at desc);

alter table public.integration_test_runs enable row level security;

-- AdminGuard calls this boolean RPC. Restrict execution to signed-in users;
-- the SECURITY DEFINER function reveals only whether the caller is an admin.
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke all on table public.integration_test_runs from anon, authenticated;
grant select, insert on table public.integration_test_runs to authenticated;

drop policy if exists integration_test_runs_admin_select on public.integration_test_runs;
create policy integration_test_runs_admin_select
  on public.integration_test_runs
  for select to authenticated
  using (public.is_admin());

drop policy if exists integration_test_runs_admin_insert on public.integration_test_runs;
create policy integration_test_runs_admin_insert
  on public.integration_test_runs
  for insert to authenticated
  with check (public.is_admin() and tested_by = auth.uid());

-- Cover the foreign key used by private emotion records without changing access.
create index if not exists user_emotions_user_id_idx
  on public.user_emotions (user_id);
