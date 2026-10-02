import React from 'react';
import { BookOpen, BookMarked, Landmark, ArrowRight } from 'lucide-react';
import { Helmet } from '@/lib/helmet-compat';
import { Link } from '@/lib/rr-compat';
import { MODULE_NAVIGATION } from '@/config/moduleNavigation';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';

const ICONS = {
  bible: BookOpen,
  catechism: BookMarked,
  documents: Landmark,
  } as const;

const EstudarHubPage: React.FC = () => {
  const environment = MODULE_NAVIGATION.find((item) => item.key === 'estudar');
  const items = environment?.items ?? [];

  // The registry keeps every destination available to the application, but the
  // Estudar landing page uses a deliberate hierarchy instead of treating every
  // module as an equal first-level source.
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
          content="Estudar na Cátedra: Bíblia, Catecismo e Documentos, com conexões pelo Nexus e acesso à Biblioteca e aos Santos."
        />
      </Helmet>

      <MobileTopBar kicker="Cathedra" title="Estudar" transparent />

      <main className="mx-auto w-full min-w-0 max-w-[1120px] px-4 pb-[calc(var(--stitch-mobile-bottomnav-h)+var(--stitch-mobile-safe-bottom)+1.5rem)] pt-5 sm:px-5 md:px-16 md:pb-16 md:pt-14">
        <header className="max-w-3xl border-b border-stitch-secondary/20 pb-6 md:pb-8">
          <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.24em] text-stitch-secondary md:text-[12px] md:tracking-[0.32em]">
            Ambiente 01 · Conhecimento
          </p>
          <h1 className="mt-2 font-stitch-display text-[32px] leading-tight text-stitch-primary md:mt-3 md:text-[56px]">
            Estudar
          </h1>
          <p className="mt-3 max-w-2xl font-stitch-body text-[15px] leading-6 text-stitch-on-surface-variant md:mt-4 md:text-[17px] md:leading-7">
            Fontes, textos e caminhos para aprofundar. Tudo permanece conectado.
          </p>
        </header>

        <section aria-labelledby="estudar-fontes" className="pt-7 md:pt-10">
          <div className="mb-4 md:mb-6">
            <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary md:text-[11px] md:tracking-[0.2em]">
              Fontes principais
            </p>
            <h2 id="estudar-fontes" className="mt-1 font-stitch-display text-[22px] leading-tight text-stitch-primary md:text-[28px]">
              Comece pelas fontes
            </h2>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
            {primaryItems.map((item) => {
              const Icon = ICONS[item.id as keyof typeof ICONS] ?? BookOpen;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group flex min-h-[148px] min-w-0 flex-col justify-between rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stitch-secondary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stitch-secondary md:min-h-[168px] md:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stitch-secondary-container text-stitch-primary md:h-10 md:w-10">
                      <Icon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-stitch-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-stitch-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-stitch-display text-[18px] leading-tight text-stitch-primary md:text-[21px]">{item.label}</h3>
                    <p className="mt-1.5 font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant md:text-[13px]">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 border-t border-stitch-outline-variant/20 pt-7" aria-labelledby="estudar-orientacao">
          <div className="rounded-2xl border border-stitch-secondary/25 bg-stitch-secondary-container/30 p-4 md:p-5">
            <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-secondary">
              Um caminho simples
            </p>
            <h2 id="estudar-orientacao" className="mt-1 font-stitch-display text-[21px] text-stitch-primary md:text-[25px]">
              Três fontes para aprofundar
            </h2>
            <p className="mt-2 max-w-2xl font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant md:text-[13px]">
              Comece pela Bíblia, aprofunde no Catecismo e consulte os Documentos do Magistério.
              As relações com outros conteúdos continuam disponíveis pela navegação transversal.
            </p>
          </div>
        </section>

      </main>

    </div>
  );
};

export default EstudarHubPage;
