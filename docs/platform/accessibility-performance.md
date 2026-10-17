# Acessibilidade, responsividade e desempenho

## Acessibilidade

- Buscar conformidade WCAG 2.2 AA nas jornadas principais.
- Navegação por teclado e foco visível; ordem de foco previsível.
- Nome acessível para controles icon-only; rótulos para campos e mensagens de erro.
- Semântica correta de títulos, landmarks, botões e links.
- Contraste de texto e componentes conforme os critérios WCAG.
- Diálogos e menus gerenciam foco e podem ser fechados por teclado.
- Respeitar redução de movimento e zoom/reflow.
- Não comunicar estado exclusivamente por cor, ícone ou animação.

## Viewports e interação

- Gate obrigatório atual: mobile 390×844 e desktop.
- Matriz responsiva complementar: 320, 360, 412 px e tablet quando a mudança afetar layout.
- Verificar overflow horizontal, elementos fora da viewport, teclado virtual, safe areas, sticky headers e alvos de toque.
- Confirmar que controles de leitor funcionam; aparência correta não prova comportamento.
- Testar loading, erro, vazio, desconexão e sessão expirada.

## Desempenho

- Medir, não presumir: tamanho do bundle, rotas críticas, imagens, fontes e requisições.
- Lazy-load de módulos pesados sem quebrar deep links ou estado.
- Evitar consultas repetidas, cascatas bloqueantes e re-renderização ampla.
- Definir metas de Core Web Vitals e acompanhar dados de campo quando disponíveis.
- Imagens com dimensões e texto alternativo apropriados; fontes com fallback e estratégia de carregamento.

## Aceite

Toda mudança visual relevante deve incluir evidência em viewport real/simulada, auditoria de console/rede, navegação por teclado e resultado dos testes automatizados pertinentes. O resultado não pode ser inferido apenas pelo build.