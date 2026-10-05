# Cátedra Digital — Projeto Mestre de Produto, Telas, Conteúdo e Experiências

> Documento mestre para transformar a visão do Cátedra Digital em um mapa executável de produto: página por página, recurso por recurso e conexão por conexão.
>
> Versão: 1.0  
> Status: Especificação mestre de produto  
> Base: CATEDRA_DIGITAL_PROJETO_OFICIAL.md  
> Regra: este documento amplia a arquitetura existente; não substitui componentes ou fluxos estáveis sem decisão explícita.

---

## 1. Objetivo

Este documento responde à pergunta:

> “Se fôssemos construir o Cátedra Digital hoje, o que cada página deveria fazer e o que ainda falta para que a plataforma seja realmente completa?”

A regra de construção é:

**preservar → ampliar → conectar → validar.**

Não reconstruir módulos que já funcionam sem necessidade.

Cada nova funcionalidade deve, antes de ser criada, verificar:
1. se o componente já existe;
2. se a informação já existe;
3. se outra tela já oferece a mesma ação;
4. se a funcionalidade pode ser uma camada contextual em vez de uma nova página;
5. se a implementação pode reutilizar a arquitetura atual.

---

## 2. Princípio de produto

O Cátedra não deve parecer um conjunto de aplicativos independentes.

Ele deve funcionar como um único ambiente:

**Fonte → contexto → compreensão → conexão → estudo/oração → continuidade.**

Exemplo:

**João 15,1-8**
→ ler
→ compreender a metáfora
→ ver contexto
→ consultar Catecismo
→ consultar Magistério
→ consultar Padres/Santos
→ estudar o tema
→ salvar/anotar
→ continuar depois.

---

## 3. Mapa mestre de ambientes

### 3.1 Átrio
Entrada e orientação.

### 3.2 Estudar
Ambiente principal de leitura e investigação.
- Bíblia
- Catecismo
- Documentos/Magistério
- Nexus/Conexo
- Biblioteca
- Santos
- Igreja Viva
- Temas

### 3.3 Rezar
Experiência contemplativa e prática.

### 3.4 Formar-se
Trilhas e formação estruturada.

### 3.5 Pesquisar
Busca transversal sobre as fontes.

### 3.6 Minha Jornada
Experiência pessoal autenticada.

### 3.7 Camadas transversais
- Conexo
- Glossário
- Pessoas
- Lugares
- Temas
- Cronologia
- Pesquisa
- Favoritos
- Anotações
- Histórico

Essas camadas não devem necessariamente virar páginas independentes. Quando possível, aparecem contextualmente dentro dos leitores.

---

## 4. Convenção de prioridade

### P0 — essencial
Sem isso o módulo não deve ser considerado completo.

### P1 — diferencial
Funcionalidades que tornam o Cátedra significativamente melhor.

### P2 — evolução
Funcionalidades avançadas que podem entrar depois sem alterar a arquitetura principal.

---

## 5. ÁTRIO

### A01 — Página inicial
**P0**
Objetivo: acolher e orientar.
Conteúdo:
- identidade Cátedra;
- busca principal;
- entradas para Estudar, Rezar, Formar-se e Pesquisar;
- continuar de onde parou;
- destaque contextual;
- caminhos de estudo.
Não transformar a página em dashboard congestionado.

### A02 — Continuar
**P0**
Mostra:
- última leitura;
- último estudo;
- última oração;
- última trilha.
Cada item deve retornar ao ponto exato.

### A03 — Descobrir
**P1**
Sugestões editoriais:
- passagem;
- documento;
- santo;
- tema;
- estudo;
- oração.
As sugestões devem apontar para fontes reais.

### A04 — Destaques
**P1**
Conteúdo editorial temporário.

---

## 6. ESTUDAR

### E01 — Hub Estudar
**P0**
Mostrar:
- continuar estudo;
- fontes principais;
- estudos recentes;
- acesso à Bíblia;
- Catecismo;
- Documentos;
- Biblioteca;
- Santos;
- Conexo.

### E02 — Temas de estudo
**P1**
Exemplos:
- Eucaristia;
- oração;
- graça;
- Igreja;
- sacramentos;
- Cristo;
- Maria.
Um tema não deve duplicar textos. Deve reunir referências.

### E03 — Estudo guiado
**P1**
Uma sequência editorial que reúne fontes reais em uma ordem pedagógica.

---

## 7. BÍBLIA

A Bíblia deve ser tratada como um **leitor + ambiente de estudo**, não apenas como um catálogo de livros.

### B01 — Biblioteca bíblica
**P0**
- Antigo Testamento;
- Novo Testamento;
- livros;
- capítulos;
- navegação rápida.

### B02 — Seleção de livro
**P0**
- livros compactos;
- busca;
- grupos;
- estado claro;
- nenhuma opção falsa ou “em manutenção” quando houver conteúdo real.

### B03 — Seleção de capítulo
**P0**
Grade compacta e legível.

### B04 — Leitor bíblico
**P0**
- texto;
- versículos;
- navegação;
- busca;
- controles essenciais;
- continuidade do ponto de leitura.

### B05 — Estudo da passagem
**P0/P1**
Ação contextual no versículo ou passagem.
Estrutura:
**Texto | Contexto | Compreender | Conexo | Referências**
Não precisa ficar tudo aberto ao mesmo tempo.

### B06 — Contexto da passagem
**P0**
- passagem anterior;
- passagem posterior;
- contexto do capítulo;
- contexto do livro.

### B07 — Compreender
**P1**
Camada editorial baseada em fontes.
Pode explicar:
- termos;
- contexto;
- símbolos;
- metáforas;
- parábolas;
- costumes;
- personagens;
- lugares.
A explicação não pode ser apresentada como doutrina inventada.

### B08 — Parábolas e metáforas de Jesus
**P1 — prioridade alta**
Catálogo contextual de passagens como:
- semeador;
- bom samaritano;
- filho pródigo;
- videira e ramos;
- pastor e ovelhas;
- fermento;
- tesouro escondido.
Cada item:
- passagem;
- contexto;
- elementos da metáfora/parábola;
- fontes bíblicas;
- Catecismo relacionado;
- Magistério/Tradição quando catalogado;
- opção de abrir o texto exato.
Regra: distinguir claramente **o texto bíblico**, **interpretação tradicional documentada** e **explicação contextual**.

### B09 — Comparar traduções
**P1**
Quando houver edição licenciada/disponível:
- tradução A;
- tradução B;
- Vulgata;
- outras fontes autorizadas.
Nunca armazenar texto protegido sem base legal.

### B10 — Personagens bíblicos
**P1**
Ficha contextual:
- nome;
- passagens;
- relações;
- cronologia;
- referências.

### B11 — Lugares bíblicos
**P1**
Ficha:
- nome;
- passagens;
- contexto;
- relações.

### B12 — Temas bíblicos
**P1**
Índice de temas ligado a passagens.

### B13 — Linha do tempo bíblica
**P2**
Cronologia editorial da história da salvação.

### B14 — Referências cruzadas
**P0**
Abrir exatamente a referência indicada.

### B15 — Conexo da passagem
**P0**
Mostrar relações catalogadas entre:
- Bíblia;
- Catecismo;
- Magistério;
- Santos/Tradição.
Se não houver relação catalogada:
> “Conexão ainda não catalogada.”
Nunca inventar.

### B16 — Pesquisa bíblica
**P0**
Pesquisa por:
- livro;
- capítulo;
- termo;
- referência;
- tema.

---

## 8. CATECISMO

### C01 — Biblioteca do Catecismo
**P0**
- partes;
- seções;
- capítulos;
- parágrafos.

### C02 — Leitor
**P0**
Experiência editorial semelhante ao leitor bíblico.

### C03 — Parágrafo em contexto
**P0**
Mostrar parágrafos próximos e referências.

### C04 — Compreender
**P1**
Contextualização baseada em fontes.

### C05 — Busca doutrinal
**P0/P1**
Pergunta prática:
> “Onde o Catecismo fala sobre isso?”

### C06 — Temas do Catecismo
**P1**
Índice por conceitos e temas.

### C07 — Glossário doutrinal
**P1**
Termos como:
- graça;
- dogma;
- sacramento;
- virtude;
- justificação;
- transubstanciação.
Cada termo deve apontar para os parágrafos e fontes.

---

## 9. DOCUMENTOS / MAGISTÉRIO

### D01 — Biblioteca de documentos
**P0**
Filtros:
- autor;
- papa;
- concílio;
- tipo;
- ano;
- tema.

### D02 — Página do documento
**P0**
- título;
- autor;
- data;
- metadados;
- contexto;
- índice;
- texto;
- referências.

### D03 — Leitor de documento
**P0**
- âncoras;
- navegação;
- trecho exato;
- voltar ao ponto anterior.

### D04 — Documentos relacionados
**P1**
Relações catalogadas.

### D05 — Linha do tempo do Magistério
**P1**
Percurso histórico:
- pontificados;
- concílios;
- documentos;
- acontecimentos relevantes.

### D06 — Autores/Pontificados
**P1**
Página contextual por autor/pontificado.

---

## 10. NEXUS / CONEXO

O Conexo é principalmente uma **camada de relação**, não um dashboard isolado.

### N01 — Conexo contextual
**P0**
Entrada a partir de uma fonte.
Exemplo:
**João 15,5**
→ Catecismo
→ Documento
→ Santo/Padre
→ outras passagens.

### N02 — Página de conexão
**P1**
Quando necessário, mostrar todas as relações catalogadas de uma fonte.

### N03 — Fonte relacionada
**P0**
Toda relação deve abrir o destino exato.

### N04 — Estado não catalogado
**P0**
Nunca preencher lacunas com conteúdo inventado.

---

## 11. BIBLIOTECA

### L01 — Biblioteca geral
**P0**
Organizar:
- livros;
- documentos;
- fontes;
- obras;
- materiais autorizados.

### L02 — Ficha da obra
**P1**
- autor;
- título;
- data;
- origem;
- tipo;
- disponibilidade;
- relações.

### L03 — Leitor
**P1**
Quando houver texto disponível e autorizado.

---

## 12. SANTOS

### S01 — Biblioteca de santos
**P1**
Busca e filtros.

### S02 — Página do santo
**P1**
- vida;
- cronologia;
- obras;
- fontes;
- espiritualidade;
- documentos;
- passagens relacionadas.

### S03 — Escritos/fontes
**P1**
Somente conteúdo com fonte adequada.

### S04 — Santo ↔ tema
**P1**
Relações catalogadas.

---

## 13. REZAR

### R01 — Página inicial
**P0**
- oração do dia;
- Liturgia das Horas;
- Lectio Divina;
- Rosário;
- Via-Sacra;
- Ladainhas;
- Novenas.

### R02 — Lectio Divina
**P0**
- Lectio;
- Meditatio;
- Oratio;
- Contemplatio.

### R03 — Rosário
**P0**
- mistérios;
- oração;
- progresso.

### R04 — Via-Sacra
**P0**
Estações e texto completo.

### R05 — Ladainhas
**P0**
Biblioteca e leitor.

### R06 — Novenas
**P0**
- dias;
- progresso;
- retorno ao ponto exato.

### R07 — Liturgia das Horas
**P0/P1**
Estrutura de oração e navegação diária conforme as fontes disponíveis.

---

## 14. FORMAR-SE

### F01 — Hub
**P0**
- trilhas;
- continuar;
- progresso.

### F02 — Catálogo de trilhas
**P0**
Filtros e categorias.

### F03 — Trilha
**P0**
- objetivo;
- etapas;
- fontes;
- progresso.

### F04 — Aula
**P0**
- objetivo;
- conteúdo;
- fontes;
- anterior/próxima;
- conclusão.

### F05 — Atividade
**P1**
Atividades simples relacionadas à formação.

### F06 — Certificados
**P2**
Somente após critérios reais de conclusão.

---

## 15. PESQUISAR

### P01 — Pesquisa global
**P0**
Pesquisa única do Cátedra.

### P02 — Resultados
**P0**
Agrupar por:
- Bíblia;
- Catecismo;
- Magistério;
- Santos;
- Patrística;
- Biblioteca.

### P03 — Filtros
**P0/P1**
- fonte;
- autor;
- período;
- tema;
- tipo.

### P04 — Resultado exato
**P0**
Cada resultado deve abrir exatamente o trecho de origem.

### P05 — Pesquisa por pergunta
**P1**
Permitir perguntas naturais, mas sempre retornar fontes verificáveis antes de qualquer síntese.

---

## 16. GLOSSÁRIO

### G01 — Glossário geral
**P1**
Índice alfabético e busca.

### G02 — Ficha do termo
**P1**
- definição;
- origem;
- Bíblia;
- Catecismo;
- Magistério;
- termos relacionados.

O glossário não deve substituir a fonte primária.

---

## 17. PESSOAS, LUGARES E CONCEITOS

Essas entidades podem aparecer como fichas contextuais, sem necessariamente criar dezenas de páginas.

### X01 — Pessoa
**P1**
Exemplo: personagem bíblico, santo, autor.

### X02 — Lugar
**P1**
Contexto e referências.

### X03 — Conceito
**P1**
Definição e fontes.

### X04 — Evento
**P2**
Evento histórico/religioso com cronologia e fontes.

---

## 18. CRONOLOGIA

### C01 — Linha do tempo geral
**P2**
História da salvação + Igreja.

### C02 — Cronologia bíblica
**P2**
Eventos e personagens.

### C03 — Cronologia da Igreja
**P2**
Concílios, pontificados, santos e acontecimentos.

A cronologia deve usar relações, não duplicação de textos.

---

## 19. MINHA JORNADA

### J01 — Página inicial
**P0**
- continuar;
- progresso;
- recentes.

### J02 — Histórico
**P0**
Voltar ao ponto original.

### J03 — Favoritos
**P0**
Fontes salvas.

### J04 — Anotações
**P0**
Anotações vinculadas à fonte.

### J05 — Marcações
**P1**
Trechos marcados.

### J06 — Trilhas
**P0**
Progresso individual.

### J07 — Diário
**P0**
Área privada autenticada.

### J08 — Certificados
**P2**
Histórico de conclusões.

---

## 20. CONTA E CONFIGURAÇÕES

### A01 — Perfil
**P0**
Dados básicos.

### A02 — Preferências
**P0**
- idioma;
- aparência;
- leitura;
- acessibilidade.

### A03 — Privacidade
**P0**
Explicar dados pessoais e operações.

### A04 — Conta
**P0**
Login, logout e segurança.

---

## 21. EXPERIÊNCIA DE INTELIGÊNCIA CONTEXTUAL

A inteligência do Cátedra deve aparecer como **assistência contextual**, não como protagonista.

### I01 — Compreender
Explicar uma passagem com fontes.

### I02 — Comparar
Comparar fontes ou interpretações documentadas.

### I03 — Conectar
Encontrar relações catalogadas.

### I04 — Localizar
Encontrar onde um tema aparece nas fontes.

### I05 — Resumir
Resumir somente conteúdo identificado e verificável.

### Regra de autoridade
A inteligência nunca deve:
- inventar citação;
- inventar documento;
- inventar doutrina;
- apresentar hipótese como fato;
- substituir a fonte original.

---

## 22. MODELO DE DADOS

A regra de armazenamento é:

> **Uma fonte, muitas relações.**

Não duplicar textos completos apenas para criar diferentes experiências.

Exemplo conceitual:

source
→ source_reference
→ topic
→ person
→ place
→ relation

Uma passagem bíblica pode estar relacionada a vários temas sem ser armazenada novamente.

### Conteúdo
Separar:
1. fonte primária;
2. metadados;
3. relação;
4. contexto editorial;
5. conteúdo pessoal do usuário.

### Dados pessoais
Nunca misturar conteúdo pessoal com conteúdo público.

---

## 23. COMPONENTES TRANSVERSAIS

Reutilizar:
- AppShell;
- GlobalHeader;
- Sidebar;
- ModuleHeader;
- Reader;
- ReaderToolbar;
- BookPicker;
- ChapterPicker;
- SourceCard;
- SourcePreview;
- ContextPanel;
- ContextBubble;
- RelatedSources;
- Search;
- SearchFilters;
- BottomSheet;
- SidePanel;
- Modal;
- EmptyState;
- ErrorState;
- LoadingState;
- Toast;
- Progress;
- Timeline;
- EntityCard.

Antes de criar outro componente, procurar um existente.

---

## 24. REGRAS DE UX

### Uma ação = um controle principal
Não duplicar menus.

### Leitura primeiro
O conteúdo nunca deve perder prioridade para decoração.

### Mobile primeiro nas interações
- toque confortável;
- retorno claro;
- menus simples;
- nenhum swipe global que altere módulo acidentalmente.

### Desktop
Usar espaço para contexto, não para aumentar desnecessariamente a largura do texto.

### Estado
Toda tela relevante deve possuir:
- loading;
- vazio;
- erro;
- indisponível;
- sucesso;
- disabled.

---

## 25. REGRAS DE CONTEÚDO

Nunca apresentar como oficial:
- mock;
- seed;
- texto inventado;
- referência falsa;
- conexão não verificada.

Sempre distinguir:

**Fonte | Contexto | Conexão | Explicação**

---

## 26. REGRAS DE LICENÇA

Quando uma tradução, livro ou documento não puder ser armazenado:
- usar referência;
- metadados;
- link para fonte autorizada;
- deep link quando possível.

Não duplicar conteúdo protegido apenas para melhorar UX.

---

## 27. PLANO DE IMPLEMENTAÇÃO INCREMENTAL

### Etapa 1 — Documento mestre
**Agora**
Criar e versionar este documento.
Resultado:
- mapa completo;
- prioridades;
- arquitetura preservada.

### Etapa 2 — Bíblia P0
Próximo bloco:
- leitor;
- navegação;
- referências;
- estudo contextual;
- estados;
- mobile/desktop.

### Etapa 3 — Bíblia P1
Depois:
- compreender;
- metáforas/parábolas;
- personagens;
- lugares;
- temas;
- comparação de traduções.

### Etapa 4 — Catecismo P0
Leitor + busca + contexto.

### Etapa 5 — Documentos P0
Biblioteca + leitor + metadados.

### Etapa 6 — Conexo P0
Conexões reais e navegáveis.

### Etapa 7 — Pesquisa P0
Pesquisa transversal.

### Etapa 8 — Rezar P0
Leitores e continuidade.

### Etapa 9 — Formar-se P0
Trilhas e aulas.

### Etapa 10 — Minha Jornada P0
Histórico, favoritos, notas e progresso.

### Etapa 11 — Camadas P1
- glossário;
- personagens;
- lugares;
- temas;
- cronologias;
- estudos guiados.

### Etapa 12 — P2
Funcionalidades avançadas sem alterar o núcleo.

---

## 28. Regra de preparação para a próxima etapa

Ao concluir cada etapa, deixar explicitamente registrado:
- o que foi implementado;
- o que foi testado;
- o que ficou pendente;
- qual é a próxima etapa;
- quais componentes serão reutilizados;
- quais dados serão necessários;
- quais módulos não devem ser tocados.

Assim cada etapa começa pronta para a seguinte.

---

## 29. Checklist de conclusão de cada página

- [ ] objetivo definido;
- [ ] fonte definida;
- [ ] dados definidos;
- [ ] desktop;
- [ ] mobile;
- [ ] tablet;
- [ ] navegação de entrada;
- [ ] navegação de retorno;
- [ ] loading;
- [ ] empty;
- [ ] error;
- [ ] acessibilidade;
- [ ] sem controles duplicados;
- [ ] sem conteúdo fictício;
- [ ] links/referências corretos;
- [ ] componentes reutilizados;
- [ ] build;
- [ ] testes;
- [ ] produção validada.

---

## 30. Primeira sequência prática

A partir deste documento, a execução deve seguir:

**1. Bíblia P0**
↓
**2. Bíblia P1 — Compreender/Metáforas**
↓
**3. Catecismo P0**
↓
**4. Documentos P0**
↓
**5. Conexo P0**
↓
**6. Pesquisa P0**
↓
**7. Rezar P0**
↓
**8. Formar-se P0**
↓
**9. Minha Jornada P0**
↓
**10. Camadas diferenciais P1/P2**

---

## 31. Regra final

O Cátedra Digital deve crescer por **camadas**, não por remendos.

Cada nova ideia deve responder:

> **Ela melhora a leitura, a compreensão, a conexão, a oração, a formação ou a continuidade?**

Se sim, ela entra no mapa.

Se já existe uma forma de fazer isso, reutilizamos.

Se exigir conteúdo novo, primeiro definimos a fonte.

Se exigir dados novos, primeiro definimos o modelo.

Se exigir uma nova tela, primeiro verificamos se uma experiência contextual resolve.

O objetivo é construir um sistema grande por dentro e simples por fora.

---

## Registro

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-10-05 | Criação do mapa mestre página por página, recursos, prioridades e sequência incremental de implementação |