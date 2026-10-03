drop policy if exists source_sync_state_no_browser_read on public.source_sync_state;
drop policy if exists source_sync_state_no_browser_write on public.source_sync_state;

create policy source_sync_state_no_browser_access
  on public.source_sync_state
  for all
  to anon, authenticated
  using (false)
  with check (false);
