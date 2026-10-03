import { supabase } from '@/lib/db';

export type StudySourceKind = 'bible' | 'catechism' | 'authority' | 'corpus' | 'journey';

export interface StudySource { kind: StudySourceKind; ref: string; title: string; excerpt?: string | null; author?: string | null; canonicalUrl?: string | null; }
export interface StudyNexusRelation { relationType: string; sourceKind: string; sourceRef: Record<string, unknown>; targetKind: string; targetRef: Record<string, unknown>; note?: string | null; confidence?: number | null; attributedTo?: string | null; }
export interface StudyContext {
  query: string;
  sources: StudySource[];
  journeys: Array<{ id: string; title: string; description: string | null; category: string | null; tags: string[] | null }>;
  nexus: StudyNexusRelation[];
}

/** Recupera contexto somente de conteúdo persistido/publicado. Não usa seed/mock e não chama IA. */
export async function getStudyContext(query: string, limit = 12): Promise<StudyContext> {
  const normalized = query.trim();
  if (!normalized) return { query: '', sources: [], journeys: [], nexus: [] };
  const like = '%' + normalized.replace(/[%_]/g, '\\$&') + '%';
  const [bible, catechism, authority, corpus, journeys] = await Promise.all([
    supabase.from('bible_verses').select('book_abbr, chapter, verse, text, source_url').ilike('text', like).limit(limit),
    supabase.from('catechism_official').select('paragraph, content, source_name, source_url').or('content.ilike.' + like + ',source_name.ilike.' + like).limit(limit),
    supabase.from('authority_sources').select('id, slug, title, author, citation, description, canonical_url').eq('status', 'published').or('title.ilike.' + like + ',author.ilike.' + like + ',citation.ilike.' + like + ',description.ilike.' + like).limit(limit),
    supabase.from('corpus_documents').select('id, slug, title, author_name, excerpt, canonical_url').eq('status', 'published').or('title.ilike.' + like + ',author_name.ilike.' + like + ',slug.ilike.' + like + ',excerpt.ilike.' + like).limit(limit),
    supabase.from('journeys').select('id, title, description, category, tags').eq('is_active', true).or('title.ilike.' + like + ',description.ilike.' + like + ',category.ilike.' + like).limit(6),
  ]);
  const queryResults = [bible, catechism, authority, corpus, journeys] as Array<{ error?: unknown }>;
  const failedQuery = queryResults.find((result) => result.error);
  if (failedQuery?.error) throw failedQuery.error;

  const sources: StudySource[] = [];
  for (const row of (bible.data ?? []) as Array<Record<string, unknown>>) {
    const book = String(row.book_abbr ?? ''); const chapter = Number(row.chapter ?? 0); const verse = Number(row.verse ?? 0);
    if (!book || !chapter || !verse) continue;
    sources.push({ kind: 'bible', ref: book + ' ' + chapter + ',' + verse, title: book + ' ' + chapter + ',' + verse, excerpt: typeof row.text === 'string' ? row.text : null, canonicalUrl: typeof row.source_url === 'string' ? row.source_url : null });
  }
  for (const row of (catechism.data ?? []) as Array<Record<string, unknown>>) {
    const paragraph = Number(row.paragraph ?? 0); if (!paragraph) continue;
    sources.push({ kind: 'catechism', ref: String(paragraph), title: 'CIC §' + paragraph, excerpt: typeof row.content === 'string' ? row.content : null, canonicalUrl: typeof row.source_url === 'string' ? row.source_url : null });
  }
  for (const row of (authority.data ?? []) as Array<Record<string, unknown>>) {
    sources.push({ kind: 'authority', ref: String(row.slug ?? row.id ?? ''), title: String(row.title ?? row.slug ?? 'Fonte de autoridade'), author: typeof row.author === 'string' ? row.author : null, excerpt: typeof row.description === 'string' ? row.description : null, canonicalUrl: typeof row.canonical_url === 'string' ? row.canonical_url : null });
  }
  for (const row of (corpus.data ?? []) as Array<Record<string, unknown>>) {
    sources.push({ kind: 'corpus', ref: String(row.slug ?? row.id ?? ''), title: String(row.title ?? row.slug ?? 'Documento'), author: typeof row.author_name === 'string' ? row.author_name : null, excerpt: typeof row.excerpt === 'string' ? row.excerpt : null, canonicalUrl: typeof row.canonical_url === 'string' ? row.canonical_url : null });
  }
  const nexus = sources.length > 0
    ? await supabase.from('nexus_relations').select('relation_type, source_kind, source_ref, target_kind, target_ref, note, confidence, attributed_to').eq('status', 'published').limit(100)
    : { data: [], error: null } as any;
  if (nexus.error) throw nexus.error;

  const sourceKeys = new Set(sources.map((source) => source.kind + '#' + source.ref));
  const relatedNexus = ((nexus.data ?? []) as Array<Record<string, unknown>>).filter((row) => {
    const key = (kind: unknown, ref: Record<string, unknown>) => { const value = ref.slug ?? ref.id ?? ref.ref; return typeof value === 'string' || typeof value === 'number' ? String(kind) + '#' + String(value) : null; };
    return sourceKeys.has(key(row.source_kind, (row.source_ref ?? {}) as Record<string, unknown>) ?? '') || sourceKeys.has(key(row.target_kind, (row.target_ref ?? {}) as Record<string, unknown>) ?? '');
  });
  return {
    query: normalized,
    sources: sources.slice(0, limit),
    journeys: (journeys.data ?? []) as StudyContext['journeys'],
    nexus: relatedNexus.map((row) => ({ relationType: String(row.relation_type ?? 'related_to'), sourceKind: String(row.source_kind ?? 'other'), sourceRef: (row.source_ref ?? {}) as Record<string, unknown>, targetKind: String(row.target_kind ?? 'other'), targetRef: (row.target_ref ?? {}) as Record<string, unknown>, note: typeof row.note === 'string' ? row.note : null, confidence: typeof row.confidence === 'number' ? row.confidence : null, attributedTo: typeof row.attributed_to === 'string' ? row.attributed_to : null })),
  };
}
