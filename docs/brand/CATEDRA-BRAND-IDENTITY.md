# Cátedra Digital — Identidade Tipográfica

**Status:** decisão oficial de identidade visual  
**Data:** 6 de outubro de 2026

## Decisão

A família tipográfica editorial oficial da Cátedra Digital é **Cormorant Garamond**.

Para a interface e os textos corridos, a família complementar oficial é **Karla**.

A combinação é intencional: **Cormorant Garamond + Karla**.

## Por que Cormorant Garamond?

A Cátedra precisa comunicar simultaneamente tradição, estudo, contemplação e presença contemporânea. Cormorant Garamond foi escolhida porque reúne essas quatro qualidades sem transformar a interface em uma reprodução literal de uma tipografia eclesiástica histórica.

### Características que representam a Cátedra

- **Editorial e erudita:** possui desenho de serifas próprio de livros, ensaios e obras de referência.
- **Contemplativa:** suas formas têm ritmo vertical e contraste suficiente para títulos solenes sem parecer ornamental demais.
- **Humana:** não tem a rigidez institucional de uma fonte puramente cerimonial.
- **Católica sem ser caricatural:** remete à tradição escrita e bibliográfica, mas não depende de símbolos ou estilos religiosos óbvios.
- **Elegante e atemporal:** funciona tanto em uma página de oração quanto em Bíblia, Catecismo, Magistério, Santos e formação.
- **Distintiva:** cria uma assinatura visual reconhecível para o Cátedra sem depender de fontes genéricas de dashboard.

## Por que Karla acompanha a Cormorant?

Karla entra como voz de interface e apoio editorial. Ela tem desenho limpo, boa leitura em tamanhos pequenos e suficiente personalidade para não deixar o sistema com aparência de uma aplicação genérica.

A separação de funções é:

- **Cormorant Garamond:** identidade, títulos, nomes de obras, grandes aberturas e momentos editoriais.
- **Karla:** navegação, controles, metadados, labels e textos corridos de interface.
- **Texto bíblico e documentos:** seguem a mesma fundação tipográfica do sistema; preferências específicas de leitura podem existir, mas não podem introduzir famílias de marca concorrentes.

## Regra de identidade

A Cátedra não deve usar Playfair Display, Lora, Cinzel, Inter ou outra família como identidade visual paralela.

Essas famílias podem existir em arquivos históricos, documentação técnica ou páginas isoladas de manutenção, mas **não fazem parte da identidade tipográfica oficial da aplicação**.

Novos componentes devem consumir os tokens tipográficos centrais, nunca declarar uma família diretamente em estilos inline.

## Tokens oficiais

- --font-display: Cormorant Garamond
- --font-body: Karla
- font-display: token editorial de título
- font-serif: alias editorial compatível, apontando para o sistema oficial
- font-reader: alias de leitura compatível, apontando para o sistema oficial
- font-ui: alias de interface, apontando para o sistema oficial

## Critério de aprovação

Ao navegar entre Átrio, Estudar, Bíblia, Catecismo, Magistério, Santos, Rezar, Formar, Pesquisar e Minha Jornada, a pessoa deve perceber **uma mesma instituição e uma mesma voz visual**, e não vários produtos diferentes reunidos no mesmo site.

A tipografia é parte da marca. Portanto, qualquer nova fonte deve ser tratada como uma alteração de identidade, e não como uma decisão local de componente.

## Relação com a marca

A marca visual da Cátedra é baseada na ideia de uma **cátedra como lugar de ensino, transmissão e contemplação da tradição**. A tipografia deve reforçar essa ideia: autoridade sem rigidez, tradição sem nostalgia e beleza sem excesso.

A Cormorant Garamond representa o lado bibliográfico e contemplativo da Cátedra; Karla garante que essa tradição permaneça funcional e legível no ambiente digital.

## Nota sobre a logo

A logo e seus significados devem ter um registro próprio de identidade visual. Este documento registra a decisão tipográfica e sua relação com a marca, mas não substitui o documento específico de construção e significado do símbolo.
