drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (
    (select auth.uid()) = id
    or public.has_role((select auth.uid()), 'admin'::public.app_role)
  );

create policy "profiles_insert_own_or_admin" on public.profiles
  for insert to authenticated
  with check (
    (select auth.uid()) = id
    or public.has_role((select auth.uid()), 'admin'::public.app_role)
  );

create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (
    (select auth.uid()) = id
    or public.has_role((select auth.uid()), 'admin'::public.app_role)
  )
  with check (
    (select auth.uid()) = id
    or public.has_role((select auth.uid()), 'admin'::public.app_role)
  );
