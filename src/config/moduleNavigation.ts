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
  /** Chave de tradução global para o rótulo do item. */
  labelKey: string;
  path: string;
  description: string;
}

export interface ModuleNavGroup {
  key: ModuleEnvironment;
  label: string;
  /** Chave de tradução global para o rótulo da navegação. */
  labelKey: string;
  description: string;
  accent: string;
  accentSoft: string;
  items: ModuleNavItem[];
}

export const MODULE_NAVIGATION: ModuleNavGroup[] = [
  {
    key: 'estudar',
    accent: '#2f6f8f',
    accentSoft: 'rgba(47,111,143,0.14)',
    label: 'Estudar',
    labelKey: 'nav.estudar',
    description: 'Fontes, textos e caminhos para aprofundar.',
    items: [
      { id: 'bible', label: 'Bíblia', labelKey: 'nav.biblia', path: '/bible', description: 'A Palavra que ilumina o caminho.' },
      { id: 'catechism', label: 'Catecismo', labelKey: 'nav.catecismo', path: '/catechism', description: 'A fé compreendida e transmitida.' },
      { id: 'documents', label: 'Documentos', labelKey: 'nav.documentos', path: '/magisterium', description: 'A voz da Igreja através do tempo.' },
    ],
  },
  {
    key: 'rezar',
    accent: '#8b5e83',
    accentSoft: 'rgba(139,94,131,0.14)',
    label: 'Rezar',
    labelKey: 'nav.rezar',
    description: 'Oração, liturgia e vida espiritual.',
    items: [
      { id: 'prayers', label: 'Orações', labelKey: 'nav.oracoes', path: '/oracao', description: 'Livro de orações completas, por categoria e tradição.' },
      { id: 'liturgy', label: 'Liturgia', labelKey: 'nav.liturgia', path: '/liturgia', description: 'Liturgia diária, Evangelho e calendário da Igreja.' },
      { id: 'breviary', label: 'Liturgia das Horas', labelKey: 'nav.liturgia_horas', path: '/breviary', description: 'Laudes, Hora Média, Vésperas e Completas.' },
      { id: 'lectio', label: 'Lectio Divina', labelKey: 'nav.lectio', path: '/lectio', description: 'Leitura orante das Escrituras.' },
      { id: 'rosary', label: 'Rosário', labelKey: 'nav.rosario', path: '/oracao/rosario', description: 'Mistérios, meditações e oração completa do Rosário.' },
      { id: 'viacrucis', label: 'Via Sacra', labelKey: 'nav.via_sacra', path: '/viacrucis', description: 'Meditação das estações da Cruz.' },
      { id: 'litanies', label: 'Ladainhas', labelKey: 'nav.ladainhas', path: '/litanies', description: 'Ladainhas e orações de invocação.' },
      { id: 'novenas', label: 'Novenas', labelKey: 'nav.novenas', path: '/novenas', description: 'Novenas completas e ciclos de oração.' },
      { id: 'missal', label: 'Missal', labelKey: 'nav.missal', path: '/missal', description: 'Ordinário e próprio da Missa.' },
      { id: 'examination', label: 'Exame de consciência', labelKey: 'nav.exame', path: '/oracao/exame-de-consciencia', description: 'Exame de consciência e preparação para a Confissão.' },
    ],
  },
  {
    key: 'formar-se',
    accent: '#b07a35',
    accentSoft: 'rgba(176,122,53,0.14)',
    label: 'Formar-se',
    labelKey: 'nav.formar_se',
    description: 'Jornadas e percursos estruturados de formação.',
    items: [
      { id: 'journeys', label: 'Jornadas', labelKey: 'nav.jornadas', path: '/jornadas', description: 'Percursos guiados com progresso.' },
      { id: 'themes', label: 'Temas', labelKey: 'nav.temas', path: '/temas', description: 'Estudos compostos por tema.' },
    ],
  },
  {
    key: 'pesquisar',
    accent: '#4f7d69',
    accentSoft: 'rgba(79,125,105,0.14)',
    label: 'Pesquisar',
    labelKey: 'nav.pesquisar',
    description: 'Descoberta universal e ferramentas de referência.',
    items: [
      { id: 'search', label: 'Buscar', labelKey: 'nav.buscar', path: '/buscar', description: 'Pesquisa transversal em toda a plataforma.' },
      { id: 'nexus', label: 'Nexus', labelKey: 'nav.nexus', path: '/nexus', description: 'Relações entre fontes, temas e conteúdos.' },
      { id: 'library', label: 'Biblioteca', labelKey: 'nav.biblioteca', path: '/acervo', description: 'Um acervo para descobrir, ler e retornar.' },
      { id: 'saints', label: 'Santos', labelKey: 'nav.santos', path: '/santos', description: 'Vidas que testemunharam a fé.' },
      { id: 'glossary', label: 'Glossário', labelKey: 'nav.glossario', path: '/glossario', description: 'Termos e conceitos da fé.' },
      { id: 'atlas', label: 'Atlas', labelKey: 'nav.atlas', path: '/atlas', description: 'Exploração geográfica e histórica.' },
      { id: 'aquinas', label: 'Aquino', labelKey: 'nav.aquino', path: '/aquinas', description: 'Obras e pensamento de Tomás de Aquino.' },
      { id: 'dogmas', label: 'Dogmas', labelKey: 'nav.dogmas', path: '/dogmas', description: 'Referência de definições dogmáticas.' },
      { id: 'popes', label: 'Papas', labelKey: 'nav.papas', path: '/papas', description: 'Sucessão e biografias pontifícias.' },
      { id: 'apparitions', label: 'Aparições', labelKey: 'nav.aparicoes', path: '/aparicoes', description: 'Referência de aparições marianas.' },
    ],
  },
  {
    key: 'minha-jornada',
    accent: '#7a6aa6',
    accentSoft: 'rgba(122,106,166,0.14)',
    label: 'Minha Jornada',
    labelKey: 'nav.minha_jornada',
    description: 'Continuidade, memória e configuração pessoal.',
    items: [
      { id: 'today', label: 'Hoje', labelKey: 'nav.hoje', path: '/hoje', description: 'Seu ponto de continuidade diário.' },
      { id: 'journal', label: 'Diário', labelKey: 'nav.diario', path: '/diario', description: 'Anotações e memória espiritual.' },
      { id: 'favorites', label: 'Favoritos', labelKey: 'nav.favoritos', path: '/favorites', description: 'Conteúdos guardados para voltar.' },
      { id: 'achievements', label: 'Conquistas', labelKey: 'nav.conquistas', path: '/achievements', description: 'Marcos e progresso.' },
      { id: 'profile', label: 'Perfil', labelKey: 'nav.perfil', path: '/profile', description: 'Identidade e preferências.' },
      { id: 'settings', label: 'Configurações', labelKey: 'nav.configuracoes', path: '/settings', description: 'Preferências da conta e experiência.' },
    ],
  },
];


export const getModuleGroup = (key: ModuleEnvironment) =>
  MODULE_NAVIGATION.find((group) => group.key === key);

export const getModuleByPath = (path: string) =>
  MODULE_NAVIGATION.flatMap((group) => group.items).find(
    (item) => path === item.path || (item.path !== '/' && path.startsWith(item.path + '/')),
  );
