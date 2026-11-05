# Especificação do módulo Formar-se

**Versão:** 1.1.0 · **Estado:** contrato funcional vigente; validação visual da revisão 2026-11-03 pendente.

## Propósito
Percursos de formação organizados por objetivo, nível, duração estimada e fontes, conectando leitura, reflexão e prática.

## Contrato de percurso
Cada percurso declara objetivo, público/nível, etapas ordenadas, duração quando disponível, fontes, critérios de conclusão e versão editorial. Abrir uma tela não basta para marcar etapa como concluída.

## Experiência e dados
- Mostrar posição atual, próxima etapa e etapas concluídas.
- Retomar percurso sem perder progresso confirmado.
- Distinguir material obrigatório, complementar e sugestão.
- Ligar conteúdos às fontes canônicas.
- Identificar explicações de Yá como conteúdo de apoio, subordinado às fontes.
- Progresso pessoal exige autenticação/autorização no backend e política documentada de retenção/exclusão.

## Direção visual e UX

A interface pública do módulo é implementada em `src/pages/AtriumJornadasPage.tsx`; a rota `/jornadas` deve permanecer integrada à navegação e à Sidebar compartilhadas. A especificação visual está em `docs/design/FORMAR_SE_DESIGN_SYSTEM.md`.

- Nome funcional visível: Formar-se.
- Priorizar continuidade de percursos iniciados e descoberta de novos percursos.
- Filtros por categoria acessíveis por toque e teclado, com estado selecionado anunciado.
- Em mobile, filtros podem rolar horizontalmente; a página não deve ganhar overflow horizontal.
- Não duplicar navegação global nem introduzir painel administrativo.

## Critérios de aceite
- [ ] Etapas e estados consistentes.
- [ ] Retomada recupera progresso salvo.
- [ ] Conclusão respeita critério explícito.
- [ ] Fontes com proveniência.
- [ ] Falha de salvamento visível e recuperável.
- [ ] Mobile validado em 390 × 844 px e desktop; alvos de toque ≥ 44 × 44 px.
- [ ] Foco visível, filtros acessíveis e ausência de overflow horizontal verificados.
- [ ] Isolamento entre usuários testado.

Mapear testes de percurso novo/em andamento/concluído, retomada, falha, autorização, fontes e responsividade.