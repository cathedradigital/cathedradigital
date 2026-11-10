import React from 'react';
import { useParams } from '@/lib/rr-compat';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/db';
import { SpaceLayout, SpaceFooter } from '@/components/cathedra/space/SpaceLayout';

/**
 * Rota canônica /biblioteca/padres/:slug para pessoas do corpus patrístico.
 * Esses registros vivem em `corpus_people`, não em `saints`; por isso não
 * devem ser enviados para /santos/:slug.
 */
export default function PadresRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const { data: person, isLoading } = useQuery({
    queryKey: ['corpus-person', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corpus_people')
        .select('slug,display_name,person_kind,canonical_url,status')
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div data-catedra-module-root data-catedra-module="pesquisar" className="min-h-screen bg-stitch-background text-stitch-on-background">
      <SpaceLayout>
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8 md:py-16">
          {isLoading ? (
            <div className="animate-pulse space-y-4" aria-label="Carregando pessoa patrística">
              <div className="h-4 w-32 bg-stitch-surface-container-low" />
              <div className="h-12 w-2/3 bg-stitch-surface-container-low" />
              <div className="h-24 w-full bg-stitch-surface-container-low" />
            </div>
          ) : person ? (
            <article className="border-t border-stitch-secondary/30 pt-8">
              <p className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.2em] text-stitch-secondary">
                {person.person_kind === 'doctor' ? 'Doutor da Igreja' : 'Padre da Igreja'} · Corpus patrístico
              </p>
              <h1 className="mt-3 font-stitch-display text-[clamp(2.25rem,7vw,4.5rem)] leading-[1.05] text-stitch-primary">
                {person.display_name}
              </h1>
              <p className="mt-6 max-w-2xl font-stitch-body text-[16px] leading-7 text-stitch-on-surface-variant">
                Voz histórica verificada no acervo da Cathedra Digital. Consulte as obras relacionadas e a fonte original para aprofundar esta tradição.
              </p>
              {person.canonical_url && (
                <a href={person.canonical_url} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-11 items-center gap-2 border border-stitch-secondary/40 px-4 py-2 font-stitch-body text-[12px] font-bold uppercase tracking-[0.12em] text-stitch-secondary hover:bg-stitch-secondary/10">
                  <BookOpen className="h-4 w-4" aria-hidden="true" /> Fonte patrística original <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </article>
          ) : (
            <article className="border-t border-stitch-secondary/30 pt-8">
              <p className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.2em] text-stitch-secondary">Corpus patrístico</p>
              <h1 className="mt-3 font-stitch-display text-4xl text-stitch-primary">Pessoa não encontrada</h1>
              <p className="mt-4 font-stitch-body text-[15px] text-stitch-on-surface-variant">Este registro ainda não está publicado no corpus.</p>
            </article>
          )}
          <SpaceFooter links={[{ label: 'Nexus', to: '/nexus', hint: 'Voltar às conexões verificadas' }, { label: 'Biblioteca', to: '/biblioteca/escritos', hint: 'Explorar a Biblioteca Patrística' }]} />
        </main>
      </SpaceLayout>
    </div>
  );
}
