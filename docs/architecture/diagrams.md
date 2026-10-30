# Diagramas oficiais — Cátedra Digital

**Revisão:** 2026-10-29  
**Base:** leitura do README, `src/App.tsx`, `src/config/moduleNavigation.ts`, `src/integrations/supabase/client.ts`, `src/server.ts`, `vite.config.ts`, `wrangler.jsonc`, `supabase/config.toml`, `package.json` e workflow Cloudflare em `main`.

Os diagramas separam a arquitetura de produto desejada da configuração atualmente observada. Não são prova de execução ou disponibilidade dos serviços.

## 1. Arquitetura lógica e fronteiras

```mermaid
flowchart TB
  USER["Usuário — desktop / mobile"]
  subgraph EDGE["Cloudflare"]
    WORKER["Cloudflare Worker: cathedradigital"]
    SSR["TanStack Start server entry"]
    WEB["Aplicação React / TypeScript"]
    ASSETS["Assets e rotas web"]
    WORKER --> SSR
    SSR --> WEB
    WEB --> ASSETS
  end

  subgraph SUPA["Único projeto Supabase"]
    AUTH["Supabase Auth"]
    DB[("PostgreSQL")]
    RLS["Row Level Security"]
    EF["Edge Functions"]
    AUTH --> DB
    DB --> RLS
  end

  USER --> WORKER
  WEB -->|"cliente Supabase + chave publicável"| AUTH
  WEB -->|"consultas autorizadas"| DB
  DB --> RLS
  WEB -->|"requisições específicas"| EF
  EF --> DB

  subgraph PRODUCT["Experiência Cátedra"]
    ATRIO["Átrio — entrada editorial"]
    STUDY["Estudar"]
    PRAY["Rezar"]
    FORM["Formar-se"]
    SEARCH["Pesquisar"]
    JOURNEY["Minha Jornada"]
    YA["Yá — assistência contextual"]
    NEXUS["Nexus — relações verificáveis"]
    ATRIO --> STUDY
    ATRIO --> PRAY
    ATRIO --> FORM
    ATRIO --> SEARCH
    ATRIO --> JOURNEY
    STUDY --> NEXUS
    STUDY --> YA
    SEARCH --> NEXUS
  end

  WEB --> PRODUCT
```

### Limites de segurança

- O navegador é ambiente não confiável.
- A chave publicável Supabase não equivale a uma chave privilegiada.
- Autenticação identifica a sessão; autorização deve ser aplicada no backend e no banco.
- RLS protege dados no PostgreSQL, mas precisa ser testada com cenários positivos e negativos.
- Yá não é autoridade doutrinal; Nexus não transforma relações sem fundamento em fontes oficiais.

## 2. Organização funcional do produto

```mermaid
flowchart TB
  A["ÁTRIO — porta de entrada"]
  A --> E["ESTUDAR"]
  A --> R["REZAR"]
  A --> F["FORMAR-SE"]
  A --> P["PESQUISAR"]
  A --> M["MINHA JORNADA"]

  E --> E1["Bíblia"]
  E --> E2["Catecismo"]
  E --> E3["Magistério / Documentos"]
  E --> E4["Nexus / Conexo"]
  E --> E5["Biblioteca"]
  E --> E6["Santos"]
  E --> E7["Igreja Viva"]

  R --> R1["Liturgia"]
  R --> R2["Lectio Divina"]
  R --> R3["Rosário"]
  R --> R4["Via-Sacra"]
  R --> R5["Ladainhas"]
  R --> R6["Novenas"]

  F --> F1["Jornadas e percursos"]
  P --> P1["Busca transversal"]
  M --> M1["Diário"]
  M --> M2["Progresso e histórico"]
  M --> M3["Favoritos e preferências"]

  YA["Yá — organiza e contextualiza; não cria autoridade"]
  N["Fontes verificáveis e proveniência"]
  YA -. "fundamenta respostas" .-> N
  E4 -. "conecta origens e destinos" .-> N
```

### Divergência entre especificação e código

O Documento Mestre agrupa Nexus, Biblioteca e Santos junto ao ambiente Estudar. O registro de navegação atual em `src/config/moduleNavigation.ts` lista esses itens no grupo Pesquisar; Hoje aparece como item dentro de Minha Jornada. O diagrama acima representa a arquitetura funcional do produto documentada no Documento Mestre. A divergência de agrupamento deve ser resolvida em uma decisão de produto e em mudança própria de navegação, não por alteração incidental desta documentação.

Igreja Viva está no escopo de produto, mas não possui especificação modular própria no conjunto revisado.

## 3. Publicação e validação

```mermaid
flowchart TD
  GH["GitHub — repositório"]
  MAIN["main / SHA candidato"]
  WF["GitHub Actions — cloudflare-deploy.yml"]
  INSTALL["Node 22 + npm install"]
  CHECKS["Typecheck + lint + validate:links + build"]
  DEPLOY["Wrangler deploy"]
  WORKER["Cloudflare Worker"]
  URLS["workers.dev + domínio raiz + www"]
  SEO["robots.txt + sitemap.xml + rotas críticas"]
  EVIDENCE["Evidências sanitizadas vinculadas ao SHA"]

  GH --> MAIN --> WF --> INSTALL --> CHECKS --> DEPLOY --> WORKER --> URLS --> SEO --> EVIDENCE
```

**Estado do workflow observado em `main`:** o workflow dispara em push para `main` e manualmente. Executa typecheck, lint, validação de rotas e build antes do deploy. Não contém, por si só, auditoria completa de dependências nem Playwright autenticado desktop/mobile antes da publicação.

**Proposta em andamento:** a PR #213 propõe fluxo manual com gates adicionais, fixação do SHA, auditoria, Playwright e validação pré/pós-deploy. Enquanto não estiver integrada e validada, não apresentar essa proposta como fluxo ativo.

### Gate de liberação exigido

```text
CI aprovado
   +
Auditoria de dependências aprovada
   +
Playwright desktop e mobile aprovado
   +
Tudo no mesmo SHA
   +
Autorização explícita
   ↓
Publicação Cloudflare
   ↓
Validação da versão efetivamente servida
```

Se um gate estiver pendente, a liberação permanece bloqueada. Uma execução de build isolada, HTTP 200 ou workflow iniciado não substitui as evidências exigidas.

## 4. Fluxo de autenticação e dados pessoais

```mermaid
sequenceDiagram
  participant U as Usuário
  participant UI as Aplicação web
  participant AUTH as Supabase Auth
  participant API as Backend / Edge Function
  participant DB as PostgreSQL + RLS

  U->>UI: abre recurso protegido
  UI->>AUTH: verifica sessão
  alt sessão ausente ou expirada
    UI-->>U: solicita autenticação preservando destino interno
    U->>UI: conclui login
    UI->>AUTH: valida credenciais/sessão
  else sessão válida
    UI->>API: solicita operação
  end
  UI->>API: envia operação autenticada
  API->>DB: consulta/grava com identidade validada
  DB->>DB: aplica políticas RLS
  DB-->>API: resultado autorizado ou negado
  API-->>UI: resposta sem dados excessivos
  UI-->>U: confirma somente após resultado real
```

O diagrama representa o contrato de segurança esperado. Cada fluxo real precisa de teste; o diagrama não afirma que todos os caminhos estejam aprovados.

## 5. Convenções para manutenção

- Manter os diagramas em Mermaid versionado junto ao código.
- Atualizar este arquivo quando entrypoint, serviços, fronteiras, módulos ou fluxo de publicação mudarem.
- Referenciar caminhos reais do repositório; remover componentes somente após verificar dependências.
- Distinguir sempre arquitetura desejada, configuração encontrada e evidência de produção.
