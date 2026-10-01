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
