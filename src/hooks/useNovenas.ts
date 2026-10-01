import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db';
import { NOVENAS, type Novena } from '@/data/novenas';

/** Converte uma linha da tabela `novenas` para o formato usado pelas telas. */
export function rowToNovena(r: any): Novena {
  return {
    slug: r.slug,
    title: r.title,
    latin: r.latin ?? undefined,
    patron: r.patron ?? '',
    category: r.category,
    summary: r.summary ?? '',
    opening: r.opening ?? '',
    closing: r.closing ?? '',
    finalPrayer: r.final_prayer ?? '',
    days: Array.isArray(r.days) ? r.days : [],
  };
}

/**
 * Novenas do banco (cadastradas pelo painel admin). Enquanto o banco não tiver
 * nenhuma, usa as novenas editoriais embutidas no app.
 */
export function useNovenasList(): Novena[] {
  const { data } = useQuery({
    queryKey: ['novenas-public'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('novenas')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });
      if (error) return [];
      return (data ?? []).map(rowToNovena);
    },
  });
  return data && data.length > 0 ? data : NOVENAS;
}
