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
  kind: 'apparition' | 'image-devotion' | 'associated-phenomenon';
  recommendedSources: Array<{
    label: string;
    url: string;
    why: string;
    sourceType?: string;
  }>;
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

const RECOMMENDED_SOURCES: Record<string, Apparition['recommendedSources']> = {
  guadalupe: [
    { label: 'Catequese sobre São Juan Diego', url: 'https://www.vatican.va/content/francesco/pt/audiences/2023/documents/20230823-udienza-generale.html', why: 'Síntese pontifícia da tradição guadalupana, da mensagem materna e do papel de Juan Diego na evangelização do México.', sourceType: 'Santa Sé' },
    { label: 'Biografia de São Juan Diego', url: 'https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20020731_juan-diego_en.html', why: 'Apresenta dados biográficos, a tradição dos encontros no Tepeyac e a beatificação e canonização de Juan Diego.', sourceType: 'Santa Sé' },
    { label: 'Síntese das aparições', url: 'https://virgendeguadalupe.org.mx/sintesis-de-las-apariciones/', why: 'Cronologia narrativa institucional dos encontros de 9 a 12 de dezembro de 1531, incluindo Zumárraga, Juan Bernardino, as flores e a tilma.', sourceType: 'Santuário' },
    { label: 'Documentos históricos guadalupanos', url: 'https://virgendeguadalupe.org.mx/documentos-historicos/', why: 'Reúne materiais indígenas, mestiços e espanhóis para aprofundar a transmissão documental do relato.', sourceType: 'Arquivo histórico' },
    { label: 'Homilia da canonização de São Juan Diego', url: 'https://www.vatican.va/holy_father/john_paul_ii/homilies/2002/documents/hf_jp-ii_hom_20020731_canonization-mexico_en.html', why: 'Relaciona Guadalupe à evangelização inculturada, à dignidade dos povos indígenas e à canonização de Juan Diego.', sourceType: 'Santa Sé' },
    { label: 'A Virgem de Guadalupe', url: 'https://www.inah.gob.mx/foto-del-dia/la-virgen-de-guadalupe', why: 'Contextualização histórica e cultural do Nican Mopohua, da imagem e da importância de Guadalupe no México.', sourceType: 'Instituto histórico' },
  ],
  'la-salette': [
    { label: 'History of La Salette', url: 'https://www.lasalette.cef.fr/en/history/', why: 'História do relato e do santuário.', sourceType: 'Santuário' },
    { label: 'Carta de João Paulo II', url: 'https://www.vatican.va/content/john-paul-ii/fr/letters/1996/documents/hf_jp-ii_let_19960506_monsignor-dufaux.html', why: 'Contextualiza a recepção e a missão de La Salette.', sourceType: 'Santa Sé' },
  ],
  lourdes: [
    { label: 'As aparições', url: 'https://www.lourdes-france.org/en/apparitions/', why: 'Cronologia dos dezoito encontros relatados por Bernadette.', sourceType: 'Santuário' },
    { label: 'O decreto de 1862', url: 'https://www.lourdes-france.org/en/the-decree/', why: 'Texto da decisão do bispo de Tarbes.', sourceType: 'Documento diocesano' },
    { label: 'As curas de Lourdes', url: 'https://www.lourdes-france.org/en/the-miracles-of-lourdes/', why: 'Explica o processo de exame das curas.', sourceType: 'Comissão médica/santuário' },
  ],
  knock: [
    { label: 'History of Knock', url: 'https://www.knockshrine.ie/history/', why: 'Contexto histórico do testemunho de 1879.', sourceType: 'Santuário' },
    { label: 'Comissões de inquérito', url: 'https://www.knockshrine.ie/the-commissions-of-enquiry-2/', why: 'Apresenta os inquéritos e seus registros.', sourceType: 'Documentação eclesial' },
    { label: 'Homilia em Knock', url: 'https://www.vatican.va/content/john-paul-ii/en/homilies/1979/documents/hf_jp-ii_hom_19790930_irlanda-knock.html', why: 'Testemunho papal sobre a peregrinação e o santuário.', sourceType: 'Santa Sé' },
  ],
  fatima: [
    { label: 'Narrativa das aparições', url: 'https://www.fatima.pt/en/pages/narrative-of-the-apparitions-', why: 'Cronologia oficial dos relatos de 1917.', sourceType: 'Santuário' },
    { label: 'Cronologia dos videntes', url: 'https://www.fatima.pt/en/pages/chronology-of-the-three-seers', why: 'Percurso biográfico de Lúcia, Francisco e Jacinta.', sourceType: 'Santuário' },
    { label: 'Documento sobre o segredo', url: 'https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_20000626_message-fatima_en.html', why: 'Documento da Santa Sé sobre a terceira parte do segredo.', sourceType: 'Santa Sé' },
  ],
  aparecida: [
    { label: 'História de Nossa Senhora Aparecida', url: 'https://www.a12.com/santuario/historia-de-nossa-senhora-aparecida-1717', why: 'Relato da descoberta da imagem em 1717.', sourceType: 'Santuário' },
    { label: 'A Aparecida que não apareceu', url: 'https://www.a12.com/academia/artigos/a-aparecida-que-nao-apareceu-foi-achada-e-acolhida', why: 'Explicita a distinção entre imagem encontrada e aparição.', sourceType: 'Estudo histórico' },
    { label: 'Mensagem ao povo brasileiro', url: 'https://www.vatican.va/content/francesco/pt/messages/pont-messages/2017/documents/papa-francesco_20171012_videomessaggio-popolo-brasiliano.html', why: 'Contextualiza a devoção e o santuário na recepção papal.', sourceType: 'Santa Sé' },
  ],
  kibeho: [
    { label: 'Declaração de 2001', url: 'https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2001/06/29/0382/01118.html', why: 'Publica a declaração definitiva do bispo de Gikongoro.', sourceType: 'Documento diocesano/Santa Sé' },
    { label: 'História breve', url: 'https://www.kibeho-cana.org/a-brief-history-of-the-apparitions-of-our-lady-of-kibeho/', why: 'Cronologia narrativa das experiências e do discernimento.', sourceType: 'Santuário' },
    { label: 'Santuário de Kibeho', url: 'https://www.diocesegikongoro.com/kibeho/sanctuaire-notre-dame-de-kibeho/', why: 'Apresenta o contexto pastoral do santuário.', sourceType: 'Diocese' },
  ],
  akita: [
    { label: 'Relato e documentação local', url: 'https://www.seitaihoshikai.com/us/', why: 'Fonte do instituto associado ao local e aos registros de Akita.', sourceType: 'Instituição local' },
    { label: 'Normas para fenômenos sobrenaturais', url: 'https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_ddf_doc_20240517_norme-fenomeni-soprannaturali_en.html', why: 'Ajuda a distinguir decisões diocesanas, culto e juízo da Santa Sé.', sourceType: 'Santa Sé' },
    { label: 'Esclarecimento sobre Akita', url: 'https://www.ucanews.com/story-archive/?post_name=/1988/09/14/bishop-ito-clarifies-cardinal-ratzingers-remarks-on-messages-of-mary&post_id=36975', why: 'Registra esclarecimentos históricos sobre a decisão do bispo Ito.', sourceType: 'Imprensa católica' },
  ],
};

export const APPARITIONS: Apparition[] = [
  {
    id: 'guadalupe',
    recommendedSources: RECOMMENDED_SOURCES['guadalupe'],
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
    seerStory: 'Segundo a tradição guadalupana, Juan Diego Cuauhtlatoatzin era um indígena associado pelas fontes ao contexto chichimeca de Cuauhtitlán/Texcoco, viúvo e convertido ao cristianismo. O relato o apresenta encontrando a Senhora no Tepeyac em dezembro de 1531 e levando seu pedido ao bispo Juan de Zumárraga. Depois, segundo a tradição, permaneceu ligado à ermida construída no local. Foi canonizado por João Paulo II em 2002; a canonização diz respeito à santidade de sua vida, não constitui por si só um decreto sobre cada detalhe histórico das aparições.',
    summary: 'O relato de encontros entre Maria e Juan Diego no Tepeyac inclui a apresentação de uma imagem numa tilma, venerada na tradição guadalupana.',
    fullStory: 'Segundo a tradição guadalupana, entre 9 e 12 de dezembro de 1531 Juan Diego encontrou no Tepeyac uma Senhora que lhe pediu que o bispo autorizasse a construção de uma igreja. O bispo pediu um sinal. Na última visita, Juan Diego reuniu rosas fora de estação numa tilma e as levou a Zumárraga; ao abrir o manto, a tradição relata que as flores caíram e apareceu a imagem venerada como Nossa Senhora de Guadalupe. A documentação histórica sobre o relato, a transmissão do culto e a imagem é estudada por fontes diferentes; não é necessário afirmar que a tilma esteja "intacta" ou converter a devoção em prova científica. O culto se consolidou no México e a tradição foi recordada por papas, enquanto a canonização de Juan Diego em 2002 pertence ao reconhecimento de sua santidade.',
    message: 'Maria se revela como Mãe de toda a humanidade. "Não estou eu aqui, que sou tua Mãe?"',
    liturgicalFeast: '12 de dezembro',
    image: '🌹',
    imageSrc: guadalupeImg,
    color: 'from-primary/20 to-primary/5 border-primary/30',
    ...APPARITION_EDITORIAL.guadalupe
  },
  {
    id: 'la-salette',
    recommendedSources: RECOMMENDED_SOURCES['la-salette'],
    kind: 'apparition' as const,
    ecclesialAssessment: {
      label: "Reconhecimento pelo Bispo de Grenoble (1851)",
      detail: "Em 19 de setembro de 1851, Dom Philibert de Bruillard publicou um mandamento após investigação e reconheceu a aparição, autorizando o culto no local.",
      authority: "Dom Philibert de Bruillard — Bispo de Grenoble",
      date: "19/09/1851",
      sourceLabel: "Consultar documentação da Diocese de Grenoble",
      sourceUrl: "https://www.lasalette.cef.fr/en/history/",
    },
    title: 'Nossa Senhora de La Salette',
    location: 'La Salette-Fallavaux, Alpes',
    country: 'França',
    year: 1846,
    date: '19 de setembro de 1846',
    seer: 'Mélanie Calvat e Maximin Giraud',
    seerStory: 'Maximin Giraud e Mélanie Calvat eram pastores de Corps. Em 19 de setembro de 1846, disseram ter visto uma Senhora sentada e chorando enquanto cuidavam do rebanho. Foram interrogados por autoridades civis e religiosas; suas trajetórias posteriores foram distintas e a própria transmissão das mensagens passou por versões e debates. A ficha conserva o núcleo do testemunho sem tratar cada formulação posterior como transcrição automática da cena original.',
    summary: 'A Virgem apareceu chorando a dois pastorzinhos, lamentando a profanação do domingo e o abandono da oração.',
    fullStory: 'Em 19 de setembro de 1846, na montanha de La Salette, os pastores Maximin e Mélanie relataram um encontro com uma Senhora que chorava. Segundo o relato, ela falou de fome, dificuldades e do afastamento da oração, insistindo na conversão, no respeito ao domingo e na vida cristã. A notícia se espalhou, houve investigação e o bispo de Grenoble autorizou o culto em 1851. A aprovação diocesana deve ser distinguida de uma definição da Santa Sé sobre a sobrenaturalidade de todos os elementos narrados.',
    message: 'Maria chora pela indiferença de seus filhos. Pede a santificação do domingo, a oração e a conversão.',
    liturgicalFeast: '19 de setembro',
    image: '😢',
    imageSrc: laSaletteImg,
    color: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
    ...APPARITION_EDITORIAL['la-salette']
  },
  {
    id: 'lourdes',
    recommendedSources: RECOMMENDED_SOURCES['lourdes'],
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
    seerStory: 'Bernadette Soubirous era uma jovem de família pobre de Lourdes. Entre fevereiro e julho de 1858, relatou dezoito encontros na gruta de Massabielle. Depois das investigações e da intensa afluência de peregrinos, entrou para a vida religiosa em Nevers, onde viveu até 1879. Sua canonização em 1933 reconhece sua santidade, não substitui o exame histórico dos relatos.',
    summary: 'A Imaculada Conceição apareceu 18 vezes a Bernadette, revelando uma fonte de água que se tornou centro de peregrinação.',
    fullStory: 'Entre 11 de fevereiro e 16 de julho de 1858, Bernadette relatou dezoito encontros na gruta de Massabielle. Segundo seu testemunho, a Senhora pediu oração e penitência; em 25 de fevereiro, Bernadette cavou o chão e bebeu de uma fonte que começou a brotar. Em 25 de março, a figura teria dito: "Eu sou a Imaculada Conceição". A autoridade diocesana reconheceu as aparições em 1862, e Lourdes se tornou lugar de peregrinação e cuidado dos enfermos. As curas são examinadas por procedimentos médicos e eclesiais próprios; a existência de relatos de cura não significa que toda recuperação seja automaticamente um milagre.',
    message: 'Maria convida à penitência, à oração e à conversão.',
    liturgicalFeast: '11 de fevereiro',
    image: '💧',
    imageSrc: lourdesImg,
    color: 'from-primary/20 to-primary/5 border-primary/30',
    ...APPARITION_EDITORIAL.lourdes
  },
  {
    id: 'knock',
    recommendedSources: RECOMMENDED_SOURCES['knock'],
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
    seerStory: 'O testemunho coletivo reúne quinze pessoas de idades diferentes, entre elas crianças, que disseram ter visto a cena junto à igreja paroquial durante a noite chuvosa de 21 de agosto de 1879. As declarações foram recolhidas em momentos distintos e submetidas a comissões de inquérito. A ficha apresenta o que as testemunhas afirmaram, sem apagar as questões próprias da avaliação histórica de memórias e depoimentos.',
    summary: 'Aparição silenciosa de Nossa Senhora, São José e São João Evangelista na parede de uma igreja.',
    fullStory: 'Na noite de 21 de agosto de 1879, em Knock, quinze pessoas relataram uma cena silenciosa na parede da igreja: Maria, São José, São João Evangelista e um altar com o Cordeiro. A visão teria durado cerca de duas horas, sem mensagem verbal atribuída. O primeiro inquérito ocorreu em 1879–1880 e outro em 1935–1936; o santuário conserva os registros e a devoção cresceu ao longo do tempo. Em 1979, João Paulo II elevou a igreja à dignidade de basílica; em 2021, Knock recebeu o status de Santuário Internacional Eucarístico e Mariano. Essas honras confirmam a importância pastoral do lugar, mas não equivalem, por si só, a um novo decreto universal sobre a sobrenaturalidade do acontecimento.',
    message: 'Silêncio contemplativo, foco na Eucaristia.',
    liturgicalFeast: '21 de agosto',
    image: '🙏',
    imageSrc: knockImg,
    color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    ...APPARITION_EDITORIAL.knock
  },
  {
    id: 'fatima',
    recommendedSources: RECOMMENDED_SOURCES['fatima'],
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
    seerStory: 'Lúcia dos Santos e seus primos Francisco e Jacinta Marto eram crianças de Aljustrel. Segundo os relatos, rezavam e cuidavam dos rebanhos quando começaram as experiências de 1917. Francisco e Jacinta morreram ainda crianças; Lúcia tornou-se religiosa e registrou suas memórias, que são uma fonte importante, mas também uma etapa posterior à experiência narrada.',
    summary: 'A Senhora mais brilhante que o sol apareceu seis vezes, pedindo o Rosário pela paz mundial.',
    fullStory: 'De 13 de maio a 13 de outubro de 1917, os três pastorinhos relataram seis encontros na Cova da Iria, com exceção de agosto, quando foram impedidos de ir no dia 13 e disseram ter recebido o encontro mais tarde. A mensagem, tal como transmitida nas memórias de Lúcia, fala de oração, conversão, penitência e paz, e identifica a Senhora como a Senhora do Rosário. Em 13 de outubro, uma multidão relatou um fenômeno solar, chamado tradicionalmente de "Milagre do Sol"; o acontecimento pertence à memória religiosa e jornalística do evento, não é prova científica automática da origem sobrenatural das aparições. Em 1930 o bispo declarou as visões dignas de crédito no âmbito diocesano; a Santa Sé publicou em 2000 a terceira parte do segredo e, em 2017, canonizou Francisco e Jacinta.',
    message: 'Oração, penitência, conversão, devoção ao Imaculado Coração de Maria e oração do Rosário pela paz, sempre à luz do Evangelho.',
    liturgicalFeast: '13 de maio',
    image: '🕊️',
    imageSrc: fatimaImg,
    color: 'from-red-500/20 to-red-600/5 border-red-500/30',
    ...APPARITION_EDITORIAL.fatima
  },
  {
    id: 'aparecida',
    recommendedSources: RECOMMENDED_SOURCES['aparecida'],
    kind: 'image-devotion' as const,
    ecclesialAssessment: {
      label: "Devoção mariana ligada à descoberta de uma imagem",
      detail: "A publicação do Estado da Cidade do Vaticano explica que o Santuário de Aparecida tem origem na descoberta de uma imagem em 1717, e não em um relato de aparição ou visão. Por isso, Aparecida é apresentada aqui como devoção mariana, não como aparição.",
      authority: "Governatorato do Estado da Cidade do Vaticano",
      date: "2025",
      sourceLabel: "Consultar publicação do Estado da Cidade do Vaticano",
      sourceUrl: "https://www.vatican.va/content/francesco/pt/messages/pont-messages/2017/documents/papa-francesco_20171012_videomessaggio-popolo-brasiliano.html",
    },
    title: 'Nossa Senhora Aparecida',
    location: 'Rio Paraíba do Sul, São Paulo',
    country: 'Brasil',
    year: 1717,
    date: 'Outubro de 1717',
    seer: 'Três pescadores: João Alves, Filipe Pedroso e Domingos Garcia',
    seerStory: 'Segundo a tradição registrada pelo Santuário, João Alves, Filipe Pedroso e Domingos Garcia eram pescadores que trabalhavam no Rio Paraíba do Sul. A descoberta da imagem é narrada como um acontecimento de devoção popular; a tradição também associa a pesca abundante que se seguiu ao achado. Não há aqui um vidente de aparição, mas testemunhas de uma imagem encontrada.',
    summary: 'A imagem da Padroeira do Brasil foi encontrada nas águas do rio Paraíba do Sul.',
    fullStory: 'Em outubro de 1717, durante uma pescaria no Rio Paraíba do Sul, João Alves teria recolhido o corpo de uma pequena imagem e, em seguida, sua cabeça. Depois de lançarem novamente as redes, os pescadores conseguiram uma quantidade excepcional de peixes, segundo a tradição preservada pelo santuário. A imagem foi levada para a casa de Filipe Pedroso e passou a receber oração; a capela, o fluxo de peregrinos e o santuário cresceram nos séculos seguintes. Aparecida é, portanto, uma devoção à imagem encontrada e acolhida, não um relato de aparição visual de Maria.',
    message: 'A devoção à imagem encontrada remete à presença de Deus no meio da necessidade e conduz os fiéis a Cristo, à esperança e à solidariedade.',
    liturgicalFeast: '12 de outubro',
    image: '🎣',
    imageSrc: aparecidaImg,
    color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    ...APPARITION_EDITORIAL.aparecida
  },
  {
    id: 'kibeho',
    recommendedSources: RECOMMENDED_SOURCES['kibeho'],
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
    seerStory: 'Alphonsine Mumureke, Nathalie Mukamazimpaka e Marie Claire Mukangango eram estudantes quando relataram experiências com a figura chamada Mãe do Verbo, a partir de 1981. O julgamento diocesano considerou essas três videntes, e não todos os relatos posteriores atribuídos a Kibeho. A história deve ser lida também no contexto social e político de Ruanda, sem transformar retrospectivamente a mensagem em uma profecia simples e comprovada do genocídio de 1994.',
    summary: 'O relato da "Mãe do Verbo" em Ruanda pede oração, penitência e reconciliação; sua recepção posterior é lida no contexto do genocídio.',
    fullStory: 'A partir de 28 de novembro de 1981, Alphonsine Mumureke relatou experiências com Maria; Nathalie Mukamazimpaka começou em janeiro de 1982 e Marie Claire Mukangango em março do mesmo ano. Comissões médica e teológica estudaram o caso, e em 1988 foi autorizado o culto público sem decisão definitiva sobre a autenticidade. O julgamento de 2001 reconheceu apenas as aparições públicas atribuídas às três videntes iniciais, distinguindo-as de numerosos relatos posteriores. A mensagem enfatizava conversão, oração, penitência, o Rosário das Sete Dores e reconciliação. É mais preciso dizer que ela foi posteriormente associada por muitos à memória do genocídio de 1994 do que afirmar que houve uma profecia comprovada do genocídio.',
    message: 'A "Mãe do Verbo" convida à conversão profunda, à oração pelo mundo e ao Rosário das Sete Dores.',
    liturgicalFeast: '28 de novembro',
    image: '✨',
    imageSrc: kibehoImg,
    color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    ...APPARITION_EDITORIAL.kibeho
  },
  {
    id: 'akita',
    recommendedSources: RECOMMENDED_SOURCES['akita'],
    kind: 'associated-phenomenon' as const,
    ecclesialAssessment: {
      label: "Carta pastoral do Bispo de Niigata (1984)",
      detail: "Em 22 de abril de 1984, Dom John Shojiro Ito reconheceu o caráter sobrenatural dos acontecimentos relativos à estátua e autorizou a veneração na diocese, expressamente enquanto aguardava um julgamento definitivo da Santa Sé. O registro é apresentado como decisão diocesana histórica, não como definição da Santa Sé.",
      authority: "Dom John Shojiro Ito — Bispo de Niigata",
      date: "22/04/1984",
      sourceLabel: "Consultar transcrição da carta pastoral",
      sourceUrl: "https://www.seitaihoshikai.com/us/",
    },
    title: 'Nossa Senhora de Akita',
    location: 'Yuzawadai, Akita',
    country: 'Japão',
    year: 1973,
    date: '6 de julho de 1973 a 15 de setembro de 1981',
    seer: 'Irmã Agnes Katsuko Sasagawa',
    seerStory: 'Agnes Katsuko Sasagawa, religiosa japonesa que enfrentava surdez, relatou uma ferida em sua mão, uma voz associada a uma imagem mariana e mensagens recebidas entre 1973 e 1981. A imagem foi observada em episódios de lacrimação, registrados e investigados localmente. O testemunho diz respeito a fenômenos associados a uma imagem e a mensagens, não a uma aparição visual formal de Maria.',
    summary: 'Relatos ligados a uma imagem mariana, a uma voz/mensagens atribuídas e a lacrimações no Japão pedem oração e conversão.',
    fullStory: 'Em Akita, a partir de 1973, acontecimentos foram associados a uma imagem da Virgem Maria: uma ferida observada na mão de Irmã Agnes, uma voz que ela relacionou à imagem e mensagens sobre oração, penitência e reparação. A imagem teria lacrimejado em 101 ocasiões entre 1975 e 1981, segundo os registros locais. Em 1984, o bispo de Niigata autorizou a veneração diocesana e afirmou sua avaliação sobre os acontecimentos enquanto se aguardava um juízo definitivo da Santa Sé. As Normas do Dicastério para a Doutrina da Fé de 2024 ajudam a distinguir uma decisão diocesana, a autorização de culto e um reconhecimento universal; Akita não deve ser descrita como aparição visual formal nem resumida por uma frase absoluta sobre o Rosário.',
    message: 'As mensagens relatadas convidam à oração, à penitência, à reparação e à conversão, sem atribuir ao caso slogans não documentados como citação literal.',
    liturgicalFeast: '15 de setembro',
    image: '😭',
    imageSrc: akitaImg,
    color: 'from-secondary/20 to-secondary/5 border-secondary/30',
    ...APPARITION_EDITORIAL.akita
  },
].sort((a, b) => a.year - b.year);
