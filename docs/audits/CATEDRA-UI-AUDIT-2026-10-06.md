# Auditoria geral — Bíblia, Catecismo, Documentos e Nexus — 06/10/2026

## Escopo
Auditoria transversal do ambiente **Estudar**, cobrindo arquitetura visual, UI/UX, tipografia, ícones, organização interna, hierarquia de texto, leitura responsiva, navegação e integração Nexus.

## Padrão oficial
- **Cormorant Garamond**: identidade editorial, títulos, aberturas e hierarquia de obras.
- **Karla**: interface, navegação, metadados e texto funcional.
- Tokens centrais: `--font-display`, `--font-body`, `--font-serif`, `--font-reader`, `--font-ui`.
- Novos componentes não devem declarar famílias tipográficas concorrentes diretamente.

## Correções aplicadas nesta rodada
1. Removidos overrides tipográficos legados dos componentes principais de Bíblia, Catecismo, cabeçalho, sidebar e autenticação.
2. Removido o carregamento independente de Cinzel/Lora/Playfair na Bíblia.
3. CSS legado e aliases Stitch foram reconduzidos aos tokens oficiais.
4. Nexus passou a respeitar o título recebido pelo componente, em vez de sobrescrevê-lo por texto fixo.
5. Pré-visualizações textuais Bíblia↔Catecismo e Nexus foram normalizadas para a tipografia de corpo, evitando serifas editoriais em blocos funcionais.
6. O módulo Estudar já possui uma camada compartilhada de responsividade, foco visível, alvos de toque e coluna de leitura.
7. Os componentes de Nexus documental usam a mesma camada tipográfica Stitch/tokenizada.

## Pontos de arquitetura preservados
- A arquitetura Nexus existente permanece intacta; a auditoria corrige apresentação e integração sem substituir o motor.
- Preferências pessoais de leitura continuam possíveis; elas não criam novas famílias de marca.
- Links externos de fonte original continuam identificados como fonte original quando o dado canônico ainda reside fora da Cátedra.

## Critérios de fechamento
- Uma única identidade tipográfica de marca.
- Hierarquia editorial consistente entre Bíblia, Catecismo e Documentos.
- Controles com alvo mínimo de toque de 44px.
- Ícones funcionais, com significado semântico e sem duplicação desnecessária.
- Texto com largura de leitura controlada e quebra segura em mobile.
- Nexus acessível sem truncamento artificial; buckets podem expandir.
- Estados de carregamento, erro e ausência de conexão explícitos.
- Deep-links e retorno ao contexto preservados.

## Próxima validação
Executar build completo e, em seguida, validação visual responsiva de produção antes de considerar a rodada encerrada.
