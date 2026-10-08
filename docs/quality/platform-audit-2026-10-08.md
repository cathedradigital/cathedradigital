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


### 3. Cabeçalho: breadcrumb não era um controle de navegação acessível

- Os itens de breadcrumb do cabeçalho eram `span` com `onClick`, sem semântica de botão/link nem estado atual acessível por teclado/leitor de tela.
- Foram convertidos em botões nativos, mantendo a navegação e indicando o item atual com `aria-current="page"`. O build/CI deve validar a alteração.

## Próximas etapas obrigatórias da varredura

1. Executar CI, typecheck, lint e os testes E2E desta branch; não integrar enquanto a autenticação de teste falhar.
2. Inventariar rotas públicas, aliases, redirects, shells e guards; diferenciar alias intencional de tela duplicada.
3. Mapear todas as fontes de navegação e os componentes globais (cabeçalho, sidebar, rodapé, busca, controles flutuantes) e consolidar somente depois de verificar todos os consumidores.
4. Auditar componentes e arquivos sem referência, dependências, CSS/tokens duplicados, feature flags antigas e código de demonstração/teste; gerar evidência antes de cada remoção.
5. Testar os módulos em desktop e mobile, incluindo Bíblia, Catecismo, Magistério, Conexo, Biblioteca, Santos, Rezar, Formar/Pesquisar, Hoje, Diário e Minha Jornada.
6. Auditar segurança do Supabase, autorização no backend/RLS, dados privados, tratamento de erros e limites de custo.
7. Validar produção no Cloudflare e nos domínios oficiais após merge aprovado; comparar comportamento publicado com o commit implantado.

## Critério de conclusão

A auditoria só pode ser declarada concluída com evidência verificável: verificações automatizadas aprovadas, fluxos críticos E2E aprovados, revisão manual de mobile/desktop, ausência de erros críticos de console/rede e validação da versão publicada. Esta nota é uma linha de base; não afirma que a varredura total ou a validação de produção já terminaram.
