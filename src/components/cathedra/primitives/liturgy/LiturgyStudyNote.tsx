import React from 'react';
import { BookOpen } from 'lucide-react';
import type { PrayerBlock } from '@/types/prayer';

export interface LiturgyStudyNoteData {
  label: string;
  explanation: string;
  practice: string;
}

const NOTES: Array<{ matches: string[]; note: LiturgyStudyNoteData }> = [
  {
    matches: ['antífona de entrada', 'antiphona ad introitum'],
    note: {
      label: 'A entrada reúne a assembleia e orienta o olhar para o mistério celebrado.',
      explanation: 'A Igreja começa a Missa caminhando para o altar. O canto ou a antífona não é apenas uma abertura musical: apresenta o tom do dia e ajuda a assembleia a passar da dispersão para a celebração.',
      practice: 'Leia a antífona antes da oração e perceba qual atitude ela pede hoje: louvor, súplica, confiança ou conversão.',
    },
  },
  {
    matches: ['ato penitencial', 'kyrie', 'confesso'],
    note: {
      label: 'Reconhecemos a necessidade da misericórdia antes de entrar no louvor.',
      explanation: 'O Ato Penitencial não substitui o sacramento da Reconciliação. Ele expressa a humildade da assembleia, reconhece o pecado e abre o coração para receber a Palavra e celebrar os santos mistérios.',
      practice: 'Nomeie diante de Deus, sem justificativas, aquilo que precisa ser convertido. Depois, receba o perdão com confiança e não permaneça preso à culpa.',
    },
  },
  {
    matches: ['glória', 'gloria'],
    note: {
      label: 'O Glória é um hino de louvor ao Pai, ao Filho e ao Espírito Santo.',
      explanation: 'A oração começa com o anúncio dos anjos em Belém e amplia-se em uma profissão de louvor. Por isso, não é uma oração de pedido: é a resposta agradecida da Igreja à presença salvadora de Deus.',
      practice: 'Reze cada invocação como uma proclamação: Deus é santo, Cristo é Senhor e a misericórdia não é uma ideia, mas uma realidade recebida.',
    },
  },
  {
    matches: ['oração do dia', 'coleta', 'collecta'],
    note: {
      label: 'A Coleta recolhe a oração da assembleia e dá nome à graça pedida naquele dia.',
      explanation: 'O sacerdote reúne as intenções dos fiéis em uma única oração dirigida ao Pai, por Cristo, no Espírito Santo. Ela costuma revelar o eixo espiritual da celebração e do tempo litúrgico.',
      practice: 'Leia a oração procurando três movimentos: quem Deus é, o que pedimos e para qual transformação de vida somos enviados.',
    },
  },
  {
    matches: ['creio', 'credo', 'profissão de fé'],
    note: {
      label: 'Respondemos à Palavra professando juntos a fé da Igreja.',
      explanation: 'O Credo não é uma lista privada de opiniões. É a forma comum pela qual a assembleia consente na fé recebida dos apóstolos e confessa o Deus trinitário, a encarnação, a Igreja e a esperança da ressurreição.',
      practice: 'Ao rezar “creio”, una sua voz à Igreja inteira. Observe qual artigo da fé precisa hoje ser melhor compreendido ou vivido.',
    },
  },
  {
    matches: ['oração dos fiéis', 'preces'],
    note: {
      label: 'A assembleia intercede pelo mundo a partir da Palavra escutada.',
      explanation: 'As preces tornam visível a responsabilidade universal da Igreja. Depois de ouvir Deus, o povo responde levando ao altar as necessidades da Igreja, dos governantes, dos que sofrem e da comunidade.',
      practice: 'Apresente pessoas concretas, mas deixe que a oração se alargue além do seu círculo. Interceder é aprender a amar com o coração da Igreja.',
    },
  },
  {
    matches: ['santo', 'sanctus'],
    note: {
      label: 'Com os anjos e santos, a Igreja aclama a santidade de Deus.',
      explanation: 'O Santo une a assembleia terrestre ao louvor celeste. O “Hosana” também recorda a entrada messiânica de Cristo: aquele que vem em nome do Senhor é o mesmo que se entrega na Eucaristia.',
      practice: 'Não o trate como intervalo musical. Reze-o como uma aclamação: Deus é santo e Cristo vem ao encontro do seu povo.',
    },
  },
  {
    matches: ['oração eucarística', 'prex eucharistica', 'cânon'],
    note: {
      label: 'A Oração Eucarística é o centro da ação de graças e da oferta de Cristo.',
      explanation: 'Nela a Igreja dá graças ao Pai, recorda a obra de Cristo, invoca o Espírito Santo, proclama a instituição da Eucaristia e intercede pelos vivos e falecidos. As várias orações têm a mesma estrutura fundamental, embora acentuem tradições e necessidades diferentes.',
      practice: 'Acompanhe os verbos da oração: damos graças, invocamos, recordamos, oferecemos e intercedemos. A Missa pede participação interior, não apenas leitura.',
    },
  },
  {
    matches: ['pai-nosso', 'pai nosso'],
    note: {
      label: 'A oração do Senhor prepara a assembleia para receber o pão e a reconciliação.',
      explanation: 'Antes da Comunhão, a Igreja reza a oração ensinada por Jesus. Ela ordena os desejos: primeiro o nome, o Reino e a vontade do Pai; depois o pão cotidiano, o perdão e a libertação do mal.',
      practice: 'Reze devagar e perceba que pedir o pão inclui aprender a repartir, e pedir perdão inclui tornar-se disponível para perdoar.',
    },
  },
  {
    matches: ['rito da paz', 'paz'],
    note: {
      label: 'A paz recebida de Cristo torna-se gesto concreto de comunhão.',
      explanation: 'O rito não é uma pausa social. Ele manifesta que a Eucaristia reconcilia e cria um povo. O gesto deve ser sóbrio, verdadeiro e coerente com a disposição de procurar a paz fora da celebração.',
      practice: 'Ofereça a paz sem superficialidade. Se há uma reconciliação possível, transforme a saudação em um primeiro passo real.',
    },
  },
  {
    matches: ['cordeiro de deus', 'agnus dei'],
    note: {
      label: 'Reconhecemos em Cristo o Cordeiro que tira o pecado e concede a paz.',
      explanation: 'A invocação une a imagem bíblica do Cordeiro pascal ao pedido de misericórdia. A repetição conduz do reconhecimento do pecado à confiança de que Cristo é a verdadeira paz da Igreja.',
      practice: 'Deixe cair a pressa antes da Comunhão. Receba a paz como dom de Cristo, não como resultado do seu controle.',
    },
  },
  {
    matches: ['comunhão', 'antífona de comunhão', 'antiphona ad communionem'],
    note: {
      label: 'A Comunhão une o fiel a Cristo e edifica a unidade do seu Corpo.',
      explanation: 'A Comunhão não é apenas um momento devocional individual. Ao receber o Corpo de Cristo, somos incorporados mais profundamente à Igreja e enviados a viver a caridade que celebramos.',
      practice: 'Depois de comungar, permaneça em silêncio. Agradeça, peça que Cristo transforme sua vida e recorde alguém a quem você precisa servir.',
    },
  },
  {
    matches: ['oração depois da comunhão', 'post communionem', 'pós-comunhão'],
    note: {
      label: 'Pedimos que o sacramento produza fruto na vida cotidiana.',
      explanation: 'A oração depois da Comunhão impede que a celebração termine em uma experiência isolada. A graça recebida é pedida novamente como força para viver, testemunhar e permanecer unido a Cristo.',
      practice: 'Pergunte-se qual fruto concreto a Missa deve produzir hoje: uma reconciliação, um serviço, uma renúncia ou uma decisão fiel.',
    },
  },
  {
    matches: ['bênção', 'despedida', 'ite, missa est', 'envio'],
    note: {
      label: 'A celebração termina com um envio: a liturgia continua na vida.',
      explanation: 'A despedida não significa simplesmente que a reunião acabou. A assembleia é enviada para levar ao mundo a graça celebrada, tornando-se testemunha do Evangelho em suas relações e responsabilidades.',
      practice: 'Escolha uma atitude concreta para levar para casa. O envio é verdadeiro quando a oração se transforma em caridade, justiça e esperança.',
    },
  },
];

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function getLiturgyStudyNote(title = '', kicker = ''): LiturgyStudyNoteData | null {
  const haystack = normalize(`${title} ${kicker}`);
  return NOTES.find(({ matches }) => matches.some((match) => haystack.includes(normalize(match))))?.note ?? null;
}

interface LiturgyStudyNoteProps {
  note: LiturgyStudyNoteData;
  meditation?: string;
  compact?: boolean;
}

export const LiturgyStudyNote: React.FC<LiturgyStudyNoteProps> = ({ note, meditation, compact = false }) => (
  <details className="group mt-4 rounded-xl border border-stitch-secondary/25 bg-stitch-secondary-container/10">
    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 py-2.5 font-stitch-body text-[10px] font-bold uppercase tracking-[0.14em] text-stitch-secondary marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary">
      <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Estudar esta oração</span>
      <span className="ml-auto text-[16px] leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
    </summary>
    <div className={`border-t border-stitch-secondary/15 px-3 pb-3 pt-3 font-stitch-body text-[13px] leading-5 text-stitch-on-surface-variant ${compact ? 'md:px-4' : 'md:px-5'}`}>
      <p className="font-bold text-stitch-primary">{note.label}</p>
      <p className="mt-2"><strong className="text-stitch-primary">Por que existe:</strong> {note.explanation}</p>
      <p className="mt-2"><strong className="text-stitch-primary">Como rezar:</strong> {note.practice}</p>
      {meditation && <p className="mt-2 border-l-2 border-stitch-secondary/50 pl-3 italic"><strong className="not-italic text-stitch-primary">Para meditar:</strong> {meditation}</p>}
    </div>
  </details>
);
