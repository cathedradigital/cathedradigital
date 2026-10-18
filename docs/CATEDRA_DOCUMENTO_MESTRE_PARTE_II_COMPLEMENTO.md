# CÁTEDRA DIGITAL

## Documento Mestre Oficial do Produto

### Parte II — Complemento operacional da arquitetura funcional

**Versão:** 1.1 — complemento proposto  
**Status:** Proposta para revisão e aprovação  
**Dependência:** Parte II — Arquitetura funcional e organização dos módulos, seções 12–16  
**Finalidade:** acrescentar critérios executáveis sem substituir os requisitos funcionais originais.

---

## 17. Prioridade de implementação

A implementação deverá ser organizada por risco, dependência e impacto para o usuário. A prioridade não autoriza ignorar requisitos de segurança, integridade editorial ou qualidade.

### 17.1. P0 — integridade e funcionamento essencial

Inclui:

- acesso às áreas principais;
- abertura correta de Bíblia, Catecismo e documentos;
- preservação de referências e destinos;
- autenticação e retorno ao recurso solicitado;
- proteção de dados privados;
- correção de erros que impeçam fluxos principais;
- ausência de referências falsas ou conexões sem destino válido;
- recuperação de erros sem perda desnecessária do contexto.

### 17.2. P1 — integração e continuidade

Inclui:

- conexões verificáveis entre os módulos;
- pesquisa integrada às coleções efetivamente disponíveis;
- continuidade de leitura, estudo e oração;
- persistência confirmada de dados pessoais;
- estados de interface coerentes;
- navegação móvel e acessibilidade dos fluxos principais.

### 17.3. P2 — expansão e aperfeiçoamento

Inclui:

- novos percursos de formação;
- recomendações personalizadas;
- expansão de coleções e conteúdos;
- melhorias editoriais e visuais;
- recursos complementares que dependam de serviços ou conteúdos ainda não disponíveis.

A classificação definitiva de cada item deverá constar do plano de execução, com dependências e critérios de conclusão.

## 18. Contratos de dados e referências canônicas

Os módulos deverão compartilhar identificadores estáveis para representar os recursos que conectam.

Sempre que aplicável, uma referência deverá conter:

- tipo de recurso;
- identificador canônico;
- localização específica, como capítulo, versículo ou parágrafo;
- origem da referência;
- destino resolvível;
- estado de validação;
- metadados de idioma e edição, quando necessários.

Os formatos exatos deverão ser documentados nos contratos técnicos de cada módulo.

### 18.1. Bíblia

Uma referência bíblica deverá identificar de forma inequívoca o livro, o capítulo e, quando necessário, o versículo ou intervalo. A validação deverá respeitar a edição e a estrutura de dados adotadas pelo produto.

### 18.2. Catecismo

Uma referência ao Catecismo deverá identificar o parágrafo e preservar a distinção entre o número do parágrafo e outros parâmetros de navegação.

### 18.3. Magistério e documentos

Uma referência deverá identificar o documento e, quando disponível, sua seção, parágrafo ou localização. O idioma e a edição deverão ser identificados quando puderem alterar a localização ou o texto apresentado.

### 18.4. Conexo / Nexus

Cada conexão deverá registrar a origem, o destino, o tipo de relação e sua procedência. Quando pertinente, deverá distinguir:

- referência explícita da própria fonte;
- relação editorial fundamentada;
- interpretação ou hipótese que exija qualificação.

Conexões quebradas, inválidas ou sem procedência adequada não deverão ser apresentadas como referências confirmadas.

## 19. Matriz de acesso e autenticação

Cada funcionalidade deverá ser classificada antes da implementação em uma das categorias:

1. **Pública:** acessível sem conta, sem expor dados privados.
2. **Autenticada:** exige sessão válida para utilizar a funcionalidade.
3. **Restrita:** exige autorização específica além da autenticação, quando aplicável.
4. **Indisponível:** ainda não implementada ou temporariamente não oferecida; não poderá simular funcionamento.

A classificação deverá ser documentada por funcionalidade, não apenas por módulo.

### 19.1. Retorno após autenticação

Quando uma ação exigir login:

- o destino solicitado deverá ser validado;
- o caminho e os parâmetros permitidos deverão ser preservados;
- após autenticação bem-sucedida, o usuário deverá retornar ao recurso pretendido;
- destinos inválidos ou não autorizados deverão ser tratados com segurança;
- o fluxo deverá ser testado em navegação direta, recarga e dispositivos móveis.

A preservação do destino não poderá permitir redirecionamentos externos arbitrários ou contornar controles de acesso.

### 19.2. Autorização no backend

Operações com dados pessoais deverão ser autorizadas no backend e no banco de dados conforme o modelo de segurança aplicável. A ocultação de um botão ou página não será considerada controle de acesso suficiente.

## 20. Contratos de integração entre módulos

Cada integração deverá possuir uma especificação própria contendo:

- módulo de origem e módulo de destino;
- ação que inicia o fluxo;
- dados e identificadores transferidos;
- parâmetros obrigatórios e opcionais;
- regras de validação;
- autenticação e autorização;
- resultado esperado;
- tratamento de erro e indisponibilidade;
- testes positivos e negativos;
- evidência necessária para a aceitação.

### 20.1. Fluxos mínimos a especificar

Deverão ser definidos e testados, conforme aplicáveis:

- Átrio → cada área principal;
- Bíblia → Catecismo;
- Catecismo → Bíblia;
- Bíblia e Catecismo → Magistério;
- recursos de estudo → Nexus;
- pesquisa → resultado específico;
- conteúdo → percurso de formação relacionado;
- recurso pessoal → Minha Jornada;
- operação que exige autenticação → login → destino original.

Uma integração somente será aprovada quando o destino, o contexto e as permissões forem verificados no fluxo completo.

## 21. Ciclo de vida editorial dos conteúdos

Cada coleção deverá definir como os conteúdos são obtidos, identificados, validados, atualizados e retirados.

O ciclo editorial deverá distinguir, quando aplicável:

- recebido ou importado;
- aguardando validação;
- validado para publicação;
- publicado;
- desatualizado ou com revisão pendente;
- retirado ou indisponível.

A terminologia final poderá variar por coleção, desde que os estados e suas consequências sejam claros.

### 21.1. Metadados

Os metadados deverão incluir os campos relevantes para a natureza do conteúdo, como título, autoria, fonte, data, idioma, edição, licença ou condição de uso, identificador e endereço de origem.

A ausência de um metadado não deverá ser preenchida com uma suposição apresentada como fato.

### 21.2. Texto original, tradução e comentário

Os leitores de documentos deverão distinguir o texto original disponível, as traduções, as adaptações, os resumos e os comentários editoriais.

A interface deverá identificar idioma e natureza do texto com clareza. Não deverá apresentar uma tradução ou síntese como se fosse o original oficial.

### 21.3. Atualização e indisponibilidade

A atualização de uma fonte externa não deverá apagar silenciosamente metadados necessários para identificar o material anteriormente consultado. Quando uma fonte ficar indisponível, o sistema deverá comunicar a situação sem inventar um destino alternativo.

## 22. Critérios complementares por módulo

Além dos requisitos já definidos nas seções 12.1–12.6, cada módulo deverá cumprir os critérios abaixo conforme seu escopo.

### 22.1. Átrio

- Todos os acessos principais deverão levar a destinos válidos.
- Carrosséis deverão oferecer controles acessíveis e comportamento previsível em dispositivos móveis.
- Conteúdos secundários deverão falhar de forma isolada sempre que possível.
- Continuidade personalizada deverá respeitar autenticação, permissões e disponibilidade real dos dados.

### 22.2. Estudar

- Bíblia, Catecismo e documentos deverão abrir referências diretas válidas.
- A navegação deverá preservar a localização de leitura quando prevista.
- Referências cruzadas deverão conduzir ao conteúdo correspondente.
- A indicação visual de conexão deverá existir apenas quando a referência subjacente for válida.
- O texto original, a tradução e o comentário deverão ser distinguíveis.

### 22.3. Rezar

- Cada modalidade deverá possuir critérios próprios de aceitação.
- O progresso só deverá ser salvo quando houver confirmação da persistência prevista.
- Textos e versões deverão ser identificados conforme a política editorial.
- Recursos de interface não deverão bloquear desnecessariamente a sequência da oração.

### 22.4. Formar-se

- Cada percurso deverá indicar objetivo, conteúdo e critérios de conclusão.
- Progresso e conclusão deverão seguir regras explícitas.
- A simples abertura de uma página não deverá equivaler automaticamente à conclusão de uma etapa, salvo se isso fizer parte do critério aprovado e estiver claramente definido.

### 22.5. Pesquisar

- Os resultados deverão provir de coleções efetivamente pesquisáveis.
- Cada resultado deverá identificar sua categoria e abrir o destino correspondente.
- Resultados aproximados deverão ser diferenciados de correspondências exatas.
- Resultados privados deverão respeitar as permissões do usuário.
- Falhas de indexação ou consulta não deverão ser apresentadas como ausência definitiva de conteúdo sem base adequada.

### 22.6. Minha Jornada

- O usuário deverá distinguir dados persistidos de alterações pendentes.
- Operações de gravação deverão confirmar o resultado.
- Dados privados deverão estar protegidos contra acesso por outros usuários.
- Exclusão, retenção e exportação deverão seguir as políticas aplicáveis e os recursos efetivamente implementados.

## 23. Plano de verificação e aceitação

A validação deverá ser definida por requisito e por fluxo, não apenas por quantidade total de testes.

Para cada requisito relevante, o plano de testes deverá registrar:

- identificador do requisito;
- cenário inicial;
- ação executada;
- resultado esperado;
- resultado observado;
- evidência;
- status;
- versão ou commit testado.

### 23.1. Classes de testes

Conforme o escopo, deverão existir:

1. testes unitários de regras isoladas;
2. testes de componentes e estados de interface;
3. testes de integração entre módulos e serviços;
4. testes de autenticação e autorização;
5. testes de persistência e recuperação;
6. testes de navegação direta e preservação de contexto;
7. testes de responsividade e acessibilidade;
8. testes de regressão;
9. verificações de build, segurança e dependências;
10. verificações de produção após publicação.

### 23.2. Computador e dispositivos móveis

Os fluxos críticos deverão ser verificados em computador e em uma configuração móvel representativa. A matriz final de navegadores, resoluções e dispositivos deverá ser registrada no plano de testes.

Os testes deverão verificar comportamento funcional, legibilidade, controles, rolagem, navegação e ausência de sobreposições impeditivas.

### 23.3. Integridade dos testes

Uma falha deverá ser classificada com base em evidências, distinguindo defeito do produto, falha de ambiente, problema de dados e problema de automação.

Os testes não deverão ser removidos ou enfraquecidos apenas para obter aprovação. Uma alteração em um teste deverá ter justificativa técnica, revisão e rastreabilidade.

## 24. Publicação e verificação da versão efetiva

A publicação será uma etapa independente da implementação e da aprovação dos testes.

O processo de entrega deverá identificar:

- commit ou versão aprovada;
- resultado das verificações obrigatórias;
- ambiente de destino;
- resultado da publicação;
- versão efetivamente servida;
- evidências de funcionamento dos fluxos críticos;
- problemas remanescentes e sua classificação.

No ambiente de produção, deverão ser verificados os domínios e destinos definidos na configuração oficial do projeto, incluindo rotas críticas e os recursos de SEO pertinentes, como `robots.txt` e `sitemap.xml`.

Uma resposta HTTP bem-sucedida ou a existência de arquivos estáticos não comprova, isoladamente, que a interface correta está sendo servida.

Nenhuma entrega deverá ser declarada publicada e validada sem evidência correspondente. Se alguma etapa não puder ser verificada, isso deverá constar explicitamente no relatório.

## 25. Registro de conclusão por requisito

Cada requisito deverá possuir um status independente:

- **Especificado:** o comportamento esperado está documentado.
- **Implementado:** existe código ou configuração correspondente.
- **Testado:** os testes definidos foram executados e seus resultados registrados.
- **Aprovado:** os critérios de aceitação foram satisfeitos e a revisão exigida foi concluída.
- **Publicado:** a versão aprovada foi disponibilizada no ambiente de destino e sua presença foi verificada.

O status deverá estar associado ao requisito e à versão correspondente. Uma funcionalidade poderá estar implementada sem estar aprovada, ou aprovada sem estar publicada.

## 26. Relação com os documentos técnicos complementares

A Parte II será detalhada por especificações complementares, no mínimo:

1. arquitetura técnica e contratos de dados;
2. autenticação, autorização e segurança;
3. especificação funcional e visual do Átrio;
4. especificações da Bíblia, do Catecismo e do Magistério;
5. contratos e regras de validação do Nexus;
6. especificação das experiências de oração;
7. formação, pesquisa e Minha Jornada;
8. design system e acessibilidade;
9. governança editorial e gestão de fontes;
10. plano de testes, observabilidade e publicação.

Esses documentos deverão identificar os requisitos que detalham, evitando duplicações contraditórias e mantendo rastreabilidade até os critérios de aceitação.

---

**Fim do complemento da Parte II.**

**Status:** proposta para revisão e aprovação. Este complemento define critérios de execução e validação; não comprova que os módulos estejam implementados, aprovados ou publicados.
