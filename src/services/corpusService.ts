import { supabase } from '@/integrations/supabase/client';

export type CorpusSaintDocument = {
  slug: string;
  title: string;
  document_kind: string;
  author_name: string | null;
  canonical_url: string;
  excerpt: string | null;
  ingestion_status: string;
};

export async function getCorpusPersonDocuments(
  slug: string,
  displayName?: string,
): Promise<CorpusSaintDocument[]> {
  const person = await supabase
    .from('corpus_people')
    .select('id, slug, display_name')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  let personId = person.data?.id ?? null;
  if (!personId && displayName) {
    const fallback = await supabase
      .from('corpus_people')
      .select('id')
      .eq('status', 'published')
      .ilike('display_name', displayName)
      .maybeSingle();
    personId = fallback.data?.id ?? null;
  }

  if (!personId) return [];

  const { data, error } = await supabase
    .from('corpus_documents')
    .select('slug,title,document_kind,author_name,canonical_url,excerpt,ingestion_status')
    .eq('person_id', personId)
    .eq('status', 'published')
    .in('ingestion_status', ['verified', 'ingested'])
    .order('title', { ascending: true })
    .limit(12);

  if (error) {
    console.error('Cátedra corpus person documents error', error.message);
    return [];
  }

  return (data ?? []) as CorpusSaintDocument[];
}
