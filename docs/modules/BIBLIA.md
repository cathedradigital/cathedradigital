# Especificação do módulo Bíblia

**Versão:** 1.0.0 · **Prioridade:** P0 · **Regra:** proteger comportamento estabelecido com regressão.

## Propósito
Leitura bíblica confiável, navegação por livro/capítulo/versículo e conexões verificáveis com Catecismo, Magistério, santos e recursos editoriais.

## Contrato de leitura
- URL canônica representa livro, capítulo e versículo; aliases normalizam sem perder referência.
- Deep link carrega capítulo e identifica o versículo solicitado.
- Reload, voltar e avançar preservam a referência.
- Referência textual resolve para passagem estruturada e mantém a URL conforme contrato canônico.
- Diferenciar carregamento, indisponibilidade, erro de fonte/rede e conteúdo vazio; nunca inventar texto como fallback silencioso.
- Mudanças estruturais exigem regressão de cobertura.

## Integridade e interações
- Traduções identificam idioma, edição/fonte e condições de uso.
- Seletor de livro/capítulo sincronizado com URL.
- Seleção, copiar/compartilhar e anotar com feedback acessível.
- Diário retorna ao livro, capítulo e versículo exatos.
- Indicadores Nexus aparecem apenas quando existe relação válida para aquele versículo.
- Texto e controles mobile sem sobreposição nem overflow horizontal.

## Critérios P0
- [ ] Deep links canônicos e aliases cobertos.
- [ ] Referência textual abre versículo correto.
- [ ] Reload/back/forward preservam estado.
- [ ] Anotação → Diário → contexto retorna ao versículo exato.
- [ ] Sem erros inesperados nos fluxos críticos.
- [ ] Mobile 390 × 844 sem overflow.
- [ ] Indicadores só aparecem para referências válidas.
- [ ] Regressão passa no mesmo SHA candidato.

**Evidência:** aprovação não verificada nesta especificação. Não remover nem enfraquecer asserções existentes.