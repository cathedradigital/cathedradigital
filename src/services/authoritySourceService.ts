import { supabase } from '@/lib/db';

export type AuthoritySourceType =
  | 'sacred_scripture'
  | 'catechism'
  | 'magisterium'
  | 'apostolic_tradition'
  | 'patristic'
  | 'saint'
  | 'theology';

export interface AuthoritySource {
  id: string;
  slug: string;
  title: string;
  source_type: AuthoritySourceType;
  authority_class: 'revelation' | 'magisterium' | 'tradition_witness' | 'theological';
  authority_label: string;
  author: string | null;
  citation: string | null;
  description: string;
  canonical_url: string | null;
  language: string;
  status: 'draft' | 'published' | 'archived';
}

export async function getAuthoritySources(): Promise<AuthoritySource[]> {
  const { data, error } = await supabase
    .from('authority_sources')
    .select('id,slug,title,source_type,authority_class,authority_label,author,citation,description,canonical_url,language,status')
    .eq('status', 'published')
    .order('source_type');

  if (error) throw error;
  return (data ?? []) as AuthoritySource[];
}
