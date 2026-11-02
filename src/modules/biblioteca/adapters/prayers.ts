import { supabase } from '@/lib/db';
import type { LibraryAdapter, LibraryItem } from '../types';

export const prayersAdapter: LibraryAdapter = {
  module: 'prayers',
  label: 'Orações',

  async list({ limit = 24, offset = 0 } = {}) {
    const { data, error } = await supabase
      .from('prayers')
      .select('id, title, slug, subtitle, category, estimated_seconds, updated_at, is_published')
      .eq('is_published', true)
      .order('title', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw error;

    return (data ?? []).map((row: any): LibraryItem => ({
      id: String(row.id),
      module: 'prayers',
      title: row.title ?? '',
      slug: row.slug ?? String(row.id),
      summary: row.subtitle ?? undefined,
      category: row.category ?? undefined,
      readingMinutes: row.estimated_seconds > 0 ? Math.ceil(row.estimated_seconds / 60) : undefined,
      href: `/oracao/${row.slug ?? row.id}`,
      updatedAt: row.updated_at ?? undefined,
    }));
  },

  resolveHref({ slug }) {
    return `/oracao/${slug}`;
  },
};
