# Estudar — padrão UX/UI por módulo

## Objetivo
O ambiente Estudar usa uma identidade azul/teal contextual, mas o conteúdo de leitura permanece neutro. A cor identifica o lugar; não compete com a Palavra, documentos ou texto teológico.

## Padrão comum
Todos os módulos devem obedecer ao mesmo esqueleto:
1. Entrada — título, kicker, contexto e ação principal.
2. Navegação local — tópicos do ambiente visíveis no cabeçalho contextual.
3. Conteúdo — coluna confortável, hierarquia tipográfica consistente.
4. Referências/Nexus — conexões aparecem depois ou ao lado do conteúdo, sem interromper a leitura.
5. Continuidade — próximo passo claro dentro da Cátedra.
6. Estados — loading, vazio, erro recuperável e sucesso.
7. Mobile — prioridade à leitura, controles acessíveis e alvos de toque >= 44px.

## Matriz da primeira rodada
| Módulo | Entrada | Leitura/consulta | Mobile | Próxima revisão |
|---|---|---|---|---|
| Bíblia | livro + capítulo | coluna ~46rem, versículo escaneável, fonte ajustável | corpo 17px, line-height ~1.82 | controles de leitura + navegação de capítulo |
| Catecismo | partes I–IV + busca | parágrafo como unidade canônica | cards/índice em 1 coluna | densidade do leitor § + referências |
| Documentos/Magistério | filtros + documentos | documento longo + referências | filtros colapsáveis | leitor documental e filtros |
| Nexus | busca + vozes | relações verificadas | cards em coluna | visualização das conexões |
| Biblioteca/Acervo | pesquisa + eixos | coleções, escritos e resultados | tabs roláveis, pesquisa prioritária | arquitetura de descoberta |
| Santos | identidade do santo | biografia, fontes, obras | hero compacto + blocos sequenciais | leitura editorial |
| Igreja Viva | entrada comunitária | posts/perfis/ações | feed legível e CTA principal | comunidade sem competir com Estudar |

## Regras de tipografia
- Texto corrido mobile: aproximadamente 17px.
- Corpo confortável: line-height entre 1.75 e 1.85.
- Coluna de leitura: aproximadamente 46rem / 68ch como teto.
- Títulos usam escala responsiva; não devem ocupar a largura inteira em telas pequenas.
- Nunca reduzir corpo para caber mais conteúdo.
- Referências, metadados e kickers são menores e visualmente secundários.

## Regra de cor
- Estudar: #2f6f8f.
- Acento aparece em filetes, foco, links contextuais, bordas suaves e pequenos indicadores.
- Superfícies usam o acento em baixa opacidade.
- Texto principal continua usando tokens neutros.
- Cada módulo interno pode ter uma assinatura editorial própria, mas não substitui a identidade do ambiente.

## Critério de aceite
Um módulo só sai desta revisão quando desktop e mobile forem coerentes, os estados principais forem tratados, a leitura tiver medida confortável, os links forem internos quando houver destino Cátedra, e o Nexus não interromper o fluxo principal.

## Ordem de execução
1. Fundação Estudar.
2. Bíblia.
3. Catecismo.
4. Magistério/Documentos.
5. Biblioteca.
6. Santos.
7. Nexus.
8. Igreja Viva.

A ordem é de implementação, não de importância doutrinal.
## Especificação visual da rodada 2 — módulos internos

A segunda camada usa o mesmo sistema de leitura do Estudar e acrescenta uma assinatura cromática discreta por módulo. A assinatura aparece em filetes, foco, bordas e superfícies suaves; nunca substitui os neutros do texto.

| Módulo | Assinatura | Estrutura principal | Regra mobile |
|---|---|---|---|
| Bíblia | azul/teal do Estudar | livro/capítulo → leitura → referências → continuidade | corpo ~17px, line-height ~1.82, coluna confortável, controles com alvo mínimo de 44px |
| Catecismo | verde-teal editorial | partes/índice → parágrafo canônico → referências | índice em 1 coluna, leitura sem compressão |
| Documentos | ocre editorial | metadados → índice/filtros → documento → referências | filtros compactáveis e texto em coluna de leitura |
| Nexo | violeta editorial | busca → vozes → relações → destino | relações empilhadas e destino sempre identificável |
| Biblioteca | âmbar editorial | busca → eixos/coleções → resultados → leitura | descoberta em uma coluna, abas/painéis roláveis |
| Santos | vinho suave | identidade → biografia → fontes/obras → continuidade | hero compacto e blocos sequenciais |
| Igreja Viva | verde comunitário | entrada → feed/perfis → ação principal | feed legível e CTA principal sem competir com o conteúdo |

### Contrato responsivo
- Mobile: gutters de aproximadamente 16px e alvos de toque de pelo menos 44px.
- Tablet: conteúdo cresce sem transformar leitura em grade estreita.
- Desktop: largura de leitura limitada a aproximadamente 46rem / 68ch.
- O texto não é reduzido para acomodar mais itens.
- Controles de leitura ficam próximos do conteúdo e não exigem navegação lateral para ações frequentes.
- Estados de carregamento, vazio e erro devem preservar a estrutura da página e permitir recuperação quando aplicável.

### Regra de implementação
Os módulos recebem `data-catedra-module` e compartilham `src/styles/estudar-modules.css`. Isso permite evoluir cada módulo separadamente sem duplicar tokens, breakpoints ou regras de leitura.

## Refinamento ponta a ponta — Etapa 3

Esta etapa aplica o mesmo contrato de acabamento aos sete ambientes do Estudar, sem alterar dados, rotas, autenticação ou integrações.

### Ordem de leitura e navegação
- **Bíblia:** contexto → seleção/identificação do livro → capítulo → leitura contínua → conexões → anterior/próximo.
- **Catecismo:** partes → seções → parágrafo → contexto/conexões → navegação de continuidade.
- **Documentos:** documento → metadados → índice/hierarquia → texto longo → referências/destinos.
- **Nexo:** destino principal → relações contextualizadas → ação de abertura; relações não competem com o conteúdo principal.
- **Biblioteca:** descoberta → busca/filtros → item → leitura/abertura; filtros ficam acessíveis sem ocupar a tela inteira.
- **Salto:** entrada editorial → conteúdo principal → blocos sequenciais → continuidade, evitando aparência de dashboard.
- **Igreja Viva:** entrada → feed → filtros/abas → conteúdo → ação principal e estados de carregamento/vazio/erro.

### Contrato responsivo comum
- toque mínimo de 44px para controles interativos;
- coluna de leitura limitada a aproximadamente 68ch/46rem;
- gutters reduzidos no celular e espaçamento progressivo em tablet/desktop;
- navegação horizontal de filtros quando a largura não comportar todos os itens;
- foco visível por teclado e respeito a reduced-motion;
- títulos balanceados e texto de leitura com largura controlada;
- estados de carregamento, vazio e erro preservados sem criar dependência de conteúdo inventado.

### Identidade contextual
Cada módulo mantém seu acento próprio, enquanto o texto de leitura permanece neutro. A identidade cromática não altera a hierarquia doutrinal nem substitui o conteúdo.
