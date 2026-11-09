/**
 * useDailyLiturgy — hook único para as leituras do dia.
 *
 * Camadas:
 *   1. React Query (cache in-memory + dedupe)
 *   2. IndexedDB (resposta imediata em visitas seguintes/offline)
 *   3. LiturgyProvider (fonte litúrgica)
 */

import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type DailyLiturgy,
  getLiturgyProvider,
  toIsoDateKey,
} from '@/core/liturgy/LiturgyProvider';
import { cacheLiturgy, getCachedLiturgy } from '@/lib/offlineCache';
import { isLiturgicalPrefetchDisabled } from '@/lib/litcalPrefetchGuard';

const OFFLINE_FLAG_KEY = 'cathedra_offline_mode';
const STATS_KEY = 'cathedra_liturgy_stats';
const STALE_MS = 1000 * 60 * 60; // 1h
const backgroundRefreshes = new Set<string>();

export interface DailyLiturgyResult {
  liturgy: DailyLiturgy | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isOfflineData: boolean;
  refresh: () => Promise<void>;
}

function isOfflineMode(): boolean {
  try {
    return localStorage.getItem(OFFLINE_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

function bumpStats(kind: 'hit-memory' | 'hit-disk' | 'miss' | 'offline-hit' | 'error'): void {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const s = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    s[kind] = (s[kind] ?? 0) + 1;
    s.lastAt = Date.now();
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch { /* métricas são best-effort */ }
}

async function fetchDay(date: Date): Promise<{ data: DailyLiturgy; offline: boolean }> {
  const key = toIsoDateKey(date);
  const cached = (await getCachedLiturgy(key)) as DailyLiturgy | null;

  if (isOfflineMode()) {
    if (cached) {
      bumpStats('offline-hit');
      return { data: cached, offline: true };
    }
    bumpStats('error');
    throw new Error('Modo Somente-Cache ativo: Liturgia não disponível offline.');
  }

  // Exibe dados já salvos sem esperar o provedor; o hook revalida em segundo plano.
  if (cached) {
    bumpStats('hit-disk');
    return { data: cached, offline: true };
  }

  try {
    const fresh = await getLiturgyProvider().getDayLiturgy(date);
    await cacheLiturgy(key, fresh);
    bumpStats('miss');
    return { data: fresh, offline: false };
  } catch (e) {
    bumpStats('error');
    // A falha do provedor litúrgico não significa que o banco Supabase inteiro caiu.
    throw e;
  }
}

function queryKey(date: Date): [string, string] {
  return ['daily-liturgy', toIsoDateKey(date)];
}

export function useDailyLiturgy(date: Date): DailyLiturgyResult {
  const qc = useQueryClient();
  const dateKey = toIsoDateKey(date);
  const key = useMemo(() => ['daily-liturgy', dateKey] as [string, string], [dateKey]);
  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchDay(date),
    staleTime: STALE_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });
  const isCachedData = query.data?.offline ?? false;

  // Revalida cache stale sem bloquear a leitura; deduplica entre consumidores do mesmo dia.
  useEffect(() => {
    if (!isCachedData || isOfflineMode() || backgroundRefreshes.has(dateKey)) return;
    backgroundRefreshes.add(dateKey);
    void getLiturgyProvider().getDayLiturgy(date)
      .then(async (fresh) => {
        await cacheLiturgy(dateKey, fresh);
        bumpStats('miss');
        qc.setQueryData(key, { data: fresh, offline: false });
      })
      .catch(() => {
        // Mantém a leitura em cache e não apresenta falha de um provedor como queda do banco.
        bumpStats('error');
      })
      .finally(() => backgroundRefreshes.delete(dateKey));
  }, [date, dateKey, isCachedData, key, qc]);

  // Só prepara os dois dias adjacentes após a leitura selecionada estar pronta.
  useEffect(() => {
    if (isLiturgicalPrefetchDisabled() || isOfflineMode()) return;
    if (query.isLoading || query.isError || !query.data || query.data.offline) return;

    for (const offset of [-1, 1]) {
      const adjacent = new Date(date);
      adjacent.setDate(adjacent.getDate() + offset);
      const adjacentKey = queryKey(adjacent);
      if (qc.getQueryData(adjacentKey)) continue;
      void qc.prefetchQuery({
        queryKey: adjacentKey,
        queryFn: () => fetchDay(adjacent),
        staleTime: STALE_MS,
      }).catch(() => { /* prefetch silencioso */ });
    }
  }, [date, qc, query.isLoading, query.isError, query.data]);

  return {
    liturgy: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isOfflineData: query.data?.offline ?? false,
    refresh: async () => { await query.refetch(); },
  };
}

/** Utilitário para leitura de estatísticas em painéis de dev. */
export function getLiturgyProviderStats(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}
