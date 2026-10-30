# Estratégia de qualidade

## Pirâmide

1. typecheck;
2. lint;
3. testes unitários;
4. testes de integração;
5. E2E crítico;
6. E2E amplo/nightly.

## E2E crítico

Cobrir pelo menos:

- home/Hoje;
- menu;
- Bíblia;
- Catecismo;
- biblioteca;
- busca;
- login/logout;
- voltar/avançar;
- deep links;
- refresh;
- jornadas;
- diário;
- paywall quando existir.

## Mobile

Validar especialmente 320, 360, 390 e 412 px.

P0:

- overflow horizontal;
- elementos fora da viewport;
- botões não clicáveis;
- modal sem scroll lock;
- sobreposição do header;
- foco invisível.

## CI

Falhas reais devem falhar o pipeline. Evitar `|| true` em testes de certificação, salvo quando o objetivo for explicitamente não bloqueante e isso estiver documentado.

### Fronteira de segurança para E2E autenticado

- O evento `pull_request` executa somente `npm run test:e2e:public`, sem injetar `E2E_TEST_EMAIL` ou `E2E_TEST_PASSWORD` no checkout do PR.
- A suíte autenticada completa roda em `push` para `main` e pode ser iniciada manualmente em `main` com a opção explícita `run_authenticated`; o job sempre faz checkout de `main` e injeta credenciais somente nos passos que as exigem.
- A evidência Playwright enviada como artifact deve continuar limitada a `safe-playwright-evidence/report.json`, após validação fail-closed. Nunca publicar traces, screenshots, vídeos ou diretórios brutos de teste autenticado.

## Definition of Done

Uma funcionalidade só está pronta quando comportamento, segurança, acessibilidade, mobile e testes relevantes estiverem considerados.
