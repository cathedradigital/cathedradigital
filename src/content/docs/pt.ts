import type { DocsBundle } from './types';

export const docsPt: DocsBundle = {
  categories: {
    inicio: 'Começar',
    leitura: 'Leitura',
    oracao: 'Oração',
    estudo: 'Estudo',
  },
  ui: {
    portalTitle: 'Documentação',
    portalSubtitle: 'Guias breves para usar a Cathedra com proveito espiritual.',
    searchLabel: 'Buscar na documentação',
    searchPlaceholder: 'Buscar guia, tema ou palavra…',
    empty: 'Nenhum guia corresponde à busca.',
    resultsCount: (n) => (n === 1 ? '1 guia encontrado' : `${n} guias encontrados`),
    back: 'Voltar à documentação',
    onThisPage: 'Nesta página',
  },
  guides: [
    {
      slug: 'primeiros-passos',
      category: 'inicio',
      title: 'Primeiros passos',
      summary: 'Como a Cathedra se organiza e por onde começar no primeiro dia.',
      keywords: ['início', 'conta', 'perfil', 'navegação', 'átrio'],
      sections: [
        {
          heading: 'O que é a Cathedra',
          body: [
            'A Cathedra reúne Escritura, liturgia, oração e patrística em um só lugar, com referências cruzadas entre tudo o que você lê.',
            'A proposta não é acumular informação, mas sustentar uma vida interior constante.',
          ],
        },
        {
          heading: 'Por onde começar',
          body: [
            'Comece pelo Átrio: ele apresenta a liturgia do dia, a leitura contínua e o que você deixou em andamento.',
            'Crie uma conta para guardar progresso de leitura, marcações e reflexões entre dispositivos.',
          ],
        },
        {
          heading: 'Ritmo sugerido',
          body: [
            'Um capítulo de Escritura, uma oração e um verbete por dia bastam para formar hábito.',
            'A constância vale mais do que a quantidade.',
          ],
        },
      ],
    },
    {
      slug: 'biblia-e-leitura-continua',
      category: 'leitura',
      title: 'Bíblia e leitura contínua',
      summary: 'Leitura de capítulos, marcações, retomada e busca no texto sagrado.',
      keywords: ['bíblia', 'escritura', 'capítulo', 'versículo', 'marcador'],
      sections: [
        {
          heading: 'Leitura por capítulo',
          body: [
            'A Bíblia é lida em capítulos completos, sem cortes, para preservar o contexto.',
            'A tradução ativa é indicada no cabeçalho do leitor.',
          ],
        },
        {
          heading: 'Retomar de onde parou',
          body: [
            'Cada capítulo lido é registrado e aparece em "Continue lendo".',
            'Marcações e reflexões ficam vinculadas ao versículo, não à sessão.',
          ],
        },
        {
          heading: 'Referências cruzadas',
          body: [
            'Referências no texto abrem em um cartão flutuante, sem tirar você da leitura.',
          ],
        },
      ],
    },
    {
      slug: 'liturgia-e-missal',
      category: 'leitura',
      title: 'Liturgia e Missal',
      summary: 'Calendário litúrgico, leituras do dia e Liturgia das Horas.',
      keywords: ['missa', 'missal', 'breviário', 'horas', 'calendário', 'tempo litúrgico'],
      sections: [
        {
          heading: 'Liturgia do dia',
          body: [
            'O calendário calcula o tempo litúrgico, a cor e a memória do dia automaticamente.',
            'As leituras próprias aparecem em leitura contínua, prontas para a oração.',
          ],
        },
        {
          heading: 'Liturgia das Horas',
          body: [
            'Laudes, Hora Média, Vésperas e Completas seguem a estrutura do breviário.',
            'Os textos são apresentados em sequência, sem saltos entre páginas.',
          ],
        },
      ],
    },
    {
      slug: 'oracao-e-rosario',
      category: 'oracao',
      title: 'Oração e Rosário',
      summary: 'Modo contemplação, mistérios do Rosário e Via Sacra.',
      keywords: ['rosário', 'via sacra', 'mistérios', 'contemplação', 'terço'],
      sections: [
        {
          heading: 'Modo contemplação',
          body: [
            'O modo contemplação reduz a interface ao essencial: texto, ritmo e imagem.',
            'O avanço entre mistérios é manual, respeitando o seu tempo.',
          ],
        },
        {
          heading: 'Rosário e Via Sacra',
          body: [
            'Cada mistério traz meditação própria, Escritura e imagem sacra.',
            'A Via Sacra segue as catorze estações na ordem tradicional.',
          ],
        },
      ],
    },
    {
      slug: 'glossario-e-nexus',
      category: 'estudo',
      title: 'Glossário e Nexus',
      summary: 'Verbetes teológicos e o grafo de referências que liga o acervo.',
      keywords: ['glossário', 'verbete', 'nexus', 'referências', 'grafo'],
      sections: [
        {
          heading: 'Verbetes',
          body: [
            'Cada verbete traz definição, etimologia, Escritura, Magistério, Tradição e aplicação.',
            'Somente verbetes publicados são visíveis ao público.',
          ],
        },
        {
          heading: 'Nexus Theologicus',
          body: [
            'O Nexus liga verbetes, santos, orações e passagens bíblicas entre si.',
            'As sugestões aparecem ao fim da leitura, como continuidade e não como distração.',
          ],
        },
      ],
    },
    {
      slug: 'manual-tecnico-catedra-digital',
      category: 'estudo',
      title: 'Manual técnico e editorial do Cátedra Digital',
      summary: 'Princípios do produto, identidade visual, módulos, navegação, Nexus, segurança, SEO, acessibilidade e publicação.',
      keywords: ['manual', 'documentação', 'design system', 'segurança', 'seo', 'rotas', 'nexus', 'auditoria', 'cloudflare', 'módulos'],
      sections: [
        {
          heading: 'O que é o Cátedra Digital',
          body: [
            'O Cátedra Digital integra estudo, oração, formação e continuidade pessoal numa experiência católica baseada em fontes identificáveis. O princípio de compreensão é Fonte → Contexto → Conexão → Compreensão → Ação.',
            'A Escritura e as fontes oficiais da Igreja têm prioridade. A inteligência Yá organiza e explica; não inventa doutrina, citações ou referências.'
          ],
        },
        {
          heading: 'Identidade e design system',
          body: [
            'A identidade pública é Cátedra Digital. A interface deve manter hierarquia tipográfica, contraste, foco visível e padrões comuns de navegação, com paletas contextuais por módulo sem sacrificar acessibilidade.',
            'Tokens e componentes existentes devem ser reutilizados. Mudanças de cor, fonte ou espaçamento exigem verificação visual e responsiva, não apenas build.'
          ],
        },
        {
          heading: 'Módulos e navegação',
          body: [
            'O Átrio orienta a experiência diária; Estudar reúne Bíblia, Catecismo, Magistério, Nexus, Biblioteca, Santos e Igreja Viva; Rezar reúne práticas de oração; Formar-se organiza percursos; Pesquisar conecta o acervo; Minha Jornada guarda progresso e dados pessoais.',
            'Links diretos, aliases, refresh, voltar/avançar e retorno de contexto devem preservar o destino esperado. O fluxo de login deve preservar o destino protegido e validar que ele é interno.'
          ],
        },
        {
          heading: 'Nexus e proveniência',
          body: [
            'O Nexus conecta conteúdos por relações identificáveis. Citação direta, referência explícita e contexto editorial devem ser distinguidos. Relações contextuais não podem ser apresentadas como citação oficial.',
            'O cache de texto não pode impedir o carregamento das relações, e o leitor deve permitir retornar à passagem ou ao parágrafo de origem.'
          ],
        },
        {
          heading: 'Segurança, SEO e acessibilidade',
          body: [
            'Dados pessoais exigem autenticação, autorização no backend e políticas RLS testadas. Segredos não podem aparecer no código público, logs ou artefatos E2E; sanitização deve falhar de modo seguro.',
            'Páginas indexáveis precisam de metadados canônicos, robots.txt e sitemap.xml coerentes. Interfaces devem ser testadas em desktop e mobile, com teclado, foco, contraste, estados de erro e ausência de overflow.'
          ],
        },
        {
          heading: 'Qualidade e publicação',
          body: [
            'Documentar não é provar implementação. Build verde não prova comportamento funcional, e deploy concluído não prova que a interface correta está servida.',
            'A cadeia oficial é GitHub → CI/testes → merge autorizado → Cloudflare Workers → verificação dos domínios reais. Merge e deploy permanecem bloqueados enquanto CI, E2E autenticado desktop/mobile, segurança ou verificações de produção estiverem pendentes.'
          ],
        },
        {
          heading: 'Documentação normativa completa',
          body: [
            'O repositório mantém o manual em docs/platform/README.md, com carta do produto, design system, contratos dos módulos, navegação e transições, Nexus/Conexo, segurança e privacidade, SEO técnico, acessibilidade e desempenho, qualidade e auditoria, conteúdo editorial do Átrio e publicação Cloudflare.',
            'Cada requisito deve ser confirmado no código, nos testes ou na produção. Pendências e limites de evidência devem continuar explícitos.'
          ],
        },
      ],
    },
  ],
};
