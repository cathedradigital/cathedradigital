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
