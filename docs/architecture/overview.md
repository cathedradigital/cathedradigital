# Arquitetura técnica da Cátedra Digital

**Revisão:** 2026-10-29  
**Escopo:** arquitetura lógica e infraestrutura observável no repositório.  
**Status:** documentação técnica revisada; não é certificação de funcionamento ou produção.

## 1. Princípios

- Uma aplicação integrada, com limites claros entre interface, domínio, dados e integrações.
- A autoridade e a proveniência pertencem às fontes; a IA apenas auxilia a consulta e a compreensão.
- A autorização é aplicada no backend e no banco; controles visuais não são fronteiras de segurança.
- Dados pessoais são segregados por usuário.
- A arquitetura documentada distingue o estado implementado do estado desejado.
- Uma alteração não pode ser declarada validada sem evidência ligada ao SHA correspondente.

## 2. Visão lógica

A aplicação é entregue como uma experiência web React/TypeScript, com renderização e runtime no Cloudflare Workers. O frontend utiliza o cliente Supabase para autenticação e operações de dados permitidas. As Edge Functions concentram operações server-side específicas, com exigência de JWT definida por função.

### Camadas

| Camada | Responsabilidade | Evidência no repositório |
|---|---|---|
| Experiência | Átrio, navegação, leitores, módulos, acessibilidade e estados de interface | `src/App.tsx`, `src/config/moduleNavigation.ts`, páginas e componentes |
| Domínio | Jornadas, leitura, pesquisa, conteúdo, referências e continuidade | `src/core`, `src/features`, `src/modules` |
| Integração de dados | Cliente Supabase, configuração pública, sessão e consultas | `src/integrations/supabase/client.ts`, `src/lib/db.ts` |
| Backend gerenciado | PostgreSQL, Auth, RLS e Edge Functions | `supabase/config.toml`, migrations e `supabase/functions/` |
| Runtime web | SSR/handler TanStack Start no Cloudflare Worker | `src/server.ts`, `vite.config.ts`, `wrangler.jsonc` |
| Entrega | Instalação, verificações, build, deploy e checagem dos endpoints | `package.json`, `.github/workflows/cloudflare-deploy.yml`, `DEPLOYMENT.md` |

## 3. Frontend e runtime

O `vite.config.ts` configura TanStack Start, React, o plugin Vite do Cloudflare, aliases TypeScript e Tailwind. O `src/server.ts` encaminha as requisições para o server entry do TanStack Start e normaliza erros SSR catastróficos.

O `wrangler.jsonc` identifica o Worker `cathedradigital`, define `src/server.ts` como entrypoint, habilita `nodejs_compat`, observabilidade e os domínios personalizados `cathedradigital.com.br` e `www.cathedradigital.com.br`.

Não confundir o protótipo `/prototype-2.0` com a aplicação oficial. Rotas de protótipo são explicitamente isoladas no roteamento e não são prova de que o redesign esteja publicado.

## 4. Ambientes de produto

O Átrio é a entrada editorial do produto. A arquitetura funcional organiza cinco ambientes:

- **Estudar:** Bíblia, Catecismo, Magistério/Documentos e recursos de leitura e aprofundamento.
- **Rezar:** Liturgia, Lectio Divina, Rosário, Via-Sacra, Ladainhas e Novenas.
- **Formar-se:** jornadas, temas e percursos.
- **Pesquisar:** busca transversal e descoberta.
- **Minha Jornada:** Diário, progresso, histórico, favoritos e preferências.

### Divergência documental a resolver

O Documento Mestre e as especificações funcionais posicionam Nexus, Biblioteca e Santos como recursos associados ao ambiente de Estudar. Já o registro atual `src/config/moduleNavigation.ts` lista Nexus, Biblioteca e Santos no grupo Pesquisar; também registra Hoje dentro de Minha Jornada. O diagrama apresenta a organização de produto desejada, mas essa divergência de agrupamento deve ser decidida e sincronizada com o registro de navegação em uma mudança própria, sem alterar rotas por consequência desta revisão documental.

A especificação de Igreja Viva também precisa de documento funcional próprio; ela não consta do índice de especificações modulares atualmente localizado.

## 5. Supabase, autenticação e dados

O repositório contém um único identificador de projeto Supabase em `supabase/config.toml`. A aplicação importa o cliente central em `src/integrations/supabase/client.ts`; `src/lib/db.ts` é uma ponte de tipagem para o mesmo cliente, não uma segunda conexão ou um segundo projeto.

O cliente usa configuração pública de build/runtime e persiste a sessão com renovação automática. Chaves públicas são públicas por definição; chaves privilegiadas e credenciais de servidor nunca devem ser incluídas no bundle do navegador.

As operações de dados pessoais exigem:
- autenticação válida;
- autorização no backend;
- políticas RLS restritas ao proprietário do dado;
- testes negativos de isolamento entre contas;
- logs sem senhas, tokens, cookies ou conteúdo privado.

A presença de uma configuração ou policy no repositório não prova que ela foi aplicada e validada no projeto remoto.

## 6. Edge Functions identificadas

O arquivo `supabase/config.toml` declara:

| Função | Verificação JWT declarada |
|---|---|
| `logos-ai` | obrigatória |
| `corpus-ingest` | obrigatória |
| `bible-text` | não exigida pelo gateway |
| `vatican-document` | não exigida pelo gateway |
| `source-sync` | não exigida pelo gateway |

“JWT não exigido pelo gateway” não significa endpoint sem controles: a própria função deve validar método, entrada, limites, autorização contextual e dados expostos conforme sua finalidade. A auditoria de implementação e configuração remota deve ser registrada separadamente.

## 7. Assistência inteligente e fontes

A assistente visível ao usuário é **Yá**. O identificador técnico `logos-ai` é o nome da Edge Function existente e não deve ser confundido com a identidade editorial da assistente.

A Yá pode localizar, organizar, contextualizar e comparar fontes. Não é autoridade doutrinal. Respostas que afirmem conteúdo doutrinal dependem de fontes verificáveis recuperadas do acervo autorizado; ausência de fonte deve resultar em limitação explícita, não em citação inventada.

O Nexus organiza relações entre fontes, mas uma aresta do grafo, cache ou sugestão gerada não cria autoridade nem transforma uma relação não verificada em referência confirmada.

## 8. Publicação e ambientes

A infraestrutura oficial é Cloudflare Workers. A cadeia contém GitHub, workflow de publicação, build, Wrangler/Cloudflare Worker e validação dos endpoints.

No workflow atualmente presente em `main`, o evento `push` para `main` dispara publicação; o workflow também pode ser iniciado manualmente. Esse workflow executa typecheck, lint, validação de rotas e build antes do deploy, mas não contém, por si só, a auditoria completa de dependências e o Playwright autenticado desktop/mobile no mesmo SHA.

A PR #213 propõe um fluxo manual com gates adicionais. Enquanto essa proposta não estiver integrada e validada, não se deve descrevê-la como comportamento já ativo. O estado de publicação e os bloqueios vigentes devem ser consultados no relatório operacional mais recente.

## 9. Limites desta documentação

Este documento descreve arquitetura confirmada por leitura de arquivos do repositório. Não certifica:
- execução bem-sucedida de build, typecheck, lint ou testes;
- aplicação remota de migrations ou policies;
- autenticação real ou isolamento entre duas contas;
- disponibilidade de cada Edge Function;
- aprovação de auditoria de dependências;
- execução de Playwright;
- deploy ou versão efetivamente servida em produção.

Esses estados exigem evidência independente, vinculada ao mesmo SHA final.
