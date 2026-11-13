# Consolidação da identidade Cathedra Digital

## Direção escolhida

**Editorial monástica contemporânea**: uma única família tipográfica serifada, escala sóbria, azul-petróleo e dourado usados como assinatura, e um wordmark único em `Cathedra Digital`.

- **Princípios:** legibilidade, continuidade entre módulos, sobriedade e reconhecimento imediato.
- **Tipografia:** `Cormorant Garamond` como família institucional única; fallbacks serifados apenas como contingência técnica.
- **Marca:** grafia oficial não traduzida `Cathedra Digital`, capitalização Title Case.
- **Cores:** manter os tokens existentes de ambiente; reservar o dourado para marca e estados institucionais.
- **Assets:** preservar o símbolo/favicons existentes, mas usar um contrato textual e tipográfico único.

## Implementação

1. Unificar tokens CSS, aliases Tailwind e estilos legados na família institucional.
2. Remover famílias explícitas divergentes de componentes críticos.
3. Normalizar grafias visíveis, SEO, fallback de OG e documentação ativa.
4. Atualizar o guia do design system e as regras do auditor para refletir o contrato real.
5. Executar typecheck, lint, build e os testes públicos afetados.

## Fora do escopo desta etapa

Aliases históricos em migrações de compatibilidade não serão apagados; serão mantidos para não quebrar normalizações já aplicadas. Fontes monoespaçadas de logs, diff e ferramentas técnicas continuam permitidas porque não fazem parte da identidade editorial.

## Melhorias prioritárias — Glossário e Biblioteca digital

### Objetivo

Seguir as prioridades aceitas: (1) confiabilidade de fontes e metadados; (2) encontrabilidade; (3) conexões contextuais; (4) retomada, distinguindo sempre a navegação recente local do progresso de leitura realmente salvo.

### Decisões de implementação

- No Glossário, usar apenas os valores existentes de `editorial_completeness` para oferecer filtro adicional, preservando busca/categoria e tratando `q`, `category` e `completeness` na URL como fonte da verdade, inclusive em Voltar/Avançar.
- Enquanto a busca atual estiver pendente, ocultar resultados/avisos obsoletos da consulta anterior; quando a RPC fuzzy falhar e o fallback usar os registros já autorizados/carregados, anunciar que os resultados são locais e simplificados, permitir nova tentativa e manter falhas de leitura/permissão como estados distintos.
- Quando não houver bibliografia cadastrada, descrever essa ausência sem prometer publicação futura. Não criar nem completar referências.
- Na Biblioteca editorial, identificar a lista local de recentes como itens abertos neste navegador, remover o percentual fixo que não representa posição real, e oferecer navegação direta ao catálogo filtrável `/acervo/lista` e à home de retomada `/acervo`.
- Substituir o bloco semanal e os claims/citações sem proveniência visível por caminhos de navegação para catálogo, Santos e Magistério, mantendo os componentes e tokens visuais existentes.
- Preservar os componentes de Nexus, leitor, busca unificada e as estruturas atuais; sem migração, sem escrita no banco e sem promessa de sincronização de leitura.
- No carrossel mobile, abrir o submenu sem mudar de rota ao tocar no ambiente; persistir somente a chave não sensível no estado da entrada atual do histórico para sobreviver a remount, limpar ao fechar, abrir item ou deslizar e preservar sem alteração outros formatos de estado. A navegação canônica ocorre quando o usuário escolhe um item.

### Estrutura do projeto afetada

- `src/components/cathedra/GlossaryPage.tsx`: índice, busca, filtros e estados de resultados.
- `src/pages/GlossaryTermPage.tsx`: transparência do grau editorial, status, versão e estado sem bibliografia.
- `src/pages/AtriumBibliotecaPage.tsx`: itens recentes, atalhos canônicos e navegação editorial.
- `src/components/mobile/MobileModuleCarousel.tsx`: estado transitório do submenu durante mudança de ambiente.
- `src/hooks/useFuzzySearch.ts`: consumidor atual já expõe o erro da RPC; reutilizar essa informação, sem alterar o contrato do hook se não for necessário.
- `e2e/glossary-resilience.spec.ts`, `e2e/estudar-public-smoke.spec.ts` e novo teste público da Biblioteca: verificar fallback, navegação do carrossel e contratos visíveis sem modificar dados remotos.

### Direção visual

Reutilizar a direção editorial monástica contemporânea e tokens `stitch-*` existentes. Priorizar rótulos legíveis, chips que quebrem linha em telas estreitas, estados acessíveis (`role=status`, `aria-pressed`) e sinais claros de fonte/limite; nenhuma mudança de identidade ou ilustração.

### Fora do escopo

Não alterar schema, popular fontes, atribuir autoridade doutrinal a um grau editorial, sincronizar `localStorage` com a conta, inventar percentuais/posições de leitura ou expandir o conteúdo doutrinal sem fonte identificável.

## Seletor de idioma no cabeçalho

- Integrar o seletor ao `MobileTopBar`, a barra utilizada nas páginas de módulos em mobile; manter o `AppHeader` desktop e não estender este escopo à `HomeUnified`.
- Em telas estreitas, exibir só o globo em botão de 44 px; em viewports maiores, manter o código abreviado. Preservar o nome acessível com o idioma atual e os nomes nativos no menu.
- Preservar a troca de locale existente (prefixo de URL, caminho, query e hash), sem acrescentar idiomas nem assumir que o conteúdo todo já está traduzido.
- Cobrir visibilidade, opções e troca localizada com E2E em viewport mobile; executar os gates locais pertinentes antes de solicitar publicação.
