# Nexus / Conexo — contrato editorial e técnico

## Finalidade

O Nexus conecta Bíblia, Catecismo, Magistério, santos e outros conteúdos católicos para ajudar a compreender relações entre fontes. É uma camada de contexto rastreável, não uma autoridade doutrinal paralela.

## Tipos de relação

Cada relação deve declarar seu tipo, origem e destino, além da proveniência disponível:

- **Citação direta:** texto ou referência explicitamente presente na fonte; requer fonte verificável.
- **Referência explícita:** a fonte aponta diretamente para outra passagem/documento.
- **Relação temática/editorial:** conexão curada por tema; deve ser rotulada como contexto editorial.
- **Relação assistida por IA:** sugestão não confirmada; não deve ser apresentada como citação nem como relação oficial antes de revisão.

## Requisitos de dados

Uma relação publicável deve possuir identificadores canônicos, tipo de relação, referência de origem, referência de destino, fonte/proveniência e metadados suficientes para evitar duplicação. IDs ausentes, destino inexistente e relação ambígua devem gerar diagnóstico, não uma ligação inventada.

## Requisitos de interface

- Informar claramente o que é fonte primária e o que é contexto.
- Mostrar referências canônicas e link funcional para abrir o destino.
- Permitir retorno à passagem/parágrafo de origem.
- Não duplicar painéis de Conexo no mesmo contexto de leitura.
- Não depender exclusivamente de cor ou de bolhas decorativas para indicar relações.
- Estados vazios/erro devem ser honestos e não ocultar falha de consulta.

## Cache e fallback

- Cache de texto não pode impedir o carregamento independente das relações.
- Fallback editorial local só pode usar um mapa versionado e revisado, com rótulo explícito de contexto editorial.
- Erros de banco não podem ser silenciosamente convertidos em afirmação de que o banco contém a relação.
- Atualizar apenas o contexto ativo quando possível, sem bloquear a leitura.

## Regressões críticas

- Relações disponíveis tanto em cache hit quanto cache miss.
- Bíblia → Catecismo e Catecismo → Bíblia com destino exato.
- Preservar livro/capítulo/versículo ou número do parágrafo ao voltar.
- Deep links §1, §2262 e §2865.
- Validar uma relação bíblica como Gn 1:1 e confirmar destino canônico.
- Desktop e mobile; ausência de duplicação, overflow e erros de rede.
- Revisão editorial para garantir que nenhuma relação contextual seja rotulada como citação direta.