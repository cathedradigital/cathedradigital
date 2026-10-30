# Segurança — Cátedra Digital

**Escopo:** aplicação web, Cloudflare Workers, Supabase, Edge Functions, dados pessoais e cadeia de entrega.  
**Status:** política e roteiro de auditoria; não é certificado de segurança.

## 1. Princípios

- Um único projeto Supabase para a Cátedra Digital.
- Menor privilégio em todos os ambientes e integrações.
- Autenticação não substitui autorização.
- Guards de frontend melhoram a experiência, mas não protegem dados por si sós.
- Dados privados devem ser isolados no backend e por RLS.
- Nenhum segredo em código, bundle, logs, artefatos ou documentação.

## 2. Fronteiras de confiança

1. Navegador: ambiente não confiável; qualquer entrada e estado local podem ser manipulados.
2. Cloudflare Worker: runtime server-side; segredos de servidor só podem existir aqui quando necessários.
3. Supabase Auth: identidade e sessão; validar claims e expiração no backend.
4. PostgreSQL/RLS: fronteira de autorização dos dados; políticas devem restringir cada operação.
5. Edge Functions: validar método, autenticação, autorização, entrada, origem e limites conforme o endpoint.

## 3. Supabase e RLS

Auditar cada tabela, view, função RPC e operação de storage utilizada pelo produto. Para cada objeto, registrar:

- se contém dados públicos, pessoais ou administrativos;
- roles que podem executar SELECT/INSERT/UPDATE/DELETE;
- policy efetiva e condição de propriedade;
- grants e funções privilegiadas;
- comportamento com usuário anônimo e usuário autenticado;
- teste positivo e negativo.

Para dados pessoais, o usuário não pode escolher livremente o `user_id` que autoriza a operação. A identidade deve ser derivada da sessão validada no servidor ou protegida por policy que compare com `auth.uid()`.

Executar teste de isolamento com duas contas de teste autorizadas: cada conta só pode ler e alterar os próprios dados. Não usar dados pessoais reais como fixture.

## 4. Edge Functions

A configuração versionada em `supabase/config.toml` declara as funções `logos-ai`, `corpus-ingest`, `bible-text`, `vatican-document` e `source-sync`. A configuração de `verify_jwt` deve ser lida função por função; quando o gateway não exige JWT, a implementação precisa aplicar os controles próprios adequados à exposição pública.

A função pública `bible-text` é somente leitura: consultas ao corpus usam a chave anônima e as políticas RLS públicas. A gravação do corpus fica no fluxo `source-sync`, que valida o token OIDC do GitHub e restringe o `ref` a `main` antes de usar service role.

Para cada função, verificar:

- método e formato de entrada;
- autenticação e autorização;
- validação de payload e limites;
- CORS e origens permitidas;
- rate limiting/abuso e custo;
- uso de secrets apenas no servidor;
- mensagens de erro sem vazamento;
- logs sem tokens, senhas ou conteúdo privado;
- testes positivos, negativos e de abuso.

## 5. Segredos e configuração

- Nunca versionar `.env` real, service-role key, senha, token, cookie ou chave privada.
- `.env.example` contém apenas nomes e placeholders.
- Chaves publicáveis do Supabase podem estar no cliente; nunca tratá-las como segredo nem confundi-las com service-role keys.
- Conferir variáveis usadas pelo build e pelo runtime sem imprimir valores.
- Se houver exposição confirmada de credencial privada, revogar/rotacionar no provedor e avaliar histórico Git.

## 6. Cloudflare e CI

- Restringir permissões dos workflows ao mínimo necessário.
- Proteger secrets de deploy e ambientes.
- Fixar a publicação no SHA aprovado.
- Guardar relatórios de auditoria e artefatos de teste sanitizados.
- Não publicar quando CI, auditoria ou E2E crítico estiverem pendentes ou reprovados.
- Não aceitar HTTP 403 como prova de que a interface correta está funcionando.

## 7. Critério de aprovação

Uma revisão só pode ser marcada como aprovada quando houver:

- inventário de objetos e funções examinados;
- políticas efetivas e testes negativos;
- isolamento entre contas demonstrado;
- inspeção de secrets e artefatos;
- relatório de dependências;
- SHA, ambiente, logs e evidências reproduzíveis.

Achados não testados permanecem **não verificados**. Esta documentação não afirma que o projeto remoto já passou por todos esses controles.
