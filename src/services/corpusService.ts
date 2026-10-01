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

/**
 * Corpus editorial tables are not part of the current generated Supabase schema.
 * Keep this service as a safe adapter until the corpus migration is introduced.
 * Returning an empty collection is preferable to querying a non-existent relation:
 * callers can render the existing "no sources" state without breaking the reader.
 */
export async function getCorpusPersonDocuments(
  _slug: string,
  _displayName?: string,
): Promise<CorpusSaintDocument[]> {
  void supabase;
  return [];
}
