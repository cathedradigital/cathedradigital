# Consolidação visual — Cathedra Digital

- [x] Usar `Cathedra Digital` como nome oficial em UI, SEO, assets e documentação ativa.
- [x] Reduzir a identidade editorial a uma única família tipográfica institucional.
- [x] Alinhar tokens, aliases Tailwind, CSS legado e componentes críticos.
- [x] Corrigir wordmarks e fallbacks de marca inconsistentes.
- [x] Validar typecheck, lint, build e E2E público afetado.
- [ ] Fazer commit e push somente após a aprovação do usuário.

# Melhorias prioritárias — Glossário e Biblioteca digital

## Glossário

- [x] O Glossário permite filtrar pelos graus editoriais já cadastrados; `q`, `category` e `completeness` são a fonte de verdade dos controles, permanecem coerentes em deep links/reload e acompanham Voltar/Avançar.
- [x] Se a busca fuzzy estiver indisponível, a interface identifica que os resultados são correspondências locais simplificadas e permite tentar novamente; enquanto a consulta atual está pendente, não mostra resultados nem aviso de erro da consulta anterior. Falha da RPC não se confunde com falha de leitura/permissão do catálogo.
- [x] A ausência de bibliografia, grau, status ou versão é apresentada como metadado não informado, sem prometer publicação futura; nenhuma referência, atribuição ou autoridade é inventada.

## Biblioteca digital

- [x] A lista da página editorial é rotulada como acessos recentes locais; não exibe um percentual ou posição de leitura que não foi salva.
- [x] O caminho “Catálogo de obras” abre `/acervo/lista`, e a retomada/progresso permanece separada em `/acervo`.
- [x] Os destaques encaminham a destinos existentes e descrevem apenas o que esses destinos oferecem, sem alegação temporal, citação ou acervo específico sem proveniência.

## Navegação mobile

- [ ] Ao tocar em um ambiente no carrossel, o submenu correspondente abre sem alterar a rota; o estado do submenu sobrevive a remount; o botão do ambiente e o controle de fechar o encerram sem reabri-lo após reload; abrir um item fecha o submenu e navega ao destino canônico; deslizar para outro ambiente fecha o submenu anterior sem deixar marcador obsoleto; outros formatos de estado de rota não são alterados.

## Validação e liberação

- [x] No candidato local, build, typecheck, lint, validadores de links/módulos/segurança, isolamento Lovable e `bun audit` passaram; a suíte pública completa passou 76/76 em Chromium desktop e mobile, incluindo fechamento do submenu, reload, filtro do Glossário e qualidade da Biblioteca.
- [ ] Após enviar o SHA candidato a `main`, aguardar CI, Estudar E2E (público e autenticado), Security Audit e Estudar final audit aprovados nesse mesmo SHA; o gate normal do workflow Cloudflare deve então publicar e validar endpoints e SEO.
- [ ] Publicação só é considerada concluída após todos os gates exigidos e a confirmação da versão servida no domínio de produção.

## Busca de dogmas e aparições
- [x] A busca de dogmas inclui o ano de definição (ou “Tradição”) além de título, definição, categoria, fonte e referências.
- [x] A busca de aparições inclui relatos, datas, festa litúrgica e todos os campos de avaliação e documentação já cadastrados.
- [x] Dogmas: remover introdução duplicada com largura de 32px; apresentar accordions com superfície e contraste de texto acessíveis em telas estreitas.
- [x] O audit de dependências volta a passar com overrides mínimos para `@hono/node-server` 2.1.6 e `hono` 4.13.16; sem atualização ampla da árvore.

## Refinamento do módulo Pesquisar — Dogmas
- [x] A busca de Dogmas deve aceitar título, definição, categoria e referências, ignorando diferenças de acentuação.
- [x] A consulta e a categoria selecionada devem permanecer coerentes com a URL para deep links e navegação.
- [x] A página deve distinguir lista com resultados de zero resultados e oferecer limpeza dos filtros.
- [x] Busca, filtros e itens expansíveis devem ter rótulos e estados ARIA explícitos, com layout utilizável em telas estreitas.
- [x] Typecheck, lint, build, validadores e o teste focado de Dogmas passaram em desktop e mobile; o teste público do diretório Pesquisar passou em desktop e mantém uma falha preexistente no mobile porque exige visibilidade de “14 caminhos” em um elemento `md:inline` oculto nesse breakpoint.
