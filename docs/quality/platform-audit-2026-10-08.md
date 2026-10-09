# Auditoria técnica da plataforma — 2026-10-08

## Escopo e princípio de segurança

Esta auditoria começa pela arquitetura real do repositório `cathedradigital/cathedradigital`. A regra é remover código somente quando não houver referências e a mudança puder ser validada; nomes parecidos, rotas legadas e componentes de conteúdo não são prova suficiente de duplicação.

A cadeia oficial permanece GitHub → Cloudflare Workers → domínio próprio. Nenhuma limpeza deve criar outra cadeia de deploy ou alterar dados de produção sem necessidade.

## Achados confirmados nesta primeira passada

### 1. Configuração de navegação legada sem consumidores encontrados

- `src/config/moduleNavigation.ts` é identificada pelo próprio validador de contratos como a configuração pública canônica.
- `src/navigation.config.ts` descrevia a si mesma como compatibilidade legada e continha uma segunda lista de links de navegação.
- A busca de código por `navigationConfig` retornou apenas a declaração em `src/navigation.config.ts`; a busca por `navigation.config` não encontrou consumidores.
- A configuração legada foi removida nesta branch. O CI precisa confirmar que nenhum consumidor indireto foi perdido.

### 2. Diagnóstico de autenticação no E2E era insuficiente

- O workflow chamava a etapa de “Verify authenticated E2E account exists”, mas só verificava se `E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD` não estavam vazios; não comprovava a existência da conta nem a validade da senha.
- As execuções recentes dos PRs #162 e #163 falharam no fluxo Bíblia → Diário, porque o navegador permaneceu em `/auth?next=...` após o envio do formulário. O build passou; o fluxo de navegador não.
- O teste foi ajustado para reportar a mensagem de autenticação da interface ou o caminho final sem expor credenciais. O nome da etapa do workflow agora descreve honestamente o pré-requisito que ela verifica.
- Ainda é necessário corrigir a causa real do login falho: a mensagem capturada pelo teste deve distinguir credencial inválida, conta indisponível, erro de rede e falha no redirecionamento. Não se deve contornar isso desativando o teste.


### 4. Registro de rotas: metadados ausentes em seis caminhos da navegação canônica

- Comparei as 31 entradas da navegação canônica com `APP_ROUTES` e as declarações literais de `Route` em `src/App.tsx`.
- Antes da correção, seis caminhos da navegação canônica não tinham metadados próprios para breadcrumb: `/liturgia`, `/buscar`, `/acervo`, `/hoje`, `/oracao/rosario` e `/oracao/exame-de-consciencia`. Em rotas aninhadas, o cabeçalho podia cair no metadado do pai ou não mostrar um rótulo específico.
- Foram adicionados registros de metadados para esses caminhos sem promovê-los a um menu paralelo; a navegação pública continua sendo definida por `MODULE_NAVIGATION`.
- Uma verificação estática posterior confirmou: 54 caminhos em `APP_ROUTES`, nenhum caminho duplicado nesse registro, todos os 31 caminhos canônicos presentes nos metadados e todos com declaração literal de rota no `App.tsx`.
- A inspeção dos contextos confirmou que as declarações repetidas para `/`, `/telemetry`, `/security`, `/admin/glossario` e `/admin/glossary` estão em escopos diferentes: Home pública vs. raiz administrativa aninhada; aliases públicos que redirecionam vs. páginas administrativas; e rota editorial protegida vs. rota equivalente dentro de `/admin/*`. Não são duplicações comprovadas no mesmo escopo e foram preservadas.

### 3. Cabeçalho: breadcrumb não era um controle de navegação acessível

- Os itens de breadcrumb do cabeçalho eram `span` com `onClick`, sem semântica de botão/link nem estado atual acessível por teclado/leitor de tela.
- Foram convertidos em botões nativos, mantendo a navegação e indicando o item atual com `aria-current="page"`. O build/CI deve validar a alteração.

### 6. Sidebar: estados ativos e ícones não cobriam todos os IDs canônicos

- A comparação entre `MODULE_NAVIGATION` e o mapa de ícones da sidebar encontrou IDs canônicos sem entrada correspondente (`documents`, `prayers`, `breviary`, `missal`, `litanies` e `examination`), que caíam no ícone genérico.
- A condição de rota ativa usava `startsWith(item.path)` sem limite de segmento, permitindo que caminhos como `/bible-legacy` também marcassem `/bible` como ativo.
- Corrigi o mapa e limitei a correspondência ao caminho exato ou a um segmento descendente. O CI da revisão atual ainda precisa confirmar a compilação e os testes.

### 7. Rodapé: inscrição no boletim afirmava sucesso sem persistência

- `Footer.tsx` simulava uma espera de 1,5 s, disparava apenas um evento de analytics e mostrava “cadastrado com sucesso”, sem chamar serviço nem persistir o e-mail.
- Corrigi o comportamento para informar que o boletim está em preparação e que nenhum cadastro foi feito. O campo não apaga o endereço informado e a métrica de inscrição falsa foi removida. A integração real do boletim continua pendente e não foi inventado um endpoint.

### 9. Shell devocional e navegação inferior mobile — divergência de implementação

- O comentário de `DevocionalMobileShell.tsx` descreve `MobileTopBar + MobileBottomNav`, mas o componente renderiza apenas `MobileTopBar`. A navegação inferior existe e é exportada, porém a busca de usos encontrou apenas o showcase de desenvolvimento e a referência no próprio comentário.
- Outras páginas, como o hub Estudar e a pesquisa, reservam espaço inferior para a barra por meio de `--stitch-mobile-bottomnav-h`; isso sugere que o padrão móvel foi planejado, mas não comprova que a barra deva ser global.
- Não integrei a barra de forma global nesta etapa: a decisão afeta a navegação e a área útil de todos os módulos e precisa ser consistente com a preferência de interface limpa, sem navegação duplicada. A discrepância fica registrada para decisão após mapear as telas móveis.

### 10. Conexo nos leitores — cobertura de referências explícitas a comprovar

- Os adapters automáticos da Bíblia e do Catecismo chamam `buildBucketedSuggestions` com `refs: {}`. As sugestões podem vir de relações do grafo e de busca textual temática, mas esses adapters não fornecem referências editoriais específicas na chamada.
- O motor diferencia relações do grafo, referências editoriais e correspondências temáticas; portanto, a ausência de refs explícitas nesses dois adapters não prova que todos os resultados estejam errados, mas significa que a exatidão de cada vínculo não pode ser presumida.
- Próxima verificação: testes com passagens e parágrafos conhecidos para conferir se as conexões exibidas levam ao versículo/parágrafo certo, permanecem dentro do Cátedra e rotulam corretamente a evidência. Não alterei o ranking teológico sem fixtures e dados verificáveis.

### 8. Guardas de acesso — primeira leitura estática

- As rotas `/hoje`, `/diario`, `/conta/*`, `/jornadas/*`, `/favorites`, `/achievements`, `/profile` e `/checkout` estão envolvidas por `AuthGuard`; as ferramentas administrativas principais estão sob `AdminGuard`.
- A seção `/conta/admin` também verifica `isAdmin` dentro do componente e redireciona usuários comuns para `/conta/perfil`. Esta revisão estática não substitui testes reais com sessão autenticada e anônima.
- A conexão Supabase não autorizou a leitura de Security Advisors, mas consultas SQL diretas ao catálogo permitiram verificar políticas RLS, grants e os gatilhos de perfil descritos na seção 11. A análise do Security Advisor permanece pendente.

### 5. Navegação mobile: componente disponível, mas sem integração global comprovada

- A busca por referências de `MobileBottomNav` encontrou o próprio componente e a página de demonstração; não encontrou uso de produção. O comentário de `DevocionalMobileShell` diz que o shell inclui `MobileTopBar + MobileBottomNav`, mas o código do shell importa e renderiza apenas `MobileTopBar`.
- Não integrei uma barra inferior global automaticamente: isso mudaria a navegação visual em todos os módulos e poderia contrariar a diretriz de interface limpa. A próxima validação deve comparar o padrão mobile real por rota e decidir se a navegação primária será o menu lateral, uma barra inferior, ou uma combinação consistente — sem manter padrões contraditórios por acidente.

### 11. Supabase — verificação direta de RLS, grants e perfil

- A consulta SQL ao catálogo de políticas confirmou RLS habilitada nas tabelas de dados consultadas: Bíblia, Catecismo, Conexo, perfis, notas, histórico, marcações de leitura, diário espiritual, progresso e etapas/jornadas.
- As tabelas pessoais têm políticas de linha para o próprio `user_id`; `journey_progress`, `reading_marks`, `spiritual_journal`, `user_history` e `user_notes` não expõem linhas via uma policy pública. O papel anônimo ainda tem grants de tabela em algumas dessas tabelas, mas RLS está habilitada e não há policy pública de leitura para esses dados; manter o princípio de privilégio mínimo é preferível.
- `profiles` tinha RLS e políticas de seleção/atualização do próprio perfil, mas o usuário autenticado também tinha permissão de inserir sua própria linha. Isso tornava essencial proteger os campos privilegiados no banco, e não confiar no formulário.
- Aplicada no projeto Supabase a migração `protect_profile_privileged_fields`: bloqueia alterações não administrativas em role, is_premium, premium_status, premium_expires_at, mercado_pago_subscription_id e email; em inserções de usuário, neutraliza role e dados premium. Foi confirmado no catálogo que o papel `anon` não pode selecionar, inserir nem atualizar `profiles`.
- Aplicada a migração `create_profile_on_signup`: cria a linha privada do perfil pelo trigger de `auth.users`, sem exigir que o navegador tenha permissão de inserir perfil. As duas migrações também foram registradas nesta branch do GitHub.
- Teste transacional de segurança tentou criar um perfil com role admin e premium ativo: os valores foram neutralizados e uma tentativa posterior de autopromoção foi rejeitada; a transação foi revertida e uma consulta confirmou que não restou linha de teste.
- Limite da evidência: o projeto Supabase consultado tinha zero linhas em `auth.users`, `profiles` e `user_roles` no momento da verificação. Isso não comprova a conta E2E de produção e impede testar uma sessão real existente. O workflow só verifica se os secrets não estão vazios, não se as credenciais correspondem a uma conta válida.
- As tabelas bíblicas e o Catecismo têm políticas públicas de leitura e políticas de escrita para admin; isso é compatível com leitores públicos. As políticas de jornadas permitem leitura de etapas de jornadas ativas; a consulta ao banco não encontrou atualmente etapas de jornadas ativas premium ou não gratuitas, mas a policy precisa ser reavaliada antes de inserir conteúdo pago real, para que conteúdo premium não dependa apenas de blur no cliente.

### 12. Corpus e referência de Conexo — consulta ao banco

- Contagens diretas: 73 livros bíblicos, 1.334 capítulos, 35.816 versículos e 2.865 parágrafos do Catecismo.
- A verificação estrutural encontrou zero capítulos ausentes, zero capítulos fora do intervalo, zero números de versículo duplicados, zero versículos vazios/inválidos, zero parágrafos duplicados, zero parágrafos ausentes no intervalo 1–2865 e zero parágrafos sem conteúdo.
- A relação editorial publicada de Gênesis 1,1 para o Catecismo §279 existe como `cites`, confiança 1,0; §290 aparece adicionalmente como `see_also`. A navegação bidirecional precisa continuar coberta pelo Playwright, incluindo retorno exato para `/bible?book=Gn&ch=1&v=1`.
- A existência de relações e contagens corretas não substitui validar o comportamento real do navegador e a qualidade teológica de cada sugestão.

### 13. Magistério — validação de links e limites

- O catálogo local de URLs do Magistério foi inspecionado estaticamente; as entradas analisadas usam HTTPS e host oficial `vatican.va`. Isso não confirma disponibilidade HTTP de cada página nem prova que todos os documentos têm texto integral local.
- O leitor inclui caminhos de abrir/consultar a fonte oficial; a validação de cada documento no navegador e a disponibilidade de traduções continuam pendentes do E2E e de verificação de rede. Não declarar a biblioteca inteira validada apenas pela lista de URLs.

## Próximas etapas obrigatórias da varredura

1. Aguardar CI, typecheck, lint e Playwright E2E desta branch. A auditoria estática passou; o build e o fluxo de navegador ainda estão em execução, e a conta de teste não foi validada.
2. Inventariar rotas públicas, aliases, redirects, shells e guards; diferenciar alias intencional de tela duplicada.
3. Mapear todas as fontes de navegação e os componentes globais (cabeçalho, sidebar, rodapé, busca, controles flutuantes) e consolidar somente depois de verificar todos os consumidores.
4. Auditar componentes e arquivos sem referência, dependências, CSS/tokens duplicados, feature flags antigas e código de demonstração/teste; gerar evidência antes de cada remoção.
5. Testar os módulos em desktop e mobile, incluindo Bíblia, Catecismo, Magistério, Conexo, Biblioteca, Santos, Rezar, Formar/Pesquisar, Hoje, Diário e Minha Jornada.
6. Auditar segurança do Supabase, autorização no backend/RLS, dados privados, tratamento de erros e limites de custo.
7. Validar produção no Cloudflare e nos domínios oficiais após merge aprovado; comparar comportamento publicado com o commit implantado.

## Critério de conclusão

A auditoria só pode ser declarada concluída com evidência verificável: verificações automatizadas aprovadas, fluxos críticos E2E aprovados, revisão manual de mobile/desktop, ausência de erros críticos de console/rede e validação da versão publicada. Esta nota é uma linha de base; não afirma que a varredura total ou a validação de produção já terminaram.
