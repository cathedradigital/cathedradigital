# PR Closeout Ledger — lote histórico aberto

Repositório: `cathedradigital/cathedradigital`  
Agente: `.github/agents/pr-closeout-23.agent.md`  
Branch: `agents/pr-closeout-23-open-prs`  
Data da consulta: 2026-10-30

## Escopo real verificado

A busca GitHub `repo:cathedradigital/cathedradigital is:pr is:open` retornou 15 PRs abertas. A #215 é a release principal, fora do lote. Portanto, há **14 PRs históricas abertas**, não 23:

`#8, #112, #116, #157, #162, #163, #165, #166, #167, #168, #171, #186, #190, #203`.

PRs #1, #2, #26, #113, #117, #179, #182 e #206 foram consultadas e constam fechadas sem merge; não são PRs abertas e não devem ser reabertas automaticamente. #215 preservada. #217 fora do escopo.

## Evidências por PR

| PR | SHA head consultado | Arquivos | Checks observados | Achados e ação |
|---:|---|---:|---|---|
| #8 | `8e50faf9d08924759a855ba19e7b1a6da75dedef` | 19 | CI success | Remove `public/test-report.html`, `.md`, PDF, JSON e ZIP; remove painel de diagnóstico legado; alterações de UX. Avaliar ZIP/report e impacto visual antes de integrar. |
| #112 | `7e581a84e7cd6890dabfce55d787ab44f7669876` | 4 | CI failure | Toca `Bible.tsx`; bloqueado pela regra de Bíblia congelada. Investigar apenas para classificar e não integrar alterações bíblicas sem autorização. |
| #116 | `19754b2584fd18bce57d5c741dc8099020decbbc` | 3 | CI success; final audit success; E2E failure | Altera `Bible.tsx` e `AtriumBibleReader.tsx`; bloqueado pela regra de Bíblia congelada. |
| #157 | `f0064f1646a5be9cfade0b7a5993948c1f824135` | 2 | CI success; final audit success; E2E failure | Remove componente Relatio duplicado do leitor Catecismo e adiciona teste de um painel Conexo. Candidato a correção isolada, mas E2E precisa ser resolvido. |
| #162 | `7698dd22f7f78706604b002679a3df3b6074a02b` | 7 | CI success; final audit success; E2E failure | Altera fluxo auth, workflow E2E, Playwright e idioma Magistério. Teste não comprova login; revisão semântica necessária antes de integrar. |
| #163 | `500de2e7747b244b1817d7a6969027ea9e4d70ab` | 6 | CI success; final audit success; E2E failure | Refatora filtros do Magistério e repete alterações de auth/E2E presentes em #162. Consolidar sobreposição para não duplicar mudanças. |
| #165 | `da7ea36a1afa5ec47bc3b8b30d6b97d5fad9a68c` | 5 | CI success; final audit success; E2E failure | Ajusta cabeçalho e controles mobile; altera também auth, App e CSS. Comparar sobreposição com #162/#163 antes de integrar. |
| #166 | `39be97d900daaf7151183575ec21e182a9e94b9c` | 19 | CI success; final audit success; E2E failure | Auditoria ampla, migrations de segurança, auth, Catecismo, Nexus, relatórios públicos. Workflow executa public smoke somente com `--project=chromium`, apesar do texto dizer ambos os viewports. Revisar migrations/RLS e corrigir comando antes de aceitar. |
| #167 | `0617cbb8f0f635e555308e7a5cd5c7a6e7b83f06` | 12 | CI success; final audit success; E2E failure | SEO, robots/sitemap, AuthGuard e arquivos bíblicos (`useBibleNavigation.ts`), além do Catecismo. Não integrar trecho bíblico sem autorização; revisar canonicals/robots/sitemap. |
| #168 | `325196401ce615038e64959d4d7c17a173a81114` | 37 | CI success; final audit success; E2E failure | Auditoria visual cross-module, muitos arquivos de interface e testes, inclui `src/data/catechism.ts` e readers. Precisa ser decomposta em mudanças menores e sobreposições com #163/#165/#166. |
| #171 | `0a77753f13e3c2199d9b0182f6aef7f0bcf98188` | 10 | Nenhum run associado retornado | Altera aliases e sincronização do Catecismo, mas também `useBibleNavigation.ts`, `SEOHead`, `seo.ts` e migrations de schema/perfil. Não integrar parte bíblica sem autorização; validar migrations contra o schema atual antes de qualquer uso. |
| #186 | `234a7776c6343293406321038bf96d9232583a52` | 9 | Nenhum run associado retornado | Integra carrossel editorial do Átrio; altera Magistério, Catecismo e Home. Revisar sobreposição com #168 e #190; exigir checks atuais. |
| #190 | `fabb7f60b05540974f703b853dece999a3fb8161` | 17 | CI success; final audit success; E2E failure | Correção de deep-link do Catecismo misturada com Cloudflare, E2E, `public/test-report.*`, sanitizer e `vercel.json`. Separar a correção funcional; não introduzir cadeia Vercel. |
| #203 | `425a5ac2d390fd5b9d784142d08d4fa96fedbbb6` | 1 | CI success; final audit success; E2E failure | Altera somente `e2e/estudar-critical.spec.ts`; melhora espera de login e testa links do Átrio. Candidato a consolidar com alterações de teste das #162/#163/#166/#171/#190, após corrigir e executar E2E. |

## Achados transversais confirmados

1. **Falha E2E recorrente:** #116, #157, #162, #163, #165, #166, #167, #168, #190 e #203 têm run E2E concluído como failure no SHA consultado. CI e auditoria final verdes não substituem E2E.
2. **Duplicação de auth/E2E:** #162, #163, #166, #171, #190 e #203 tocam `e2e/estudar-critical.spec.ts`, `App.tsx`, `AuthGuard.tsx` ou workflow. Consolidar por comportamento esperado, não por cherry-pick cego.
3. **Bíblia congelada:** #112, #116 e #171 contêm alterações em arquivos bíblicos. #167 também toca `useBibleNavigation.ts`. Essas partes ficam fora da integração sem autorização expressa.
4. **Migrations sensíveis:** #166 e #171 incluem migrations relacionadas a perfil, SEO e permissões. Não executar remotamente; verificar ordem, idempotência, grants e RLS em ambiente de teste.
5. **Artefatos públicos:** #8, #166 e #190 removem ou adicionam relatórios de teste em `public/`. Não publicar traces, dumps ou relatórios internos.
6. **Deploy:** #190 inclui `docs/deployment/vercel.md` e remove `vercel.json`; o caminho oficial continua Cloudflare Workers.

## Próximas ações técnicas

- [ ] Buscar detalhes dos logs de falha E2E de cada SHA e identificar causa raiz compartilhada.
- [ ] Inspecionar checks completos e reviews/conversas antes de decidir integração.
- [ ] Criar branch de consolidação a partir da `main` atual.
- [ ] Consolidar primeiro correções não-bíblicas e de baixo acoplamento (Catecismo/Conexo, Magistério, UI, SEO seguro, Átrio).
- [ ] Isolar/omitir mudanças em arquivos da Bíblia sem autorização.
- [ ] Corrigir o workflow de public smoke para realmente executar desktop e mobile se esse for o requisito.
- [ ] Executar quality/CI, auditoria, build Cloudflare e Playwright desktop/mobile no mesmo SHA.
- [ ] Integrar mudanças aprovadas, fechar PRs com comentários de destino e SHA.
- [ ] Executar workflow manual Cloudflare e verificar produção, robots e sitemap.

**Estado honesto:** análise inicial de metadata, arquivos, patches e runs concluída para as 14 PRs abertas. Nenhuma PR histórica foi integrada ou fechada nesta etapa. Não há publicação declarada. A execução de testes local/Playwright e a consolidação funcional ainda precisam ser realizadas.

## Implementação executada nesta sessão

### PR #219 — consolidação isolada da correção #157
- Branch: `ops/closeout-conexo-catechism-157`
- SHA final enviado: `21f9a1b690187805a8b69b1d4b894e994c5b819f`
- Commit de código: `237380e000f34c78adcb273080b9e88e55a7aa58`
- Commit de teste: `21f9a1b690187805a8b69b1d4b894e994c5b819f`
- Arquivos alterados: `src/modules/catequese/reader/Catechism.tsx`, `e2e/estudar-critical.spec.ts`.
- Mudança: removido o import e o bloco Relatio duplicado; teste adicionado para garantir um único painel Conexo em §279.
- PR criada: https://github.com/cathedradigital/cathedradigital/pull/219
- Estado observado logo após criação: aberta, mergeable=true, sem status/checks publicados ainda. Não fazer merge até CI, auditoria e E2E passarem no SHA final.
- A PR #157 original permanece aberta até a validação e integração da #219; só então pode ser encerrada com referência à #219/merge commit.

### Logs de E2E inspecionados
- Run #170 / PR #157: falha no step `Run public browser smoke`, portanto os testes autenticados foram pulados. Log aponta falhas no smoke de retorno de estudo e nos controles da barra da Bíblia; não é evidência de falha no novo teste Conexo da #157.
- Run #505 / PR #203: etapa de autenticação passou, mas a suíte crítica falhou. Um dos erros observados na versão antiga do teste esperava `/login?next=` enquanto a aplicação permaneceu em `/diario`; os demais fluxos autenticados expiraram esperando redirecionamento. A alteração da #203 é somente no teste e não corrige a proteção de rota.
- Workflow atual em `main` usa `npm run test:e2e:public` (desktop e mobile) e suíte autenticada separada em main; o workflow antigo proposto em #166 não deve substituir essa configuração.


### Atualização da PR #219 — cobertura desktop/mobile
- O teste de regressão Conexo foi movido da spec autenticada para `e2e/estudar-public-smoke.spec.ts`, pois o workflow de PR executa a suíte pública nos projetos desktop e mobile; a suíte autenticada é executada somente em main/dispatch.
- Novo SHA da PR #219: `23dc05b7eb550e50aab632b13db957d2bf521d93`.
- Commit intermediário da spec crítica: `48cae267037bd08d5c059ad8660e5616b680fa14`.
- Após a atualização, a PR continua aberta e mergeable. Nenhum workflow run/status foi retornado ainda para o novo SHA; aguardar disparo/execução antes de qualquer merge.

### PR #220 — consolidação visual isolada da #163
- Branch: `ops/closeout-magisterium-theme-ui-163`
- SHA final: `43d62cc3fb6727c9a0fecc093a20e947d8885ea3`
- Arquivos: `src/components/cathedra/Magisterium.tsx`, `e2e/estudar-public-smoke.spec.ts`.
- Implementação: categorias em navegação horizontal editorial com estado acessível; temas em cartões responsivos com contagem de documentos e seleção múltipla.
- Teste: categoria Encíclicas, estado `aria-pressed`, grupo acessível de temas, contagem e alternância.
- PR: https://github.com/cathedradigital/cathedradigital/pull/220
- PR #163 comentada com referência à #220; continua aberta até validação e integração.
- Estado observado na criação: mergeable=true; ainda sem workflow runs retornados para o SHA. Não fazer merge até CI, auditoria e E2E desktop/mobile concluírem verdes.
