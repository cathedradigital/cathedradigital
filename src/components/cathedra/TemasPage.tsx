import { Icons } from '@/constants';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { normalizeText } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNexusTagContent } from '@/lib/nexusContent';
import { useSearchParams, useNavigate } from '@/lib/rr-compat';
import { supabase } from '@/lib/db';
import { motion } from 'framer-motion';
import { AppRoute } from '@/types';

import { useFuzzySearch } from '@/hooks/useFuzzySearch';
import { FuzzySearchInput } from './FuzzySearchInput';
import { BubbleTag } from './BubbleTag';
import { TagBubble } from './ThemeChip';
import { getTabProps, getTabPanelProps, useTabNavigation, useRovingTabindex } from './TabUtils';
import { useSpiritualProfile } from '@/hooks/useSpiritualProfile';
import { PROFILES, type ProfileId } from './SpiritualQuiz';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';


interface Tag {
  id: string;
  label: string;
  slug: string;
  emoji: string;
  category: string;
  similarityScore?: number;
  [key: string]: unknown;
}

const TemasPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const tagsContainerRef = React.useRef<HTMLDivElement>(null);
  const { handleKeyDown: handleTabKeyDown } = useTabNavigation();
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl) return fromUrl;
    return localStorage.getItem('nexus_bubbles_filter') || 'all';
  });

  useEffect(() => {
    localStorage.setItem('nexus_bubbles_filter', activeCategory);
    if (activeCategory !== 'all') {
      setSearchParams({ category: activeCategory }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeCategory, setSearchParams]);

  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.id,
        label: t.name,
        slug: t.slug,
        emoji: t.emoji || '⛪',
        category: t.category || 'Geral'
      })) as Tag[];
    },
  });

  const categories = useMemo(() => {
    if (!tags) return ['all'];
    const distinct = Array.from(new Set(tags.map(t => t.category)));
    return ['all', ...distinct];
  }, [tags]);

  const {
    results: fuzzyTags,
    isPending: isSearchPending,
  } = useFuzzySearch<Tag>({
    rpc: 'search_tags_fuzzy',
    query: searchQuery,
    primaryField: 'label',
    secondaryField: 'category',
    secondaryWeight: 0.5,
  });
  const isSearchActive = searchQuery.trim().length >= 2;

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    const base: Tag[] = isSearchActive ? (fuzzyTags ?? []) : tags;
    if (isSearchActive || activeCategory === 'all') return base;
    return base.filter(tag => tag.category === activeCategory);
  }, [tags, fuzzyTags, isSearchActive, activeCategory]);

  const { activeIndex, handleKeyDown: handleRovingKeyDown } = useRovingTabindex(filteredTags.length, tagsContainerRef);

  // Suggested tags based on the user's spiritual profile (sparkle highlight)
  const { profileId } = useSpiritualProfile();
  const suggestedSlugs = useMemo(() => {
    if (!profileId || !tags) return new Set<string>();
    const profile = PROFILES[profileId];
    if (!profile) return new Set<string>();
    const relevantLabels = [profile.theme, profile.pain.label, 'Oração', 'Jesus', 'Fé'];
    return new Set(
      tags
        .filter(t => relevantLabels.some(l => t.label.toLowerCase().includes(l.toLowerCase())))
        .slice(0, 8)
        .map(t => t.slug)
    );
  }, [profileId, tags]);

  useEffect(() => {
    const temaSlug = searchParams.get('tema');
    if (temaSlug) {
      navigate(`${AppRoute.TEMAS}/${temaSlug}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleTagSelect = (tag: Tag) => {
    navigate(`${AppRoute.TEMAS}/${tag.slug}`);
  };

  const prefetchTag = useCallback((tag: Tag) => {
    queryClient.prefetchQuery({
    queryKey: ['tag-contents', tag.id, tag.label],
    queryFn: () => fetchNexusTagContent(tag),
    staleTime: 1000 * 60 * 5,
  });
  }, [queryClient]);

  return (
    <div data-catedra-module-root data-catedra-module="nexus" className="min-h-screen w-full min-w-0 overflow-x-hidden bg-stitch-background text-stitch-on-background">
      <MobileTopBar kicker="Cathedra Digital" title="Temas" transparent />
      <main className="catedra-page catedra-section mx-auto min-w-0 px-4 pb-16 pt-6 sm:px-5 md:px-8 md:pt-12">
        <header className="mb-8 max-w-3xl md:mb-10">
          <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.24em] text-stitch-secondary md:text-[12px] md:tracking-[0.32em]">Nexus Theologicus</p>
          <h1 className="mt-2 font-stitch-display text-[34px] leading-tight text-stitch-primary md:mt-3 md:text-[52px]">Temas que conectam</h1>
          <p className="mt-3 max-w-2xl font-stitch-body text-[15px] leading-6 text-stitch-on-surface-variant md:text-[18px] md:leading-7">Explore os fios que aproximam Escritura, Catecismo, Magistério e vida cristã.</p>
        </header>

        <div className="space-y-6">
          <div className="sticky top-2 z-20 flex flex-col gap-3 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest/95 p-3 shadow-sm backdrop-blur-md sm:p-4">
            <FuzzySearchInput
              className="w-full"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar um tema, como Amor ou Graça"
              isSearching={isSearchPending}
            />
            
            <div role="tablist" aria-label="Filtrar temas por categoria" className="flex w-full items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat}
                  {...getTabProps(`tab-category-${idx}`, `panel-temas`, activeCategory === cat, `
                    min-h-10 whitespace-nowrap rounded-full border px-4 py-2 font-stitch-body text-[11px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary
                    ${activeCategory === cat
                      ? 'border-stitch-secondary bg-stitch-secondary text-stitch-secondary-on-container'
                      : 'border-stitch-outline-variant/40 bg-stitch-surface-container-low text-stitch-on-surface-variant hover:border-stitch-secondary hover:text-stitch-primary'
                    }
                  `)}
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setActiveCategory(cat)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx, categories.length, (newIdx) => setActiveCategory(categories[newIdx]), 'tab-category-')}
                >
                  {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div {...getTabPanelProps('panel-temas', `tab-category-${categories.indexOf(activeCategory)}`, true, "relative overflow-hidden rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest outline-none")}>
              {loadingTags ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 py-10">
                  <div className="relative">
                    <Icons.Loader2 className="h-7 w-7 animate-spin text-stitch-secondary" />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-stitch-secondary/15" />
                  </div>
                  <span className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.16em] text-stitch-on-surface-variant">Consultando Nexus...</span>
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stitch-secondary-container/30">
                    <Icons.Search className="h-5 w-5 text-stitch-secondary" />
                  </div>
                  <p className="font-stitch-body text-sm text-stitch-on-surface-variant">Nenhum tema encontrado para sua busca.</p>
                </div>
              ) : (
                <>
                  {isSearchActive && activeCategory !== 'all' && (
                    <div className="px-spacing-lg pt-spacing-lg flex items-center justify-between">
                      <div className="flex items-center gap-spacing-xs px-spacing-sm py-spacing-2xs rounded-premium bg-primary/5 border border-primary/10">
                        <Icons.Sparkles className="w-spacing-sm h-spacing-sm text-primary/40" />
                        <span className="text-premium-xs font-bold text-primary/60 uppercase tracking-widest">Busca Global Ativa</span>
                      </div>
                      <Button 
                        onClick={() => setActiveCategory('all')}
                        className="text-premium-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4 transition-all"
                      >
                        Limpar Filtro
                      </Button>
                    </div>
                  )}
                  <div className="relative p-5 sm:p-8">
                    <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2.5 sm:gap-3" role="list" ref={tagsContainerRef}>
                      {filteredTags.map((tag, idx) => (
                        <div key={tag.id} role="listitem">
                          <TagBubble
                            tag={tag}
                            index={idx}
                            isSuggested={suggestedSlugs.has(tag.slug)}
                            onKeyDown={(e) => handleRovingKeyDown(e, idx, () => {})}
                            tabIndex={activeIndex === idx ? 0 : -1}
                            className="rounded-full border border-stitch-outline-variant/40 bg-stitch-surface-container-low px-3 py-2 font-stitch-body text-[11px] font-bold uppercase tracking-[0.1em] text-stitch-on-surface-variant transition-colors hover:border-stitch-secondary hover:text-stitch-primary sm:px-4"
                            profileId={profileId as ProfileId}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 border-t border-stitch-outline-variant/20 px-5 pb-5 pt-3">
                    <div className="flex items-center gap-2 rounded-full border border-stitch-outline-variant/30 bg-stitch-surface-container-low px-3 py-1.5">
                      <span className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.14em] text-stitch-on-surface-variant tabular-nums">
                        {filteredTags.length} conexões sagradas
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-stitch-secondary/60" />
                      <Icons.Sparkles className="h-3.5 w-3.5 text-stitch-secondary" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-stitch-secondary/20 bg-stitch-secondary-container/10 px-6 py-8 text-center"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stitch-surface-container-lowest text-stitch-secondary">
              <Icons.Tag className="h-5 w-5" />
            </div>
            <h3 className="font-stitch-display text-[22px] leading-tight text-stitch-primary">Descubra os tesouros da Fé</h3>
            <p className="mt-2 max-w-2xl font-stitch-body text-sm leading-6 text-stitch-on-surface-variant">
              Selecione um tema acima para percorrer os conteúdos relacionados da Bíblia, Catecismo e Magistério.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TemasPage;
