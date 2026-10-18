---
name: cathedra-systematic-debugging
description: Investiga falhas da Cátedra Digital por evidências, isola causa-raiz e impede correções especulativas ou enfraquecimento de testes.
---

# Investigação sistemática

## Sequência
1. Recolher SHA, branch, run ID, job ID e nome exato do passo com falha.
2. Ler o log do passo e os passos imediatamente anteriores. Não inferir causa só pelo resumo vermelho.
3. Classificar a falha:
   - código/produto;
   - teste ou seletor;
   - configuração/secrets;
   - dependência/cache;
   - serviço externo;
   - runner/infraestrutura.
4. Formular uma hipótese verificável e uma previsão observável.
5. Fazer uma alteração pequena que teste a hipótese; não combinar correções independentes sem necessidade.
6. Reexecutar no SHA alterado e comparar logs/artefatos. Registrar tempos por etapa quando o objetivo for desempenho.
7. Se a falha for de secret ausente, registrar apenas o nome da variável ausente, nunca seu valor. Não tentar ler ou exportar secrets.
8. Se os testes funcionais não iniciaram, não classificar a execução como falha funcional do produto.
9. Preservar traces e relatórios úteis; sanitizar cookies, authorization headers, tokens e credenciais antes de compartilhar.
10. Reportar evidência, causa confirmada ou hipótese ainda aberta, correção, resultado e próximo bloqueio.

## Desempenho de instalação
- Usar o lockfile versionado com instalação frozen.
- Verificar que a instalação não alterou manifest nem lockfile.
- Separar tempo de instalação de dependências, instalação de browser, build e testes.
- Confirmar cache hit/miss nos logs. Uma única execução com cache miss comprova reprodutibilidade, mas não ganho de tempo.
- Comparar execuções equivalentes antes/depois em condições similares; não alegar ganho sem baseline medido.
