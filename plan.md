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
