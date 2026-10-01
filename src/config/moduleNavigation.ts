/**
 * Navegação modular canônica da Cátedra.
 *
 * Regra: os 5 ambientes são a arquitetura pública. Recursos específicos
 * ficam dentro de um ambiente; ferramentas transversais não viram novos
 * itens de menu de primeiro nível.
 */

export type ModuleEnvironment =
  | 'estudar'
  | 'rezar'
  | 'formar-se'
  | 'pesquisar'
  | 'minha-jornada';

export interface ModuleNavItem {
  id: string;
  label: string;
  path: string;
  description: string;
}

export interface ModuleNavGroup {
  key: ModuleEnvironment;
  label: string;
  description: string;
  items: ModuleNavItem[];
}

export const MODULE_NAVIGATION: ModuleNavGroup[] = [
  {
    key: 'estudar',
    label: 'Estudar',
    description: 'Fontes, tradição e conhecimento da fé.',
    items: [
      { id: 'bible', label: 'Bíblia', path: '/bible', description: 'Leitura e estudo da Sagrada Escritura.' },
      { id: 'catechism', label: 'Catecismo', path: '/catechism', description: 'Doutrina organizada por parágrafos e temas.' },
      { id: 'documents', label: 'Documentos', path: '/magisterium', description: 'Documentos do Magistério e fontes oficiais da Igreja.' },
      { id: 'nexus', label: 'Nexus', path: '/nexus', description: 'Conecta Bíblia, Catecismo, documentos, santos e temas.' },
      { id: 'library', label: 'Biblioteca', path: '/acervo', description: 'Acervo, obras e coleções para aprofundamento.' },
      { id: 'saints', label: 'Santos', path: '/santos', description: 'Vidas, escritos e testemunhos de santidade.' },
      { id: 'church', label: 'Igreja Viva', path: '/community', description: 'Vida da Igreja, calendário e contexto atual.' },
    ],
  },
  {
    key: 'rezar',
    label: 'Rezar',
    description: 'Oração, liturgia e vida espiritual.',
    items: [
      { id: 'prayers', label: 'Orações', path: '/oracao', description: 'Livro de orações completas, por categoria e tradição.' },
      { id: 'liturgy', label: 'Liturgia', path: '/liturgia', description: 'Liturgia diária, Evangelho e calendário da Igreja.' },
      { id: 'breviary', label: 'Liturgia das Horas', path: '/breviary', description: 'Laudes, Hora Média, Vésperas e Completas.' },
      { id: 'lectio', label: 'Lectio Divina', path: '/lectio', description: 'Leitura orante das Escrituras.' },
      { id: 'rosary', label: 'Rosário', path: '/oracao/rosario', description: 'Mistérios, meditações e oração completa do Rosário.' },
      { id: 'viacrucis', label: 'Via Sacra', path: '/viacrucis', description: 'Meditação das estações da Cruz.' },
      { id: 'litanies', label: 'Ladainhas', path: '/litanies', description: 'Ladainhas e orações de invocação.' },
      { id: 'novenas', label: 'Novenas', path: '/novenas', description: 'Novenas completas e ciclos de oração.' },
      { id: 'missal', label: 'Missal', path: '/missal', description: 'Ordinário e próprio da Missa.' },
      { id: 'examination', label: 'Exame de consciência', path: '/oracao/exame-de-consciencia', description: 'Exame de consciência e preparação para a Confissão.' },
    ],
  },
  {
    key: 'formar-se',
    label: 'Formar-se',
    description: 'Jornadas e percursos estruturados de formação.',
    items: [
      { id: 'journeys', label: 'Jornadas', path: '/jornadas', description: 'Percursos guiados com progresso.' },
      { id: 'themes', label: 'Temas', path: '/temas', description: 'Estudos compostos por tema.' },
    ],
  },
  {
    key: 'pesquisar',
    label: 'Pesquisar',
    description: 'Descoberta universal e ferramentas de referência.',
    items: [
      { id: 'search', label: 'Buscar', path: '/buscar', description: 'Pesquisa transversal em toda a plataforma.' },
      { id: 'glossary', label: 'Glossário', path: '/glossario', description: 'Termos e conceitos da fé.' },
      { id: 'atlas', label: 'Atlas', path: '/atlas', description: 'Exploração geográfica e histórica.' },
      { id: 'aquinas', label: 'Aquino', path: '/aquinas', description: 'Obras e pensamento de Tomás de Aquino.' },
      { id: 'dogmas', label: 'Dogmas', path: '/dogmas', description: 'Referência de definições dogmáticas.' },
      { id: 'popes', label: 'Papas', path: '/papas', description: 'Sucessão e biografias pontifícias.' },
      { id: 'apparitions', label: 'Aparições', path: '/aparicoes', description: 'Referência de aparições marianas.' },
    ],
  },
  {
    key: 'minha-jornada',
    label: 'Minha Jornada',
    description: 'Continuidade, memória e configuração pessoal.',
    items: [
      { id: 'today', label: 'Hoje', path: '/hoje', description: 'Seu ponto de continuidade diário.' },
      { id: 'journal', label: 'Diário', path: '/diario', description: 'Anotações e memória espiritual.' },
      { id: 'favorites', label: 'Favoritos', path: '/favorites', description: 'Conteúdos guardados para voltar.' },
      { id: 'achievements', label: 'Conquistas', path: '/achievements', description: 'Marcos e progresso.' },
      { id: 'profile', label: 'Perfil', path: '/profile', description: 'Identidade e preferências.' },
      { id: 'settings', label: 'Configurações', path: '/settings', description: 'Preferências da conta e experiência.' },
    ],
  },
];

export const TRANSVERSAL_MODULES = [
  { id: 'logos', label: 'Logos IA', path: '/logos', description: 'Assistente transversal baseado nas fontes recuperadas pelo Nexus.' },
  { id: 'community', label: 'Comunidade', path: '/community', description: 'Partilha e interação entre usuários.' },
];

export const getModuleGroup = (key: ModuleEnvironment) =>
  MODULE_NAVIGATION.find((group) => group.key === key);

export const getModuleByPath = (path: string) =>
  MODULE_NAVIGATION.flatMap((group) => group.items).find(
    (item) => path === item.path || (item.path !== '/' && path.startsWith(item.path + '/')),
  );
