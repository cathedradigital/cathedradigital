# Estudar — E2E mínimo de fechamento

Este caminho existe exclusivamente para validar o PR antes do merge. Ele não cria preview de produção, não altera main e não deixa infraestrutura persistente.

## Execução

O workflow `.github/workflows/estudar-e2e.yml` faz checkout do HEAD do PR, instala as dependências existentes, instala `@playwright/test` somente no runner CI (`--no-save`), instala apenas Chromium, executa o build e sobe `vite preview` localmente no próprio runner. Depois executa os fluxos críticos e publica apenas os artefatos de evidência por 7 dias.

## Segredos necessários

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `E2E_TEST_EMAIL`
- `E2E_TEST_PASSWORD`

`E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD` devem ser de uma conta de teste real, separada de contas pessoais e sem privilégios administrativos.

Se não existir uma conta premium real, o fluxo premium permanece bloqueado e nenhuma conta é criada automaticamente.

## Cobertura

- login → rota protegida → retorno;
- Bíblia → anotação → Diário → contexto exato;
- Catecismo → anotação → Diário → parágrafo;
- Magistério → anotação → documento/parágrafo;
- reload + back + forward;
- console e respostas HTTP 404/5xx;
- mobile 390px no fluxo crítico;
- screenshots/traces somente em falhas.

O workflow é acionado somente em PR para `main` ou manualmente. Não há deploy, cron ou monitoramento permanente.