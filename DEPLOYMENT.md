# Cathedra Digital — publicação e operação

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
GitHub Actions — CI, Estudar E2E, Security Audit, Estudar final audit
       ↓
Cloudflare workflow_run — gate dos quatro workflows no mesmo SHA
       ↓
Node.js 22 + Bun 1.3 + dependências do lockfile
       ↓
typecheck → lint → validate:links → build → deploy após gates
       ↓
Worker cathedradigital
       ↓
workers.dev + domínios oficiais
```

Vercel e Lovable não são alvos oficiais de produção. Não criar uma segunda cadeia de publicação.

## 2. Comportamento atualmente versionado

O arquivo `.github/workflows/cloudflare-deploy.yml` em `main` declara:

- disparo após a conclusão dos workflows `CI`, `Estudar E2E`, `Security Audit` e `Estudar final audit` em `main` (`workflow_run`);
- verificação de que os quatro resultados são sucesso no SHA exato que iniciou o gate; falha, execução ausente ou espera superior a 45 minutos bloqueia o deploy;
- checkout do SHA validado, credenciais Cloudflare, instalação congelada com `bun ci`, autorização Wrangler, consulta DNS, typecheck, lint, validação de rotas e build;
- publicação do Worker e verificações de saúde, endpoints personalizados, `robots.txt` e `sitemap.xml`.

`Estudar E2E` executa a suíte pública desktop/mobile e, em `main`, a suíte autenticada com secrets. `Security Audit` audita o grafo de dependências travado; `Estudar final audit` valida as fronteiras de segurança. O push normal inicia esses gates, mas não publica diretamente: `workflow_run` aguarda todos no mesmo SHA.

O `workflow_dispatch` do deploy exige `fast_track=true` e ignora intencionalmente o gate de E2E autenticado. É um caminho de exceção, não o fluxo normal; não usar sem pedido explícito que autorize esse bypass. A aprovação genérica de um deploy não autoriza `fast_track`.

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
- [ ] `CI`, `Estudar E2E`, `Security Audit` e `Estudar final audit` aprovados no SHA exato.
- [ ] Auditoria de dependências aprovada nesse SHA, sem vulnerabilidades bloqueadoras não tratadas.
- [ ] Playwright público desktop/mobile e Playwright autenticado aprovados nesse SHA.
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
