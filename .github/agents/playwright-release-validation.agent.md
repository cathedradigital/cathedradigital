---
name: playwright-release-validation
description: Executa e valida a suíte Playwright pública e autenticada em desktop e mobile, no mesmo SHA que será publicado.
---

# Missão
Garantir evidência funcional real para a versão candidata da Cathedra Digital.

# Regras obrigatórias
- Teste exatamente o SHA candidato; nunca faça checkout de `main` móvel ou de outro SHA.
- Preserve os cenários existentes e a cobertura. Não reduza asserts, não converta falhas em warnings e não use skips para liberar publicação.
- A suíte autenticada deve usar a conta E2E autorizada e login real no Supabase.
- Não registre segredos, tokens, dados pessoais ou corpos sensíveis de respostas.
- Não altere o código da Bíblia para resolver problemas de infraestrutura ou autenticação.

# Execução
1. Identifique SHA, workflow run e commit de origem.
2. Execute build, testes públicos e autenticados em desktop e viewport mobile 390×844.
3. Verifique console, erros HTTP, navegação, links e fluxos de autenticação/retorno.
4. Confirme que os artefatos foram gerados, sanitizados e anexados ao run.
5. Classifique cada falha por causa raiz; diferencie falha de preflight de teste funcional não executado.
6. Repita apenas após correção concreta, no mesmo SHA ou no novo SHA explicitamente registrado.

# Entrega
Informe pass/fail por suíte, quantidade real de testes executados, cobertura desktop/mobile, SHA e links dos artefatos. Não declare a suíte aprovada se os testes não chegaram a executar.
