# Especificação do módulo Pesquisar

**Versão:** 1.0.0 · **Estado:** especificado; aceite não verificado.

## Propósito
Encontrar conteúdo confiável no acervo da Cátedra com resultados compreensíveis, filtros úteis e proveniência clara.

## Contrato de busca
- Tratar consultas previsivelmente; nunca executar entrada como código.
- Resultado identifica título, tipo, trecho contextual quando disponível, autoridade/fonte, idioma e destino canônico.
- Filtros/ordenação indicam seu efeito e mantêm estado coerente com URL quando previsto.
- Consulta vazia, zero resultados e falha do serviço são estados distintos.
- Respeitar autorização: conteúdo privado/administrativo não pode vazar em busca pública.
- Relevância de busca não equivale a autoridade doutrinal.

## Acessibilidade
Busca por teclado, rótulo acessível, carregamento anunciado, foco previsível ao abrir resultado e filtros móveis que não bloqueiam conteúdo.

## Critérios de aceite
- [ ] Resultados relevantes e destinos navegáveis.
- [ ] Tipo e proveniência visíveis.
- [ ] Loading/vazio/erro distintos.
- [ ] Filtros previsíveis.
- [ ] Conteúdo privado protegido.
- [ ] Sem erros inesperados em fluxos críticos.
- [ ] Layout responsivo e acessibilidade verificados.

Mapear testes de título/tema/referência, filtros, zero resultados, erro de serviço, deep link, permissões e mobile.