import React from 'react';
import { BookOpen, BookMarked, Landmark, Network, Library, Sparkles, UsersRound, ArrowRight } from 'lucide-react';
import { Helmet } from '@/lib/helmet-compat';
import { Link } from '@/lib/rr-compat';
import { MODULE_NAVIGATION } from '@/config/moduleNavigation';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

const ICONS = {
  bible: BookOpen,
  catechism: BookMarked,
  documents: Landmark,
  nexus: Network,
  library: Library,
  saints: Sparkles,
  church: UsersRound,
} as const;

const EstudarHubPage: React.FC = () => {
  const environment = MODULE_NAVIGATION.find((item) => item.key === 'estudar');
  const items = environment?.items ?? [];

  return (
    <div
      data-catedra-module-root
      data-catedra-module="estudar"
      className="min-h-screen w-full bg-stitch-background text-stitch-on-background"
    >
      <Helmet>
        <title>Cathedra — Estudar</title>
        <meta
          name="description"
          content="Estudar na Cátedra: Bíblia, Catecismo, Documentos, Nexus, Biblioteca, Santos e Igreja Viva."
        />
      </Helmet>

      <MobileTopBar kicker="Cathedra" title="Estudar" transparent />

      <main className="mx-auto w-full max-w-[1120px] px-5 pb-[calc(var(--stitch-mobile-bottomnav-h)+var(--stitch-mobile-safe-bottom)+2rem)] pt-8 md:px-16 md:pb-16 md:pt-14">
        <header className="max-w-3xl border-b border-stitch-secondary/20 pb-8">
          <p className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.32em] text-stitch-secondary">
            Ambiente 01 · Conhecimento
          </p>
          <h1 className="mt-3 font-stitch-display text-[38px] leading-tight text-stitch-primary md:text-[56px]">
            Estudar
          </h1>
          <p className="mt-4 max-w-2xl font-stitch-body text-[17px] leading-7 text-stitch-on-surface-variant">
            Um lugar único para ler as fontes, compreender a fé e seguir as relações entre os textos.
            Escolha uma fonte para começar; o restante da Cátedra permanece a um passo.
          </p>
        </header>

        <section aria-labelledby="estudar-fontes" className="pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.2em] text-stitch-secondary">
                Fontes e caminhos
              </p>
              <h2 id="estudar-fontes" className="mt-1 font-stitch-display text-[28px] text-stitch-primary">
                Comece por onde precisa
              </h2>
            </div>
            <span className="hidden font-stitch-body text-[11px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant md:inline">
              {items.length} áreas
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = ICONS[item.id as keyof typeof ICONS] ?? BookOpen;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group flex min-h-[190px] flex-col justify-between rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stitch-secondary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stitch-secondary"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stitch-secondary-container text-stitch-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-stitch-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-stitch-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-stitch-display text-[22px] text-stitch-primary">{item.label}</h3>
                    <p className="mt-2 font-stitch-body text-[14px] leading-6 text-stitch-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12 border-t border-stitch-outline-variant/20 pt-8">
          <p className="max-w-2xl font-stitch-body text-[14px] leading-6 text-stitch-on-surface-variant">
            O Estudar é a porta principal de aprofundamento. A leitura acontece nos módulos;
            o Nexus conecta as fontes; a Biblioteca ajuda a descobrir e retomar o acervo.
          </p>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default EstudarHubPage;
