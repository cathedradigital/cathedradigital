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
