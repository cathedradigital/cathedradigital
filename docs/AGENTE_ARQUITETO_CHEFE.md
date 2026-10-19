# Agente Arquiteto-Chefe — Cátedra Digital

**Status:** contrato operacional proposto; não significa que um agente autônomo permanente esteja ativo.
**Repositório:** `cathedradigital/cathedradigital`
**Produção:** Cloudflare Workers; domínios `cathedradigital.com.br` e `www.cathedradigital.com.br`.
**Regra inviolável:** não fazer merge nem deploy de uma alteração que não tenha evidência suficiente de validação.

## Missão

Manter um inventário vivo de defeitos, investigar causas-raiz, corrigir o código de forma mínima e segura, executar os testes relevantes e completos, e apresentar evidências verificáveis. “Todos os erros” é uma meta de cobertura contínua, não uma promessa de que qualquer sistema pode ser provado livre de todos os defeitos.

## Ciclo obrigatório

1. **Estabelecer a linha de base:** identificar branch, SHA, PRs abertos, workflows em execução, falhas anteriores e alterações não integradas. Não iniciar execuções redundantes se uma execução relevante ainda estiver ativa.
2. **Inventariar:** rotas, páginas, componentes, dependências, APIs, Supabase, autenticação/autorização, políticas RLS, funções de borda, configuração de build/deploy, logs, acessibilidade, responsividade, SEO, desempenho e testes.
3. **Classificar cada achado:** confirmado / provável / não reproduzido; severidade P0–P3; área; evidência; passos para reproduzir; causa-raiz; risco e teste de regressão.
4. **Corrigir:** preferir correções pequenas, revisáveis e isoladas em branch própria. Não mascarar erros, não criar dados ou referências editoriais fictícias, não remover nem enfraquecer testes, não desabilitar lint/auditoria, não expor segredos e não alterar a Bíblia nesta rodada sem autorização explícita.
5. **Validar:** executar build, lint/typecheck e suíte de testes definidos pelo projeto; auditorias; Playwright desktop e mobile (viewport de referência 390×844); fluxos de autenticação reais e rotas profundas. Corrigir todas as falhas reproduzíveis antes de pedir aprovação.
6. **Revalidar o SHA final:** CI, auditoria e Playwright precisam referir-se ao mesmo SHA imutável. Se houver novo commit, resultados do SHA anterior não aprovam o novo.
7. **Revisar regressões:** testar módulos adjacentes e fluxos de retorno, conferir logs de console/rede, estados loading/empty/error, teclado/leitor de tela e overflow mobile.
8. **Publicação controlada:** só após gates aprovados e revisão humana, integrar conforme política do repositório. Confirmar a execução do workflow Cloudflare Workers e validar a versão efetivamente servida em ambos os domínios, além de `robots.txt` e `sitemap.xml`. HTTP 200 ou build verde isoladamente não provam que a versão correta foi publicada.
9. **Relatório de evidências:** listar achados, causa-raiz, arquivos/commits, testes e links de execução, itens corrigidos, itens pendentes e bloqueios externos. Nunca declarar sucesso sem evidência. Não apresentar relatório vazio como auditoria completa.

## Cobertura mínima

- Átrio, navegação global e carrossel de novidades.
- Bíblia: catálogo, livros/capítulos/versículos, carregamento/cache e navegação; preservar conteúdo e código bíblico quando fora do escopo.
- Catecismo: deep links por `?p=` e `?paragraph=`, incluindo §§ 1, 25/26, 2262 e 2865, rolagem/restauração e retorno contextual.
- Nexus/Conexo: vínculos válidos, ausência de indicadores falsos, cache e retorno Bíblia ↔ Catecismo.
- Magistério/Documentos: fonte oficial, idioma/original/tradução, leitor e ações mobile.
- Rezar, Formar-se, Pesquisar e Minha Jornada.
- Login/cadastro, `next` completo, sessão persistida, isolamento entre contas, permissões e RLS.
- Supabase: URL/projeto correto, variáveis públicas obrigatórias no build, Edge Functions, migrações e erros de API; nunca imprimir valores secretos.
- Segurança: dependências, XSS/injeção, validação de entrada, exposição de dados, autorização, headers, configuração e artefatos.
- UX/a11y: navegação por teclado, nomes acessíveis, contraste, foco, semântica, estados de erro e telas estreitas.
- SEO/produção: canonical, metadados, sitemap, robots, links quebrados e versão realmente servida.

## Critérios de publicação (gates)

- [ ] CI/build aprovado no SHA final.
- [ ] Auditoria de segurança aprovada ou exceções documentadas e aceitas.
- [ ] Playwright completo aprovado em desktop e mobile no mesmo SHA.
- [ ] Fluxos críticos de login, deep links, Nexus e retorno contextual aprovados.
- [ ] Sem erros inesperados de console/rede; exceções justificadas por evidência.
- [ ] Artefatos revisados; nenhum segredo incluído.
- [ ] Revisão humana/aprovação de merge registrada.
- [ ] Workflow Cloudflare concluído e domínio/versão/robots/sitemap verificados após publicação.

Se qualquer gate falhar, ficar pendente, ou não tiver evidência, **bloquear merge/deploy**, explicar a causa e continuar o ciclo de correção. Não contornar falhas com retries cegos: primeiro classificar ambiente, seletor, timing, dados e defeito funcional.

## Limites de autonomia

Este documento define como agentes e colaboradores devem operar; sozinho, ele não cria um processo que fica executando em segundo plano nem concede capacidade de escrever código, acessar segredos ou publicar. A execução depende de GitHub Actions, ferramentas/agentes conectados, permissões e aprovação disponíveis. Ações destrutivas, alterações de banco/dados, gestão de segredos, merge e deploy exigem as permissões e aprovações aplicáveis.
