# Cátedra Digital — Formação católica para todos os dias.

**Formação católica para todos os dias.**

A Cátedra Digital integra estudo, oração, formação, pesquisa e continuidade pessoal em uma experiência católica unificada. A plataforma conecta fontes confiáveis, contexto, relações verificáveis e ação, sem substituir a autoridade eclesial nem a liberdade do usuário.

## Princípio orientador

**Fonte → Contexto → Conexão → Compreensão → Ação**

- Conteúdo com fonte, autoria, idioma e proveniência identificáveis.
- Inteligência artificial como assistência contextual, nunca como autoridade doutrinal.
- Segurança aplicada no backend; guards de interface não substituem autorização.
- Privacidade por padrão e isolamento dos dados pessoais.
- Qualidade comprovada por testes e evidências vinculados ao mesmo SHA.

## Organização do produto

O **Átrio** é a porta de entrada editorial. A navegação principal organiza a experiência em cinco ambientes:

1. **Estudar** — Bíblia, Catecismo, Magistério e Documentos; conexões e acervo conforme a arquitetura editorial aprovada.
2. **Rezar** — Liturgia, Lectio Divina, Rosário, Via-Sacra, Ladainhas e Novenas.
3. **Formar-se** — jornadas e percursos estruturados.
4. **Pesquisar** — busca transversal e descoberta de conteúdos.
5. **Minha Jornada** — diário, progresso, histórico, favoritos e continuidade pessoal.

A especificação de produto e o registro de navegação do código ainda possuem diferenças de agrupamento para alguns recursos (Nexus, Biblioteca e Santos). Essa divergência está registrada na documentação de arquitetura; não deve ser resolvida silenciosamente por este README.

## Arquitetura e operação

- Frontend: React e TypeScript, com TanStack Start/Vite.
- Runtime e publicação: Cloudflare Workers, configurado por `wrangler.jsonc`.
- Dados, autenticação e funções de backend: um único projeto Supabase, com autorização no servidor e RLS no banco.
- Cadeia oficial de publicação: GitHub → Cloudflare Workers.
- Vercel e Lovable não são ambientes oficiais de produção.

## Documentação

Consulte o [índice oficial da documentação](docs/README.md).

Documentos principais:
- [Documento Mestre — Parte I](docs/CATEDRA_DOCUMENTO_MESTRE_PARTE_I.md)
- [Complemento operacional — Parte II](docs/CATEDRA_DOCUMENTO_MESTRE_PARTE_II_COMPLEMENTO.md)
- [Arquitetura técnica](docs/architecture/overview.md)
- [Diagramas de arquitetura e publicação](docs/architecture/diagrams.md)
- [Especificações dos módulos](docs/modules/README.md)
- [Matriz de rastreabilidade](docs/CATEDRA_MATRIZ_RASTREABILIDADE_REQUISITOS.md)
- [Segurança](docs/security/security.md)
- [Estratégia de testes](docs/quality/testing.md)
- [Operação e publicação](DEPLOYMENT.md)

## Desenvolvimento e liberação

Antes de uma mudança ser considerada pronta:
1. validar typecheck, lint, contratos, rotas, segurança e build;
2. executar os testes relevantes sem remover ou enfraquecer asserções;
3. validar fluxos críticos em desktop e mobile;
4. confirmar autenticação, autorização e isolamento dos dados quando aplicável;
5. revisar dependências e segredos;
6. associar todas as evidências ao mesmo SHA;
7. publicar somente após os gates e a autorização exigida;
8. verificar a versão efetivamente servida nos domínios oficiais e os recursos SEO.

Build aprovado não comprova publicação. Workflow iniciado não comprova aprovação. Documentação não comprova implementação.
