# Auditoria e consolidação do front-end da Cátedra

## Objetivo
Unificar a experiência visual e de navegação sem redesenhar a identidade editorial, alterar conteúdo religioso, regras de negócio ou o backend.

## Diagnóstico inicial
- A home ativa é `HomeUnified`, não as duas landing pages legadas; ela já comunica estudo, oração e continuidade, mas usa microtextos e contrastes frágeis em alguns pontos.
- Mobile, tablet e desktop renderizam sem erros de console, porém o menu móvel, a densidade de controles e o rodapé precisam de revisão prática.
- Há múltiplas gerações de botões, cards, landing pages e utilitários visuais convivendo, com raios, sombras e tamanhos divergentes.
- A validação automática de 91 destinos internos passa, mas ainda é necessário testar cliques e rotas principais no navegador.
- A base global já possui tokens e foco/reduced-motion; a correção deve consolidar o uso desses padrões, não criar uma estética paralela.

## Implementação
1. **Home e primeira visita**
   - Revisar a home efetivamente usada, simplificar hierarquia e chamadas concorrentes.
   - Tornar Bíblia, Catecismo, Estudar, Rezar e continuidade imediatamente compreensíveis.
   - Ajustar busca, cartões de ambientes, prova social/rodapé apenas onde já existirem e forem funcionais.

2. **Navegação compartilhada**
   - Padronizar cabeçalho, menu móvel, navegação inferior, links ativos, voltar e destinos principais.
   - Corrigir ações sem destino, destinos incoerentes e áreas clicáveis sem semântica adequada.

3. **Design system e componentes**
   - Consolidar tokens seguros de container, espaçamento, raio, sombra, tipografia e estados.
   - Alinhar Button/Input/Card/Badge/Tabs e componentes Cátedra existentes, evitando reescrever telas.
   - Remover hardcodes visuais de alto impacto somente nos componentes compartilhados e telas principais.

4. **Acessibilidade, ícones e responsividade**
   - Corrigir nomes acessíveis, labels, ordem de headings, foco, alvos de 44px, contraste e semântica.
   - Padronizar ícones de interface na biblioteca existente e remover emojis usados como ícones de controle.
   - Validar 390px, 768px, 1024px e desktop largo, incluindo barras fixas, overflow e texto.

5. **Estados e desempenho**
   - Harmonizar estados loading/empty/error nas jornadas principais.
   - Corrigir carregamentos pesados ou duplicados somente quando houver impacto comprovado, preservando comportamento.

6. **Validação final**
   - Executar validação de links, typecheck, lint/testes relevantes e build disponível pelo ambiente.
   - Fazer uma segunda passagem visual e funcional por home, Bíblia, Catecismo, Estudar, Orações, Glossário e autenticação.
   - Entregar achados, alterações, pendências e resultados objetivos.

## Limites
- Sem mudanças em banco, autenticação, RLS, conteúdo doutrinal ou regras comerciais.
- Sem reformulação artística, módulos novos ou substituição da arquitetura existente.
- Arquivos legados não usados serão apenas documentados, não removidos sem prova de segurança.
