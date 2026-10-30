# Cátedra Digital — publicação e operação

**Alvo oficial:** Cloudflare Workers  
**Worker:** `cathedradigital`  
**Repositório:** `cathedradigital/cathedradigital`  
**Branch de produção:** `main`

## 1. Arquitetura de publicação

O projeto utiliza TanStack Start, Vite, Cloudflare Vite Plugin e Wrangler. A configuração versionada está em `wrangler.jsonc`, na raiz, com entrypoint `src/server.ts`.

A cadeia oficial é:

```text
GitHub
  └─ main / SHA candidato
       ↓
GitHub Actions — workflow Cloudflare
       ↓
Node.js 22 + npm install
       ↓
typecheck → lint → validate:links → build
       ↓
Wrangler / Cloudflare Workers
       ↓
Worker cathedradigital
       ↓
workers.dev + domínios oficiais
```

Vercel e Lovable não são alvos oficiais de produção. Não criar uma segunda cadeia de publicação.

## 2. Comportamento atualmente versionado

O arquivo `.github/workflows/cloudflare-deploy.yml` em `main` declara:
- disparo por push em `main` e execução manual (`workflow_dispatch`);
- validação da presença das credenciais Cloudflare;
- instalação com `npm install`;
- validação de autorização com Wrangler;
- consulta DNS;
- typecheck, lint, validação de rotas e build;
- deploy do Worker;
- checagem dos três endpoints.

**Limite importante:** o workflow atualmente versionado não executa, por si só, auditoria completa de dependências nem Playwright autenticado desktop/mobile antes do deploy. A PR #213 propõe um fluxo manual com gates adicionais, mas uma proposta em PR não é comportamento ativo de `main`. Verificar o estado e os checks reais antes de qualquer liberação.

Até a adoção e validação de um gate completo, não tratar o workflow atual como certificação integral de release. A política operacional da Cátedra exige CI, auditoria e Playwright aprovados no mesmo SHA, além da autorização de publicação.

## 3. Comandos locais

Instalação de dependências:

```bash
npm install
```

Validações disponíveis no `package.json`:

```bash
npm run typecheck
npm run lint
npm run validate:modules
npm run validate:links
npm run validate:security
npm run build
```

O comando `npm run deploy:cloudflare` executa build seguido de `wrangler deploy`. Ele é uma operação de publicação, não um teste local. Não executá-lo como parte de uma revisão documental ou antes de todos os gates e da autorização explícita.

## 4. Configuração do Worker

O `wrangler.jsonc` define:
- nome `cathedradigital`;
- compatibility date e `nodejs_compat`;
- entrypoint `src/server.ts`;
- workers.dev e preview URLs;
- domínios personalizados;
- observabilidade.

Os secrets Cloudflare devem permanecer nos ambientes de secrets apropriados. Nunca registrar valores em documentação, commits ou logs.

## 5. Supabase

A aplicação utiliza um único projeto Supabase. A referência de projeto versionada está em `supabase/config.toml`; o cliente da aplicação está em `src/integrations/supabase/client.ts`.

As variáveis de build/runtime devem ser configuradas no ambiente correto, sem copiar valores privados para o repositório. A chave publicável não é uma service-role key. Operações privilegiadas permanecem server-side.

## 6. Endpoints de produção

Após publicação autorizada, verificar:
- `https://cathedradigital.com.br/`
- `https://www.cathedradigital.com.br/`
- `https://cathedradigital.cathedradigital.workers.dev/`

Verificar também:
- `/robots.txt`;
- `/sitemap.xml`;
- rotas e deep links críticos;
- login e retorno ao destino;
- versão/commit efetivamente servido;
- erros de console e rede.

Uma resposta HTTP 200 não prova, isoladamente, que a versão correta e os fluxos funcionais estejam publicados. Um HTTP 403 nos domínios personalizados também não prova funcionamento da interface.

## 7. Critérios antes de liberar

- [ ] SHA final identificado.
- [ ] CI aprovado nesse SHA.
- [ ] Auditoria de dependências aprovada nesse SHA, sem vulnerabilidades bloqueadoras não tratadas.
- [ ] Playwright crítico desktop e mobile aprovado nesse SHA.
- [ ] Artefatos sanitizados e logs preservados.
- [ ] Fluxos de autenticação e deep links verificados.
- [ ] Nenhum bloqueador de segurança aberto.
- [ ] Autorização explícita para merge/publicação.
- [ ] Pós-deploy validado nos três endpoints e nos recursos SEO.

Se qualquer item estiver pendente, o estado é **BLOQUEADO PARA LIBERAÇÃO**.

## 8. Rollback e incidentes

Em caso de regressão, interromper a liberação, preservar logs e identificar o último deployment/commit comprovadamente funcional. Executar rollback somente pelo procedimento autorizado do Cloudflare, registrando o SHA e a versão efetivamente servida.

Não usar comandos Nitro ou `.output/server/` como procedimento de publicação deste projeto.

## 9. Referências

- `wrangler.jsonc`
- `src/server.ts`
- `vite.config.ts`
- `package.json`
- `.github/workflows/cloudflare-deploy.yml`
- PR #213 — proposta de workflow manual com gates adicionais
