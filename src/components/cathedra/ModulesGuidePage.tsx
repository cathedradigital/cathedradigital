import React from 'react';
import { BookOpen, HandHeart, GraduationCap, SearchCode, Compass, Brain, Users, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/rr-compat';
import { Helmet } from '@/lib/helmet-compat';
import { MODULE_NAVIGATION, TRANSVERSAL_MODULES } from '@/config/moduleNavigation';

const ENV_ICONS = {
  'estudar': BookOpen,
  'rezar': HandHeart,
  'formar-se': GraduationCap,
  'pesquisar': SearchCode,
  'minha-jornada': Compass,
} as const;

const ModulesGuidePage: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-[1120px] space-y-10 px-5 pb-24 pt-8 md:px-10 md:pt-14">
      <Helmet>
        <title>Mapa da Plataforma — Cathedra</title>
        <meta
          name="description"
          content="Mapa dos cinco ambientes e módulos da plataforma Cathedra Digital."
        />
      </Helmet>

      <header className="max-w-3xl">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-secondary">
          Arquitetura da plataforma
        </p>
        <h1 className="font-display text-4xl leading-tight text-primary md:text-5xl">
          Um caminho claro para cada necessidade.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
          A Cathedra foi organizada em cinco ambientes. Os módulos vivem dentro
          deles; ferramentas transversais, como Logos e Comunidade, não competem
          com a navegação principal.
        </p>
      </header>

      <section aria-labelledby="flow-title" className="border-y border-border/30 py-7">
        <h2 id="flow-title" className="sr-only">Fluxo principal</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {MODULE_NAVIGATION.map((group, index) => {
            const Icon = ENV_ICONS[group.key];
            return (
              <React.Fragment key={group.key}>
                <Link
                  to={group.items[0]?.path ?? '/'}
                  className="group flex min-h-[110px] flex-col justify-between border border-border/30 bg-card p-4 transition-colors hover:border-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  <Icon className="h-5 w-5 text-secondary" aria-hidden />
                  <span>
                    <span className="block font-display text-lg text-primary">{group.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{group.description}</span>
                  </span>
                </Link>
                {index < MODULE_NAVIGATION.length - 1 && (
                  <ArrowRight className="mx-auto hidden h-4 w-4 self-center text-muted-foreground/40 sm:block" aria-hidden />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="modules-title">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">Mapa</p>
          <h2 id="modules-title" className="mt-1 font-display text-3xl text-primary">
            Ambientes e módulos
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {MODULE_NAVIGATION.map((group) => {
            const Icon = ENV_ICONS[group.key];
            return (
              <article key={group.key} className="border border-border/30 bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-secondary/30 bg-secondary/5">
                    <Icon className="h-5 w-5 text-secondary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-primary">{group.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.description}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="group rounded-sm border border-border/20 px-4 py-3 transition-colors hover:border-secondary/40 hover:bg-secondary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      <span className="block font-medium text-primary group-hover:text-secondary">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="transversal-title" className="border border-secondary/25 bg-secondary/5 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">Capacidades transversais</p>
            <h2 id="transversal-title" className="mt-1 font-display text-2xl text-primary">
              Ajudam todos os ambientes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Logos e Comunidade atravessam a experiência. Eles aparecem quando
              fazem sentido no contexto, sem criar uma sexta ou sétima categoria
              de navegação.
            </p>
          </div>
          <div className="grid w-full gap-3 md:max-w-md md:grid-cols-2">
            {TRANSVERSAL_MODULES.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="border border-border/30 bg-background p-4 transition-colors hover:border-secondary/40"
              >
                {item.id === 'logos' ? (
                  <Brain className="h-5 w-5 text-secondary" aria-hidden />
                ) : (
                  <Users className="h-5 w-5 text-secondary" aria-hidden />
                )}
                <span className="mt-3 block font-medium text-primary">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 pt-7">
        <p className="text-xs leading-6 text-muted-foreground">
          Administração, auditoria, telemetria, diagnósticos e ferramentas de
          desenvolvimento permanecem fora da navegação pública e são acessíveis
          apenas pelas áreas protegidas correspondentes.
        </p>
      </section>
    </div>
  );
};

export default ModulesGuidePage;
