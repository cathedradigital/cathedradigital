# Cátedra — Design System

## Objetivo

Criar uma linguagem visual consistente entre Estudar, Rezar, Formar-se, Pesquisar e Minha Jornada sem redesenhar cada módulo isoladamente.

## Princípios

- **Clareza antes de ornamentação:** conteúdo e ação principal devem ter prioridade visual.
- **Hierarquia consistente:** títulos, corpo, metadados, ações e estados usam o mesmo ritmo.
- **Superfícies contidas:** cards e bordas servem para agrupar informação, não para decorar cada bloco.
- **Leitura confortável:** áreas de leitura usam largura menor que áreas de navegação.
- **Mobile primeiro:** espaçamento e títulos reduzem progressivamente em telas pequenas.
- **Acessibilidade:** foco visível, alvos de toque de pelo menos 44px e respeito a prefers-reduced-motion.
- **Estados explícitos:** carregando, vazio, erro e sucesso não devem parecer uma página quebrada.

## Tokens compartilhados

As classes `.catedra-page`, `.catedra-section`, `.catedra-reading`, `.catedra-surface`, `.catedra-interactive` e `.catedra-action` formam a primeira camada reutilizável em `src/styles.css`.

## Regra de evolução

Novos módulos devem reutilizar esses padrões antes de criar valores locais de largura, raio, espaçamento ou interação. Alterações globais devem ser feitas nos tokens para evitar divergência entre telas.
