import React from 'react';
import { ArrowRight, BookMarked, BookOpen, Compass, Landmark, Sparkles } from 'lucide-react';
import { Helmet } from '@/lib/helmet-compat';
import { Link } from '@/lib/rr-compat';
import { MODULE_NAVIGATION } from '@/config/moduleNavigation';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';

const ICONS = {
  bible: BookOpen,
  catechism: BookMarked,
  documents: Landmark,
} as const;

const TOPICS = [
  { id: 'esperanca', label: 'Esperança', description: 'Aprofundar uma fé que atravessa as provações.' },
  { id: 'eucaristia', label: 'Eucaristia', description: 'Percorrer Escritura, ensinamento e vida sacramental.' },
  { id: 'graca', label: 'Graça', description: 'Compreender o dom da graça e sua vida concreta.' },
] as const;

const EstudarHubPage: React.FC = () => {
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

        <section aria-labelledby="estudar-temas" className="pb-8 md:pb-10">
          <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
            <div>
              <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary md:text-[11px] md:tracking-[0.2em]">
                Aprofundamentos
              </p>
              <h2 id="estudar-temas" className="mt-1 font-stitch-display text-[22px] leading-tight text-stitch-primary md:text-[28px]">
                Escolha um tema
              </h2>
            </div>
            <span className="hidden items-center gap-1.5 font-stitch-body text-[11px] text-stitch-on-surface-variant sm:flex">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Conexões em contexto
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            {TOPICS.map((topic) => (
              <Link
                key={topic.id}
                to={`/estudo?topic=${encodeURIComponent(topic.label)}`}
                className="group flex min-h-[158px] min-w-0 flex-col justify-between rounded-2xl border border-stitch-secondary/25 bg-stitch-secondary-container/25 p-4 transition-all hover:-translate-y-0.5 hover:border-stitch-secondary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stitch-secondary md:min-h-[178px] md:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stitch-surface-container-lowest text-stitch-secondary">
                    <Compass className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-stitch-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-stitch-secondary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-stitch-display text-[19px] leading-tight text-stitch-primary md:text-[21px]">{topic.label}</h3>
                  <p className="mt-1.5 font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant md:text-[13px]">
                    {topic.description}
                  </p>
                </div>
              </Link>
            ))}
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
