# Cátedra Digital — Matriz de rastreabilidade do Documento Mestre

**Versão:** 0.1 — levantamento inicial  
**Data:** 2026-10-18  
**Status:** Em levantamento histórico; precisa de atualização contra o SHA candidato atual; não é certificação de implementação  
**Repositório consultado:** `cathedradigital/cathedradigital`  
**Base consultada:** branch `main`, commit `3d11520d3b1c8a713d278589ad0ab89e7982c0e0` (levantamento de 2026-10-18; referência histórica, não presumir que seja o HEAD atual).  
**Documento relacionado:** Parte I v1.1 e complemento da Parte II, PR #198.

## 1. Como ler esta matriz

- **Localizado:** caminho confirmado no repositório consultado.
- **Candidato:** arquivo/script identificado como parte do fluxo, mas ainda precisa de inspeção específica.
- **Pendente de evidência:** ainda não foi demonstrado por teste executado neste levantamento.
- **Não verificado:** a busca não localizou um artefato conclusivo; isso não prova que ele não exista.

Esta matriz não declara nenhum requisito como aprovado ou publicado. Cada conclusão de implementação deverá ser confirmada por leitura do código, execução de testes e evidência associada ao mesmo commit.

## 2. Matriz inicial de rastreabilidade

| Requisito / princípio | Área ou arquivo localizado | Verificação existente identificada | Estado deste levantamento | Próxima ação verificável |
|---|---|---|---|---|
| Integridade operacional: build e contratos de módulo | `package.json` | `npm run build` executa verificação de assets, contratos de módulos, segurança, Vite build e TypeScript | Localizado; não executado nesta matriz | Executar no SHA candidato e registrar saída integral |
| Contratos entre módulos | `scripts/validate-module-contracts.mjs` (referenciado em `package.json`) | `npm run validate:modules` e parte do build | Script referenciado; conteúdo não inspecionado neste levantamento | Inspecionar regras e mapear cada contrato aos requisitos 5, 18 e 20 |
| Segurança e limites de acesso | `scripts/validate-security-boundaries.mjs` (referenciado em `package.json`) | `npm run validate:security` e parte do build | Script referenciado; não executado | Inspecionar cobertura; associar a requisitos 10, 11 e 19; executar testes negativos de autorização |
| Integridade de rotas internas | `scripts/validate-internal-routes.mjs` (referenciado em `package.json`) | `npm run validate:links` | Script referenciado; não executado | Inspecionar cobertura e executar; relacionar destinos inválidos aos fluxos do Átrio, Estudar e Pesquisar |
| Publicação Cloudflare | `package.json` e `DEPLOYMENT.md` | Script `deploy:cloudflare` executa build e Wrangler deploy | Fluxo declarado; publicação não verificada por este levantamento | Só publicar após gates; registrar SHA, saída do deploy e versão servida |
| Leitores e cadeia de leitura | `src/config/reader-modules.ts` | O próprio arquivo documenta a intenção de auditoria do Reader Template e referências a verificações estáticas/E2E | Arquivo localizado; testes citados ainda precisam de resolução de caminho e execução | Inspecionar registro completo, entradas e rotas; confirmar arquivos reais de teste no repositório |
| Plano de implementação das telas | `docs/CATEDRA_TELAS_PLANO_IMPLEMENTACAO.md` | Documento descreve sequência de fundação visual e módulos | Documentação localizada; não comprova comportamento | Converter cada critério em requisito identificável e teste automatizado/manual |
| Projeto mestre de telas e conteúdo | `docs/CATEDRA_DIGITAL_PROJETO_MESTRE_TELAS_E_CONTEUDO.md` | Documento mestre de produto existente | Documentação localizada; cobertura contra o código ainda não mapeada | Fazer inventário seção a seção e evitar duplicar ou contradizer a Parte I/II |
| Átrio: carregamento, vazio, erro e conteúdo | Implementação deverá ser localizada na rota/componente atual do Átrio | A Parte II exige estados explícitos; a matriz não comprova todos os estados do módulo | Pendente de inspeção de código e teste | Identificar entry, hooks, componente de notícias e testes; verificar estados loading/success/empty/error em desktop e mobile |
| Bíblia: referência canônica e navegação por capítulo/versículo | Entry e serviço da Bíblia ainda precisam ser vinculados nesta matriz | Contratos e validação de rotas são candidatos; não demonstram semântica bíblica correta | Pendente de rastreabilidade detalhada | Mapear referência, parser, leitor, origem dos dados, deep links e testes de capítulo/versículo |
| Catecismo: parágrafo e deep link | Entry/serviço do Catecismo ainda precisam ser vinculados nesta matriz | Validação de rotas é candidata; não prova parágrafo correto nem retorno à origem | Pendente de rastreabilidade detalhada | Mapear `paragraph`, aliases e parâmetros canônicos; criar/confirmar testes para parágrafos de aceitação e retorno |
| Magistério: documento, idioma, original e tradução | `src/config/reader-modules.ts` lista o registro canônico dos módulos de leitura | Auditoria de cadeia de leitura é mencionada no comentário do arquivo; execução não comprovada | Parcialmente localizado; comportamento editorial não validado | Mapear reader, modelo de metadados, seleção de idioma e teste de original/tradução |
| Nexus: origem, destino e tipo de relação | Contratos de módulo e leitor são pontos de entrada; o caminho de implementação precisa ser confirmado | Nenhum teste específico foi confirmado nesta consulta | Pendente | Localizar schema, consultas e renderizador do Nexus; verificar origem/destino válidos e ausência de indicador para conexão inexistente |
| Login e retorno ao destino solicitado | Caminhos exatos de auth e respectivos testes ainda precisam ser vinculados | Não foi confirmada uma execução de teste de autenticação neste levantamento | Pendente | Localizar rotas de login/auth, sanitização de `next`, callbacks e testes de visitante, sessão expirada e retorno |
| Minha Jornada: persistência e isolamento de dados | Serviço/tabelas e fluxos específicos ainda precisam ser ligados ao código neste levantamento | Validador de segurança é candidato; não prova persistência ou RLS efetiva | Pendente | Inspecionar queries, políticas RLS e testes entre dois usuários; confirmar gravação, leitura e exclusão |
| Rezar e Formar-se: continuidade e conclusão | Entradas e serviços ainda precisam ser vinculados | Não há evidência de teste específico neste levantamento | Pendente | Inventariar modalidades e percursos; definir critérios de progresso, retomada e persistência |
| Pesquisar: fonte, categoria e destino do resultado | Entry, indexação e adaptadores ainda precisam ser vinculados | Validação de rotas é candidata; não comprova a correção dos resultados | Pendente | Mapear coleções consultadas, ranking, links, estados de falha e permissões |
| Acessibilidade e layout móvel | Componentes e configuração de testes ainda precisam ser vinculados | Não foi executada verificação visual nesta matriz | Pendente | Fixar viewport móvel representativo, verificar teclado/foco/semântica/overflow e guardar evidências |
| SEO e versão efetiva em produção | `DEPLOYMENT.md` é referência de operações; rotas de SEO precisam ser localizadas | Nenhum teste de produção foi executado nesta matriz | Pendente | Verificar domínio principal e www, UI e SHA servidos, `robots.txt` e `sitemap.xml` após publicação autorizada |

## 3. Scripts de verificação confirmados no package.json

O `package.json` consultado declara:

- `npm run build`: checagem de assets, contratos de módulos, limites de segurança, build Vite e TypeScript;
- `npm run typecheck`: `tsc --noEmit`;
- `npm run lint`: ESLint;
- `npm run validate:modules`: validação de contratos de módulos;
- `npm run validate:links`: validação de rotas internas;
- `npm run validate:security`: validação de limites de segurança;
- `npm run deploy:cloudflare`: build seguido de `wrangler deploy`.

A existência desses scripts não representa resultado aprovado. Nenhum deles foi executado como parte da criação desta matriz.

## 4. Lacunas que bloqueiam uma declaração de conclusão

1. **SHA final único:** escolher o commit candidato e executar todos os gates nele.
2. **Cobertura E2E:** confirmar caminhos reais dos testes no repositório, os comandos de execução e os cenários desktop/mobile.
3. **Autenticação real:** provar os fluxos com sessão e sem sessão, incluindo retorno ao destino e autorização no backend.
4. **Dados e referências:** provar deep links e integridade de Bíblia, Catecismo, Magistério e Nexus.
5. **Evidências:** guardar resultados, logs e artefatos identificados pelo SHA, sem misturar execuções de versões diferentes.
6. **Produção:** após aprovação e publicação autorizada, verificar a interface efetivamente servida, domínios e recursos de SEO.

## 5. Critério para atualizar o status de um requisito

Um requisito só poderá avançar de status quando houver evidência apropriada:

- **Especificado:** requisito e critério de aceitação documentados.
- **Implementado:** arquivo/commit que realiza o comportamento identificado.
- **Testado:** teste reproduzível executado no mesmo SHA e resultado registrado.
- **Aprovado:** todos os critérios exigidos passaram e a revisão correspondente foi concluída.
- **Publicado:** versão aprovada publicada e confirmada no ambiente de destino.

Não converter “arquivo localizado”, “script existente”, “workflow iniciado” ou “HTTP 200” isoladamente em “funcionalidade aprovada”.

---

**Próxima unidade de trabalho:** fechar primeiro a rastreabilidade P0 do Átrio, Bíblia, Catecismo, Magistério/Nexus e autenticação; em seguida executar os gates no mesmo SHA e registrar as evidências. Este documento é um inventário inicial com lacunas explícitas, não um relatório de aprovação.
