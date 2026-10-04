        slug: abbr,
        summary: chapters ? `${chapters} capítulo${chapters > 1 ? 's' : ''}` : undefined,
        category: testament,
        href: `/bible?book=${encodeURIComponent(abbr)}&ch=1`,
      };
    });
  },

  resolveHref({ slug }) {
    return `/bible?book=${encodeURIComponent(slug)}&ch=1`;
  },
};
    const { data, error } = await supabase
      .from('bible_books')
      .select('id, abbrev, name, testament, chapters_count')
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw error;

    return (data ?? []).map((row: any): LibraryItem => {
      const abbr = (row as { abbrev?: string }).abbrev ?? '';
      const name = (row as { name?: string }).name ?? abbr;
      const testament = (row as { testament?: string }).testament ?? undefined;
      const chapters = (row as { chapters_count?: number }).chapters_count ?? 0;
      return {
        id: String(row.id),
        module: 'bible',
        title: name,
        slug: abbr,
        summary: chapters ? `${chapters} capítulo${chapters > 1 ? 's' : ''}` : undefined,
        category: testament,
        href: `/bible?book=${encodeURIComponent(abbr)}&chapter=1`,
      };
    });
  },

  resolveHref({ slug }) {
    return `/bible?book=${encodeURIComponent(slug)}&chapter=1`;
  },
};
