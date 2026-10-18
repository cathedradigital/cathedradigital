# Especificação do módulo Átrio

**Versão:** 1.0.0 · **Prioridade:** P0 · **Estado:** especificado; aceite não verificado.

## Propósito
Porta de entrada editorial da Cátedra Digital: orientar o usuário aos conteúdos e módulos, sem parecer painel administrativo.

## Experiência principal
- Identidade Cátedra Digital e caminhos claros para Estudar, Rezar, Formar-se, Pesquisar e Minha Jornada.
- Notícias/atualizações em carrossel, priorizando fontes oficiais da Igreja (Vaticano, CNBB) e veículos católicos identificados.
- Controles anterior/próximo acessíveis, seleção de notícia e link para fonte original.
- Navegação por teclado e toque; não depender de hover.
- Estados loading, vazio e erro distinguíveis. Falha de API não pode parecer lista legitimamente vazia.

## Dados editoriais
Cada item deve ter título, publicador, URL, data quando disponível, texto alternativo de imagem quando aplicável e estado de publicação. Não fabricar notícia, fonte ou data.

## Critérios de aceite
- [ ] Home comunica a proposta e oferece navegação principal clara.
- [ ] Carrossel, seleção e abertura da fonte funcionam.
- [ ] Estados de carregamento/vazio/erro são acessíveis.
- [ ] Sem links quebrados ou erros HTTP/console inesperados.
- [ ] Mobile 390 × 844 sem overflow nem sobreposição crítica.
- [ ] Após deploy autorizado, domínio serve a versão esperada.

## Testes a mapear
Renderização da home, estados de notícias, navegação dos cards, teclado/toque, links internos/externos, mobile e saúde de rede/console. Localizar testes existentes antes de duplicar.

**Evidência:** esta especificação não declara o módulo aprovado. Registrar SHA e artefatos reais.