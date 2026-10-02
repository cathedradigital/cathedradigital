create or replace function public.bible_read_gate_status()
returns table (
  blocked boolean,
  status text,
  last_run_at timestamptz,
  run_id uuid,
  blocking_findings integer,
  reason text
)
language sql
stable
security invoker
set search_path = public
as $$
  with stats as (
    select
      count(*)::integer as books,
      coalesce(sum(chapters_count), 0)::integer as expected_chapters,
      (select count(*)::integer from public.bible_chapters) as actual_chapters,
      (select count(*)::integer from public.bible_verses) as actual_verses
    from public.bible_books
  ),
  gaps as (
    select
      greatest(0, 73 - books)
      + greatest(0, expected_chapters - actual_chapters)
      + case when actual_chapters > 0 and actual_verses = 0 then 1 else 0 end
      as findings,
      books,
      expected_chapters,
      actual_chapters,
      actual_verses
    from stats
  )
  select
    (findings > 0) as blocked,
    case when findings > 0 then 'partial' else 'ok' end as status,
    null::timestamptz as last_run_at,
    null::uuid as run_id,
    findings as blocking_findings,
    case
      when books < 73 then format('Cânon incompleto: %s de 73 livros cadastrados.', books)
      when actual_chapters < expected_chapters then format(
        'Capítulos incompletos: %s de %s capítulos cadastrados.',
        actual_chapters, expected_chapters
      )
      when actual_verses = 0 then 'Versículos ainda não foram ingeridos.'
      else 'Cobertura bíblica estrutural completa.'
    end as reason
  from gaps;
$$;

grant execute on function public.bible_read_gate_status() to anon, authenticated;
