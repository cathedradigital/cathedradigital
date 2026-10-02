# Publicação do Cátedra no Cloudflare Workers

## Objetivo

Usar o mesmo repositório GitHub como fonte única e publicar o Cátedra no Cloudflare Workers para termos uma segunda URL de visualização enquanto o Vercel estiver sujeito ao limite de build.

O Cátedra usa TanStack Start com SSR, portanto a publicação deve ser feita como **Cloudflare Worker**, não como um site estático simples.

## Conexão GitHub → Cloudflare

1. Abrir o painel da Cloudflare.
2. Entrar em **Workers & Pages**.
3. Selecionar **Create application**.
4. Escolher **Import a repository**.
5. Autorizar a conta/organização GitHub quando solicitado.
6. Selecionar `cathedradigital/digital-cathedral`.
7. Escolher a branch `main` como produção.
8. Salvar e fazer o primeiro deploy.
9. Confirmar a URL `workers.dev` gerada.
10. Depois, em **Settings → Builds**, conferir se o repositório está conectado.

A integração do Cloudflare pode criar builds automaticamente a cada push e também publicar URLs de Preview para branches/PRs.

## Configuração do projeto

A documentação atual do Cloudflare possui autoconfiguração para projetos existentes. Como o repositório ainda não contém `wrangler.jsonc`, é preferível deixar o primeiro import gerar a configuração oficial e o PR correspondente, em vez de criar manualmente uma configuração incompleta.

Depois do PR de autoconfiguração:

- revisar o `wrangler.jsonc`;
- conferir o nome do Worker;
- conferir `compatibility_date`;
- conferir `nodejs_compat`;
- conferir o plugin do Cloudflare no Vite;
- executar a validação/build;
- só então mesclar.

## Regra de publicação do Cátedra

GitHub = fonte única do código.

Vercel = produção atual.

Cloudflare = segunda publicação/visualização e previews.

Não serão mantidas duas versões de código.

## Auditoria

As correções funcionais continuam sendo feitas no GitHub. O Cloudflare só passa a publicar o estado consolidado quando a integração estiver autorizada e o primeiro build estiver validado.


## Deploy automático pelo GitHub Actions

O repositório agora possui o workflow `.github/workflows/cloudflare-deploy.yml`.

- Pull requests continuam usando o workflow de qualidade para validar o código, sem publicar.
- Cada push/merge em `main` executa as validações e, somente depois, publica o Worker no Cloudflare.
- Execuções concorrentes de produção são canceladas para evitar builds/deploys duplicados.
- O workflow não contém credenciais no código.

### Credenciais necessárias uma única vez

Em **GitHub → Settings → Secrets and variables → Actions**, cadastrar:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

O token deve ter apenas as permissões necessárias para publicar Workers. Nunca colocar o token em arquivos, commits ou variáveis públicas.

### Proteção de custo durante o desenvolvimento

A publicação automática fica limitada a `main`; PRs não fazem deploy. Como o repositório é público, os runners padrão do GitHub Actions não consomem a franquia mensal de minutos da conta. No Cloudflare Workers Free, o limite atual é de 100.000 requisições por dia; ultrapassar o limite do plano Free faz as operações falharem, em vez de gerar cobrança por excesso. Antes de habilitar qualquer plano pago, manteremos o projeto no Free enquanto o Cátedra estiver em desenvolvimento.
