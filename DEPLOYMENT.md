# Cátedra Digital — Deployment & Operations Guide

## Cloudflare Workers — produção

A implantação atual usa **TanStack Start + Cloudflare Vite Plugin + Wrangler**. O fluxo de produção não usa Nitro nem `.output/server/`.

### Build local

```bash
npm install
npm run build
```

O build deve terminar sem erros antes da publicação.

### Deploy local/manual

```bash
npm run deploy:cloudflare
```

ou:

```bash
npm run build
npx wrangler deploy
```

O `wrangler.jsonc` na raiz é a configuração de publicação do Worker.

---

## Cloudflare Workers Builds

Para o Worker **cathedradigital**, a configuração do serviço deve apontar para:

- **Repository:** `cathedradigital/cathedradigital`
- **Production branch:** `main`
- **Root directory:** raiz do repositório
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`

O deploy command deve publicar o Worker usando o `wrangler.jsonc` da raiz.

> Importante: não use `npx nitro deploy --prebuilt` nem `wrangler deploy .output/server/`. Esses comandos pertencem a uma configuração anterior e não correspondem à configuração atual do projeto.

---

## URLs de produção

Após uma publicação válida, verificar:

- Worker: `cathedradigital`
- workers.dev: `https://cathedradigital.cathedradigital.workers.dev/`
- domínio: `https://cathedradigital.com.br/`
- www: `https://www.cathedradigital.com.br/`

Se o workers.dev retornar 404 ou a página de erro da plataforma, primeiro verificar o **último deployment/build do Worker** no Cloudflare antes de investigar Supabase.

---

## Configuração do Worker

O arquivo `wrangler.jsonc` deve permanecer na raiz e define:

- nome do Worker;
- compatibility date;
- `nodejs_compat`;
- entrypoint do TanStack Start;
- workers.dev;
- preview URLs;
- domínios de produção;
- observabilidade.

A configuração atual usa o entrypoint oficial do TanStack Start:

```json
"main": "@tanstack/react-start/server-entry"
```

---

## Variáveis de ambiente

As variáveis necessárias ao runtime devem ser configuradas no Cloudflare conforme o ambiente.

Nunca colocar chaves privadas, tokens de serviço ou segredos diretamente no código-fonte ou neste documento.

Variáveis públicas do cliente devem ser tratadas como públicas. Segredos de servidor devem permanecer somente no ambiente do Worker.

---

## Checklist antes da publicação

### Código
- [ ] `npm install` concluído
- [ ] `npm run build` concluído
- [ ] TypeScript sem erros
- [ ] validações internas sem erros
- [ ] configuração `wrangler.jsonc` presente na raiz

### Cloudflare
- [ ] Worker conectado ao repositório correto
- [ ] branch `main`
- [ ] root directory na raiz
- [ ] build command `npm run build`
- [ ] deploy command `npx wrangler deploy`
- [ ] último deployment concluído com sucesso
- [ ] workers.dev respondendo
- [ ] domínio personalizado respondendo

### Runtime
- [ ] aplicação inicia sem exceção no Worker
- [ ] rotas principais carregam
- [ ] assets estáticos carregam
- [ ] autenticação é testável
- [ ] conexão com Supabase é testável

---

## Verificação pós-deploy

Primeiro teste o Worker:

```bash
curl -I https://cathedradigital.cathedradigital.workers.dev/
```

Depois teste o domínio:

```bash
curl -I https://cathedradigital.com.br/
```

Se houver erro:

1. abrir o último build/deployment no Cloudflare;
2. conferir o **Build log**;
3. conferir o **Deploy log**;
4. conferir os logs do Worker;
5. só depois investigar dependências externas.

---

## Troubleshooting

### Build falhou

Executar localmente:

```bash
rm -rf node_modules
npm install
npm run build
```

Se o build local passar e o Cloudflare falhar, comparar:

- versão do Node;
- diretório raiz;
- comando de build;
- comando de deploy;
- variáveis de build;
- versão do Wrangler.

### Deploy terminou, mas workers.dev não abre

Verificar:

1. se existe um deployment publicado;
2. se o deployment corresponde ao commit mais recente da `main`;
3. se o Worker possui o nome `cathedradigital`;
4. se o workers.dev está habilitado;
5. se o log do Worker mostra exceção durante o startup;
6. se o domínio está apontando para o Worker correto.

### 404

Um 404 no workers.dev não deve ser tratado automaticamente como problema do React. Primeiro confirmar no Cloudflare se o Worker está efetivamente publicado e se a requisição está chegando ao Worker.

### Erro durante startup

Verificar especialmente código executado durante SSR/startup que dependa de APIs exclusivas do navegador, como `window`, `document`, `localStorage`, `navigator` ou `sessionStorage`.

Essas APIs só devem ser acessadas quando o código estiver rodando no navegador.

---

## Supabase

Supabase é uma dependência da aplicação, mas a primeira etapa da recuperação do deploy é fazer o Worker abrir corretamente.

Ordem de diagnóstico:

**GitHub → Workers Build → Deploy → Worker runtime → workers.dev → domínio → Supabase**

Não usar um erro do Supabase para mascarar uma falha de publicação do Worker.

---

## Rollback

Para voltar a um commit conhecido e funcional, use o histórico do GitHub/Cloudflare e publique novamente o commit desejado.

Não use comandos Nitro ou o diretório `.output/server/` para rollback deste projeto.

---

## Referências

- Cloudflare Workers / Wrangler: https://developers.cloudflare.com/workers/
- Cloudflare Vite Plugin: https://developers.cloudflare.com/workers/vite-plugin/
- TanStack Start: https://tanstack.com/start
- Supabase: https://supabase.com/docs

---

## Regra operacional

Para este projeto, a publicação Cloudflare deve seguir uma única cadeia:

```text
GitHub main
   ↓
Cloudflare Workers Builds
   ↓
npm run build
   ↓
npx wrangler deploy
   ↓
Worker cathedradigital
   ↓
workers.dev
   ↓
cathedradigital.com.br
```

Se essa cadeia quebrar, corrigir o ponto exato da quebra antes de alterar módulos da aplicação.
