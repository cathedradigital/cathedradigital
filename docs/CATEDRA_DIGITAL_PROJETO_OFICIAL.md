# Cátedra Digital — Projeto Oficial de Produto, UI/UX e Implementação

> Documento-base oficial para orientar a evolução visual, estrutural e funcional do Cátedra Digital.
>
> **Versão:** 1.0  
> **Status:** Base oficial de produto e implementação  
> **Escopo:** experiência completa do Cátedra Digital — desktop, tablet e mobile  
> **Regra:** este documento orienta futuras implementações e deve ser atualizado quando uma decisão estrutural for substituída.

---

## Documento Mestre de Produto

O detalhamento página por página, recursos, prioridades, entidades, camadas contextuais e sequência incremental de implementação está em:

docs/CATEDRA_DIGITAL_PROJETO_MESTRE_TELAS_E_CONTEUDO.md

Este documento oficial continua sendo a base arquitetural. O documento mestre complementa essa base sem substituir decisões estruturais já estabilizadas.

---

## 1. Visão

O Cátedra Digital deve funcionar como uma **biblioteca viva e um átrio digital da Igreja**: acolhedor na entrada, profundo no conteúdo, preciso nas fontes e simples de navegar.

A experiência deve unir:

- estudo;
- oração;
- formação;
- pesquisa;
- conexões entre fontes;
- percurso pessoal do usuário.

A beleza é parte do produto, mas nunca deve competir com a leitura, a oração ou a pesquisa.

### Princípio central

**Fonte → contexto → conexão → ação.**

O sistema deve partir de fontes reais e confiáveis. A inteligência contextual serve para organizar e conectar o conteúdo; não deve inventar fontes, relações ou textos.

---

# 2. Arquitetura principal

O Cátedra será organizado em seis ambientes principais:

1. **Átrio**
2. **Estudar**
3. **Rezar**
4. **Formar-se**
5. **Pesquisar**
6. **Minha Jornada**

### Camada transversal

**Nexus / Conexo** é uma camada de conexão entre Bíblia, Catecismo, Magistério, Santos, Patrística e demais fontes. Não deve ser tratado apenas como uma página independente.

---

# 3. Átrio

## Objetivo

Ser a entrada principal do Cátedra.

O usuário deve entender em poucos segundos:

- onde está;
- o que pode fazer;
- como continuar algo iniciado;
- como encontrar conhecimento.

## Estrutura

### Hero

Mensagem curta e acolhedora:

**“O que você quer compreender hoje?”**

A busca deve parecer uma porta de entrada para o conhecimento, não necessariamente um chatbot.

### Entradas principais

- Estudar
- Rezar
- Formar-se
- Pesquisar
- Minha Jornada

### Conteúdo complementar

- continuar de onde parou;
- destaque do dia;
- documento ou passagem em evidência;
- notícias selecionadas;
- caminhos de estudo.

### Mobile

- hero compacto;
- cards ou pílulas horizontais;
- conteúdo em coluna;
- navegação sempre evidente.

---

# 4. Estudar

## Objetivo

Ser o grande ambiente intelectual do Cátedra.

## Entradas

- Bíblia
- Catecismo
- Documentos / Magistério
- Nexus / Conexo
- Biblioteca
- Santos
- Igreja Viva

A organização pode evoluir, mas o sistema visual deve permanecer único.

## Tela Estudar

Deve apresentar:

- continuidade do estudo;
- estudos recentes;
- caminhos recomendados;
- acesso rápido às fontes;
- pesquisa contextual.

---

# 5. Bíblia

## Objetivo

Oferecer o melhor leitor bíblico possível dentro do Cátedra.

## Tela de leitura

### Cabeçalho

- voltar;
- livro;
- capítulo;
- pesquisa;
- controles essenciais.

**Não duplicar controles.**

### Texto

- excelente legibilidade;
- espaçamento vertical controlado;
- números dos versículos discretos;
- parágrafos visualmente bem agrupados;
- leitura confortável em desktop e mobile.

### Referências

Ao tocar/clicar em uma referência:

1. abrir contexto;
2. mostrar a fonte exata;
3. permitir abrir a fonte completa;
4. preservar o ponto de leitura.

### Desktop

- leitor central;
- painel contextual opcional;
- largura de leitura controlada.

### Mobile

- coluna única;
- toolbar compacta;
- bottom sheet para contexto;
- controles com área de toque adequada.

### Seletores

O seletor de livro/capítulo deve:

- ser opaco;
- ser legível;
- ter fechamento claro;
- não ficar transparente;
- não criar elementos duplicados;
- não cobrir o conteúdo de forma confusa.

### Integridade

Não apresentar conteúdo fictício como Bíblia oficial.

A base existente deve permanecer navegável e verificável.

---

# 6. Catecismo

## Objetivo

Criar um leitor editorial para o Catecismo.

### Elementos

- partes;
- seções;
- números dos parágrafos;
- navegação direta;
- referências cruzadas;
- contexto relacionado.

A experiência deve compartilhar o mesmo motor visual do leitor bíblico.

---

# 7. Documentos / Magistério

## Biblioteca

Filtros por:

- autor;
- pontífice;
- concílio;
- tipo;
- ano;
- tema.

## Leitor

- título;
- metadados;
- índice;
- âncoras;
- trecho exato;
- referências relacionadas.

Quando houver fonte externa, o link deve apontar para o destino específico sempre que possível.

---

# 8. Rezar

## Objetivo

Criar uma experiência contemplativa, silenciosa e prática.

## Entradas

- Liturgia das Horas;
- Lectio Divina;
- Rosário;
- Via-Sacra;
- Ladainhas;
- Novenas.

## Regras

A tela deve privilegiar:

- texto;
- ritmo;
- silêncio visual;
- progresso;
- continuidade.

Evitar excesso de elementos de dashboard.

---

# 9. Formar-se

## Objetivo

Organizar formação estruturada.

### Tela inicial

- trilhas;
- cursos;
- progresso;
- recomendações;
- certificados.

### Aula

- título;
- objetivos;
- conteúdo;
- anterior;
- próxima;
- progresso;
- conclusão.

O progresso deve ficar separado do conteúdo público.

---

# 10. Pesquisar

## Objetivo

Criar uma pesquisa transversal do Cátedra.

## Fontes

Resultados podem ser agrupados por:

- Bíblia;
- Catecismo;
- Magistério;
- Santos;
- Patrística;
- Biblioteca.

## Resultado

Cada resultado deve apresentar:

- fonte;
- referência;
- trecho;
- contexto;
- ação para abrir exatamente aquele ponto.

A fonte primária deve aparecer antes das conexões secundárias.

---

# 11. Minha Jornada

## Objetivo

Ser a área pessoal do usuário.

### Conteúdo

- continuar;
- progresso;
- histórico;
- favoritos;
- anotações;
- marcações;
- trilhas;
- certificados.

### Regra de privacidade

Recursos pessoais devem ficar vinculados ao usuário autenticado.

A interface nunca deve informar que algo foi salvo se a operação não foi concluída.

Cada registro deve permitir voltar ao ponto original da fonte.

---

# 12. Nexus / Conexo

## Objetivo

Mostrar relações entre:

**Bíblia ↔ Catecismo ↔ Magistério ↔ Santos ↔ Tradição**

## Apresentação

Não é necessário usar um grafo técnico.

A preferência é por uma experiência editorial:

**Passagem → Catecismo → Documento → Santo / Tradição**

Cada ligação deve ser acionável.

### Regra fundamental

Se uma relação não estiver catalogada ou comprovada:

**não inventar.**

Informar que a conexão ainda não está catalogada.

---

# 13. Sistema visual

## Identidade

Todos os módulos pertencem ao mesmo Cátedra.

Eles podem ter cores próprias, mas não podem parecer aplicativos diferentes.

## Paleta conceitual

| Ambiente | Direção |
|---|---|
| Átrio | marfim, pedra, neutros nobres |
| Estudar | azul / petróleo |
| Rezar | ameixa / violeta |
| Formar-se | âmbar / terracota |
| Pesquisar | verde profundo |
| Minha Jornada | violeta / índigo |

As cores devem funcionar principalmente como acentos.

Contraste e acessibilidade têm prioridade.

---

# 14. Tipografia

A tipografia deve favorecer leitura longa.

### Regras

- evitar textos excessivamente pequenos;
- hierarquia clara;
- títulos fortes;
- referências diferenciadas;
- números de versículos legíveis;
- altura de linha adequada;
- nenhuma informação essencial deve depender de tamanho minúsculo.

---

# 15. Ícones

Ícones devem ser:

- consistentes;
- simples;
- semanticamente claros;
- acessíveis;
- reutilizáveis.

### Regra contra duplicação

Uma ação deve ter um controle principal.

Não criar dois ícones diferentes para abrir a mesma função sem necessidade.

Antes de adicionar um novo ícone:

1. localizar componentes existentes;
2. verificar se a ação já existe;
3. verificar usos duplicados;
4. reutilizar o componente quando possível.

---

# 16. Shell global

Todas as telas devem compartilhar:

- cabeçalho;
- logo Cátedra Digital;
- navegação contextual;
- pesquisa;
- perfil/menu;
- retorno;
- sistema de estados.

### Mobile

A navegação deve ser compacta.

Sempre preservar:

- localização atual;
- ação de voltar;
- acesso às funções principais.

---

# 17. Componentes oficiais

Componentes que devem ser compartilhados:

- AppShell
- GlobalHeader
- ModuleHeader
- ModuleTabs
- Breadcrumb
- BackButton
- SearchInput
- SearchFilters
- SourceCard
- DocumentCard
- CourseCard
- PrayerCard
- Reader
- ReaderToolbar
- ReaderSection
- Verse
- CatechismParagraph
- SourceReference
- ContextBubble
- SourcePreview
- RelatedSources
- BookPicker
- ChapterPicker
- TranslationCarousel
- BottomSheet
- SidePanel
- Modal
- LoadingState
- EmptyState
- ErrorState
- Toast
- ProgressCard
- JourneyTimeline
- CertificateCard

---

# 18. Estados obrigatórios

Toda tela relevante deve possuir:

### Loading

Skeleton ou indicador contextual.

### Empty

Explicar por que está vazio e qual é o próximo passo.

### Error

Mensagem humana e ação de recuperação.

### Indisponível

Informar claramente a limitação.

### Sucesso

Feedback discreto.

### Disabled

Controle visualmente distinguível.

---

# 19. Responsividade

Testar pelo menos:

- 320 px;
- 375 px;
- 390 px;
- 768 px;
- 1024 px;
- desktop amplo.

## Mobile

Prioridade:

1. leitura;
2. toque;
3. navegação;
4. conteúdo.

## Desktop

Usar espaço adicional para:

- painel contextual;
- navegação;
- filtros;
- referências.

Não criar duas aplicações diferentes.

---

# 20. Acessibilidade

Obrigatório:

- foco visível;
- navegação por teclado;
- contraste adequado;
- áreas de toque confortáveis;
- labels acessíveis;
- estados comunicados;
- sem depender somente de cor;
- respeito a `prefers-reduced-motion`.

Controles interativos devem buscar área mínima de aproximadamente **44 × 44 px**.

---

# 21. Conteúdo e fontes

O Cátedra não deve apresentar:

- mock como fonte;
- seed como conteúdo oficial;
- texto inventado como documento;
- referência falsa;
- conexão não verificada como fato.

Separar claramente:

1. fonte oficial;
2. fonte externa;
3. contexto;
4. conexão.

---

# 22. Experiência de inteligência contextual

A inteligência do Cátedra deve ser:

- discreta;
- orientada por fontes;
- contextual;
- fiel à doutrina;
- útil.

Evitar transformar toda interação em uma interface de chatbot.

A inteligência deve ajudar o usuário a:

- compreender;
- localizar;
- comparar;
- conectar;
- retornar à fonte.

---

# 23. Autenticação e área pessoal

A experiência pública deve funcionar sem conta.

A autenticação torna-se necessária para recursos pessoais, como:

- Diário;
- Jornada;
- notas;
- favoritos;
- histórico;
- progresso;
- certificados.

Dados pessoais devem permanecer associados ao usuário correto e protegidos pelo backend.

---

# 24. Arquitetura de implementação

A implementação deve privilegiar:

- componentes compartilhados;
- tokens de design;
- dados reais;
- rotas claras;
- separação de responsabilidades;
- baixo acoplamento;
- ausência de duplicação.

### Regra

**Corrigir no componente-base antes de corrigir dezenas de telas individualmente.**

---

# 25. Plano oficial de implementação

## Fase 1 — Fundação

- design tokens;
- tipografia;
- espaçamento;
- shell;
- navegação;
- componentes-base.

## Fase 2 — Átrio

- tela principal;
- entradas;
- continuidade;
- conteúdo destacado.

## Fase 3 — Estudar

- hub;
- Bíblia;
- Catecismo;
- Documentos.

## Fase 4 — Nexus

- referências;
- contexto;
- conexões;
- navegação entre fontes.

## Fase 5 — Rezar

- biblioteca;
- leitores;
- progresso.

## Fase 6 — Formar-se

- trilhas;
- aulas;
- progresso;
- certificados.

## Fase 7 — Pesquisar

- pesquisa;
- filtros;
- resultados;
- abertura da fonte exata.

## Fase 8 — Minha Jornada

- autenticação;
- histórico;
- anotações;
- progresso;
- favoritos.

## Fase 9 — Auditoria

- duplicações;
- responsividade;
- acessibilidade;
- estados;
- performance;
- links;
- fontes.

## Fase 10 — Produção

- build;
- testes;
- deploy;
- validação visual;
- smoke test.

---

# 26. Critérios para considerar uma tela pronta

Uma tela só deve ser considerada concluída quando:

- [ ] desktop funciona;
- [ ] mobile funciona;
- [ ] tablet foi verificado;
- [ ] navegação de entrada funciona;
- [ ] navegação de retorno funciona;
- [ ] não existem controles duplicados;
- [ ] loading funciona;
- [ ] empty funciona;
- [ ] error funciona;
- [ ] foco de teclado funciona;
- [ ] textos estão legíveis;
- [ ] referências apontam para o destino correto;
- [ ] não existe conteúdo fictício apresentado como oficial;
- [ ] build passa;
- [ ] testes relevantes passam;
- [ ] produção foi validada visualmente.

---

# 27. Auditoria contínua

Toda alteração importante deve responder:

1. O componente já existe?
2. Essa função já existe?
3. Existe outra implementação da mesma ação?
4. A mudança afeta outro módulo?
5. Funciona em mobile?
6. Funciona em desktop?
7. O retorno continua claro?
8. A fonte continua correta?
9. O estado de erro está coberto?
10. A publicação foi realmente validada?

---

# 28. Governança

Este documento é a **base oficial de produto**.

Quando uma decisão for alterada:

- registrar a mudança;
- explicar o motivo;
- identificar módulos afetados;
- atualizar este documento;
- evitar que código antigo permaneça como implementação concorrente.

Uma mudança em um módulo não deve quebrar os demais.

---

# 29. Ordem recomendada de evolução

1. Átrio
2. Estudar
3. Bíblia
4. Catecismo
5. Documentos / Magistério
6. Nexus / Conexo
7. Rezar
8. Formar-se
9. Pesquisar
10. Minha Jornada

---

# 30. Resultado esperado

O resultado final deve ser um único **Cátedra Digital**, e não um conjunto de módulos visualmente desconectados.

O usuário deve sentir:

> **“Entrei em um lugar de estudo, oração, formação e descoberta.”**

A interface deve ser bela, silenciosa quando necessário, precisa nas fontes e simples de usar.

A tecnologia deve desaparecer atrás da experiência.

---

## Registro de versão

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-10-04 | Criação da especificação oficial de produto, telas, UI/UX e implementação |

