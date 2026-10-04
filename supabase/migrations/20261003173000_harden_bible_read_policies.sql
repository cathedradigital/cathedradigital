-- Cátedra Digital · Bíblia
-- Evita policies PERMISSIVE sobrepostas no SELECT público das tabelas bíblicas.
-- Conteúdo bíblico continua público; somente operações de escrita ficam
-- reservadas ao papel admin autenticado.

drop policy if exists "bible_books_admin_all" on public.bible_books;
drop policy if exists "bible_chapters_admin_all" on public.bible_chapters;
drop policy if exists "bible_verses_admin_all" on public.bible_verses;

create policy "bible_books_admin_insert"
  on public.bible_books for insert to authenticated
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_books_admin_update"
  on public.bible_books for update to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role))
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_books_admin_delete"
  on public.bible_books for delete to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_chapters_admin_insert"
  on public.bible_chapters for insert to authenticated
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_chapters_admin_update"
  on public.bible_chapters for update to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role))
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_chapters_admin_delete"
  on public.bible_chapters for delete to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_verses_admin_insert"
  on public.bible_verses for insert to authenticated
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_verses_admin_update"
  on public.bible_verses for update to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role))
  with check (auth_internal.has_role((select auth.uid()), 'admin'::app_role));

create policy "bible_verses_admin_delete"
  on public.bible_verses for delete to authenticated
  using (auth_internal.has_role((select auth.uid()), 'admin'::app_role));
