/**
 * RailwayInAdiutoriumProvider — implementação atual do LiturgyProvider.
 *
 * Encapsula a chamada à edge function `liturgical-calendar` (action `readings`),
 * que hoje delega para `https://liturgia.up.railway.app`. Nenhuma nova fonte:
 * apenas isola o contorno para permitir troca futura sem tocar em UI/hooks.
 */

import { supabase } from '@/lib/db';
import {
  type DailyLiturgy,
  type LiturgyProvider,
  type Reading,
  inferSeason,
  normalizeColorToken,
  toIsoDateKey,
} from '../LiturgyProvider';

interface RawReadings {
  data?: string;
  liturgia?: string;
  cor?: string;
  dia?: string;
  primeiraLeitura?: Reading | null;
  salmo?: { referencia: string; refrao: string; texto: string } | null;
  segundaLeitura?: Reading | string | null;
  evangelho?: Reading | null;
}

function normalizeSecond(raw: RawReadings['segundaLeitura']): Reading | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text || /^(não há|nao ha) segunda leitura\b/i.test(text)) return null;
    return {
      referencia: 'Segunda Leitura',
      titulo: 'Segunda Leitura',
      texto: text,
    };
  }
  return raw;
}

export class RailwayInAdiutoriumProvider implements LiturgyProvider {
  readonly id = 'railway-in-adiutorium';
  readonly label = 'In Adiutorium (railway)';

  async getDayLiturgy(date: Date): Promise<DailyLiturgy> {
    const { data, error } = await supabase.functions.invoke('liturgical-calendar', {
      body: {
        action: 'readings',
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      },
    });
    let raw: RawReadings;
    if (error) {
      const errorInfo = error as { name?: string; context?: { status?: number } };
      const status = errorInfo.context?.status;
      const isFetchOrRelayFailure =
        errorInfo.name === 'FunctionsFetchError' ||
        errorInfo.name === 'FunctionsRelayError';
      if (status !== 404 && !isFetchOrRelayFailure) throw error;

      // Em browsers, o CORS da função ausente pode transformar o 404 em
      // FunctionsFetchError. Fallback só em 404/rede/relay; nunca em 401/403.
      const url = new URL('https://liturgia.up.railway.app/');
      url.searchParams.set('dia', String(date.getDate()));
      url.searchParams.set('mes', String(date.getMonth() + 1));
      url.searchParams.set('ano', String(date.getFullYear()));
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        throw new Error(`A fonte litúrgica respondeu HTTP ${response.status}.`);
      }
      raw = (await response.json()) as RawReadings;
    } else {
      raw = (data ?? {}) as RawReadings;
    }

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error('A fonte litúrgica retornou uma resposta inválida.');
    }

    return {
      isoDate: toIsoDateKey(date),
      data: raw.data ?? date.toLocaleDateString('pt-BR'),
      liturgia: raw.liturgia ?? '',
      cor: raw.cor ?? 'verde',
      colorToken: normalizeColorToken(raw.cor),
      dia: raw.dia ?? '',
      season: inferSeason(raw.liturgia ?? raw.dia ?? ''),
      primeiraLeitura: raw.primeiraLeitura ?? null,
      salmo: raw.salmo ?? null,
      segundaLeitura: normalizeSecond(raw.segundaLeitura),
      evangelho: raw.evangelho ?? null,
    };
  }
}
