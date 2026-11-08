import React from 'react';
import {
  BookOpen,
  BookMarked,
  CalendarDays,
  ChevronRight,
  Cross,
  Heart,
  Moon,
  Sunrise,
} from 'lucide-react';
import { Link } from '@/lib/rr-compat';
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
  },
] as const;

const OTHER_PATHS = [
  { label: 'Liturgia do dia', description: 'Leituras, salmo e Evangelho da celebração.', to: '/liturgia', icon: CalendarDays },
  { label: 'Missal', description: 'Rezar a Missa e estudar o sentido de cada oração.', to: '/missal', icon: BookMarked },
  { label: 'Via-Sacra', description: 'Meditar o caminho da Paixão do Senhor.', to: '/viacrucis', icon: Cross },
  { label: 'Ladainhas', description: 'Rezar com a Igreja em invocações e súplicas.', to: '/litanies', icon: BookMarked },
  { label: 'Novenas', description: 'Percursos de oração e preparação ao longo de nove dias.', to: '/novenas', icon: CalendarDays },
  { label: 'Livro de orações', description: 'Orações fundamentais e tradicionais.', to: '/oracao', icon: BookOpen },
  { label: 'Contemplatio', description: 'Permanecer em silêncio diante de Deus.', to: '/contemplatio', icon: Moon },
  { label: 'Exame de consciência', description: 'Preparar o coração para a reconciliação.', to: '/oracao/exame-de-consciencia', icon: Cross },
] as const;

const RezarHomePage: React.FC = () => (
  <section data-catedra-module-root data-catedra-module="rezar" className="min-h-screen w-full min-w-0 overflow-x-hidden bg-stitch-background text-stitch-on-background pb-24 pt-6 md:pt-12">
    <header className="catedra-page catedra-section mx-auto max-w-3xl px-4 pb-8 text-center sm:px-5 md:pb-10">
      <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.24em] text-stitch-secondary md:text-[12px] md:tracking-[0.32em]">Ritmo, silêncio e presença de Deus</p>
      <h1 className="mt-2 font-stitch-display text-[36px] leading-tight text-stitch-primary md:mt-3 md:text-[56px]">Rezar</h1>
      <p className="mt-3 font-stitch-body text-[15px] leading-6 text-stitch-on-surface-variant md:text-[18px] md:leading-7">Três caminhos para ordenar a oração: a liturgia da Igreja, a escuta da Palavra e a contemplação dos mistérios de Cristo.</p>
    </header>

    <div className="catedra-page mx-auto max-w-6xl space-y-14 px-4 sm:px-5 md:space-y-16">
      <section aria-labelledby="rezar-caminhos" className="space-y-6">
        <header className="mx-auto max-w-3xl space-y-2 text-center">
          <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-secondary md:text-[11px]">Caminhos essenciais</p>
          <h2 id="rezar-caminhos" className="font-stitch-display text-[24px] leading-tight text-stitch-primary md:text-[30px]">
            Uma vida de oração, três caminhos
          </h2>
          <p className="font-stitch-body text-sm leading-6 text-stitch-on-surface-variant">
            Escolha por onde deseja começar. Cada espaço conduz a uma experiência própria, com sequência e conteúdo adequados à oração.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.to} className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest shadow-sm transition-all hover:-translate-y-0.5 hover:border-stitch-secondary hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <div className="relative flex min-h-32 items-center justify-between border-b border-stitch-outline-variant/20 bg-stitch-secondary-container/20 px-5 py-5 md:px-6">
                  <span className="font-stitch-display text-5xl font-light text-stitch-secondary/35">{item.number}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-stitch-secondary/20 bg-stitch-surface-container-lowest text-stitch-secondary shadow-sm">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="absolute bottom-3 left-5 font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-secondary md:left-6">
                    {item.eyebrow}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="font-stitch-display text-[24px] leading-tight text-stitch-primary group-hover:text-stitch-secondary">{item.title}</h3>
                  <p className="mt-3 flex-1 font-stitch-body text-sm leading-6 text-stitch-on-surface-variant">{item.description}</p>
                  <p className="mt-5 border-t border-stitch-outline-variant/25 pt-4 font-stitch-body text-xs font-medium leading-relaxed text-stitch-secondary">
                    {item.detail}
                  </p>
                  <Link
                    to={item.to}
                    className="mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded-xl bg-stitch-secondary px-4 py-3 font-stitch-body text-sm font-bold text-stitch-secondary-on-container transition-colors hover:bg-stitch-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2"
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
          <h2 id="rezar-outras-formas" className="font-stitch-display text-[24px] leading-tight text-stitch-primary md:text-[30px]">
            Outras formas de oração
          </h2>
          <p className="font-stitch-body text-sm leading-6 text-stitch-on-surface-variant">
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
                className="group flex min-h-24 items-center gap-3 rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest px-4 py-4 text-left transition-all hover:border-stitch-secondary hover:bg-stitch-secondary-container/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stitch-secondary-container text-stitch-secondary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-stitch-display text-[17px] text-stitch-primary group-hover:text-stitch-secondary">{item.label}</span>
                  <span className="mt-1 block font-stitch-body text-xs leading-5 text-stitch-on-surface-variant">{item.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-stitch-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-stitch-secondary" aria-hidden="true" />
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
