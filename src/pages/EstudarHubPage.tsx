import React, { useEffect, useState } from 'react';
import { ArrowRight, BookMarked, BookOpen, Compass, Landmark, Sparkles } from 'lucide-react';
import { Helmet } from '@/lib/helmet-compat';
import { Link } from '@/lib/rr-compat';
import { MODULE_NAVIGATION } from '@/config/moduleNavigation';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { JourneyService } from '@/core/journey/JourneyService';
import type { Journey } from '@/core/journey/types';
import { supabase } from '@/lib/db';
import { getStudyContext, type StudyContext } from '@/services/studyContextService';

const ICONS = {
  bible: BookOpen,
  catechism: BookMarked,
  documents: Landmark,
} as const;

const sourceHref = (source: StudyContext['sources'][number]): string | null => {
  if (source.kind === 'bible') return '/bible?ref=' + encodeURIComponent(source.ref);
  if (source.kind === 'catechism') return '/catechism?p=' + encodeURIComponent(source.ref);
  return source.canonicalUrl ?? null;
};

const EstudarHubPage: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [nexusCount, setNexusCount] = useState<number | null>(null);
  const [journeysLoading, setJourneysLoading] = useState(true);
  const [studyQuery, setStudyQuery] = useState('');
  const [studyContext, setStudyContext] = useState<StudyContext | null>(null);
  const [studyLoading, setStudyLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      JourneyService.list({ is_active: true, limit: 6 }),
      supabase.from('nexus_relations').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ]).then(([journeyResult, nexusResult]) => {
      if (!active) return;
      if (journeyResult.data) setJourneys(journeyResult.data);
      if (!nexusResult.error) setNexusCount(nexusResult.count ?? 0);
      setJourneysLoading(false);
    }).catch(() => {
      if (active) setJourneysLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const query = studyQuery.trim();
    if (query.length < 2) {
      setStudyContext(null);
      setStudyLoading(false);
      return;
    }
    let active = true;
    setStudyLoading(true);
    const timer = window.setTimeout(() => {
      getStudyContext(query).then((context) => {
        if (active) setStudyContext(context);
      }).catch(() => {
        if (active) setStudyContext({ query, sources: [], journeys: [], nexus: [] });
      }).finally(() => {
        if (active) setStudyLoading(false);
      });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [studyQuery]);

  const environment = MODULE_NAVIGATION.find((item) => item.key === 'estudar');
  const items = environment?.items ?? [];
  const primaryIds = ['bible', 'catechism', 'documents'] as const;
  const primaryItems = primaryIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div
      data-catedra-module-root
      data-catedra-module="estudar"
      className="min-h-screen w-full min-w-0 overflow-x-hidden bg-stitch-background text-stitch-on-background"
    >
      <Helmet>
        <title>Cathedra — Estudar</title>
        <meta
          name="description"
          content="Estude por temas e percorra conexões entre Escritura, Catecismo, Magistério e vida espiritual."
        />
      </Helmet>

      <MobileTopBar kicker="Cathedra" title="Estudar" transparent />

      <main className="mx-auto w-full min-w-0 max-w-[1120px] px-4 pb-[calc(var(--stitch-mobile-bottomnav-h)+var(--stitch-mobile-safe-bottom)+1.5rem)] pt-5 sm:px-5 md:px-16 md:pb-16 md:pt-14">
        <header className="max-w-3xl pb-7 md:pb-9">
          <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.24em] text-stitch-secondary md:text-[12px] md:tracking-[0.32em]">
            Ambiente 01 · Conhecimento
          </p>
          <h1 className="mt-2 font-stitch-display text-[32px] leading-tight text-stitch-primary md:mt-3 md:text-[56px]">
            O que você quer compreender hoje?
          </h1>
          <p className="mt-3 max-w-2xl font-stitch-body text-[15px] leading-6 text-stitch-on-surface-variant md:mt-4 md:text-[17px] md:leading-7">
            Em vez de procurar cada fonte separadamente, comece por um tema. O Cátedra organiza o caminho para você aprofundar, conectar e continuar.
          </p>
        </header>

        <section aria-labelledby="estudar-busca" className="mb-8 md:mb-10">
          <div className="rounded-2xl border border-stitch-secondary/20 bg-stitch-surface-container-low p-4 md:p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-stitch-secondary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h2 id="estudar-busca" className="font-stitch-display text-[18px] text-stitch-primary md:text-[20px]">Comece por um tema</h2>
                <p className="mt-1.5 font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant md:text-[13px]">
                  A busca consulta somente fontes persistidas e publicadas. A Yá poderá organizar esse contexto depois; aqui a recuperação continua determinística e verificável.
                </p>
                <input
                  value={studyQuery}
                  onChange={(event) => setStudyQuery(event.target.value)}
                  placeholder="Ex.: esperança, oração, Eucaristia"
                  aria-label="Buscar um tema no acervo do Cátedra"
                  className="mt-3 w-full rounded-xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest px-3 py-2.5 font-stitch-body text-sm text-stitch-primary outline-none focus:border-stitch-secondary"
                />
              </div>
            </div>
            {studyQuery.trim().length >= 2 && (
              <div className="mt-4 border-t border-stitch-outline-variant/20 pt-4">
                {studyLoading ? (
                  <p className="text-sm text-stitch-on-surface-variant">Consultando o acervo real…</p>
                ) : studyContext && (studyContext.sources.length > 0 || studyContext.journeys.length > 0) ? (
                  <div className="space-y-4">
                    {studyContext.sources.length > 0 && (
                      <div>
                        <p className="mb-2 font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary">Fontes encontradas</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {studyContext.sources.slice(0, 6).map((source) => (
                            (() => {
                              const href = sourceHref(source);
                              const content = (
                                <div className="rounded-xl border border-stitch-outline-variant/20 bg-stitch-surface-container-lowest p-3 transition-colors hover:border-stitch-secondary/50 focus-within:border-stitch-secondary">
                                  <p className="font-stitch-display text-[15px] text-stitch-primary">{source.title}</p>
                                  {source.author && <p className="mt-0.5 text-[11px] text-stitch-on-surface-variant">{source.author}</p>}
                                  {source.excerpt && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-stitch-on-surface-variant">{source.excerpt}</p>}
                                </div>
                              );
                              return href ? (href.startsWith('/') ? <Link to={href} aria-label={'Abrir ' + source.title}>{content}</Link> : <a href={href} target="_blank" rel="noreferrer" aria-label={'Abrir fonte externa: ' + source.title}>{content}</a>) : content;
                            })()
                          ))}
                        </div>
                      </div>
                    )}
                    {studyContext.journeys.length > 0 && (
                      <div>
                        <p className="mb-2 font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary">Jornadas relacionadas</p>
                        <div className="flex flex-wrap gap-2">
                          {studyContext.journeys.map((journey) => (
                            <Link key={journey.id} to={`/jornadas/${journey.id}`} className="rounded-full border border-stitch-secondary/25 bg-stitch-secondary-container/25 px-3 py-1.5 text-xs text-stitch-primary">
                              {journey.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] text-stitch-on-surface-variant">
                      {studyContext.nexus.length > 0
                        ? studyContext.nexus.length + ' conexões publicadas foram encontradas para este contexto.'
                        : 'Nenhuma conexão Nexus publicada foi encontrada para este contexto.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-stitch-on-surface-variant">Nenhuma fonte publicada correspondeu a este tema. O Cátedra não preencherá a ausência com conteúdo inventado.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="estudar-jornadas" className="pb-8 md:pb-10">
          <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
            <div>
              <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary md:text-[11px] md:tracking-[0.2em]">Caminhos reais</p>
              <h2 id="estudar-jornadas" className="mt-1 font-stitch-display text-[22px] leading-tight text-stitch-primary md:text-[28px]">Continue por uma jornada</h2>
            </div>
            <span className="hidden items-center gap-1.5 font-stitch-body text-[11px] text-stitch-on-surface-variant sm:flex"><Compass className="h-3.5 w-3.5" aria-hidden="true" />Conteúdo publicado</span>
          </div>
          {journeysLoading ? (
            <div className="rounded-2xl border border-stitch-outline-variant/20 bg-stitch-surface-container-low p-5 text-sm text-stitch-on-surface-variant">Carregando jornadas disponíveis…</div>
          ) : journeys.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
              {journeys.map((journey) => (
                <Link key={journey.id} to={`/jornadas/${journey.id}`} className="group flex min-h-[158px] flex-col justify-between rounded-2xl border border-stitch-secondary/25 bg-stitch-secondary-container/25 p-4 transition-all hover:-translate-y-0.5 hover:border-stitch-secondary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stitch-secondary md:p-5">
                  <div className="flex items-start justify-between gap-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-stitch-surface-container-lowest text-stitch-secondary"><Compass className="h-4 w-4" aria-hidden="true" /></span><ArrowRight className="h-4 w-4 text-stitch-on-surface-variant transition-transform group-hover:translate-x-1" aria-hidden="true" /></div>
                  <div><h3 className="font-stitch-display text-[19px] leading-tight text-stitch-primary">{journey.title}</h3><p className="mt-1.5 line-clamp-2 font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant">{journey.description ?? 'Continue sua formação.'}</p></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-stitch-outline-variant/20 bg-stitch-surface-container-low p-5 text-sm text-stitch-on-surface-variant">Nenhuma jornada publicada está disponível neste momento.</div>
          )}
        </section>

        <section aria-labelledby="estudar-conexoes" className="pb-8 md:pb-10">
          <div className="rounded-2xl border border-stitch-secondary/20 bg-stitch-surface-container-low p-4 md:p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-stitch-secondary" aria-hidden="true" />
              <div>
                <h2 id="estudar-conexoes" className="font-stitch-display text-[18px] text-stitch-primary md:text-[20px]">Conexões entre as fontes</h2>
                <p className="mt-1.5 max-w-3xl font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant md:text-[13px]">
                  {nexusCount === null ? 'Verificando as relações publicadas no Nexus…' : nexusCount > 0 ? `${nexusCount} relações publicadas estão disponíveis para conectar os conteúdos.` : 'O Nexus ainda não tem relações publicadas. O Cátedra não exibirá conexões inventadas enquanto a base oficial estiver sendo sincronizada.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="estudar-fontes" className="border-t border-stitch-outline-variant/20 pt-7 md:pt-9">
          <div className="mb-4 md:mb-5">
            <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary md:text-[11px] md:tracking-[0.2em]">
              Fontes
            </p>
            <h2 id="estudar-fontes" className="mt-1 font-stitch-display text-[22px] leading-tight text-stitch-primary md:text-[28px]">
              Ou entre diretamente em uma fonte
            </h2>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            {primaryItems.map((item) => {
              const Icon = ICONS[item.id as keyof typeof ICONS] ?? BookOpen;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group flex min-h-[128px] min-w-0 flex-col justify-between rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stitch-secondary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stitch-secondary md:min-h-[142px] md:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stitch-secondary-container text-stitch-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-stitch-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-stitch-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-stitch-display text-[17px] leading-tight text-stitch-primary md:text-[19px]">{item.label}</h3>
                    <p className="mt-1 font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-7 md:mt-9" aria-labelledby="estudar-principio">
          <div className="rounded-2xl border border-stitch-secondary/20 bg-stitch-surface-container-low p-4 md:p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-stitch-secondary" aria-hidden="true" />
              <div>
                <h2 id="estudar-principio" className="font-stitch-display text-[18px] text-stitch-primary md:text-[20px]">
                  Ler é só o começo
                </h2>
                <p className="mt-1.5 max-w-3xl font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant md:text-[13px]">
                  O estudo ganha sentido quando você consegue compreender, relacionar, refletir e continuar. As conexões são apresentadas a partir do contexto que você está lendo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EstudarHubPage;
