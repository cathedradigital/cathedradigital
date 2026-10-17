# Design system — Cátedra Digital

## Objetivo

Criar uma linguagem visual reconhecível, contemplativa, acessível e consistente. Cada módulo pode ter uma paleta sem criar um produto visualmente fragmentado.

## Tokens e fonte de verdade

Antes de criar cores, tipografia, espaçamentos, sombras ou raios novos, localizar e reutilizar os tokens e componentes existentes. A paleta compartilhada atual está em `src/lib/sacredPalette.ts`; o projeto também contém ferramentas de auditoria de design. Este documento define governança, não substitui os valores reais do código.

- Evitar hexadecimais, espaçamentos e estilos inline novos fora das fontes de tokens justificadas.
- Não renomear nem substituir tokens globais em uma auditoria de módulo sem mapear todos os consumidores.
- Cores de capas editoriais podem ser específicas da obra; não devem ser usadas como justificativa para duplicar tokens de interface.
- Alterações de fonte devem ser globais, justificadas e verificadas em desktop/mobile e em caracteres portugueses.

## Identidade e tipografia

- Marca exibida: **Cátedra Digital**, sempre com “TH” na identidade inglesa quando usada como *Cathedra Digital*.
- Usar a família tipográfica já configurada no projeto. O auditador existente recomenda Cinzel em títulos e Inter no corpo; confirmar a configuração efetiva antes de alterar fontes.
- Hierarquia recomendada: título de página; título de seção; metadados; corpo de leitura; notas, proveniência e ações secundárias.
- Texto de leitura deve priorizar conforto, largura de linha adequada, altura de linha e contraste, sem espaçamento fragmentado artificialmente.

## Princípios de composição

- Leitor de conteúdo como área principal; controles secundários discretos e previsíveis.
- Uma única navegação lateral principal, acessível por acionador de menu consistente.
- Não duplicar abas, chips ou barras de navegação para Bíblia/Catecismo/Documentos quando o contexto e a sidebar já resolvem a orientação.
- Cabeçalho mobile não deve sobrepor logotipo, seta de retorno ou controles.
- Evitar bolhas decorativas, sombras excessivas, elementos circulares concorrentes e ícones sem função.
- Estados de carregamento, vazio, erro e sucesso devem ser explícitos; não simular sucesso quando a operação falha.

## Paletas por módulo

A paleta é uma identidade contextual, não uma licença para reduzir contraste. Antes de ajustar, verificar a implementação atual e preservar tokens semânticos comuns.

| Área | Intenção visual | Regra |
|---|---|---|
| Átrio | acolhimento, orientação, luz | identidade institucional e destaques editoriais legíveis |
| Bíblia | leitura, silêncio, concentração | contraste alto e controles mínimos |
| Catecismo | precisão, referência, estrutura | hierarquia clara de parágrafo e proveniência |
| Magistério/Documentos | autoridade documental | autor, data, idioma e origem destacados |
| Nexus/Conexo | relações e contexto | relações distinguíveis sem depender apenas de cor |
| Rezar | serenidade e ritmo | reduzir distrações durante a oração |
| Biblioteca | descoberta editorial | capas podem variar; navegação permanece consistente |
| Minha Jornada | continuidade pessoal | estados privados e progresso compreensível |
| Yá | assistência e explicação | identidade própria sem competir com a marca nem parecer autoridade doutrinal |

Os acentos dos cinco ambientes de navegação e do Átrio são centralizados em `src/lib/sacredPalette.ts` (`MODULE_PALETTES`). O Átrio usa ouro institucional sobre a base azul-petróleo; Estudar, Rezar, Formar-se, Pesquisar e Minha Jornada mantêm os acentos específicos existentes. `scripts/validate-module-contracts.mjs` verifica que a navegação consome os tokens e que a rota raiz aplica a paleta do Átrio.

## Acessibilidade cromática e interação

- Não comunicar estado apenas por cor; usar texto, ícone ou forma complementar.
- Texto normal deve mirar contraste WCAG AA (4.5:1); texto grande e componentes gráficos devem cumprir os limiares WCAG aplicáveis.
- Foco visível, alvos acionáveis adequados a toque, rótulos acessíveis e suporte a teclado.
- Respeitar redução de movimento; animações de marca devem ser discretas e não bloquear conteúdo.
- Testar tema claro/escuro se ambos estiverem disponíveis.

## Processo de mudança

1. Identificar token e consumidores.
2. Fazer mudança mínima e semântica.
3. Rodar auditoria visual, lint, typecheck e build.
4. Verificar contraste, foco, overflow e estados em 390×844 e desktop; incluir 320/360/412 px quando houver layout responsivo.
5. Anexar screenshots ou relatório verificável ao PR.
6. Não declarar a auditoria visual concluída apenas porque o build passou.