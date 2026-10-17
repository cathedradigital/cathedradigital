---
name: e2e-playwright-diagnostics
description: Use when diagnosing slow or failing Playwright E2E runs, CI timeouts, flaky selectors, auth/session issues, or missing test artifacts in Cátedra Digital.
---

# Skill: diagnóstico E2E Playwright — Cátedra Digital

## Objetivo
Encontrar a causa-raiz e tornar a execução previsível sem perder cobertura funcional, desktop/mobile ou autenticação real.

## Procedimento obrigatório
1. **Fixar a evidência:** anotar workflow run, job, SHA, duração, status final, número de testes passados/falhos e tamanho/nome dos artefatos.
2. **Ler os logs completos:** distinguir falha de build/setup, timeout global, timeout de ação, assertion failure, strict-mode/locator ambiguity, HTTP/console error e retry.
3. **Inspecionar evidências por teste:** abrir `error-context.md`, screenshot e trace; usar vídeo se o trace não explicar a transição. Não inferir causa apenas pelo título do teste.
4. **Agrupar por causa provável:** navegação/deep-link; carregamento/estado assíncrono; auth/redirect; persistência/Diário; locator ambíguo; mobile/layout; infraestrutura/setup.
5. **Propor uma hipótese por vez:** descrever a evidência que a sustenta e a menor verificação que a pode confirmar ou refutar.
6. **TDD:** quando possível, reproduzir a falha antes da correção; manter o comportamento exigido pelos asserts originais.
7. **Medir:** registrar duração total e por teste antes/depois, retries, testes passados/falhos e artefatos.
8. **Revalidar:** executar teste focal, suíte crítica, build/typecheck e os checks relevantes no SHA final.
9. **Entregar relatório:** listar causa confirmada versus hipótese ainda não confirmada, arquivos alterados, commit/PR e evidências.

## Proibições
- Não usar `test.skip`, `fixme`, `|| true`, `continue-on-error` ou remoção de asserts como atalho.
- Não aumentar timeouts para esconder uma espera sem investigar o locator/estado que a provoca.
- Não ativar sharding/mais workers antes de comprovar isolamento de sessão, dados e fixtures.
- Não alterar código da Bíblia nesta tarefa de diagnóstico da issue #173.
- Não alterar credenciais de E2E sem evidência.
- Não fazer merge/deploy nem declarar a produção validada.

## Sinais já observados na execução 38501621497
O job terminou em 18,3 min com 10 testes aprovados e 11 falhas. Build, setup e verificação de presença dos secrets passaram. O log contém falhas em deep-link da Bíblia, ações do Diário, navegação/busca do Catecismo e dois locators ambíguos. Tratar esta lista como evidência inicial; confirmar cada causa nos traces antes de corrigir.
