# Matriz de rastreabilidade — requisitos, código e testes

**Versão:** 1.0.0  
**Estado:** mapeamento estático inicial; não é aprovação funcional ou de produção.  
**Base inspecionada:** `main` em `3d11520d3b1c8a713d278589ad0ab89e7982c0e0` (SHA base confirmado na PR de documentação modular).  
**Método:** leitura de arquivos e busca estática no GitHub. Não foi executada uma nova suíte Playwright, build ou teste real de isolamento durante este mapeamento.

## Como ler os estados

- **Localizado:** arquivo/componente/migração existe na revisão examinada.
- **Teste localizado:** há um teste relacionado no repositório; isso não significa que passou na execução atual.
- **Implementação parcial / comportamento a confirmar:** código ou teste cobre apenas parte do requisito.
- **Não verificado:** faltam execução, evidência de runtime ou teste específico.
- **Falha confirmada:** só será usada quando uma execução reproduzível demonstrar a falha. Este mapeamento estático não declara falhas funcionais confirmadas.

## Resumo de evidências

| Prioridade | Requisito | Código real localizado | Testes localizados | Estado atual / lacuna |
|---|---|---|---|---|
| P0 | Bíblia: deep links, referência, reload/back/forward | [Bible.tsx](../src/components/cathedra/Bible.tsx), [App.tsx](../src/App.tsx) | [estudar-critical.spec.ts](../e2e/estudar-critical.spec.ts) | **Mapeado; execução não verificada.** A suíte contém testes de versículo, referência textual, seletor e histórico do navegador. |
| P0 | Catecismo: §1, §25/26, §2262, §2865 e alias `paragraph` | [Catechism shim](../src/components/cathedra/Catechism.tsx), [módulo Catequese](../src/modules/catequese) | [estudar-critical.spec.ts](../e2e/estudar-critical.spec.ts) | **Mapeado; execução não verificada.** Há testes para alias, fronteiras, texto/referência bíblica, proveniência e Conexo. |
| P0 | Magistério: leitura e retorno contextual | [Magisterium.tsx](../src/components/cathedra/Magisterium.tsx), [estudar-critical.spec.ts](../e2e/estudar-critical.spec.ts) | [estudar-critical.spec.ts](../e2e/estudar-critical.spec.ts) | **Parcialmente mapeado.** O E2E cobre anotação → Diário → documento/parágrafo; metadados, idioma/original-tradução e controles de leitura precisam de testes específicos e execução. |
| P0 | Nexus: relações válidas e indicadores precisos por versículo | [Bible.tsx](../src/components/cathedra/Bible.tsx), tabela consultada `nexus_relations` | Teste de Conexo no Catecismo em [estudar-critical.spec.ts](../e2e/estudar-critical.spec.ts) | **Parcialmente mapeado.** Não localizei, na busca estática feita, teste negativo específico que prove ausência de indicador quando não há relação válida por versículo. Busca não prova inexistência de outros testes. |
| P0 | Átrio: página inicial, navegação e notícias/anúncios | [HomeUnified.tsx](../src/pages/HomeUnified.tsx), [hooks do Átrio](../src/modules/atrium/hooks/index.ts), [App.tsx](../src/App.tsx) | Nenhum teste dedicado de carrossel/navegação foi localizado nas buscas realizadas | **Código localizado; aceite não verificado.** Confirmar componente de notícias efetivamente renderizado, anterior/próximo, seleção/fonte, estados loading/vazio/erro e navegação mobile. |
| P0 | Auth: rota protegida e preservação do destino | [App.tsx](../src/App.tsx), [estudar-critical.spec.ts](../e2e/estudar-critical.spec.ts) | Teste `auth redirect preserves protected destination`; helper `login` | **Teste localizado; execução não verificada.** O helper atual verifica URL imediatamente após clicar; confirmar que aguarda a transição e testar query/hash, destino interno e rejeição de destino externo. |
| P0 | Minha Jornada: anotação e retorno ao contexto exato | [Bible.tsx](../src/components/cathedra/Bible.tsx), [SpiritualProfile.tsx](../src/components/cathedra/SpiritualProfile.tsx), [migração pessoal](../supabase/migrations/20260909213548_2e8e8ab8-d3cc-41d5-a30e-8a5dcfc79971.sql) | Fluxos Bíblia/Catecismo/Magistério → Diário → contexto em [estudar-critical.spec.ts](../e2e/estudar-critical.spec.ts) | **Fluxos de teste localizados; execução não verificada.** Verificar persistência, falha de salvamento, expiração de sessão e destino exato após autenticar novamente. |
| P0 Segurança | Isolamento de notas, histórico, diário e progresso | Migração SQL habilita RLS e define política `auth.uid() = user_id` para tabelas pessoais | Não localizei teste E2E de acesso cruzado com duas contas nas buscas realizadas | **Políticas definidas na migração; aplicação efetiva e isolamento real não verificados.** Exige teste negativo com duas identidades e confirmação do schema/policies ativos no Supabase. |
| P1 | Rezar | Especificação em [REZAR.md](./modules/REZAR.md) na PR modular | Testes específicos não localizados nesta busca | **Não verificado.** Mapear sequências, avançar/voltar, fonte, persistência e estados de erro. |
| P1 | Formar-se | [useSpiritualJourney](../src/hooks/useSpiritualJourney.ts) é usado na home; dados de jornadas/progresso na migração SQL | Teste específico de percurso/retomada não localizado nesta busca | **Parcialmente mapeado; não verificado.** Cobrir novo/em andamento/concluído, persistência e isolamento por usuário. |
| P1 | Pesquisar | [HomeUnified.tsx](../src/pages/HomeUnified.tsx) navega para `/buscar`; rota e página devem ser confirmadas no mapa de rotas | Testes específicos de busca não localizados nesta busca | **Parcialmente mapeado; não verificado.** Cobrir consulta, filtros, zero resultados, falha e autorização. |
| P1 | Biblioteca, Santos, Igreja Viva e demais áreas | Referências e rotas devem ser mapeadas no código de rotas e nos módulos correspondentes | Nenhuma cobertura suficiente confirmada neste mapeamento | **Não verificado.** Criar critérios de aceite por módulo antes de declarar cobertura. |

## Referências técnicas verificadas

1. [`package.json`](../package.json) define `build` (inclui verificações de assets, contratos de módulos, segurança, Vite e TypeScript), `typecheck`, `lint`, `validate:modules`, `validate:links`, `validate:security` e `deploy:cloudflare`.
2. [`src/pages/HomeUnified.tsx`](../src/pages/HomeUnified.tsx) usa `useAnnouncements`, `useFeaturedThemes`, `useResume`, `useLiturgyToday` e navegação para busca; [`src/modules/atrium/hooks/index.ts`](../src/modules/atrium/hooks/index.ts) implementa hooks que consultam adapters.
3. [`src/components/cathedra/Bible.tsx`](../src/components/cathedra/Bible.tsx) contém lógica de consulta a `nexus_relations` e conversão de relações em conexões exibíveis.
4. [migração SQL](../supabase/migrations/20260909213548_2e8e8ab8-d3cc-41d5-a30e-8a5dcfc79971.sql) habilita RLS em `user_history`, `user_notes`, `journey_progress`, `spiritual_journal`, `reading_marks` e outras tabelas pessoais; cria política `FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` para a lista de tabelas pessoais. Isso demonstra intenção no arquivo de migração, não que a migração/política está ativa no banco de produção.
5. [`e2e/estudar-critical.spec.ts`](../e2e/estudar-critical.spec.ts) contém testes de retorno contextual, deep links do Catecismo, fronteiras de parágrafo, proveniência, Conexo, ausência de navegação duplicada e dois casos de overflow mobile.

## Próximas verificações obrigatórias

1. Fixar o SHA candidato único e executar CI, auditoria e Playwright desktop/mobile nesse mesmo SHA; salvar URLs de runs, resultados, logs e artefatos.
2. Corrigir o helper de login para aguardar a navegação real antes da asserção, se a versão atual ainda não tiver essa correção.
3. Acrescentar ou localizar testes negativos do Nexus: sem relação, relação inválida, relação de outro versículo, cache obsoleto e destino inválido.
4. Adicionar teste Átrio para controles do carrossel, fonte original, loading/vazio/erro, rotas e viewport 390 × 844.
5. Executar teste de segurança com duas contas: usuário A não lê/altera dados de B; testar SELECT/INSERT/UPDATE/DELETE e confirmar RLS/policies ativas no projeto Supabase.
6. Mapear módulos P1 individualmente, usando nomes de testes e arquivos reais; não marcar aceite por mera existência de componente.
7. Só depois de gates aprovados no SHA final avaliar merge e, mediante autorização, deploy Cloudflare. Confirmar UI real no domínio, `robots.txt` e `sitemap.xml`.

## Registro desta revisão

- Tipo de verificação: inspeção estática de arquivos e buscas no GitHub.
- SHA de base: `3d11520d3b1c8a713d278589ad0ab89e7982c0e0`.
- Build/CI/Playwright executados nesta revisão: **não**.
- Falhas funcionais confirmadas nesta revisão: **nenhuma** — não houve execução de testes.
- Lacunas verificadas: cobertura específica de Átrio e teste negativo de Nexus não foram localizados nas buscas; teste de isolamento entre duas contas não foi localizado; status das políticas ativas no Supabase não foi consultado.
- Resultado global: **mapeamento inicial criado; implementação e aceite continuam não verificados onde indicado**.
