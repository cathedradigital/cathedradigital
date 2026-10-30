/**
 * Mapa canônico de metadata por rota.
 * Titles ≤60 chars, descriptions ≤160 chars, com foco em CTR.
 * Usado por <RouteSeo/> em App.tsx.
 */

export interface RouteMeta {
  title: string;
  description: string;
  /** Se true, marca noindex (rotas admin/dev/legacy/auth). */
  noindex?: boolean;
  /** Canonical alternativo (ex.: para rotas duplicadas apontarem à versão preferida). */
  canonicalPath?: string;
}

/**
 * Rotas estáticas (match exato). Rotas dinâmicas com :slug têm defaults
 * aqui e podem ser sobrescritas pela própria página via <Helmet>.
 */
export const ROUTE_META: Record<string, RouteMeta> = {
  // ─── Documentação ─────────────────────────────────────────────
  '/docs': {
    title: 'Documentação Cátedra — Guias de Uso',
    description:
      'Guias práticos para usar a Cátedra: leitura bíblica, oração, liturgia e estudo. Disponíveis em português, inglês, espanhol, italiano, latim, francês e alemão.',
  },
  '/docs/:slug': {
    title: 'Guia — Documentação Cátedra',
    description: 'Guia da documentação Cátedra com passo a passo para aproveitar o acervo e as ferramentas de estudo.',
  },
  '/audit-logs': {
    title: 'Trilha de Auditoria — Cátedra',
    description: 'Painel interno de auditoria.',
    noindex: true,
  },
  '/site-health': {
    title: 'Saúde do Site — Cátedra',
    description: 'Painel interno de saúde da plataforma.',
    noindex: true,
  },
  '/admin/audit-logs': {
    title: 'Trilha de Auditoria — Admin',
    description: 'Painel administrativo de auditoria.',
    noindex: true,
  },
  '/knowledge-audit': {
    title: 'Auditoria de Conhecimento — Admin',
    description: 'Painel administrativo de auditoria de densidade e conectividade teológica.',
    noindex: true,
  },
  '/production-ready': {
    title: 'Certificação de Produção — Admin',
    description: 'Painel de verificação dos checkpoints para lançamento final.',
    noindex: true,
  },

  // ─── Home / Átrio ─────────────────────────────────────────────
  '/': {
    title: 'Cátedra Digital — Mosteiro Digital',
    description:
      'Bem-vindo ao Mosteiro Digital. Bíblia Sagrada, Catecismo, liturgia diária, santos, orações e IA teológica em uma experiência contemplativa.',
  },

  // ─── Escritura & Doutrina (Biblioteca) ────────────────────────
  '/bible': {
    title: 'Bíblia Sagrada Católica Online — Leitura e Estudo',
    description:
      'Leia a Bíblia católica com referências cruzadas, comentários patrísticos e busca instantânea por versículo, capítulo e tema.',
  },
  '/catechism': {
    title: 'Catecismo da Igreja Católica — Leitura Integral',
    description:
      'Explore o Catecismo da Igreja Católica com navegação por parágrafos, referências e conexões teológicas em tempo real.',
  },
  '/magisterium': {
    title: 'Magistério da Igreja — Encíclicas e Documentos',
    description:
      'Acervo do Magistério: encíclicas, exortações apostólicas e documentos conciliares com busca e leitura editorial.',
  },
  '/glossario': {
    title: 'Léxico Teológico Católico — Glossário Cátedra',
    description:
      'Verbetes fundamentais da fé católica: definição, história, Escritura, Magistério e conexões teológicas cruzadas.',
  },
  '/temas': {
    title: 'Temas da Fé Católica — Percursos por Assunto',
    description:
      'Percorra a fé por temas: Trindade, Cristo, Igreja, sacramentos, moral e mais — cada tema conectado à Escritura e ao Magistério.',
  },
  '/aquinas': {
    title: 'Suma Teológica de Santo Tomás — Leitura Guiada',
    description:
      'Leitura estruturada da Suma Teológica de São Tomás de Aquino com navegação por partes, questões e artigos.',
  },
  '/biblioteca': {
    title: 'Biblioteca Inteligente — O Google Católico',
    description:
      'Busque por perguntas, assuntos, santos ou documentos. O cérebro teológico da Cátedra conectando toda a Tradição em um só lugar.',
  },
  '/biblioteca/inteligente': {
    title: 'Biblioteca Inteligente — Pesquisa Teológica Avançada',
    description:
      'Utilize o motor de busca avançado da Cátedra para encontrar conexões profundas entre a Bíblia, o Catecismo e a Patrística.',
  },
  '/dogmas': {
    title: 'Dogmas Católicos — Verdades Definidas da Fé',
    description:
      'Lista completa dos dogmas católicos com definição, contexto histórico e fontes magisteriais.',
  },

  '/atrium': {
    title: 'Átrio — Cátedra Digital',
    description:
      'Portal interno da Cátedra: acesse Bíblia, Catecismo, Liturgia, Orações e Logos AI em um único ambiente contemplativo.',
  },
  '/acervo': {
    title: 'Acervo Cátedra — Mosteiro do Conhecimento',
    description: 'Biblioteca Católica unificada: Bíblia, Catecismo, Patrística, Magistério e Aparições Marianas em um hub inteligente.',
  },

  // ─── Vida de Oração (Igreja) ──────────────────────────────────
  '/oracao': {
    title: 'Livro de Orações Católicas — Cátedra',
    description:
      'Orações tradicionais da Igreja: Pai Nosso, Ave Maria, Credo, Salve Rainha, Angelus, Te Deum e muito mais, comentadas.',
  },
  '/oracao/rosario': {
    title: 'Rosário Contemplativo Online — 20 Mistérios',
    description:
      'Reze o Santo Rosário com modo contemplativo, meditações editoriais, arte sacra e ritmo ajustável de silêncio.',
  },
  '/viacrucis': {
    title: 'Via Sacra Online — 14 Estações Meditadas',
    description:
      'Rezar a Via Sacra em 14 estações com contemplação editorial, oração vocal e passagens da Paixão.',
  },
  '/litanies': {
    title: 'Ladainhas Católicas — Reze com a Igreja',
    description:
      'Ladainha de Todos os Santos, do Sagrado Coração, de Nossa Senhora e mais, com versos completos e comentários.',
  },
  '/novenas': {
    title: 'Novenas Católicas — 9 Dias de Oração',
    description:
      'Novenas tradicionais e devocionais completas: santos, Nossa Senhora, Sagrado Coração, com progresso e lembretes.',
  },
  '/lectio': {
    title: 'Lectio Divina — Leitura Orante da Palavra',
    description:
      'Lectio Divina passo a passo (leitura, meditação, oração, contemplação) sobre a Palavra de Deus.',
  },
  '/contemplatio': {
    title: 'Contemplação — Silêncio Orante Guiado',
    description:
      'Espaço de silêncio contemplativo com ritmo suave, temas escolhidos e presença orante diante do Senhor.',
  },

  // ─── Liturgia ─────────────────────────────────────────────────
  '/liturgia': {
    title: 'Igreja — Liturgia, Missa e Ofício Divino',
    description:
      'A vida litúrgica da Igreja: Missal, Liturgia das Horas e calendário. Reze o próprio do dia em união com toda a Igreja.',
  },
  '/igreja': {
    title: 'Igreja — Vida Litúrgica e Espiritual',
    description:
      'Entrada legada da área Igreja. O destino canônico atual é a Comunidade.',
    canonicalPath: '/community',
    noindex: true,
  },
  '/liturgia/dia': {
    title: 'Dia Litúrgico — Missa, Horas e Santo do Dia',
    description:
      'Peregrinação litúrgica completa: leituras, próprio da missa, liturgia das horas e santo do dia em um só lugar.',
  },
  // Rotas dinâmicas de /liturgia/dia/:d são resolvidas via DYNAMIC_PATTERNS abaixo.
  '/calendar': {
    title: 'Calendário Litúrgico Católico — Cátedra',
    description:
      'Calendário litúrgico anual com tempos, festas, memórias, cores e santos do dia segundo o rito romano.',
  },
  '/missal': {
    title: 'Missal Romano Online — Missa do Dia',
    description:
      'Missa do dia com introito, coleta, leituras, ofertório, prefácio e comunhão. Textos completos para acompanhar.',
  },
  '/breviary': {
    title: 'Liturgia das Horas — Breviário Online',
    description:
      'Reze o Ofício Divino: Laudes, Terça, Sexta, Nona, Vésperas e Completas com salmos, hinos e leituras próprias.',
  },
  '/hoje': {
    title: 'Hoje na Cátedra — Sua Jornada Espiritual',
    description:
      'Painel diário com liturgia, oração, leitura, santo do dia e sua caminhada espiritual em um só lugar.',
  },

  // ─── Devocional & Santos ──────────────────────────────────────
  '/santos': {
    title: 'Vidas dos Santos Católicos — Enciclopédia Hagiográfica',
    description:
      'Vidas dos santos com biografia, virtudes, escritos, milagres e devoções para inspirar sua caminhada rumo à santidade.',
  },
  '/santos/:id': {
    title: 'Vida de Santo — Cátedra Digital',
    description: 'Conheça a história, milagres e o legado espiritual deste santo da Igreja Católica.',
  },
  '/papas': {
    title: 'Papas da Igreja Católica — Cronologia',
    description:
      'Cronologia dos Sucessores de Pedro: biografia, pontificado, encíclicas e legado de cada Papa.',
  },
  '/aparicoes': {
    title: 'Aparições Marianas Aprovadas — História',
    description:
      'Aparições de Nossa Senhora reconhecidas pela Igreja: mensagens, história e frutos espirituais.',
  },

  // ─── Comunidade & Jornadas ────────────────────────────────────
  '/buscar': {
    title: 'Buscar na Cátedra — Bíblia, Catecismo, Santos',
    description:
      'Busca unificada por versículos, parágrafos, verbetes, santos, orações e documentos do Magistério.',
  },
  '/itineraria': {
    title: 'Itinerários Espirituais — Jornadas Guiadas',
    description:
      'Jornadas de 7 a 14 dias com leitura, oração e contemplação para aprofundar a fé passo a passo.',
  },
  '/logos': {
    title: 'Logos — Assistente Teológico com IA',
    description:
      'Converse com Logos, o assistente de teologia católica: respostas grounded em Escritura, Padres e Magistério.',
  },

  // ─── Institucional / Utilidade ────────────────────────────────
  '/guia-modulos': {
    title: 'Guia dos Módulos — Como Usar a Cátedra',
    description:
      'Conheça cada módulo da Cátedra: Bíblia, Catecismo, Liturgia, Oração, Comunidade e Formação.',
  },

  // ─── Comunidade ───────────────────────────────────────────────
  '/community': {
    title: 'Comunidade Cátedra — Discussão Católica',
    description:
      'Comunidade de fiéis para discussão de fé, doutrina, oração e caminhada espiritual à luz da Tradição católica.',
  },
  '/about': {
    title: 'Sobre a Cátedra — Missão, Visão e Equipe',
    description:
      'Conheça a Cátedra Digital: missão de servir a fé católica com tradição e tecnologia, equipe e princípios que guiam a plataforma.',
  },
  '/partners': {
    title: 'Parceiros Cátedra — Comunidades e Apostolados',
    description:
      'Parceiros institucionais da Cátedra: dioceses, paróquias, comunidades e apostolados que caminham conosco.',
  },
  '/admin/seo': {
    title: 'Admin · SEO — Cátedra',
    description: 'Painel administrativo de SEO e metadados. Acesso restrito.',
    noindex: true,
  },

  // ─── Institucional / Legal ────────────────────────────────────
  '/transparencia': {
    title: 'Transparência — Cátedra Digital',
    description:
      'Relatório de transparência da Cátedra: uso de recursos, apostolado apoiado e destinação dos aportes dos assinantes PRO.',
  },
  '/terms': {
    title: 'Termos de Uso — Cátedra Digital',
    description:
      'Termos de uso da Cátedra Digital: direitos, deveres, propriedade intelectual e regras de utilização da plataforma.',
  },
  '/privacy': {
    title: 'Política de Privacidade — Cátedra Digital',
    description:
      'Política de privacidade da Cátedra: dados coletados, finalidade, base legal, cookies e direitos do titular (LGPD).',
  },
  '/legal': {
    title: 'Centro Legal — Cátedra Digital',
    description:
      'Documentos institucionais da Cátedra: privacidade, LGPD, termos de uso e transparência reunidos em um único lugar.',
  },
  '/legal/privacy': {
    title: 'Política de Privacidade — Cátedra Digital',
    description:
      'Política de privacidade da Cátedra: dados coletados, finalidade, base legal, cookies e direitos do titular (LGPD).',
    canonicalPath: '/privacy',
    noindex: true, // alias — canonical aponta para /privacy
  },

  '/legal/lgpd': {
    title: 'LGPD — Conformidade e Direitos do Titular · Cátedra',
    description:
      'Como a Cátedra Digital cumpre a Lei nº 13.709/2018: bases legais, direitos do titular, DPO, incidentes e transferência internacional.',
  },
  '/manifesto': {
    title: 'Manifesto da Cátedra — Escritura, Tradição e Oração',
    description:
      'A convicção que sustenta a Cátedra Digital: unir Escritura, Tradição, Liturgia, Oração e IA em uma só experiência de fé.',
  },
  '/contato': {
    title: 'Contato — Cátedra Digital',
    description:
      'Fale com a Cátedra: suporte, encarregado de dados (LGPD/DPO), parcerias institucionais e imprensa.',
  },

  // ─── Monetização / Planos ─────────────────────────────────────
  '/pricing': {
    title: 'Planos Cátedra PRO — Assinatura e Preços',
    description:
      'Compare os planos Cátedra PRO: recursos premium, IA teológica ampliada, orações contemplativas e apoio ao apostolado.',
  },
  '/upgrade': {
    title: 'Upgrade para Cátedra PRO — Torne-se Assinante',
    description:
      'Ative o Cátedra PRO e desbloqueie leitura sem limites, IA teológica ampliada, orações premium e apoio ao apostolado.',
    noindex: true,
  },


  // ─── Rotas privadas / não indexáveis ──────────────────────────
  '/auth': { title: 'Entrar — Cátedra', description: 'Acesse sua conta na Cátedra Digital.', noindex: true },
  '/reset-password': { title: 'Redefinir senha — Cátedra', description: 'Redefina sua senha.', noindex: true },
  '/onboarding': { title: 'Boas-vindas — Cátedra', description: 'Configure seu perfil espiritual.', noindex: true },
  '/profile': { title: 'Meu perfil — Cátedra', description: 'Sua caminhada e preferências.', noindex: true },
  '/profile/favorites': { title: 'Favoritos — Cátedra', description: 'Seus conteúdos favoritos.', noindex: true },
  '/spiritual-profile': { title: 'Perfil espiritual — Cátedra', description: 'Sua caminhada espiritual.', noindex: true },
  '/diario': { title: 'Diário espiritual — Cátedra', description: 'Registre sua vida interior.', noindex: true },
  '/favorites': { title: 'Favoritos — Cátedra', description: 'Seus conteúdos favoritos.', noindex: true },
  '/achievements': { title: 'Conquistas — Cátedra', description: 'Suas conquistas na caminhada.', noindex: true },
  '/checkout': { title: 'Checkout — Cátedra', description: 'Finalize sua assinatura.', noindex: true },
  '/checkout/result': { title: 'Checkout — Resultado', description: 'Resultado do pagamento.', noindex: true },
  '/transactions': { title: 'Minhas transações — Cátedra', description: 'Histórico de pagamentos.', noindex: true },

  // ─── Aliases (Navigate replace) — noindex + canonical ao destino
  '/home': { title: 'Cátedra Digital', description: 'Alias para a página inicial.', noindex: true, canonicalPath: '/' },
  '/sobre': { title: 'Sobre — Cátedra', description: 'Alias para /about.', noindex: true, canonicalPath: '/about' },
  '/biblia': { title: 'Ler — Sagrada Escritura', description: 'Alias para /bible.', noindex: true, canonicalPath: '/bible' },
  '/catecismo': { title: 'Catecismo — Cátedra', description: 'Alias para /catechism.', noindex: true, canonicalPath: '/catechism' },
  '/magisterio': { title: 'Magistério — Cátedra', description: 'Alias para /magisterium.', noindex: true, canonicalPath: '/magisterium' },
  '/search': { title: 'Buscar — Cátedra', description: 'Alias para /buscar.', noindex: true, canonicalPath: '/buscar' },
  '/planos': { title: 'Planos — Cátedra', description: 'Alias para /pricing.', noindex: true, canonicalPath: '/pricing' },
  '/chat': { title: 'Logos — Cátedra', description: 'Alias para /logos.', noindex: true, canonicalPath: '/logos' },
  '/login': { title: 'Entrar — Cátedra', description: 'Alias para /auth.', noindex: true, canonicalPath: '/auth' },
  '/dashboard': { title: 'Hoje — Cátedra', description: 'Alias para /hoje.', noindex: true, canonicalPath: '/hoje' },
  '/glossary': { title: 'Glossário — Cátedra', description: 'Alias para /glossario.', noindex: true, canonicalPath: '/glossario' },
  '/az-faith': { title: 'Glossário — Cátedra', description: 'Alias para /glossario.', noindex: true, canonicalPath: '/glossario' },
  '/encyclopedia': { title: 'Glossário — Cátedra', description: 'Alias para /glossario.', noindex: true, canonicalPath: '/glossario' },
  '/rosary': { title: 'Rosário — Cátedra', description: 'Alias para /oracao/rosario.', noindex: true, canonicalPath: '/oracao/rosario' },
  '/prayers': { title: 'Orações — Cátedra', description: 'Alias para /oracao.', noindex: true, canonicalPath: '/oracao' },
  '/rosario': { title: 'Rosário — Cátedra', description: 'Alias para /oracao/rosario.', noindex: true, canonicalPath: '/oracao/rosario' },
  '/ladainhas': { title: 'Ladainhas — Cátedra', description: 'Alias para /litanies.', noindex: true, canonicalPath: '/litanies' },
  '/contemplacao': { title: 'Contemplação — Cátedra', description: 'Alias para /contemplatio.', noindex: true, canonicalPath: '/contemplatio' },
  '/confession': { title: 'Exame de consciência — Cátedra', description: 'Alias para /oracao/exame-de-consciencia.', noindex: true, canonicalPath: '/oracao/exame-de-consciencia' },
  '/confissao': { title: 'Exame de consciência — Cátedra', description: 'Alias para /oracao/exame-de-consciencia.', noindex: true, canonicalPath: '/oracao/exame-de-consciencia' },

  // Legacy / dev — noindex
  '/legacy-home': { title: 'Cátedra', description: 'Cátedra Digital.', noindex: true, canonicalPath: '/' },
  '/home-v3': { title: 'Cátedra', description: 'Cátedra Digital.', noindex: true, canonicalPath: '/' },
  '/bible-legacy': { title: 'Bíblia (legado)', description: 'Versão anterior do leitor bíblico.', noindex: true, canonicalPath: '/bible' },
  '/catechism-legacy': { title: 'Catecismo (legado)', description: 'Versão anterior.', noindex: true, canonicalPath: '/catechism' },
  '/buscar-legacy': { title: 'Buscar (legado)', description: 'Versão anterior.', noindex: true, canonicalPath: '/buscar' },
  '/oracao-legacy': { title: 'Orações (legado)', description: 'Versão anterior.', noindex: true, canonicalPath: '/oracao' },
  '/biblioteca-legacy': { title: 'Biblioteca (legado)', description: 'Versão anterior.', noindex: true, canonicalPath: '/biblioteca' },
  '/rosary-legacy': { title: 'Rosário (legado)', description: 'Versão anterior.', noindex: true, canonicalPath: '/oracao/rosario' },
};


/**
 * Padrões dinâmicos: aplicados quando o path não bate com uma chave estática.
 * A página em si costuma emitir <Helmet> mais específico (título com nome do item)
 * que sobrescreve estes defaults via dedupe do react-helmet-async.
 */
const DYNAMIC_PATTERNS: Array<{ test: RegExp; meta: RouteMeta }> = [
  {
    test: /^\/liturgia\/dia\/\d{4}-\d{2}-\d{2}$/,
    meta: {
      title: 'Dia Litúrgico — Missa, Horas e Santo',
      description:
        'Consulte qualquer data do calendário: missal, ofício divino, santo do dia e escrituras integrados.',
      canonicalPath: '/liturgia/dia',
      noindex: true,
    },
  },
  {
    test: /^\/liturgia\/dia\/[^/]+$/,
    meta: {
      title: 'Dia Litúrgico — Missa, Horas e Santo',
      description:
        'Peregrinação litúrgica completa: leituras, próprio da missa, liturgia das horas e santo do dia em um só lugar.',
      canonicalPath: '/liturgia/dia',
      noindex: true,
    },
  },
  {
    test: /^\/glossario\/[^/]+$/,
    meta: {
      title: 'Verbete Teológico — Léxico Cátedra',
      description: 'Definição, história, Escritura, Magistério e conexões cruzadas do verbete teológico.',
    },
  },
  {
    test: /^\/oracao\/[^/]+$/,
    meta: {
      title: 'Oração Católica — Cátedra',
      description: 'Reze com a Igreja: texto integral, comentário editorial e modo contemplativo.',
    },
  },
  {
    test: /^\/novenas\/[^/]+$/,
    meta: {
      title: 'Novena Católica — 9 Dias de Oração',
      description: 'Novena completa em 9 dias com meditações, oração vocal e acompanhamento de progresso.',
    },
  },
  {
    test: /^\/santos\/[^/]+$/,
    meta: {
      title: 'Vida de Santo Católico — Cátedra',
      description: 'Biografia, virtudes, escritos e devoção do santo católico.',
    },
  },
  {
    test: /^\/magisterium\/[^/]+$/,
    meta: {
      title: 'Documento do Magistério — Cátedra',
      description: 'Texto integral do documento magisterial com navegação e busca.',
    },
  },
  {
    test: /^\/itineraria\/[^/]+/,
    meta: {
      title: 'Itinerário Espiritual — Jornada Guiada',
      description: 'Jornada espiritual guiada com leitura, oração e contemplação.',
    },
  },
  {
    test: /^\/colecoes\/[^/]+$/,
    meta: {
      title: 'Coleção Editorial — Cátedra',
      description: 'Coleção editorial da Cátedra: percurso curado por sacramentos, santos e temas da fé católica.',
    },
  },
  {
    test: /^\/acervo\/colecoes\/[^/]+$/,
    meta: {
      title: 'Coleção do Acervo — Cátedra',
      description: 'Trilha de formação do Acervo Cátedra: leituras, orações e reflexões conectadas em uma coleção editorial.',
    },
  },
  {
    test: /^\/colecoes\/[^/]+\/certificado$/,
    meta: {
      title: 'Certificado da Coleção — Cátedra',
      description: 'Status de conclusão e critérios da coleção editorial no Cátedra.',
      noindex: true,
    },
  },

  {
    test: /^\/temas\/[^/]+$/,
    meta: {
      title: 'Tema da Fé Católica — Cátedra',
      description: 'Percurso temático conectando Escritura, Catecismo e Magistério.',
    },
  },
  {
    test: /^\/jornadas$/,
    meta: {
      title: 'Jornadas Espirituais — Cátedra',
      description: 'Jornadas guiadas de 7 a 14 dias com leitura, oração e contemplação para aprofundar a fé passo a passo.',
    },
  },
  {
    test: /^\/jornadas\/[^/]+$/,
    meta: {
      title: 'Jornada Espiritual — Cátedra',
      description: 'Jornada guiada com leitura, oração e contemplação para aprofundar a fé passo a passo.',
    },
  },
  {
    test: /^\/jornadas\/[^/]+\/(step|complete|conclusao)$/,
    meta: {
      title: 'Jornada — Etapa',
      description: 'Etapa da jornada espiritual em andamento.',
      noindex: true,
    },
  },
  {
    test: /^\/community\/post\/[^/]+$/,
    meta: {
      title: 'Publicação — Comunidade Cátedra',
      description: 'Publicação da comunidade Cátedra com discussão sobre fé, doutrina e vida espiritual.',
    },
  },
  {
    test: /^\/community\/user\/[^/]+$/,
    meta: {
      title: 'Perfil de membro — Comunidade Cátedra',
      description: 'Perfil público de membro da comunidade Cátedra.',
      noindex: true,
    },
  },
  {
    test: /^\/glossary\/[^/]+$/,
    meta: {
      title: 'Verbete — Glossário Cátedra',
      description: 'Alias em inglês para verbete do glossário teológico católico.',
      noindex: true,
      canonicalPath: '/glossario',
    },
  },
  {
    test: /^\/biblioteca\/padres\/[^/]+$/,
    meta: {
      title: 'Padre da Igreja — Biblioteca Cátedra',
      description: 'Redirecionamento para o verbete/biografia do Padre da Igreja na Biblioteca Cátedra.',
      noindex: true,
    },
  },
  {
    test: /^\/biblioteca\/acervo\/[^/]+$/,
    meta: {
      title: 'Acervo — Biblioteca Cátedra',
      description: 'Coleção editorial da Biblioteca Cátedra com temas, filtros e itens paginados por nível de formação.',
    },
  },
  {
    test: /^\/biblioteca\/catolica$/,
    meta: {
      title: 'Biblioteca Católica — Cátedra',
      description: 'Escritos dos Santos, Padres, Doutores, Clássicos e Magistério da Igreja em um só átrio, com ficha editorial e Nexus Theologicus.',
      canonicalPath: '/acervo',
    },
  },
  {
    test: /^\/biblioteca\/catolica\/acervo$/,
    meta: {
      title: 'Acervo — Biblioteca Católica · Cátedra',
      description: 'Explore o acervo unificado: busque por título, autor ou tema em toda a Tradição — Escritos, Padres, Doutores, Clássicos e Magistério.',
      canonicalPath: '/acervo/lista',
    },
  },
  {
    test: /^\/acervo$/,
    meta: {
      title: 'Acervo Cátedra — Biblioteca Católica',
      description: 'O centro do conhecimento católico: Escritos dos Santos, Padres, Doutores, Magistério, Patrística, Liturgia e Clássicos em um só átrio.',
      canonicalPath: '/acervo',
    },
  },
  {
    test: /^\/acervo\/lista$/,
    meta: {
      title: 'Acervo — Explorar todas as obras · Cátedra',
      description: 'Busque no acervo unificado do Cátedra por título, autor ou tema — Escritos, Padres, Doutores, Clássicos e Magistério.',
      canonicalPath: '/acervo/lista',
    },
  },
  {
    test: /^\/biblioteca\/escritos$/,
    meta: {
      title: 'Biblioteca Patrística — Escritos dos Santos | Cátedra',
      description: 'Obras dos Padres, Doutores e místicos da Igreja: Confissões, Suma Teológica, Imitação de Cristo e mais — leitor premium com anotações.',
      canonicalPath: '/biblioteca/escritos',
    },
  },
  {
    test: /^\/biblioteca\/escritos\/busca$/,
    meta: {
      title: 'Buscar — Biblioteca Patrística Cátedra',
      description: 'Busca full-text nos escritos dos Padres, Doutores e místicos: pesquise por autor, obra ou palavras exatas dentro dos capítulos.',
      noindex: true,
    },
  },
  {
    test: /^\/biblioteca\/escritos\/[^/]+\/[^/]+$/,
    meta: {
      title: 'Obra Patrística — Biblioteca Cátedra',
      description: 'Sumário da obra patrística com abstract, licença editorial, capítulos e leitor contínuo integrado ao Nexus Theologicus.',
    },
  },
  {
    test: /^\/biblioteca\/escritos\/[^/]+\/[^/]+\/capitulo\/[^/]+$/,
    meta: {
      title: 'Capítulo — Biblioteca Patrística Cátedra',
      description: 'Leitor premium de capítulo patrístico com notas editoriais, referências bíblicas e conexões teológicas.',
    },
  },
  {
    test: /^\/magisterio\/[^/]+$/,
    meta: {
      title: 'Magistério — Cátedra',
      description: 'Redirecionamento para o documento do Magistério no acervo Cátedra.',
      noindex: true,
    },
  },
  {
    test: /^\/docs\/[^/]+$/,
    meta: ROUTE_META['/docs/:slug'],
  },
  {
    test: /^\/(admin|dev)(\/|$)/,
    meta: {
      title: 'Admin — Cátedra',
      description: 'Painel administrativo.',
      noindex: true,
    },
  },
];

/** Locales suportados pelo portal de documentação (prefixo de URL). */
const LOCALE_PREFIX = /^\/(en|es|it|la|fr|de)(?=\/|$)/;

export function resolveRouteMeta(pathname: string): RouteMeta | null {
  let clean = pathname.replace(/\/+$/, '') || '/';
  if (ROUTE_META[clean]) return ROUTE_META[clean];
  for (const { test, meta } of DYNAMIC_PATTERNS) {
    if (test.test(clean)) return meta;
  }
  // Rotas localizadas (/en/docs, /es/docs/slug…) herdam a meta da rota base.
  if (LOCALE_PREFIX.test(clean)) {
    clean = clean.replace(LOCALE_PREFIX, '') || '/';
    if (ROUTE_META[clean]) return ROUTE_META[clean];
    for (const { test, meta } of DYNAMIC_PATTERNS) {
      if (test.test(clean)) return meta;
    }
  }
  return null;
}
