import { supabase } from '@/lib/db';

export type AuthorityRelationType =
  | 'grounds' | 'interprets' | 'develops' | 'witnesses' | 'contextualizes' | 'echoes';

export interface AuthoritySourceRelation {
  id: string;
  source_id: string;
  related_source_id: string;
  relation_type: AuthorityRelationType;
  note: string | null;
  source: { slug: string; title: string; source_type: string; authority_label: string };
  related_source: { slug: string; title: string; source_type: string; authority_label: string };
}

export async function getAuthorityRelations(sourceId?: string): Promise<AuthoritySourceRelation[]> {
  let query = (supabase as any)
    .from('authority_source_relations')
    .select('id,source_id,related_source_id,relation_type,note,source:authority_sources!authority_source_relations_source_id_fkey(slug,title,source_type,authority_label),related_source:authority_sources!authority_source_relations_related_source_id_fkey(slug,title,source_type,authority_label)')
    .eq('status', 'published');

  if (sourceId) query = query.or(`source_id.eq.${sourceId},related_source_id.eq.${sourceId}`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AuthoritySourceRelation[];
}
