/**
 * ReaderAutoNexus — contrato universal para adapters de sugestão
 * automática dos Readers (Bíblia, Catecismo, Magistério, Prayer,
 * Saint, Glossary, Journey, Liturgy).
 *
 * Cada adapter recebe um input tipado do seu domínio e devolve
 * `ReaderAutoNexusOutput` (self + suggestions + byBucket + labels).
 *
 * Regras arquiteturais:
 *   • Sem UI, sem React, sem Supabase.
 *   • Sem URLs literais. Toda resolução via KnowledgeGraph.resolve()
 *     → KnowledgeResolver → RouteRegistry.
 *   • Buckets seguem a ordem canônica declarada pelo adapter.
 */

import { KnowledgeGraph } from '../KnowledgeGraph';
import { KnowledgeRegistry } from '../KnowledgeRegistry';
import type { KnowledgeNodeId, ResolvedNode } from '../types';
import type { ContinuationSuggestion } from '../continuation';
import { KIND_SPECS, ensureNode } from './glossaryAutoNexus';

/* ------------------------------ Tipos ------------------------------ */

export type ReaderNexusBucket =
  | 'bible'
  | 'catechism'
  | 'glossary'
  | 'journey'
  | 'saint'
  | 'father'
  | 'liturgy'
  | 'prayer'
  | 'magisterium';

export interface ReaderAutoNexusOutput {
  selfId: KnowledgeNodeId | null;
  suggestions: ContinuationSuggestion[];
  byBucket: Partial<Record<ReaderNexusBucket, ResolvedNode[]>>;
  labels: Record<string, string>;
}

export interface ReaderAutoNexus<TInput = unknown> {
  /** Identificador do adapter (também usado nas métricas). */
  readonly kind: string;
  /** Rótulo humano curto para dashboards/debug. */
  readonly label: string;
  buildSuggestions(input: TInput): ReaderAutoNexusOutput;
}

/* -------------------------- Rótulos / eyebrows -------------------------- */

export const BUCKET_LABEL: Record<ReaderNexusBucket, string> = {
  bible: 'Escritura',
  catechism: 'Catecismo',
  glossary: 'Glossário',
  journey: 'Jornadas',
  saint: 'Santos',
  father: 'Padres',
  liturgy: 'Liturgia',
  prayer: 'Orações',
  magisterium: 'Magistério',
};

export const BUCKET_EYEBROW: Record<ReaderNexusBucket, string> = {
  bible: 'Meditar na Escritura',
  catechism: 'Aprofundar no Catecismo',
  glossary: 'Estudar o verbete',
  journey: 'Continuar a formação',
  saint: 'Conhecer o santo',
  father: 'Conhecer o Padre da Igreja',
  liturgy: 'Rezar com a Liturgia',
  prayer: 'Rezar agora',
  magisterium: 'Aprofundar no Magistério',
};

export function intentForBucket(
  b: ReaderNexusBucket,
): ContinuationSuggestion['intent'] {
  switch (b) {
    case 'bible': return 'study';
    case 'catechism':
    case 'magisterium': return 'deepen';
    case 'glossary': return 'study';
    case 'journey': return 'apply';
    case 'saint':
    case 'father': return 'meet';
    case 'liturgy':
    case 'prayer': return 'pray';
  }
}

/* -------------------------- Helper compartilhado -------------------------- */

export interface BuildBucketedOptions {
  /** Nó do próprio conteúdo (para telemetria/vizinhança). */
  selfId: KnowledgeNodeId | null;
  /** Ordem canônica dos buckets no resultado final. */
  buckets: readonly ReaderNexusBucket[];
  /** Refs brutas por bucket (strings/números crus). */
  refs: Partial<Record<ReaderNexusBucket, string[]>>;
  /** Consultas semânticas para fallback quando o bucket está vazio. */
  fallbackQueries?: string[];
}

/**
 * Resolve refs → nós → sugestões, na ordem dos buckets.
 * 1) Registra cada ref via `ensureNode` (idempotente).
 * 2) Se algum bucket estiver vazio, usa `KnowledgeGraph.search()` + `neighbors()`.
 * 3) Devolve 1 sugestão por bucket na ordem canônica.
 */
export function buildBucketedSuggestions(
  opts: BuildBucketedOptions,
): { byBucket: Partial<Record<ReaderNexusBucket, ResolvedNode[]>>; suggestions: ContinuationSuggestion[] } {
  type Candidate = {
    resolved: ResolvedNode;
    score: number;
  };

  const byBucket: Partial<Record<ReaderNexusBucket, ResolvedNode[]>> = {};
  const candidates = new Map<ReaderNexusBucket, Map<KnowledgeNodeId, Candidate>>();

  const normalize = (value: string): string[] =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .split(/\\s+/)
      .map((token) => token.replace(/[^a-z0-9-]/g, ''))
      .filter((token) => token.length >= 3);

  const queryTokens = (opts.fallbackQueries ?? []).flatMap(normalize);
  const self = opts.selfId ? KnowledgeGraph.findNode(opts.selfId) : undefined;
  const selfTokens = self ? normalize(\`\${self.label} \${self.summary ?? ''}\`) : [];

  const scoreText = (node: ResolvedNode): number => {
    if (!queryTokens.length) return 0;
    const hay = normalize(\`\${node.node.label} \${node.node.summary ?? ''}\`);
    const haySet = new Set(hay);
    const overlap = queryTokens.filter((token) => haySet.has(token)).length;
    const phrase = queryTokens.length > 1 && hay.join(' ').includes(queryTokens.join(' ')) ? 8 : 0;
    return overlap * 5 + phrase;
  };

  const scoreRelation = (nodeId: KnowledgeNodeId): number => {
    if (!opts.selfId) return 0;
    const relations = [
      ...KnowledgeRegistry.relationsFrom(opts.selfId),
      ...KnowledgeRegistry.relationsTo(opts.selfId),
    ].filter((relation) => relation.to === nodeId || relation.from === nodeId);
    return relations.reduce((total, relation) => total + 20 + Math.round((relation.weight ?? 0) * 20), 0);
  };

  const push = (bucket: ReaderNexusBucket, resolved: ResolvedNode, bonus = 0) => {
    if (!resolved?.url || resolved.node.id === opts.selfId) return;
    const arr = candidates.get(bucket) ?? new Map<KnowledgeNodeId, Candidate>();
    candidates.set(bucket, arr);

    const score = bonus + scoreRelation(resolved.node.id) + scoreText(resolved);
    const previous = arr.get(resolved.node.id);
    if (!previous || score > previous.score) {
      arr.set(resolved.node.id, { resolved, score });
    }
  };

  // 1. Refs explícitas: são a evidência mais forte de intenção editorial.
  for (const bucket of opts.buckets) {
    const spec = KIND_SPECS[bucket];
    if (!spec) continue;
    for (const raw of opts.refs[bucket] ?? []) {
      const id = ensureNode(spec, raw);
      if (!id) continue;
      const resolved = KnowledgeGraph.resolve(id);
      if (resolved) push(bucket, resolved, 100);
    }
  }

  // 2. Relações diretas do grafo: conexão estrutural tem prioridade sobre texto.
  if (opts.selfId && KnowledgeRegistry.hasNode(opts.selfId)) {
    KnowledgeGraph.neighbors(opts.selfId).forEach((node) => {
      const bucket = (opts.buckets as readonly string[]).includes(node.kind)
        ? (node.kind as ReaderNexusBucket)
        : null;
      if (!bucket) return;
      const resolved = KnowledgeGraph.resolve(node.id);
      if (resolved) push(bucket, resolved, 45);
    });
  }

  // 3. Descoberta textual: coleta todos os matches elegíveis e os ranqueia,
  //    em vez de parar no primeiro item encontrado de cada bucket.
  for (const q of opts.fallbackQueries ?? []) {
    if (!q || q.trim().length < 3) continue;
    const found = KnowledgeGraph.search(q, { limit: 48 });
    for (const node of found) {
      if (node.id === opts.selfId) continue;
      const bucket = (opts.buckets as readonly string[]).includes(node.kind)
        ? (node.kind as ReaderNexusBucket)
        : null;
      if (!bucket) continue;
      const resolved = KnowledgeGraph.resolve(node.id);
      if (resolved) push(bucket, resolved, 10);
    }
  }

  // 4. Compatibilidade lexical com o próprio nó. Útil quando o conteúdo
  //    chegou sem refs explícitas e o índice possui nós semanticamente próximos.
  if (selfTokens.length) {
    for (const node of KnowledgeGraph.allNodes()) {
      if (node.id === opts.selfId) continue;
      const bucket = (opts.buckets as readonly string[]).includes(node.kind)
        ? (node.kind as ReaderNexusBucket)
        : null;
      if (!bucket) continue;
      const hay = normalize(\`\${node.label} \${node.summary ?? ''}\`);
      const overlap = selfTokens.filter((token) => hay.includes(token)).length;
      if (!overlap) continue;
      const resolved = KnowledgeGraph.resolve(node.id);
      if (resolved) push(bucket, resolved, overlap * 2);
    }
  }

  // 5. Materializa os candidatos ordenados. Mantemos vários itens por bucket
  //    para que o Nexus possa exibir profundidade sem perder a relevância.
  for (const bucket of opts.buckets) {
    const ranked = Array.from(candidates.get(bucket)?.values() ?? [])
      .sort((a, b) => b.score - a.score || a.resolved.node.label.localeCompare(b.resolved.node.label))
      .slice(0, 8);
    if (ranked.length) byBucket[bucket] = ranked.map((item) => item.resolved);
  }

  // 6. Uma sugestão de continuidade por bucket, usando o melhor candidato.
  const suggestions: ContinuationSuggestion[] = [];
  for (const bucket of opts.buckets) {
    const first = byBucket[bucket]?.[0];
    if (!first?.url) continue;
    suggestions.push({
      intent: intentForBucket(bucket),
      eyebrow: BUCKET_EYEBROW[bucket],
      label: first.node.label,
      target: first,
      weight: 1,
    });
  }

  return { byBucket, suggestions };
}

/* ------------------------------ Registry ------------------------------ */

class ReaderAutoNexusRegistryImpl {
  private readonly adapters = new Map<string, ReaderAutoNexus>();

  register<T>(adapter: ReaderAutoNexus<T>): void {
    this.adapters.set(adapter.kind, adapter as ReaderAutoNexus);
  }

  get<T = unknown>(kind: string): ReaderAutoNexus<T> | undefined {
    return this.adapters.get(kind) as ReaderAutoNexus<T> | undefined;
  }

  has(kind: string): boolean {
    return this.adapters.has(kind);
  }

  list(): ReaderAutoNexus[] {
    return Array.from(this.adapters.values());
  }

  /** Somente para testes. */
  _reset(): void {
    this.adapters.clear();
  }
}

export const ReaderAutoNexusRegistry = new ReaderAutoNexusRegistryImpl();
