# Estudar — E2E mínimo de fechamento

Este caminho valida o PR antes do merge e a versão de `main` após integração. Em PR, testa o HEAD do PR sem secrets de autenticação; em `main`, valida o código confiável e executa a suíte autenticada. Não cria preview de produção nem deixa infraestrutura persistente.

## Execução

O workflow `.github/workflows/estudar-e2e.yml` faz checkout do HEAD do PR na validação de PR e checkout de `main` confiável na execução pós-merge. Instala as dependências, instala Chromium, valida a configuração Supabase, executa o build e sobe `vite preview` localmente no runner. A suíte autenticada só recebe secrets nos passos protegidos de `main`; a evidência publicada é sanitizada e retida por 7 dias.

## Segredos necessários

- `VITE_SUPABASE_PROJECT_ID` (explicit build target, sourced from `.env.production`)
- `VITE_SUPABASE_URL` (must match the project ID)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (must match `publicConfig.ts`; publishable key only)
- `E2E_TEST_EMAIL`
- `E2E_TEST_PASSWORD`

`E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD` devem ser de uma conta de teste real, separada de contas pessoais e sem privilégios administrativos.

Antes de compilar, o workflow valida Project ID, URL e chave publicável contra `src/integrations/supabase/publicConfig.ts`; divergências bloqueiam o build sem imprimir a chave. Os secrets E2E precisam autenticar uma conta de teste já existente no mesmo projeto oficial comprovado.

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

O workflow roda em PR para `main`, em `push` para `main` e por `workflow_dispatch`. Em PR, executa apenas a suíte pública; em `main`, executa a suíte pública e a autenticada com os secrets E2E. No disparo manual, a suíte autenticada exige `run_authenticated=true`. O workflow não faz deploy nem cria cron ou monitoramento permanente.