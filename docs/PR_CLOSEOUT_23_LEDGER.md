# PR Closeout Ledger — lote histórico real de 23 PRs

Repositório: `cathedradigital/cathedradigital`  
Agente: `.github/agents/pr-closeout-23.agent.md`  
Branch de instalação: `agents/pr-closeout-23-open-prs`  
Última atualização: 2026-10-30

## Escopo confirmado no GitHub

PRs históricas (23):  
`#1, #2, #4, #8, #26, #112, #113, #116, #117, #157, #162, #163, #165, #166, #167, #168, #171, #179, #182, #186, #190, #203, #206`.

Fora do lote: **#215** (release principal) e **#217** (instalação do agente). A busca do GitHub retornou 25 PRs abertas no total: as 23 acima + #215 + #217.

## Estado da investigação — 2026-10-30

| PR | Branch | Head SHA observado | Arquivos | Sinal inicial / risco | Estado |
|---:|---|---|---:|---|---|
| #1 | security/auth-hardening | 3108b74e41d4 | 7 | Troca pipeline npm por Bun; alterações de favoritos e reading marks; exige revisar migrations e compatibilidade do CI | Investigação |
| #2 | security/production-hardening-20260910 | d658eded8ccd | 486 | Escopo excessivamente amplo; inclui centenas de testes/arquivos, seeds SQL em grande volume e mudanças de segurança; alto risco de merge integral | Investigação |
| #4 | — | — | — | Ainda não inspecionada em profundidade | Pendente |
| #8 | fix/ui-ux-audit | 8e50faf9d089 | 19 | Inclui ZIP e relatórios em `public/`; remover exposição de artefatos antes de integrar qualquer mudança útil | Investigação |
| #26 | feat/estudar-module-foundation | d51206519f9d | 9 | Fundação UX do Estudar; precisa comparar com UI atual e PRs posteriores | Investigação |
| #112 | agent/master-estudar-exact-continuity-20261003 | 7e581a84e7cd | 4 | Sobreposição de Bible.tsx e MagisteriumViewer com PRs #113/#162/#165; patch contém bloco de scroll aparentemente serializado/escapeado e requer validação de sintaxe | Investigação |
| #113 | agent/master-estudar-final-restoration-20261003 | fb687c56d836 | 6 | Sobreposição com #112; Auth/App e logos-ai/RLS exigem revisão de segurança | Investigação |
| #116 | audit/bible-module-complete-20261003 | 19754b2584fd | 3 | Toca Bible.tsx/AtriumBibleReader; código da Bíblia congelado, não integrar sem autorização específica | Bloqueada por limite de escopo |
| #117 | audit/bible-complete-20261003 | b6957106ad01 | 18 | Toca vários arquivos da Bíblia e Catecismo; inclui migration RLS e workflow de sync; não integrar mudanças da Bíblia sem autorização | Bloqueada por limite de escopo |
| #157 | fix/catecismo-p0-connection-dedup-20261006 | f0064f1646a5 | 2 | Catecismo + E2E; elegível após confirmar checks e diff atual | Investigação |
| #162 | fix/magisterium-explicit-language-20261008 | 7698dd22f7f7 | 7 | Apesar do título, patch inclui AuthGuard/App e E2E; sobrepõe #163 e #165; validar escopo real | Investigação |
| #163 | fix/magisterium-theme-explorer-ui-20261008 | 500de2e7747b | 6 | Sobrepõe AuthGuard/App/E2E com #162; validar conteúdo visual exclusivo | Investigação |
| #165 | fix/magisterium-mobile-reader-controls-20261008 | da7ea36a1afa | 5 | Alterações de shell global e ReaderToolbar; sobrepõe #162; validar mobile | Investigação |
| #166 | audit/platform-sweep-20261008 | 39be97d900da | 19 | Inclui relatórios em public/, mudanças de rotas, RLS e workflow; requer revisão integral de segurança | Investigação |
| #167 | fix/seo-indexing-ranking-20261009 | 0617cbb8f0f6 | 12 | Toca robots/sitemap e também hooks de Bíblia/Catecismo; preservar limite da Bíblia e validar canonicals | Investigação |
| #168 | feat/magisterium-visual-doc-audit-20261010 | 325196401ce6 | 37 | Auditoria transversal; ampla sobreposição com #26/#162/#163/#165/#166 e #182 | Investigação |
| #171 | fix/study-e2e-root-causes-20261011 | 0a77753f13e3 | 10 | SEO schema e navegação; inclui migration de perfil psicológico e Catecismo; validar projeto Supabase único e RLS | Investigação |
| #179 | fix/bible-nexus-hydrate-on-cache | 82740c084f6a | 12 | Toca Bible.tsx e Catecismo; inclui Auth e sanitizador; não integrar alterações da Bíblia sem autorização | Bloqueada por limite de escopo |
| #182 | docs/platform-operating-manual-20261017 | b44211e76661 | 51 | Altera workflows, App, AuthGuard, Supabase config, Catecismo e docs; contém referência de Vercel incompatível com arquitetura atual | Investigação |
| #186 | fix/atrium-news-home-integration-clean | 234a7776c634 | 9 | Além do carrossel, toca MagisteriumViewer e Catecismo; comparar com #182 e validar conteúdo editorial | Investigação |
| #190 | fix/catechism-deeplink-intersection-race-main | fabb7f60b055 | 17 | Contém docs/config Vercel, vercel.json e função corpus-ingest; Auth/SEO/Catecismo; precisa separar mudanças obsoletas | Investigação |
| #203 | test/critical-estudar-atrium-e2e | 425a5ac2d390 | 1 | Apenas E2E; elegível após verificar se os testes adicionam cobertura real e não relaxam asserções | Investigação |
| #206 | feat/arquiteto-chefe-governanca | dd7d60d390d8 | 4 | Documentação e instruções de agente; possível sobreposição com #2 e #179; validar conteúdo | Investigação |

## Evidência preliminar de checks

- #1, #112: nenhum status combinado retornado para o head consultado.
- #2, #8: status Vercel success; não é evidência de build/publicação Cloudflare e não substitui os gates do projeto.
- #26: status Vercel failure com motivo `build-rate-limit`; não é falha funcional comprovada, mas não é aprovação.
- Os demais heads ainda aguardam coleta de status e Actions.
- Mergeability false em várias PRs não foi interpretado como conflito semântico; precisa de comparação/atualização da base.

## Próximas ações técnicas

1. Comparar diffs completos e commits por grupos de sobreposição.
2. Identificar quais alterações já chegaram à main ou à #215.
3. Remover exposição de relatórios/ZIPs em `public/` nas alterações que forem aproveitadas.
4. Separar mudanças válidas das mudanças incompatíveis (Vercel, troca de package manager, Bíblia congelada).
5. Criar branch de consolidação baseada na main atual, implementar mudanças seguras e executar testes reais.
6. Só então fechar PRs com prova de destino do conteúdo.

## Gates finais

- [ ] 23 PRs investigadas por diff, commits, reviews, checks e dependências.
- [ ] Alterações exclusivas válidas implementadas e preservadas.
- [ ] Nenhum conteúdo da Bíblia alterado sem autorização.
- [ ] RLS/autenticação/ownership preservados e testados.
- [ ] Zero PR aberta dentro da allowlist.
- [ ] #215 e #217 preservadas.
- [ ] CI, auditoria, build Cloudflare e E2E aplicáveis aprovados no mesmo SHA.
- [ ] Workflow manual Cloudflare executado separadamente.
- [ ] Domínios oficiais, Worker, robots.txt e sitemap.xml verificados em produção.

Nenhuma PR histórica foi fechada ou integrada nesta fase de investigação. Não marcar qualquer item como concluído sem SHA e URL de evidência.

## Evidências adicionais — CI e Supabase de produção

### CI histórico consultado nos SHAs das PRs

| PR | Workflow | Resultado | Diagnóstico observado |
|---:|---|---|---|
| #1 | Node.js CI | Falhou | ESLint/Prettier: 49.725 erros e 165 avisos; branch troca npm por Bun e não é compatível com o pipeline npm atual |
| #2 | Node.js CI | Falhou | ESLint: 18 erros e 177 avisos, incluindo Rules of Hooks e no-require-imports |
| #4 | Node.js CI | Falhou | ESLint: 1.068 erros e 159 avisos; adiciona também workflow e script específicos de Vercel, incompatíveis com a arquitetura atual |
| #8 | CI | Passou | A comparação com main mostra a remoção dos artefatos antigos `public/cathedra.zip`, relatórios HTML/MD/PDF e JSON de indexação; alterações visuais ainda precisam ser comparadas ao estado atual |
| #26 | CI | Falhou | TypeScript em `src/services/corpusService.ts`: schema generated não reconhece colunas/relations de corpus; Vercel falhou por rate limit de build, não é evidência Cloudflare |

### Verificação direta do projeto Supabase ativo

- `list_projects` confirmou exatamente um projeto: `isojguvcnfncokoxoauk`, nome `cathedradigital`, estado `ACTIVE_HEALTHY`, PostgreSQL 17, região `sa-east-1`.
- Consulta de catálogo em produção confirmou RLS ativo e política owner-scoped `notifications_own` para todas as operações, com `auth.uid() = user_id` em USING e WITH CHECK.
- A mesma consulta confirmou RLS ativo e política owner-scoped `reading_marks_own` para todas as operações, com USING e WITH CHECK por `auth.uid() = user_id`.
- A tabela `public.bible_favorites` não existe no projeto ativo (consulta ao catálogo retornou zero linhas). A migration da PR #1 pula a criação quando a tabela não existe, mas o hook proposto passa a consultar/inserir nessa tabela para usuários autenticados. Integrar esse hook isoladamente quebraria favoritos autenticados e ocultaria os favoritos locais existentes.
- Não executar migrations de produção para tentar fazer o hook funcionar sem antes definir schema, migração de dados, RLS, unicidade, testes e compatibilidade com `useDevotionalFavorites`.

### Consequências para a triagem

- PR #1: a política de notifications e reading_marks já está coberta no banco ativo; a parte de favoritos depende de tabela inexistente e exige redesenho/migração antes de ser aproveitada. Não fazer merge integral.
- PR #2: o escopo de 486 arquivos e o CI falho impedem merge integral. Separar migrations/testes realmente exclusivos depois de comparar com o estado do banco e com as migrations já aplicadas.
- PR #4: o pipeline npm já é o padrão atual e #215 traz npm 10.9.9/lockfile; não importar o workflow Vercel.
- PR #8: a remoção de artefatos públicos é útil e a comparação indica que o PR remove os arquivos; verificar quais alterações visuais continuam ausentes antes de encerrar.
- PR #26: a alteração de UX não pode ser integrada até resolver os erros de tipos e demonstrar que os arquivos continuam compatíveis com a arquitetura atual.


## Resultado dos workflows históricos — lote completo

| PR | CI | Auditoria/validação | E2E | Evidência / diagnóstico |
|---:|---|---|---|---|
| #112 | Falhou | — | — | CI Node.js falhou; precisa corrigir antes de reaproveitar mudanças de Magistério |
| #113 | Passou | Passou | Não executado | Mergeability false; sobreposição com #112/#162/#163 e mudanças AuthGuard |
| #116 | Passou | Passou | Falhou | Altera Bible.tsx e AtriumBibleReader; não integrar código da Bíblia |
| #117 | Falhou | Falhou | Falhou | Alterações amplas da Bíblia, Catecismo, sincronização e migration RLS; não integrar integralmente |
| #157 | Passou | Passou | Falhou | E2E público falhou em seletores/URL e mobile; correção seletiva foi implementada em #218 |
| #162 | Passou | Passou | Falhou | E2E: 16 casos falharam, com timeout de navegação, deep links e links de referência duplicados |
| #163 | Passou | Passou | Falhou | E2E falhou; sobreposição de workflow/AuthGuard/App com #162 |
| #165 | Passou | Passou | Falhou | E2E falhou; alterações de controles mobile ainda sem validação final |
| #166 | Passou | Passou | Falhou | Migrações de perfil/role e premium foram aplicadas no projeto atual sob versões novas #215; demais mudanças precisam de comparação |
| #167 | Passou | Passou | Falhou | E2E falhou; alteração do robots/sitemap junto com hooks da Bíblia; não importar mudanças da Bíblia |
| #168 | Passou | Passou | Falhou | 11 casos E2E falharam, incluindo deep link de Catecismo, links de referência duplicados e overflow mobile |
| #171 | Passou | Passou | Falhou | 16 casos E2E falharam; navegação e links mobile |
| #179 | Passou | Passou | Falhou | E2E: 48 falhas; login/deep links/rotas e seletores mobile |
| #182 | Passou | Passou | Cancelado | 45 min sem conclusão; PR ampla com workflow e configuração, incluindo referências Vercel incompatíveis |
| #186 | Não encontrado | Não encontrado | Não encontrado | Nenhum workflow retornado para o head consultado; mergeability false |
| #190 | Passou | Passou | Falhou | E2E não iniciou: preflight Supabase retornou HTTP 400 invalid_credentials; patch inclui correção de deep link reaproveitada seletivamente em #218 |
| #203 | Passou | Passou | Falhou | 42 falhas E2E; page.waitForURL expirou em múltiplos fluxos |
| #206 | Passou | Passou | Não aplicável / não executado | PR contém somente documentação e perfil de agente; conteúdo revisado, sem alterações de runtime |

### Implementação em andamento

- PR #218 (ops/pr-consolidation-23) reaplica sobre a main atual correções seletivas das PRs #157 e #190:
  - remove o Relatio duplicado do Catecismo;
  - exige um único data-nexus-panel no E2E;
  - corrige canonicalização ?paragraph=N para ?p=N;
  - limita o observer aos artigos reais do leitor;
  - melhora o diagnóstico do login Playwright para revelar a rejeição real do Supabase.
- SHA atual da PR #218: 96851f98bfcfbd465f34219d0333ee1d78ddba38.
- No SHA atual: CI success, auditoria success, Playwright público desktop/mobile ainda in_progress na última consulta. Não integrar nem fechar #157/#190 até o E2E concluir.

### Decisão de segurança do lote

- Nenhum merge/fechamento de PR histórica foi realizado ainda.
- Não executar mudanças de produção Supabase nesta etapa. As consultas foram somente leitura.
- Não publicar produção. O único alvo de deploy segue sendo Cloudflare Workers, por workflow manual após a release principal.

## Ações de consolidação na branch de release — 2026-10-30

- PR #206: **closed sem merge direto**, com os quatro arquivos de documentação/agente copiados byte a byte para esta branch de release. Conteúdo preservado; PR encerrada como substituída pela consolidação #215.
- PR #217: **closed sem merge direto** (PR auxiliar fora do lote), com o perfil PR Closeout 23 e o ledger copiados byte a byte para esta branch de release. O agente ficará disponível na main somente após merge aprovado da #215.
- SHA da branch de release após a cópia: `74e4ac05d5ff57561ed783279ac12509676e0f52`.
- As outras 22 PRs da allowlist histórica continuam abertas e em investigação. Nenhuma foi fechada sem decisão de preservação.

### PR #1 — decisão técnica de encerramento

- O documento de autenticação/RLS foi preservado em docs/security/authentication.md na branch da release.
- As políticas de produção notifications_own e reading_marks_own já impõem auth.uid() = user_id em USING e WITH CHECK; as migrations antigas da PR #1 para essas políticas são redundantes no projeto ativo.
- A tabela public.bible_favorites não existe no único projeto Supabase ativo. O hook da PR #1 mudaria favoritos autenticados para consultar essa tabela inexistente, sem migração de dados do localStorage; não integrar esse hook.
- O índice parcial de leitura (um is_last_read por usuário) ainda não existe no banco. A tabela tem 1 linha e zero duplicatas; o índice é uma melhoria válida, mas precisa de migration nova gerada pelo fluxo Supabase correto, com teste e revisão. Não aplicar DDL de produção nem inventar versão de migration nesta rodada.
- O workflow Node.js CI da PR #1 falha com 49.725 erros Prettier/ESLint e a branch troca npm por Bun, incompatível com o release atual.
- A PR #1 será encerrada como substituída/ parcialmente preservada: documento integrado, RLS já garantida no banco, hook de favoritos rejeitado por depender de tabela inexistente, índice parcial registrado como pendência técnica explícita.

### PR #2 — decisão técnica de encerramento

- A PR contém 486 arquivos e 57 commits à frente de uma base com 810 commits de atraso/divergência em relação à main atual; não é uma unidade segura de merge.
- CI histórico falhou com 18 erros e 177 avisos, incluindo Rules of Hooks, imports proibidos e expressões inválidas.
- O documento de auditoria de 15/09 já existe na main; as migrações de perfil/premium e permissões RLS foram reaplicadas/aplicadas sob versões posteriores e registradas na release #215.
- O projeto ativo não possui public.user_sensitive_data. telemetry_settings contém somente a chave thresholds; a leitura pública é consumida por Telemetry.init() para carregar limites operacionais, enquanto alterações ficam restritas pela política admin. Não remover a leitura pública sem substituir esse contrato.
- A sobrecarga enum de auth_internal.has_role usada pela política admin existe em produção e está correta; a sobrecarga text/is_admin antiga não é usada pelas políticas atuais consultadas.
- Nenhum merge integral dos 486 arquivos será feito. O restante do snapshot antigo (funções, seeds e testes) não foi validado individualmente contra a arquitetura atual e não será restaurado em bloco.
- Decisão: encerrar como snapshot obsoleto/reprovado para merge, preservando a documentação de auditoria já presente na main e mantendo os controles de produção atuais. Não declarar que todo o código da branch foi integrado.

### PR #4 — extração seletiva de migration válida

- A PR #4 tem 1.011 arquivos alterados; o CI histórico falha com 1.068 erros/159 avisos e inclui workflows/scripts de Vercel, incompatíveis com o destino Cloudflare.
- A investigação encontrou um defeito real: useDevotionalFavorites consulta public.bible_favorites, mas a tabela não existia no único projeto Supabase ativo.
- A parte válida da migration antiga foi reescrita de forma mínima e aplicada ao projeto ativo:
  - migration 20261030203257_create_bible_favorites_and_harden_reading_marks: cria bible_favorites com unicidade por user_id/content_type/content_id, RLS owner-scoped, grants mínimos e índice parcial de um last-read por usuário;
  - migration 20261030203411_restrict_bible_favorites_grants: remove privilégios amplos herdados e deixa authenticated apenas com SELECT/INSERT/DELETE; service_role mantém ALL.
- As migrations e a definição da tabela foram registradas na branch da release; o tipo bible_favorites foi acrescentado seletivamente a src/integrations/supabase/types.ts sem substituir o arquivo inteiro por uma geração que diverge em milhares de linhas.
- Verificação pós-migration: tabela existe, RLS ativo, três políticas owner-scoped, nenhum grant para anon, authenticated tem somente DELETE/INSERT/SELECT, índice parcial reading_marks_one_last_read_per_user_idx existe.
- Smoke test transacional: inserção sob claim de usuário autenticado foi aceita; após trocar o claim para outro usuário, a consulta retornou zero linhas; a transação foi revertida (nenhum dado de teste persistido).
- Advisor de segurança após a migration continua apontando apenas leaked password protection disabled (WARN); nenhum novo finding de RLS foi criado.

### Atualização da PR #1 após a correção da PR #4

- A pendência do índice parcial de reading_marks registrada no comentário inicial da #1 foi resolvida pelas migrations 20261030203257 e 20261030203411.
- A decisão de não integrar o hook useFavorites da #1 permanece: public.bible_favorites agora existe para useDevotionalFavorites, mas o hook antigo da #1 tem contrato diferente, não migra localStorage e não foi validado para a UI global de favoritos.

### PR #26 — decisão técnica de encerramento

- A especificação UX/UI do Estudar já existe na main em docs/design/estudar-module-ux-spec.md.
- Os atributos data-catedra-module-root e a fundação CSS do Estudar já aparecem na main nas páginas Biblioteca, Comunidade, Magistério, Santos, Catecismo e Nexus.
- O componente antigo src/components/cathedra/BibleReader.tsx não existe mais na main; a Bíblia usa a arquitetura atual e permanece congelada, então não restaurar esse arquivo.
- O CI histórico falhou por tipos Supabase antigos na branch obsoleta (corpusService não reconhecia relations/colunas existentes na main atual); o Vercel status falhou por rate limit, sem relação com Cloudflare.
- Decisão: conteúdo UX principal já substituído pela arquitetura atual; arquivo de Bíblia obsoleto não será reaplicado. Encerrar sem merge da branch antiga.
