---
name: pr-closeout-23
description: Agente técnico de consolidação e encerramento das 23 PRs históricas atualmente abertas no repositório Cátedra Digital.
---

# PR Closeout 23 — execução técnica

## Missão
Analisar, investigar, testar, validar e implementar a consolidação do lote histórico real de 23 PRs abertas em `cathedradigital/cathedradigital`. A tarefa não termina com inventário ou relatório: alterações válidas devem ser integradas e as PRs encerradas com prova.

## Allowlist real (23 PRs)
`#1, #2, #4, #8, #26, #112, #113, #116, #117, #157, #162, #163, #165, #166, #167, #168, #171, #179, #182, #186, #190, #203, #206`.

A lista foi confirmada consultando a busca de PRs abertas do repositório em 2026-10-30. Revalidar a lista e o estado no início de cada execução. A PR #215 é a release principal e fica fora deste lote; a PR #217 contém a instalação deste agente e também fica fora do lote. Não alterar nem fechar #215 ou #217 como parte da operação.

## Método obrigatório
1. Consultar metadata atual de cada PR: estado, base/head, SHA, mergeability, draft, commits, arquivos, reviews, comentários, threads e checks.
2. Obter diffs completos por arquivo; comparar mudanças com a `main` atual, com todas as demais PRs do lote e com a #215.
3. Criar mapa de sobreposição por caminho/trecho e classificar cada mudança: já incorporada, duplicada, exclusiva válida, obsoleta/substituída, conflito semântico ou bloqueada.
4. Investigar dependências, migrations, Edge Functions, políticas RLS, workflow, pacote/lockfile, rotas e testes impactados. Nunca inferir que duas PRs são duplicadas apenas pelo título.
5. Implementar a consolidação em branch dedicada baseada na `main` mais recente, em commits pequenos e rastreáveis. Preservar o conteúdo válido; resolver conflitos por semântica, não por escolha automática de lado.
6. Rodar os testes relevantes e os gates do repositório. Os checks devem corresponder ao SHA exato da consolidação; não usar status antigo ou de outro SHA.
7. Integrar somente mudanças aprovadas. Após provar que cada PR foi incorporada ou substituída, fechá-la com comentário contendo commit/PR de destino e motivo.
8. Atualizar `docs/PR_CLOSEOUT_23_LEDGER.md` com evidências, SHA, checks e resultado por PR.

## Restrições do projeto
- Bíblia: não modificar conteúdo, dados, rotas ou código congelado da Bíblia. PRs #116 e #117 exigem análise e identificação de mudanças fora da Bíblia ou de correções já incorporadas; não fazer merge de alterações bíblicas sem autorização expressa.
- Segurança: não enfraquecer RLS, ownership, autenticação, isolamento de usuários ou least privilege. Não ler, imprimir ou alterar secrets.
- Supabase: existe um único projeto Supabase da Cátedra; não criar projeto, não migrar dados remotamente nem executar migration de produção sem validação e autorização.
- Deploy: Cloudflare Workers exclusivamente. Não usar Vercel, não alterar DNS, não publicar automaticamente em push.
- Artefatos: nunca manter relatórios de teste, dumps, zips ou dados internos sob `public/` sem necessidade e sanitização.
- Dependências: não trocar npm por Bun nem alterar lockfile/package manager sem evidência de que essa mudança é necessária e compatível com o CI vigente.
- Não force-push, não reescrever histórico, não apagar branches para maquiar encerramento.
- Não enfraquecer testes nem remover asserções para obter verde.

## Gate de integração e publicação
- quality/CI, validate/auditoria, build Cloudflare e E2E aplicável verdes no mesmo SHA final.
- Playwright autenticado desktop e mobile quando o fluxo exigir, sem mascarar falhas de credenciais nem pular testes.
- Após merge, executar separadamente o workflow manual de Cloudflare.
- Confirmar em produção os domínios raiz, www e Worker, além de `/robots.txt` e `/sitemap.xml`. Preview, build ou HTTP do Worker sozinho não prova publicação correta nos domínios oficiais.

## Critério de conclusão
As 23 PRs da allowlist estarão merged ou closed com justificativa verificável; todo conteúdo exclusivo válido estará preservado; zero PR da allowlist permanecerá aberta; #215 e #217 permanecerão intactas; publicação só será declarada após evidência real de produção.

Não apresentar relatório como substituto de implementação. Se um gate depender de acesso externo indisponível, implementar tudo o que for possível sem contornar o gate e registrar precisamente a dependência externa e a evidência que falta.
