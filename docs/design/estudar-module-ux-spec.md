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