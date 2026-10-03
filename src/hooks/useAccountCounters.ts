/**
 * Sprint UX · Área do Usuário — contadores unificados.
 *
 * Um único hook para alimentar os badges da sidebar da conta.
 * Sem alteração de schema: apenas count queries nas tabelas existentes.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/db';
import { JourneyService } from '@/core/journey';
import { useAuth } from "@/hooks/useAuth";

export interface AccountCounters {
  notes: number;
  favorites: number;
  journalEntries: number;
  journeys: number;
  collections: number;
  prayerSessions: number;
  readingsMarks: number;
}

const EMPTY: AccountCounters = {
  notes: 0, favorites: 0, journalEntries: 0, journeys: 0,
  collections: 0, prayerSessions: 0, readingsMarks: 0,
};

export function useAccountCounters() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["account-counters", user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<AccountCounters> => {
      if (!user?.id) return EMPTY;
      const uid = user.id;
      const head = { count: "exact" as const, head: true };

      // Counts pessoais mantêm falhas explícitas no cache; não transformamos
      // uma falha de banco em um estado aparentemente vazio.
      const safe = async (p: PromiseLike<{ count: number | null }>) => {
        const r = await p;
        if ('error' in r && r.error) throw r.error;
        return r.count ?? 0;
      };

      const [notes, favorites, journal, journeys, collections, prayers, readings] = await Promise.all([
        safe(supabase.from("user_notes").select("id", head).eq("user_id", uid) as any),
        safe(supabase.from("bible_favorites").select("id", head).eq("user_id", uid) as any),
        safe(supabase.from("spiritual_journal").select("id", head).eq("user_id", uid) as any),
        JourneyService.getUserProgressCount(uid).then((result) => {
          if (result.error) throw result.error;
          return result.data ?? 0;
        }),
        safe(supabase.from("collection_progress").select("id", head).eq("user_id", uid) as any),
        safe(supabase.from("prayer_sessions").select("id", head).eq("user_id", uid) as any),
        safe(supabase.from("reading_marks").select("id", head).eq("user_id", uid) as any),
      ]);

      return {
        notes, favorites, journalEntries: journal, journeys,
        collections, prayerSessions: prayers, readingsMarks: readings,
      };
    },
  });
}
