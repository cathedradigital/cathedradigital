# Cátedra Digital — Plano de Implementação das Telas

Este documento transforma o Projeto Oficial de Produto, UI/UX e Implementação em uma ordem prática de execução no repositório.

## Regra de segurança
A implementação deve evoluir sobre os componentes e módulos existentes. Não criar uma segunda aplicação paralela e não substituir módulos funcionais sem necessidade.

Antes de alterar uma tela:
1. localizar o componente/rota atual;
2. localizar componentes reutilizáveis;
3. verificar duplicações;
4. preservar dados e integrações existentes;
5. testar desktop e mobile;
6. só então aplicar a mudança.

## Etapa 1 — Fundação visual
Consolidar AppShell, cabeçalho global, identidade Cátedra Digital, tokens de espaçamento e superfície, áreas de toque confortáveis, foco de teclado, estados loading/empty/error, regras de leitura e cores contextuais por módulo.

Critério: nenhuma nova tela deve inventar seu próprio sistema de espaçamento, botão, card ou estado.

## Etapa 2 — Átrio
Hero acolhedor, pesquisa, cinco portas principais (Estudar, Rezar, Formar-se, Pesquisar, Minha Jornada), continuidade de estudo/oração/formação e rodapé institucional. No mobile, portas em cards/pílulas horizontais sem excesso de altura.

## Etapa 3 — Estudar
Hub com Bíblia, Catecismo, Documentos/Magistério, Nexus/Conexo, Biblioteca, Santos e Igreja Viva. O usuário deve conseguir sair e retornar ao Átrio sem depender apenas do botão do navegador.

## Etapa 4 — Bíblia
Prioridade máxima para refinamento completo: livro, capítulo, seletor opaco, retorno, busca, leitura compacta, referências, bolha contextual, painel Nexus, mobile, desktop, acessibilidade e ausência de controles duplicados.

Regra: correções exclusivamente bíblicas não devem alterar outros módulos, salvo componentes compartilhados que precisem de correção estrutural.

## Etapa 5 — Catecismo
Reutilizar o motor editorial do leitor: parágrafo, seção, referência, busca, retorno, contexto, mobile e desktop.

## Etapa 6 — Documentos
Biblioteca com filtros por autor, tipo, período e tema; leitor com índice, âncoras, fonte, referência exata e contexto.

## Etapa 7 — Nexus
Implementar como camada contextual. Exemplo de fluxo: Bíblia → Catecismo → Magistério → Santo. Cada item mostra a fonte, referência, abertura do ponto exato e informa quando a relação ainda não foi catalogada.

## Etapa 8 — Rezar
Experiência contemplativa para Liturgia das Horas, Lectio Divina, Rosário, Via-Sacra, Ladainhas e Novenas. Não transformar oração em dashboard administrativo.

## Etapa 9 — Formar-se
Trilhas, cursos, aulas, progresso e certificados.

## Etapa 10 — Pesquisar
Busca transversal com prioridade para fonte primária. Resultado: Fonte → referência → trecho → contexto → abrir.

## Etapa 11 — Minha Jornada
Área pessoal após autenticação para histórico, notas, favoritos, progresso, certificados e retorno ao ponto de origem.

# Auditoria obrigatória em cada etapa

### Visual
- sem duplicações;
- sem sobreposição;
- sem transparências indevidas;
- sem texto minúsculo;
- sem botões pequenos;
- sem espaçamento vertical excessivo.

### Navegação
- entrada;
- retorno;
- deep link;
- mobile;
- desktop.

### Conteúdo
- fonte real;
- referência correta;
- nenhum mock apresentado como oficial.

### Código
- reutilização de componentes;
- sem implementação duplicada;
- sem CSS conflitante;
- sem imports desnecessários.

### Produção
- build;
- testes;
- deploy;
- smoke test.

# Ordem atual
1. Projeto/documentação — concluído.
2. Fundação visual — próxima.
3. Átrio.
4. Estudar.
5. Bíblia.
6. Catecismo.
7. Documentos.
8. Nexus.
9. Rezar.
10. Formar-se.
11. Pesquisar.
12. Minha Jornada.
13. Auditoria final.

## Critério de conclusão
O projeto só será considerado concluído quando a experiência puder ser percorrida do Átrio até cada módulo sem inconsistências de navegação, responsividade, identidade visual, conteúdo ou estados de interface.