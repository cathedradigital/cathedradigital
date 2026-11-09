import React from 'react';
import { BookOpen, CheckCircle2, Compass, Heart, Info } from 'lucide-react';

export interface StudyApplicationContent {
  what: string;
  why: string;
  how: string;
  application: string;
  references?: string;
}

interface StudyApplicationBlockProps {
  content: StudyApplicationContent;
  heading?: string;
  eyebrow?: string;
  className?: string;
}

const ITEMS = [
  { key: 'what', label: 'O que é', icon: Info },
  { key: 'why', label: 'Por que rezamos', icon: BookOpen },
  { key: 'how', label: 'Como acompanhar', icon: Compass },
  { key: 'application', label: 'Aplicação para hoje', icon: CheckCircle2 },
  { key: 'references', label: 'Aprofunde', icon: Heart },
] as const;

export const StudyApplicationBlock: React.FC<StudyApplicationBlockProps> = ({
  content,
  heading = 'Estudo e aplicação',
  eyebrow = 'Além do texto da oração',
  className,
}) => (
  <section
    aria-labelledby="study-application-title"
    className={`rounded-2xl border border-stitch-secondary/30 bg-stitch-secondary-container/15 p-4 shadow-sm md:p-6 ${className ?? ''}`}
  >
    <header className="mb-4 border-b border-stitch-secondary/20 pb-4">
      <p className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.22em] text-stitch-secondary">{eyebrow}</p>
      <h2 id="study-application-title" className="mt-1 font-stitch-display text-xl text-stitch-primary md:text-2xl">{heading}</h2>
      <p className="mt-1 font-stitch-body text-sm leading-5 text-stitch-on-surface-variant">
        Entenda a oração, reze com atenção e leve seu sentido para a vida.
      </p>
    </header>

    <div className="grid gap-3 md:grid-cols-2">
      {ITEMS.map(({ key, label, icon: Icon }) => {
        const text = content[key];
        if (!text) return null;
        return (
          <article key={key} className="rounded-xl border border-stitch-outline-variant/25 bg-stitch-surface-container-lowest/75 p-3 md:p-4">
            <h3 className="flex items-center gap-2 font-stitch-body text-[10px] font-bold uppercase tracking-[0.14em] text-stitch-secondary">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </h3>
            <p className="mt-2 font-stitch-body text-sm leading-6 text-stitch-on-surface-variant">{text}</p>
          </article>
        );
      })}
    </div>
  </section>
);

export function getPrayerStudyContent(input: {
  title: string;
  slug?: string;
  category?: string;
  explanation?: string | null;
  meditation?: string | null;
  sourceRef?: string | null;
}): StudyApplicationContent {
  const slug = input.slug?.toLowerCase() ?? '';
  const category = input.category?.toLowerCase() ?? '';
  const isRosary = slug.includes('rosario') || category.includes('rosário') || category.includes('rosario');

  if (isRosary) {
    return {
      what: 'O Rosário é uma oração vocal e contemplativa: percorremos os mistérios da vida de Cristo com Maria, deixando que a repetição das orações sustente a atenção e o coração.',
      why: 'A repetição não é um fim em si mesma. Ela cria um ritmo de escuta, louvor e súplica para que o Evangelho seja contemplado e se torne vida. O centro de cada dezena é sempre Cristo e seu mistério.',
      how: 'Anuncie o mistério, leia a passagem bíblica, formule a intenção e reze a dezena sem pressa. Use cada Ave-Maria como um retorno ao mistério, não como uma contagem automática.',
      application: input.meditation ?? 'Escolha uma atitude concreta que corresponda ao mistério contemplado e leve-a para uma relação, decisão ou serviço ao longo do dia.',
      references: input.sourceRef ?? 'Aprofunde cada mistério na Escritura, no Catecismo e nos santos relacionados apresentados pela Cathedra Digital.',
    };
  }

  return {
    what: `“${input.title}” é uma oração da tradição cristã que organiza a relação com Deus por meio de louvor, súplica, ação de graças ou entrega. O texto deve ser rezado como encontro, não apenas lido como informação.`,
    why: input.explanation ?? 'A Igreja conserva orações porque elas dão palavras à fé recebida e ajudam o fiel a rezar unido à Escritura, à Tradição e à comunidade cristã.',
    how: 'Leia uma vez para compreender o movimento do texto. Depois reze mais lentamente, fazendo pausas nas palavras que pedem resposta interior e retomando a frase central quando a atenção se dispersar.',
    application: input.meditation ?? 'Conclua escolhendo uma atitude concreta: uma reconciliação, um agradecimento, um serviço ou uma decisão de fidelidade que traduza a oração em vida.',
    references: input.sourceRef ?? 'Consulte as referências bíblicas, do Catecismo e da tradição indicadas nesta página quando estiverem disponíveis.',
  };
}

export function getNovenaStudyContent(input: {
  title: string;
  patron: string;
  category: string;
  summary: string;
  totalDays: number;
}): StudyApplicationContent {
  return {
    what: `${input.title} é um percurso de oração perseverante de ${input.totalDays} dias, ligado à devoção de ${input.patron}. Cada dia une oração, meditação e uma intenção para formar um caminho, não apenas uma leitura avulsa.`,
    why: `A tradição das novenas educa a perseverança e a expectativa confiante diante de Deus. Este percurso pertence ao âmbito devocional da Igreja: ele prepara o coração para uma graça, festa ou intenção sem substituir a liturgia.`,
    how: `Reserve um horário possível e mantenha a ordem: oração inicial, meditação do dia, intenção, oração final e silêncio. Se precisar interromper, retome pelo dia salvo; a fidelidade ao caminho é mais importante que a pressa.`,
    application: `Depois da oração, transforme a intenção do dia em um gesto concreto. Pergunte: o que esta meditação pede de mim hoje em casa, no trabalho, na comunidade ou diante de Deus?`,
    references: `${input.category} · ${input.summary} Consulte as referências bíblicas e a tradição específica apresentadas em cada dia quando estiverem disponíveis.`,
  };
}
