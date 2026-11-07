-- Conteúdo bíblico é público e somente leitura.
-- Escritas continuam protegidas pelas policies admin existentes.
create policy "bible_books_public_read"
  on public.bible_books for select
  to anon, authenticated
  using (true);

create policy "bible_chapters_public_read"
  on public.bible_chapters for select
  to anon, authenticated
  using (true);

create policy "bible_verses_public_read"
  on public.bible_verses for select
  to anon, authenticated
  using (true);
