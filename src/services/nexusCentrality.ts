/**
 * nexusCentrality — enriquece arestas curadas com o grau de centralidade
 * dos nós no grafo curado (`public.nexus_relations`).
 *
 * Quanto mais conexões curadas um nó possui, mais central ele é — e mais
 * cedo aparece nas sugestões do Reader. Falha de rede nunca quebra a
 * leitura: sem grau, as arestas voltam com weight 0.
 */

import { supabase } from '@/lib/db';
import type { CuratedNexusEdge } from '@/core/knowledge/adapters/nexusGraphMerge';

type RelationRow = {
  id: string;
  source_kind: string;
  source_ref: Record<string, unknown>;
  target_kind: string;
  target_ref: Record<string, unknown>;
};

function refId(ref: Record<string, unknown> | null): string | null {
  if (!ref) return null;
  for (const key of ['slug', 'id', 'ref'] as const) {
    const value = ref[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

export async function withCentrality(
  edges: CuratedNexusEdge[],
): Promise<CuratedNexusEdge[]> {
  if (edges.length === 0) return edges;

  const refs = Array.from(new Set(edges.map((e) => e.ref))).slice(0, 200);

  const columns = 'id, source_kind, source_ref, target_kind, target_ref';
  const [outgoing, incoming] = await Promise.all([
    supabase
      .from('nexus_relations')
      .select(columns)
      .eq('status', 'published')
      .in('source_ref->>slug', refs)
      .limit(500),
    supabase
      .from('nexus_relations')
      .select(columns)
      .eq('status', 'published')
      .in('target_ref->>slug', refs)
      .limit(500),
  ]);

  if (outgoing.error || incoming.error) return edges.map((e) => ({ ...e, weight: 0 }));

  const requestedRefs = new Set(refs);
  const degrees = new Map<string, number>();
  const seenRelations = new Set<string>();
  for (const row of [...(outgoing.data ?? []), ...(incoming.data ?? [])] as RelationRow[]) {
    if (seenRelations.has(row.id)) continue;
    seenRelations.add(row.id);

    const sourceRef = refId(row.source_ref);
    if (sourceRef && requestedRefs.has(sourceRef)) {
      const key = `${row.source_kind}#${sourceRef}`;
      degrees.set(key, (degrees.get(key) ?? 0) + 1);
    }

    const targetRef = refId(row.target_ref);
    if (targetRef && requestedRefs.has(targetRef)) {
      const key = `${row.target_kind}#${targetRef}`;
      degrees.set(key, (degrees.get(key) ?? 0) + 1);
    }
  }

  return edges.map((e) => ({ ...e, weight: degrees.get(`${e.kind}#${e.ref}`) ?? 0 }));
}
