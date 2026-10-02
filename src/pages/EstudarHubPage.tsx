import React from 'react';
import { BookOpen, BookMarked, Landmark, Network, Library, UsersRound, ArrowRight } from 'lucide-react';
import { Helmet } from '@/lib/helmet-compat';
import { Link } from '@/lib/rr-compat';
import { MODULE_NAVIGATION } from '@/config/moduleNavigation';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';

const ICONS = {
  bible: BookOpen,
  catechism: BookMarked,
  documents: Landmark,
  nexus: Network,
  library: Library,
  saints: Flame,
  church: UsersRound,
} as const;

const EstudarHubPage: React.FC = () => {
  const environment = MODULE_NAVIGATION.find((item) => item.key === 'estudar');
  const items = environment?.items ?? [];

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
          content="Estudar na Cátedra: Bíblia, Catecismo, Documentos, Nexus, Biblioteca, Santos e Igreja Viva."
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
          <div className="mb-4 flex items-end justify-between gap-3 md:mb-6 md:gap-4">
            <div>
              <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary md:text-[11px] md:tracking-[0.2em]">
                Fontes e caminhos
              </p>
              <h2 id="estudar-fontes" className="mt-1 font-stitch-display text-[22px] leading-tight text-stitch-primary md:text-[28px]">
                Comece por onde precisa
              </h2>
            </div>
            <span className="hidden font-stitch-body text-[11px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant md:inline">
              {items.length} áreas
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 md:gap-4">
            {items.map((item) => {
              const Icon = ICONS[item.id as keyof typeof ICONS] ?? BookOpen;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group flex min-h-[132px] min-w-0 flex-col justify-between rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-3 shadow-sm md:min-h-[132px] md:p-4 transition-all hover:-translate-y-0.5 hover:border-stitch-secondary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stitch-secondary"
                >
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stitch-secondary-container text-stitch-primary md:h-9 md:w-9">
                      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-stitch-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-stitch-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-stitch-display text-[16px] leading-tight text-stitch-primary md:text-[19px]">{item.label}</h3>
                    <p className="mt-1 line-clamp-2 font-stitch-body text-[11px] leading-4 text-stitch-on-surface-variant md:text-[12px] md:leading-5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 border-t border-stitch-outline-variant/20 pt-7" aria-labelledby="estudar-conexoes">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-secondary">
                Conexões vivas
              </p>
              <h2 id="estudar-conexoes" className="mt-1 font-stitch-display text-[22px] text-stitch-primary">
                Uma fonte leva à outra
              </h2>
            </div>
            <Link
              to="/nexus"
              className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-full border border-stitch-secondary/40 px-4 py-2 font-stitch-body text-[11px] font-bold uppercase tracking-[0.12em] text-stitch-secondary hover:border-stitch-secondary"
            >
              Abrir Nexus <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 hidden flex-wrap gap-2 md:flex">
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-stitch-outline-variant/40 bg-stitch-surface-container-lowest px-3 py-2 font-stitch-body text-[12px] text-stitch-on-surface-variant transition-colors hover:border-stitch-secondary hover:text-stitch-primary"
              >
                <span>{item.label}</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="mt-4 max-w-3xl font-stitch-body text-[12px] leading-5 text-stitch-on-surface-variant md:text-[13px]">
            Na leitura, as referências podem levar a outras fontes: Bíblia, Catecismo, Documentos,
            Santos e demais conteúdos relacionados. O Nexus é o ponto de encontro dessas relações.
          </p>
        </section>
      </main>

    </div>
  );
};

export default EstudarHubPage;
