# Especificação do módulo Catecismo

**Versão:** 1.0.0 · **Prioridade:** P0.

## Propósito
Disponibilizar o Catecismo da Igreja Católica com texto fiel à fonte oficial, navegação por parágrafo, proveniência visível e conexões editoriais verificáveis.

## URL e leitura
- O parâmetro canônico de parágrafo é p; aliases como paragraph devem ser aceitos quando previstos e normalizados.
- Deep links exibem parágrafo e cabeçalho, inclusive limites §1 e §2865.
- Busca por número/tema abre o resultado correto e atualiza a URL.
- Anterior/próximo atualiza conteúdo e URL e respeita limites do corpus.
- Reload e retorno do Diário preservam parágrafo original.
- Referências bíblicas abrem o destino correto.

## Fidelidade editorial
- Preservar texto oficial e acentos; não mostrar entidades HTML escapadas literalmente.
- Exibir proveniência e link para fonte oficial quando disponível.
- Separar texto oficial, nota editorial e comentário de Yá.
- Não fabricar texto nem atribuir paráfrase ao Catecismo.
- Relações Conexo devem ser rotuladas e navegáveis.

## Critérios P0
- [ ] Deep links §1, §25, §26, §2262 e §2865.
- [ ] Alias paragraph=2865 normaliza para p=2865.
- [ ] Busca, anterior/próximo e limites funcionam.
- [ ] Mt 5,21 abre local correto na Bíblia.
- [ ] Proveniência oficial visível e navegável.
- [ ] Sem entidades HTML indevidas.
- [ ] Anotação → Diário → parágrafo exato.
- [ ] Nexus/Yá acessível no mobile, sem navegação duplicada/overflow.
- [ ] Sem erros inesperados de rede/console.

**Evidência:** requisitos documentados, não aprovação presumida. Registrar SHA e artefatos.