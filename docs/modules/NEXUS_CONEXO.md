# Especificação do Nexus / Conexo

**Versão:** 1.0.0 · **Prioridade:** P0 · **Diferencial central**.

## Propósito
Conectar Bíblia ↔ Catecismo ↔ Magistério ↔ Santos e outras fontes aprovadas, com caminho até a origem e explicação da relação.

## Contrato de relação
Cada relação deve ter ID estável, tipo, origem/destino, referência específica, proveniência/fundamento editorial, estado de revisão, responsável quando aplicável, destino navegável e data de revisão quando suportado. Relações incompletas ou não verificáveis não podem ser apresentadas como confirmadas.

Diferenciar relação oficial, referência editorial, associação temática e sugestão gerada.

## UX e Yá
- Bubbles/cartões são curados e transparentes.
- Indicadores aparecem apenas no versículo/parágrafo que tem relação válida, não indiscriminadamente no capítulo.
- Ao abrir relação, explicar o tipo de conexão e oferecer destino direto.
- Cache não pode transformar dados inválidos ou antigos em relação confirmada.
- Estados carregando, sem conexões, erro e dados disponíveis são distintos.
- Interações acessíveis em mobile, sem depender de hover.
- Yá pode organizar, comparar e explicar com incerteza explícita; não inventa citação, parágrafo ou status de aprovação.

## Critérios P0
- [ ] Cada conexão tem origem/destino/referência/proveniência válidos.
- [ ] Links abrem recurso e posição corretos.
- [ ] Indicadores só aparecem em referências reais.
- [ ] Relações editoriais são rotuladas.
- [ ] Estados vazio/erro/cache explícitos.
- [ ] Desktop/mobile acessíveis.
- [ ] Testes positivos e negativos.
- [ ] Conteúdo gerado não se confunde com fonte oficial.

**Governança:** relações curadas exigem validação editorial; mudanças de schema exigem migração e testes. Aceite não verificado.