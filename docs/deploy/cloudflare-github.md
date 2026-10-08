# Publicação do Cátedra no Cloudflare Workers

## Fonte única de verdade

O repositório oficial é `cathedradigital/cathedradigital`.

A cadeia oficial é:

**GitHub `main` → GitHub Actions → build/validação → Cloudflare Worker → domínios oficiais**

Não manter uma segunda publicação de produção em Vercel nem uma cadeia paralela de código.

## Worker e domínios

O projeto usa TanStack Start com SSR e o plugin oficial do Cloudflare para Vite. A configuração de produção está em `wrangler.jsonc`.

Domínios que devem ser validados após cada publicação:

- `https://cathedradigital.com.br`
- `https://www.cathedradigital.com.br`
- `https://cathedradigital.cathedradigital.workers.dev`

## Deploy automático pelo GitHub Actions

O workflow `.github/workflows/cloudflare-deploy.yml` publica somente após as validações.

- Pull requests validam o código, sem deploy de produção.
- Push/merge em `main` executa typecheck, lint, links, build e deploy.
- Execuções concorrentes de produção são canceladas para evitar deploys duplicados.
- Credenciais ficam somente nos GitHub Secrets.

### Credenciais

Em **GitHub → Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Nunca colocar credenciais em arquivos, commits, logs ou variáveis públicas.

## Regra operacional

Uma alteração só é considerada entregue quando:

1. está no `main`;
2. o build passa;
3. o Worker é publicado;
4. as três URLs acima são verificadas;
5. o fluxo crítico alterado é validado em produção.

Se algum estágio falhar, a entrega fica **bloqueada**, e o próximo passo deve tratar a falha antes de declarar a funcionalidade pronta.
