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
} from 'lucide-react';
import { Link } from '@/lib/rr-compat';
import { EditorialHero } from '@/components/editorial/harmony';
import { SpaceFooter } from '@/components/cathedra/space/SpaceLayout';

const GROUPS = [
  {
    title: 'Liturgia da Igreja',
    description: 'Unir a oração pessoal à oração pública e diária da Igreja.',
    items: [
      { label: 'Missal', description: 'Acompanhar a celebração eucarística.', to: '/missal', icon: BookOpen },
      { label: 'Laudes', description: 'Santificar o início do dia.', to: '/breviary?h=laudes', icon: Sun },
      { label: 'Oração do meio-dia', description: 'Interromper o dia para voltar o coração a Deus.', to: '/breviary?h=sexta', icon: Clock3 },
      { label: 'Vésperas', description: 'Oferecer a Deus o trabalho e os acontecimentos do dia.', to: '/breviary?h=vesperas', icon: CalendarDays },
      { label: 'Completas', description: 'Concluir o dia na confiança e na paz de Cristo.', to: '/breviary?h=completas', icon: Moon },
    ],
  },
  {
    title: 'Devoções',
    description: 'Caminhos tradicionais de oração, meditação e intercessão.',
    items: [
      { label: 'Rosário', description: 'Contemplar com Maria os mistérios da vida de Cristo.', to: '/oracao/rosario', icon: Heart },
      { label: 'Via-Sacra', description: 'Acompanhar o caminho da Paixão do Senhor.', to: '/viacrucis', icon: Cross },
      { label: 'Ladainhas', description: 'Rezar com a Igreja em invocações e súplicas.', to: '/litanies', icon: BookMarked },
      { label: 'Novenas', description: 'Percorrer nove dias de oração e preparação.', to: '/novenas', icon: CalendarDays },
    ],
  },
  {
    title: 'Oração e meditação',
    description: 'Encontrar silêncio, escuta da Palavra e exame da própria vida.',
    items: [
      { label: 'Livro de orações', description: 'Acessar as orações fundamentais e tradicionais.', to: '/oracao', icon: BookOpen },
      { label: 'Lectio Divina', description: 'Ler, meditar, rezar e contemplar a Palavra.', to: '/lectio', icon: Sparkles },
      { label: 'Contemplatio', description: 'Permanecer em silêncio diante de Deus.', to: '/contemplatio', icon: Heart },
      { label: 'Exame de consciência', description: 'Preparar o coração para a reconciliação.', to: '/oracao/exame-de-consciencia', icon: Cross },
    ],
  },
] as const;

const RezarHomePage: React.FC = () => (
  <section className="catedra-page catedra-section pb-24 pt-8 md:pt-12">
    <EditorialHero density="minimal" align="center">
      <EditorialHero.Eyebrow>Ritmo, silêncio e presença de Deus.</EditorialHero.Eyebrow>
      <EditorialHero.Title>Rezar</EditorialHero.Title>
      <EditorialHero.Subtitle>
        A oração da Igreja em seus ritmos, devoções e caminhos de contemplação.
      </EditorialHero.Subtitle>
    </EditorialHero>

    <div className="mx-auto max-w-7xl space-y-14">
      {GROUPS.map((group) => (
        <section key={group.title} aria-labelledby={`rezar-${group.title}`} className="space-y-5">
          <header className="mx-auto max-w-3xl space-y-2 text-center">
            <h2 id={`rezar-${group.title}`} className="font-serif text-2xl text-foreground md:text-3xl">
              {group.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{group.description}</p>
          </header>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex min-h-28 items-center gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-lg font-semibold text-foreground group-hover:text-primary">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
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
