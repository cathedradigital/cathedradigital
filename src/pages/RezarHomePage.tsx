import React from 'react';
import {
  BookOpen,
  BookMarked,
  CalendarDays,
  ChevronRight,
  Clock3,
  Cross,
  Heart,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
} from 'lucide-react';
import { Link } from '@/lib/rr-compat';
import { EditorialHero } from '@/components/editorial/harmony';
import { SpaceFooter } from '@/components/cathedra/space/SpaceLayout';

const PILLARS = [
  {
    number: '01',
    eyebrow: 'Oração oficial da Igreja',
    title: 'Liturgia das Horas',
    description:
      'Santifique o dia inteiro com a oração pública da Igreja. Reze as Laudes, a Hora Média, as Vésperas e as Completas, acompanhando o ritmo da liturgia.',
    detail: 'Salmos · Cânticos · Leituras breves · Preces',
    to: '/breviary',
    action: 'Entrar na Liturgia das Horas',
    icon: Sunrise,
    accent: 'from-amber-500/15 via-primary/5 to-transparent',
  },
  {
    number: '02',
    eyebrow: 'Escuta e encontro com a Palavra',
    title: 'Lectio Divina',
    description:
      'Faça da Escritura um encontro com Deus: leia com atenção, medite no coração, responda em oração e permaneça em contemplação.',
    detail: 'Lectio · Meditatio · Oratio · Contemplatio',
    to: '/lectio',
    action: 'Começar a leitura orante',
    icon: BookOpen,
    accent: 'from-sky-500/15 via-primary/5 to-transparent',
  },
  {
    number: '03',
    eyebrow: 'Contemplação dos mistérios de Cristo',
    title: 'Rosário',
    description:
      'Percorra com Maria os mistérios da vida, paixão, morte e ressurreição de Jesus. Escolha a sequência, apresente sua intenção e reze no seu ritmo.',
    detail: 'Gozosos · Luminosos · Dolorosos · Gloriosos',
    to: '/oracao/rosario',
    action: 'Rezar o Rosário',
    icon: Heart,
    accent: 'from-rose-500/15 via-primary/5 to-transparent',
  },
] as const;

const OTHER_PATHS = [
  { label: 'Liturgia do dia', description: 'Leituras, salmo e Evangelho da celebração.', to: '/liturgia', icon: CalendarDays },
  { label: 'Missal', description: 'Acompanhar o ordinário e o próprio da Missa.', to: '/missal', icon: BookMarked },
  { label: 'Via-Sacra', description: 'Meditar o caminho da Paixão do Senhor.', to: '/viacrucis', icon: Cross },
  { label: 'Ladainhas', description: 'Rezar com a Igreja em invocações e súplicas.', to: '/litanies', icon: BookMarked },
  { label: 'Novenas', description: 'Percursos de oração e preparação ao longo de nove dias.', to: '/novenas', icon: CalendarDays },
  { label: 'Livro de orações', description: 'Orações fundamentais e tradicionais.', to: '/oracao', icon: BookOpen },
  { label: 'Contemplatio', description: 'Permanecer em silêncio diante de Deus.', to: '/contemplatio', icon: Moon },
  { label: 'Exame de consciência', description: 'Preparar o coração para a reconciliação.', to: '/oracao/exame-de-consciencia', icon: Cross },
] as const;

const RezarHomePage: React.FC = () => (
  <section className="catedra-page catedra-section pb-24 pt-8 md:pt-12">
    <EditorialHero density="minimal" align="center">
      <EditorialHero.Eyebrow>Ritmo, silêncio e presença de Deus.</EditorialHero.Eyebrow>
      <EditorialHero.Title>Rezar</EditorialHero.Title>
      <EditorialHero.Subtitle>
        Três caminhos centrais para ordenar a oração: a liturgia da Igreja, a escuta da Palavra e a contemplação dos mistérios de Cristo.
      </EditorialHero.Subtitle>
    </EditorialHero>

    <div className="mx-auto max-w-6xl space-y-16">
      <section aria-labelledby="rezar-caminhos" className="space-y-6">
        <header className="mx-auto max-w-3xl space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/75">Caminhos essenciais</p>
          <h2 id="rezar-caminhos" className="font-serif text-2xl text-foreground md:text-3xl">
            Uma vida de oração, três caminhos
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Escolha por onde deseja começar. Cada espaço conduz a uma experiência própria, com sequência e conteúdo adequados à oração.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.to} className="group flex min-h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl">
                <div className={`relative flex min-h-36 items-center justify-between bg-gradient-to-br ${item.accent} px-6 py-6`}>
                  <span className="font-serif text-5xl font-light text-primary/20">{item.number}</span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-background/75 text-primary shadow-sm">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="absolute bottom-4 left-6 text-[10px] font-bold uppercase tracking-[0.18em] text-primary/75">
                    {item.eyebrow}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-2xl font-semibold text-foreground group-hover:text-primary">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  <p className="mt-5 border-t border-border/70 pt-4 text-xs font-medium leading-relaxed text-primary/80">
                    {item.detail}
                  </p>
                  <Link
                    to={item.to}
                    className="mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {item.action}
                    <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="rezar-outras-formas" className="space-y-5">
        <header className="mx-auto max-w-3xl space-y-2 text-center">
          <h2 id="rezar-outras-formas" className="font-serif text-2xl text-foreground md:text-3xl">
            Outras formas de oração
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Outras práticas e recursos da tradição espiritual da Igreja, organizados em um só lugar.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {OTHER_PATHS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex min-h-24 items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-4 text-left transition-all hover:border-primary/40 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-base font-semibold text-foreground group-hover:text-primary">{item.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>

    <SpaceFooter
      note="Toda oração cristã nasce da graça, encontra seu centro em Cristo e se une à oração da Igreja."
      links={[
        { label: 'Bíblia', to: '/bible', hint: 'Escutar a Palavra de Deus' },
        { label: 'Catecismo', to: '/catechism', hint: 'Aprofundar a fé da Igreja' },
        { label: 'Santos', to: '/santos', hint: 'Aprender com os testemunhos de santidade' },
      ]}
    />
  </section>
);

export default RezarHomePage;
