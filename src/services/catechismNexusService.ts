/**
 * catechismNexusService — leitura das relações curadas do Nexus ligadas
 * a um parágrafo (ou faixa de parágrafos) do Catecismo.
 *
 * Lê public.nexus_relations nas DUAS direções:
 *   catechism_paragraph → X
 *   X → catechism_paragraph
 *
 * Os refs do banco podem usar chaves específicas do tipo do nó
 * (por exemplo, paragraph no Catecismo e abbr/chapter/verse na Bíblia).
 * Este serviço normaliza esses formatos para o contrato do Reader Nexus.
 */

import { supabase } from '@/lib/db';
import type { CuratedNexusEdge } from '@/core/knowledge/adapters/nexusGraphMerge';
import { withCentrality } from './nexusCentrality';

interface RawRow {
  relation_type: string;
  source_kind: string;
  source_ref: Record<string, unknown> | null;
  target_kind: string;
  target_ref: Record<string, unknown> | null;
  note: string | null;
}

function scalar(ref: Record<string, unknown> | null, keys: readonly string[]): string | null {
  if (!ref) return null;
  for (const key of keys) {
    const value = ref[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function refId(kind: string, ref: Record<string, unknown> | null): string | null {
  if (!ref) return null;

  if (kind === 'catechism_paragraph' || kind === 'catechism') {
    return scalar(ref, ['paragraph', 'id', 'ref', 'slug']);
  }

  if (kind === 'bible_verse' || kind === 'bible') {
    const abbr = scalar(ref, ['abbr', 'book', 'slug']);
    const chapter = scalar(ref, ['chapter', 'ch']);
    const verse = scalar(ref, ['verse', 'v']);
    if (abbr && chapter) return verse ? abbr + ' ' + chapter + ':' + verse : abbr + ' ' + chapter;
  }

  return scalar(ref, ['slug', 'id', 'ref']);
}

function refTitle(kind: string, ref: Record<string, unknown> | null): string | null {
  const explicit = scalar(ref, ['title', 'label']);
  if (explicit) return explicit;
  return refId(kind, ref);
}

/**
 * Arestas curadas de uma faixa de parágrafos (tipicamente o artigo atual).
 * Suporta os formatos de referência oficiais já presentes no banco.
 */
export async function getCatechismCuratedEdges(
  from: number,
  to: number,
): Promise<CuratedNexusEdge[]> {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return [];

  const paragraphs: string[] = [];
  for (let p = Math.max(1, Math.trunc(from)); p <= Math.min(2865, Math.trunc(to)); p += 1) {
    paragraphs.push(String(p));
  }
  if (paragraphs.length === 0) return [];

  const cols = 'relation_type, source_kind, source_ref, target_kind, target_ref, note';

  // O corpus atual usa "paragraph"; versões anteriores do importador usavam "id".
  // Consultamos ambos para manter compatibilidade sem perder relações curadas.
  const [outgoingByParagraph, outgoingById, incomingByParagraph, incomingById] = await Promise.all([
    supabase.from('nexus_relations').select(cols)
      .eq('source_kind', 'catechism_paragraph').in('source_ref->>paragraph', paragraphs).limit(200),
    supabase.from('nexus_relations').select(cols)
      .eq('source_kind', 'catechism_paragraph').in('source_ref->>id', paragraphs).limit(200),
    supabase.from('nexus_relations').select(cols)
      .eq('target_kind', 'catechism_paragraph').in('target_ref->>paragraph', paragraphs).limit(200),
    supabase.from('nexus_relations').select(cols)
      .eq('target_kind', 'catechism_paragraph').in('target_ref->>id', paragraphs).limit(200),
  ]);

  const rows = [
    ...(outgoingByParagraph.data ?? []),
    ...(outgoingById.data ?? []),
    ...(incomingByParagraph.data ?? []),
    ...(incomingById.data ?? []),
  ] as unknown as RawRow[];

  const edges: CuratedNexusEdge[] = [];
  const seen = new Set<string>();

  const push = (
    kind: string,
    ref: Record<string, unknown> | null,
    note: string | null,
    relationType: string,
  ) => {
    if (kind === 'catechism_paragraph' || kind === 'other') return;
    const id = refId(kind, ref);
    if (!id) return;
    const key = kind + '#' + id;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({
      kind,
      ref: id,
      title: refTitle(kind, ref),
      note,
      relationType,
    });
  };

  for (const row of rows) {
    if (row.source_kind === 'catechism_paragraph') {
      push(row.target_kind, row.target_ref, row.note, row.relation_type);
    } else if (row.target_kind === 'catechism_paragraph') {
      push(row.source_kind, row.source_ref, row.note, row.relation_type);
    }
  }

  return withCentrality(edges);
}
