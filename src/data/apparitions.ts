import { DeepContent } from '@/types';
import guadalupeImg from '@/assets/aparicao-guadalupe.webp';
import lourdesImg from '@/assets/aparicao-lourdes.webp';
import fatimaImg from '@/assets/aparicao-fatima.webp';
import aparecidaImg from '@/assets/aparicao-aparecida.webp';
import laSaletteImg from '@/assets/aparicao-la-salette.webp';
import knockImg from '@/assets/aparicao-knock.webp';
import kibehoImg from '@/assets/aparicao-kibeho.webp';
import akitaImg from '@/assets/aparicao-akita.webp';

export interface Apparition extends Partial<DeepContent> {
  id: string;
  title: string;
  location: string;
  country: string;
  year: number;
  date: string;
  seer: string;
  seerStory: string;
  summary: string;
  fullStory: string;
  message: string;
  liturgicalFeast: string;
  kind: 'apparition' | 'image-devotion';
  ecclesialAssessment: {
    label: string;
    detail: string;
    authority: string;
    date: string;
    sourceLabel: string;
    sourceUrl: string;
  };
  image: string;
  imageSrc: string;
  color: string;
}

const APPARITION_EDITORIAL: Record<string, Partial<DeepContent>> = {
  guadalupe: {
    textoBase: "A tradição guadalupana apresenta Maria em encontro com São Juan Diego no Tepeyac, em dezembro de 1531.",
    explicacao: "O relato destaca o cuidado materno de Maria e o envio de Juan Diego ao bispo. A catequese pontifícia recorda esse testemunho na história da evangelização do México.",
    interpretacaoProfunda: "A devoção guadalupana sublinha a proximidade de Maria e a dignidade dos povos indígenas, sempre orientando a fé para Cristo.",
    aplicacaoPratica: "Transformar a devoção em acolhida concreta, especialmente aos pobres, aos pequenos e aos que se sentem esquecidos.",
    reflexaoFinal: "Como a minha fé se torna presença e cuidado para quem está próximo?",
    exercicio: "Reze uma Ave-Maria por alguém que precise de acolhida e dignidade.",
  },
  'la-salette': {
    textoBase: "O relato de La Salette apresenta Maria chorando e dirigindo um apelo à conversão.",
    explicacao: "A mensagem transmitida a Maximino e Mélanie chama à oração, à fidelidade cristã e à santificação do domingo.",
    interpretacaoProfunda: "O choro de Maria é apresentado como chamado pastoral à conversão, não como substituto do Evangelho nem da Revelação definitiva de Cristo.",
    aplicacaoPratica: "Reservar tempo para a oração, participar da Eucaristia dominical e viver a conversão em atitudes concretas.",
    reflexaoFinal: "Tenho tratado o domingo como dia do Senhor e de caridade?",
    exercicio: "Escolha um gesto concreto de reconciliação e oração para esta semana.",
  },
  lourdes: {
    textoBase: "O testemunho de Lourdes está ligado às experiências de Bernadette Soubirous na gruta de Massabielle, em 1858.",
    explicacao: "O relato associa a oração, a penitência e a conversão à experiência de Bernadette e à vida de oração que se desenvolveu no santuário.",
    interpretacaoProfunda: "A mensagem convida à humildade e à confiança em Deus, com atenção especial aos doentes e aos que sofrem.",
    aplicacaoPratica: "Aproximar-se dos enfermos com respeito, presença, oração e serviço concreto.",
    reflexaoFinal: "Tenho cuidado dos que sofrem ou apenas penso neles à distância?",
    exercicio: "Visite ou telefone a alguém enfermo ou solitário, oferecendo presença e escuta.",
  },
  knock: {
    textoBase: "O relato de Knock descreve uma cena silenciosa junto à igreja paroquial, com Maria, São José, São João Evangelista e o Cordeiro.",
    explicacao: "A fonte do santuário destaca o silêncio da cena e a centralidade do Cordeiro. Não há mensagem verbal atribuída à aparição no relato apresentado.",
    interpretacaoProfunda: "A contemplação do Cordeiro conduz o olhar para Cristo e para o mistério eucarístico, centro da vida da Igreja.",
    aplicacaoPratica: "Cultivar momentos de silêncio diante de Cristo e participar da Eucaristia com atenção e reverência.",
    reflexaoFinal: "O silêncio tem espaço real na minha oração?",
    exercicio: "Reserve alguns minutos de silêncio diante do Santíssimo Sacramento ou em oração pessoal.",
  },
  fatima: {
    textoBase: "A mensagem de Fátima, recebida pelos três pastorinhos em 1917 segundo o relato, insiste na oração, na conversão e na paz.",
    explicacao: "A cronologia do Santuário de Fátima registra o processo canônico diocesano e a carta pastoral de 1930, que declarou dignas de crédito as visões.",
    interpretacaoProfunda: "O chamado à conversão e à oração deve ser lido à luz do Evangelho e da centralidade de Cristo, sem transformar revelações privadas em novo depósito da fé.",
    aplicacaoPratica: "Rezar pela paz, buscar a reconciliação e assumir responsabilidade pelo bem do próximo.",
    reflexaoFinal: "Que atitude concreta minha pode favorecer a paz na família e na comunidade?",
    exercicio: "Reze uma dezena do Rosário pela paz e por pessoas em situação de conflito.",
  },
  aparecida: {
    textoBase: "A devoção a Nossa Senhora Aparecida tem origem na descoberta de uma imagem de Nossa Senhora da Conceição por pescadores no Rio Paraíba do Sul, em 1717.",
    explicacao: "A história da imagem e o crescimento da devoção pertencem à memória religiosa do Brasil. Não se trata de um relato de aparição mariana.",
    interpretacaoProfunda: "A devoção popular pode fortalecer a fé, a esperança e a solidariedade quando conduz a Cristo e se expressa em caridade.",
    aplicacaoPratica: "Viver a fé com simplicidade, reconhecer a dignidade dos trabalhadores e servir quem enfrenta necessidades.",
    reflexaoFinal: "A minha devoção mariana me aproxima mais de Cristo e do serviço ao próximo?",
    exercicio: "Faça um gesto de solidariedade por uma família ou pessoa em necessidade.",
  },
  kibeho: {
    textoBase: "O relato de Kibeho situa as experiências a partir de 1981 e apresenta o título Mãe do Verbo.",
    explicacao: "A declaração episcopal publicada pela Santa Sé descreve o processo de discernimento e identifica as três videntes iniciais consideradas no julgamento definitivo.",
    interpretacaoProfunda: "O apelo à conversão e à reconciliação deve ser acolhido à luz do Evangelho e da dignidade de cada pessoa, especialmente diante da memória de violência e sofrimento.",
    aplicacaoPratica: "Promover reconciliação, rejeitar o ódio e rezar pelas vítimas de violência.",
    reflexaoFinal: "Tenho trabalhado pela reconciliação ou alimentado ressentimentos?",
    exercicio: "Reze pelas vítimas de conflitos e procure um passo possível de reconciliação.",
  },
  akita: {
    textoBase: "O registro de Akita reúne acontecimentos atribuídos a uma imagem mariana e mensagens relatadas por Irmã Agnes Sasagawa entre 1973 e 1981.",
    explicacao: "A carta pastoral de 1984 deve ser lida integralmente: o bispo descreveu sua conclusão e autorizou a veneração diocesana enquanto aguardava decisão definitiva da Santa Sé.",
    interpretacaoProfunda: "O convite à oração e à penitência é apresentado como chamado à conversão cristã, sem alimentar medo ou especulações sobre acontecimentos futuros.",
    aplicacaoPratica: "Rezar com confiança, praticar a penitência de modo equilibrado e buscar a reconciliação.",
    reflexaoFinal: "Minha oração me conduz à confiança em Deus ou ao medo?",
    exercicio: "Ofereça uma oração pela paz e por quem precisa de consolo.",
  },
};

export const APPARITIONS: Apparition[] = [
  {
    id: 'guadalupe',
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Tradição guadalupana recordada pela Santa Sé",
      detail: "A catequese do Papa Francisco recorda a tradição das aparições a São Juan Diego em 1531. Esta referência vaticana é apresentada como testemunho da tradição, não como um decreto específico de reconhecimento.",
      authority: "Papa Francisco — Audiência Geral",
      date: "23/08/2023",
      sourceLabel: "Ler a catequese no Vaticano",
      sourceUrl: "https://www.vatican.va/content/francesco/pt/audiences/2023/documents/20230823-udienza-generale.html",
    },
    title: 'Nossa Senhora de Guadalupe',
    location: 'Tepeyac, Cidade do México',
    country: 'México',
    year: 1531,
    date: '9–12 de dezembro de 1531',
    seer: 'São Juan Diego Cuauhtlatoatzin',
    seerStory: 'Juan Diego era um indígena nahua, simples agricultor, recém-convertido. Após as aparições, dedicou a vida a cuidar da ermida no Tepeyac. Canonizado em 2002.',
    summary: 'A Virgem apareceu a Juan Diego no monte Tepeyac, deixando sua imagem milagrosamente impressa em sua tilma.',
    fullStory: 'Em dezembro de 1531, a Virgem Maria apareceu ao indígena Juan Diego no monte Tepeyac. Ela se apresentou como a "Mãe do verdadeiro Deus". Ao abrir a tilma diante do bispo Zumárraga, revelou-se a imagem milagrosa de Nossa Senhora. A tilma permanece intacta quase 500 anos depois.',
    message: 'Maria se revela como Mãe de toda a humanidade. "Não estou eu aqui, que sou tua Mãe?"',
    liturgicalFeast: '12 de dezembro',
    image: '🌹',
    imageSrc: guadalupeImg,
    color: 'from-primary/20 to-primary/5 border-primary/30',
    ...APPARITION_EDITORIAL.guadalupe
  },
  {
    id: 'la-salette',
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Reconhecimento pelo Bispo de Grenoble (1851)",
      detail: "Em 19 de setembro de 1851, Dom Philibert de Bruillard publicou um mandamento após investigação e reconheceu a aparição, autorizando o culto no local.",
      authority: "Dom Philibert de Bruillard — Bispo de Grenoble",
      date: "19/09/1851",
      sourceLabel: "Consultar documentação da Diocese de Grenoble",
      sourceUrl: "https://www.diocese-grenoble-vienne.fr/csx/scripts/downloader2.php?filename=DATAWX%2Ffichier%2F96%2Ff1%2FFR.dfi5ob2gp7b8&mime=application%2Fpdf&originalname=Echos_du_27_septembre_2020_-_Rev_3.pdf",
    },
    title: 'Nossa Senhora de La Salette',
    location: 'La Salette-Fallavaux, Alpes',
    country: 'França',
    year: 1846,
    date: '19 de setembro de 1846',
    seer: 'Mélanie Calvat e Maximin Giraud',
    seerStory: 'Mélanie e Maximin eram pastorzinhos pobres e quase analfabetos. Após a aparição, ambos mantiveram a veracidade do testemunho sob severo escrutínio.',
    summary: 'A Virgem apareceu chorando a dois pastorzinhos, lamentando a profanação do domingo e o abandono da oração.',
    fullStory: 'Em 19 de setembro de 1846, na montanha de La Salette, a "Bela Senhora" apareceu chorando a duas crianças, lamentando a profanação do domingo, a blasfêmia e o abandono da oração.',
    message: 'Maria chora pela indiferença de seus filhos. Pede a santificação do domingo, a oração e a conversão.',
    liturgicalFeast: '19 de setembro',
    image: '😢',
    imageSrc: laSaletteImg,
    color: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
    ...APPARITION_EDITORIAL['la-salette']
  },
  {
    id: 'lourdes',
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Decreto episcopal de reconhecimento (1862)",
      detail: "Em 18 de janeiro de 1862, Dom Bertrand-Sévère Laurence, Bispo de Tarbes, publicou o decreto que reconheceu as aparições após a investigação eclesiástica.",
      authority: "Dom Bertrand-Sévère Laurence — Bispo de Tarbes",
      date: "18/01/1862",
      sourceLabel: "Ler o decreto no Santuário de Lourdes",
      sourceUrl: "https://www.lourdes-france.org/en/the-decree/",
    },
    title: 'Nossa Senhora de Lourdes',
    location: 'Gruta de Massabielle, Lourdes',
    country: 'França',
    year: 1858,
    date: '11 de fevereiro a 16 de julho de 1858',
    seer: 'Santa Bernadette Soubirous',
    seerStory: 'Bernadette era uma menina pobre, doente e humilde. Após as 18 aparições, tornou-se religiosa, vivendo em oração e sofrimento até sua morte em 1879.',
    summary: 'A Imaculada Conceição apareceu 18 vezes a Bernadette, revelando uma fonte de água que se tornou centro de peregrinação.',
    fullStory: 'Entre fevereiro e julho de 1858, a Virgem apareceu 18 vezes a Bernadette. Na 16ª aparição, revelou: "Eu sou a Imaculada Conceição". A fonte surgida no local tornou-se fonte de inúmeras curas.',
    message: 'Maria convida à penitência, à oração e à conversão.',
    liturgicalFeast: '11 de fevereiro',
    image: '💧',
    imageSrc: lourdesImg,
    color: 'from-primary/20 to-primary/5 border-primary/30',
    ...APPARITION_EDITORIAL.lourdes
  },
  {
    id: 'knock',
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Duas comissões eclesiásticas de inquérito",
      detail: "O Santuário de Knock documenta as comissões de 1879–80 e 1935–36 e seus pareceres sobre a credibilidade dos testemunhos. Esta ficha descreve as investigações registradas pela fonte do santuário, sem transformar o resultado das comissões em uma declaração universal de autenticidade sobrenatural.",
      authority: "Comissões eclesiásticas convocadas pelo Arcebispo de Tuam",
      date: "1879–1880 e 1935–1936",
      sourceLabel: "Consultar as comissões no Santuário de Knock",
      sourceUrl: "https://www.knockshrine.ie/the-commissions-of-enquiry-2/",
    },
    title: 'Nossa Senhora de Knock',
    location: 'Knock, Condado de Mayo',
    country: 'Irlanda',
    year: 1879,
    date: '21 de agosto de 1879',
    seer: '15 testemunhas (homens, mulheres e crianças)',
    seerStory: 'Quinze testemunhas, incluindo crianças e idosos, presenciaram a aparição silenciosa na parede da igreja sob chuva intensa por duas horas.',
    summary: 'Aparição silenciosa de Nossa Senhora, São José e São João Evangelista na parede de uma igreja.',
    fullStory: 'Na noite de 21 de agosto de 1879, 15 pessoas viram Maria, São José e São João Evangelista perto da parede da igreja local. A aparição foi silenciosa, focada na centralidade do Cordeiro (Eucaristia).',
    message: 'Silêncio contemplativo, foco na Eucaristia.',
    liturgicalFeast: '21 de agosto',
    image: '🙏',
    imageSrc: knockImg,
    color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    ...APPARITION_EDITORIAL.knock
  },
  {
    id: 'fatima',
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Carta pastoral do Bispo de Leiria (1930)",
      detail: "Em 13 de outubro de 1930, Dom José Alves Correia da Silva declarou dignas de crédito as visões das crianças na Cova da Iria, após o processo canônico diocesano.",
      authority: "Dom José Alves Correia da Silva — Bispo de Leiria",
      date: "13/10/1930",
      sourceLabel: "Consultar cronologia oficial do Santuário de Fátima",
      sourceUrl: "https://www.fatima.pt/pt/pages/cronologia-dos-videntes",
    },
    title: 'Nossa Senhora de Fátima',
    location: 'Cova da Iria, Fátima',
    country: 'Portugal',
    year: 1917,
    date: '13 de maio a 13 de outubro de 1917',
    seer: 'Lúcia dos Santos, Francisco e Jacinta Marto',
    seerStory: 'Três pastorinhos de Aljustrel receberam mensagens sobre a paz, o inferno e a conversão do mundo.',
    summary: 'A Senhora mais brilhante que o sol apareceu seis vezes, pedindo o Rosário pela paz mundial.',
    fullStory: 'De maio a outubro de 1917, Maria apareceu a Lúcia, Francisco e Jacinta. Apresentou-se como a Senhora do Rosário e culminou com o Milagre do Sol em 13 de outubro, testemunhado por milhares.',
    message: 'Oração, penitência, devoção ao Imaculado Coração de Maria e o Rosário como arma de paz.',
    liturgicalFeast: '13 de maio',
    image: '🕊️',
    imageSrc: fatimaImg,
    color: 'from-red-500/20 to-red-600/5 border-red-500/30',
    ...APPARITION_EDITORIAL.fatima
  },
  {
    id: 'aparecida',
    kind: 'image-devotion' as const,
    ecclesialAssessment: {
      label: "Devoção mariana ligada à descoberta de uma imagem",
      detail: "A publicação do Estado da Cidade do Vaticano explica que o Santuário de Aparecida tem origem na descoberta de uma imagem em 1717, e não em um relato de aparição ou visão. Por isso, Aparecida é apresentada aqui como devoção mariana, não como aparição.",
      authority: "Governatorato do Estado da Cidade do Vaticano",
      date: "2025",
      sourceLabel: "Consultar publicação do Estado da Cidade do Vaticano",
      sourceUrl: "https://test.vaticanstate.va/images/trimestrale/2025/4-2025-eng.pdf",
    },
    title: 'Nossa Senhora Aparecida',
    location: 'Rio Paraíba do Sul, São Paulo',
    country: 'Brasil',
    year: 1717,
    date: 'Outubro de 1717',
    seer: 'Três pescadores: João Alves, Filipe Pedroso e Domingos Garcia',
    seerStory: 'Pescadores humildes encontraram a imagem de Nossa Senhora da Conceição após uma pesca milagrosa que trouxe abundância de peixes.',
    summary: 'A imagem da Padroeira do Brasil foi encontrada nas águas do rio Paraíba do Sul.',
    fullStory: 'Em 1717, três pescadores encontraram primeiro o corpo da estátua e depois a cabeça. Após a pesca milagrosa, tornaram-se devotos da imagem, que viria a ser a Padroeira do Brasil.',
    message: 'Maria aparece para manifestar a presença de Deus no meio da necessidade, unindo um povo em torno de seu Filho.',
    liturgicalFeast: '12 de outubro',
    image: '🎣',
    imageSrc: aparecidaImg,
    color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    ...APPARITION_EDITORIAL.aparecida
  },
  {
    id: 'kibeho',
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Declaração definitiva do Bispo de Gikongoro (2001)",
      detail: "Em 29 de junho de 2001, Dom Augustin Misago publicou a declaração definitiva sobre os acontecimentos de Kibeho, identificando as três videntes iniciais reconhecidas no documento.",
      authority: "Dom Augustin Misago — Bispo de Gikongoro",
      date: "29/06/2001",
      sourceLabel: "Ler a declaração publicada pela Santa Sé",
      sourceUrl: "https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2001/06/29/0382/01118.html",
    },
    title: 'Nossa Senhora de Kibeho',
    location: 'Kibeho, Província de Gikongoro',
    country: 'Ruanda',
    year: 1981,
    date: '28 de novembro de 1981 a 28 de novembro de 1989',
    seer: 'Alphonsine Mumureke, Nathalie Mukamazimpaka e Marie Claire Mukangango',
    seerStory: 'Três jovens estudantes tiveram visões proféticas de Maria e Jesus alertando sobre conflitos e pedindo conversão.',
    summary: 'A "Mãe do Verbo" apareceu em Ruanda antes do genocídio, pedindo oração e penitência.',
    fullStory: 'De 1981 a 1989, Maria apareceu em Kibeho. Pediu conversão urgente e profetizou sofrimentos para a nação ruandesa, alertando sobre a importância do arrependimento e oração profunda.',
    message: 'A "Mãe do Verbo" convida à conversão profunda, à oração pelo mundo e ao Rosário das Sete Dores.',
    liturgicalFeast: '28 de novembro',
    image: '✨',
    imageSrc: kibehoImg,
    color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    ...APPARITION_EDITORIAL.kibeho
  },
  {
    id: 'akita',
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Carta pastoral do Bispo de Niigata (1984)",
      detail: "Em 22 de abril de 1984, Dom John Shojiro Ito reconheceu o caráter sobrenatural dos acontecimentos relativos à estátua e autorizou a veneração na diocese, expressamente enquanto aguardava um julgamento definitivo da Santa Sé. O registro é apresentado como decisão diocesana histórica, não como definição da Santa Sé.",
      authority: "Dom John Shojiro Ito — Bispo de Niigata",
      date: "22/04/1984",
      sourceLabel: "Consultar transcrição da carta pastoral",
      sourceUrl: "https://www.miraclehunter.com/marian_apparitions/statements/akita_statement_01.html",
    },
    title: 'Nossa Senhora de Akita',
    location: 'Yuzawadai, Akita',
    country: 'Japão',
    year: 1973,
    date: '6 de julho de 1973 a 15 de setembro de 1981',
    seer: 'Irmã Agnes Katsuko Sasagawa',
    seerStory: 'Agnes Sasagawa, religiosa surda, presenciou lágrimas em uma estátua e recebeu mensagens sobre a necessidade de reparação.',
    summary: 'Uma estátua de Nossa Senhora chorou 101 vezes no Japão, pedindo oração, penitência e reparação.',
    fullStory: 'Entre 1973 e 1981, uma estátua de Nossa Senhora em um convento japonês chorou 101 vezes. A Irmã Agnes, surda, recebeu mensagens urgentes sobre a conversão da humanidade.',
    message: 'Maria pede oração, penitência e reparação. "O Rosário é a arma mais poderosa."',
    liturgicalFeast: '15 de setembro',
    image: '😭',
    imageSrc: akitaImg,
    color: 'from-secondary/20 to-secondary/5 border-secondary/30',
    ...APPARITION_EDITORIAL.akita
  },
].sort((a, b) => a.year - b.year);
