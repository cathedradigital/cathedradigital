# Auditoria da Bíblia — Cátedra Digital
## 2026-10-03

Objetivo: transformar o módulo Bíblia em um leitor e ambiente de estudo profissional, tomando como referência padrões funcionais observados em aplicativos e plataformas de Bíblia, sem copiar identidade visual ou conteúdo proprietário.

### Referências investigadas
- YouVersion: leitura e áudio, acesso offline, destaques, marcadores, notas, comparação de versões, planos e histórico de leitura.
- Bible Gateway: busca por palavras/frases/referências, comparação lado a lado, notas, destaques, áudio e planos.
- Logos: notas ancoradas no texto, destaques organizáveis, pesquisa avançada, referências cruzadas, workflows e recursos de estudo/originais.
- Catena: comentário ligado ao versículo, Padres da Igreja, referências cruzadas, busca unificada, notas, coleções, sincronização e leitura offline.
- Douay-Rheims: modos Leitura/Estudo/Comparação, referências que abrem o texto do versículo, notas e aparato de estudo ligado ao trecho.
- iBreviary: experiência mobile-first, conteúdo baixável e controles de leitura.

### O que um aplicativo de Bíblia profissional precisa
#### P0 — Fundamento
- 73 livros católicos carregados e íntegros.
- Todos os capítulos e versículos disponíveis, sem texto parcial ou fallback silencioso.
- Fonte rastreável por capítulo/versículo.
- Navegação livro → capítulo → versículo.
- URL profunda estável e compartilhável.
- Voltar/avançar/reload preservando exatamente o contexto.
- Busca por referência e texto.
- Leitura desktop e mobile sem quebrar.

#### P1 — Leitura pessoal
- Destaques por cor.
- Notas ancoradas em versículo.
- Marcadores/favoritos.
- Histórico e último ponto lido.
- Retorno exato a um versículo.
- Compartilhamento de passagem.
- Ajuste de fonte, tamanho, tema e espaçamento.
- Offline com cache íntegro e indicação honesta da origem.

#### P1 — Estudo
- Referências cruzadas reais.
- Rodapé/notas do texto quando a fonte fornecer.
- Abrir referência mostrando o texto real do destino.
- Relações Bíblia ↔ Catecismo/Magistério/Patrística quando houver dados publicados.
- Busca temática sem pontuação artificial.
- Comparação de versões, quando houver textos/licenças disponíveis.
- Introdução, contexto e estrutura do livro.
- Glossário/termos bíblicos.
- Camada de estudo opcional sem poluir a leitura.

#### P2 — Continuidade
- Planos de leitura.
- Progresso sincronizado entre dispositivos.
- Áudio com acompanhamento do texto.
- Leitura diária.
- Coleções pessoais.
- Exportação/importação dos dados pessoais.
- PWA/offline robusto.

#### P2/P3 — Estudo avançado
- Léxico hebraico/grego e morfologia somente quando houver fonte/licença confiável.
- Mapas, linha do tempo e pessoas/lugares.
- Guias de passagem.
- Camada de IA para organizar/compreender, nunca para substituir a fonte primária.
- Rede Nexus navegável e auditável.

### Estado encontrado nesta varredura
- Banco: 73 livros, 1.334 capítulos e 35.816 versículos.
- Cobertura estrutural dos 73 livros já confirmada anteriormente.
- nexus_relations: 0 relações publicadas neste momento; portanto referências reais Bíblia ↔ Catecismo ainda precisam ser alimentadas/publicadas.
- Busca: o frontend chamava bible-search, mas a função não existia no projeto Supabase. Foi criada uma busca real sobre o índice bíblico.
- Busca: removida a pontuação aleatória e a lógica de tema detectado que não representava relevância real.
- Navegação: corrigida a dupla codificação das abreviações de livros na URL.
- Recuperação: removido fallback parcial de Abdias que mostrava apenas três versículos e podia mascarar uma falha da fonte.
- bible-text: mantém recuperação prioritária do banco local e fonte upstream, com ETag/cache e rastreabilidade da fonte.

### Arquitetura alvo do Cátedra
Fonte bíblica verificada → banco/indexação → bible-text → leitor → ações do versículo → Nexus/estudo → Diário/Minha Jornada

A regra principal é: nenhuma camada de estudo pode esconder uma falha da camada bíblica.

### Próximas ondas
1. Validar todos os 73 livros/1.334 capítulos automaticamente.
2. Validar busca por referência e texto em desktop/mobile.
3. Publicar relações Nexus reais e verificar texto de destino.
4. Fechar ciclo versículo → nota → Diário → retorno exato.
5. Implementar comparação de versões somente quando houver fontes/licenças reais.
6. Implementar áudio e planos sem acoplar essas funções ao carregamento do texto.
7. Adicionar ferramentas avançadas de estudo de forma modular.

### Critério de conclusão
A Bíblia só será considerada concluída quando:
- qualquer livro/capítulo válido abrir;
- nenhum capítulo retornar texto parcial silenciosamente;
- busca encontrar referência e texto;
- deep links funcionarem;
- notas/destaques/progresso persistirem;
- referências exibirem o destino real quando o dado existir;
- desktop e mobile passarem os mesmos fluxos críticos;
- erros de fonte forem visíveis e diagnosticáveis;
- CI/E2E comprovarem os fluxos críticos.