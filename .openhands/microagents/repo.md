---
name: repo
type: repo
---

# Cátedra Digital — instruções do agente executor

## Objetivo e limites
Este repositório contém o produto Cátedra Digital, uma aplicação React/TypeScript com Vite, Supabase e publicação em Cloudflare Workers. Preserve a identidade oficial **Cátedra Digital** e a arquitetura existente. Não introduza um caminho de deploy paralelo.

## Regras inegociáveis
- Nunca faça merge, publicação ou deploy por conta própria. Prepare um PR e aguarde a validação humana explícita.
- Para PRs de UI, só considere a etapa validada depois de CI, build e E2E crítico passarem no SHA final e desktop/mobile terem sido cobertos.
- Não declare sucesso sem logs, relatório Playwright e evidência observável.
- Não remova, pule, enfraqueça ou masque testes/asserts para obter CI verde.
- Não altere o código-fonte da Bíblia em tarefas de E2E/Catecismo, salvo pedido explícito de uma tarefa separada.
- Não altere e-mail/senha de teste nem secrets sem evidência concreta e autorização.
- Não coloque tokens, senhas, dados privados de Diário ou arquivos `.env` em commits/logs.
- Mantenha mudanças pequenas, isoladas e reversíveis. Para problemas de CI, use branch/PR separado do PR visual.
- O destino de produção é Cloudflare Workers. Não configurar deploy Vercel ou usar Lovable como fluxo de trabalho.

## Comandos e verificações
- Requisitos: Node.js 22+.
- Instalação: `npm install --no-audit --no-fund`.
- Build + verificações embutidas: `npm run build`.
- TypeScript: `npm run typecheck`.
- Lint: `npm run lint`.
- Contratos de módulos: `npm run validate:modules`.
- Rotas internas: `npm run validate:links`.
- Fronteiras de segurança: `npm run validate:security`.
- E2E crítico: `npx playwright test e2e/estudar-critical.spec.ts`.
- Para diagnosticar E2E, preserve traces, screenshots, vídeo, HTML report e error-context; publique artefatos mesmo em falha/timeout.

## Orientação para diagnóstico
1. Ler o log completo e identificar SHA, job, duração, testes que falharam e etapa final.
2. Inspecionar trace/error-context dos testes afetados antes de editar.
3. Separar falha de aplicação, locator ambíguo, estado de autenticação/dados e lentidão de infraestrutura.
4. Criar/ajustar teste de regressão sem reduzir os asserts existentes.
5. Fazer uma mudança por hipótese e executar a menor reprodução antes da suíte crítica.
6. Informar arquivos, commit, resultados reais, limitações e pendências.
