# Design System — Formar-se

**Produto:** Cathedra Digital<br>
**Módulo:** Formar-se<br>
**Versão:** 1.0.0<br>
**Estado:** proposta implementada parcialmente; validação visual e automatizada pendente<br>
**Escopo:** somente a experiência de Formar-se. Os tokens globais e a Sidebar compartilhada permanecem sob governança transversal.

## 1. Direção editorial

Formar-se é um ambiente de formação intelectual e espiritual. A interface deve parecer uma biblioteca de percursos cuidadosamente organizados: serena, legível e acolhedora. Não deve assumir a linguagem de painel administrativo, gamificação competitiva ou catálogo comercial.

Princípio da jornada: **interesse → conhecimento → compreensão → amadurecimento**.

A interface orienta sem pressionar. O progresso informa a continuidade, mas não transforma a formação em competição.

## 2. Identidade cromática

O acento contextual do módulo é **âmbar-terra #b07a35**, já definido na navegação compartilhada.

| Token / uso | Diretriz |
|---|---|
| Âmbar-terra #b07a35 | Identificação contextual, progresso e pequenos destaques |
| Superfícies | Reutilizar os tokens semânticos existentes (background, surface, border) |
| Texto principal | Token semântico de primeiro plano; contraste sempre prioritário |
| Texto secundário | Metadados e descrições, nunca informação essencial isolada |
| Estados | Usar tokens semânticos existentes para sucesso, alerta e erro |

A cor contextual não substitui rótulos, ícones, foco visível ou estados textuais. Não introduzir uma paleta paralela nem alterar os tokens globais por causa deste módulo.

## 3. Tipografia e hierarquia

- **Títulos editoriais:** família de display já usada pelo sistema editorial, com escala fluida e quebra de palavras segura.
- **Corpo e navegação:** tipografia de interface existente, com tamanho confortável em mobile.
- **Metadados:** podem ser menores, mas devem permanecer legíveis e não carregar instruções essenciais.
- **Caixa alta e tracking:** uso pontual em pequenos rótulos; evitar frases inteiras em caixa alta.

Hierarquia recomendada: título do ambiente → descrição curta → continuidade do percurso → exploração de percursos → metadados e fontes.

## 4. Composição e componentes

### Cabeçalho editorial
- Nome explícito do ambiente: **Formar-se**.
- Uma frase que explique o valor do módulo em português brasileiro.
- Evitar nomes de conceito que substituam o nome funcional do ambiente.

### Continuidade
- Priorizar percursos já iniciados.
- Exibir etapa atual e progresso confirmado.
- A ação principal deve retomar o percurso, sem sugerir que o usuário precisa começar novamente.

### Exploração
- Categorias em controles compactos e roláveis horizontalmente no mobile.
- No desktop, permitir quebra de linha natural.
- Estado selecionado comunicado por aria-pressed, além da cor.
- Percursos apresentados como conteúdo editorial, com título, descrição e metadados relevantes.

### Cartões e links
- Superfícies contidas; bordas e sombras discretas.
- Área clicável ampla e foco de teclado claramente visível.
- Não usar hover como único meio de descoberta ou interação.
- Não simular links com elementos estáticos.

## 5. Layout mobile-first

Viewport de referência: **390 × 844 px**.

- Uma coluna como padrão; grades só em larguras maiores.
- Espaçamento vertical reduzido na primeira dobra; evitar grandes áreas vazias antes do conteúdo útil.
- Categorias em faixa horizontal com rolagem por toque, sem comprimir rótulos.
- Alvos de toque de pelo menos **44 × 44 px**.
- Sem rolagem horizontal da página; apenas faixas de conteúdo explicitamente roláveis.
- Respeitar áreas seguras do dispositivo e a navegação compartilhada.
- Testar zoom, quebra de títulos, teclado virtual e orientação.

## 6. Estados e acessibilidade

Todo fluxo deve tratar:
- carregamento;
- conteúdo disponível;
- lista vazia;
- falha ao carregar;
- falha ao recuperar ou salvar progresso;
- percurso iniciado, em andamento e concluído.

Requisitos:
- HTML semântico e hierarquia de títulos coerente;
- controles com nome acessível;
- foco visível e ordem de tabulação lógica;
- aria-pressed em filtros selecionáveis;
- estados de progresso com valor e rótulo;
- movimento reduzido respeitado;
- contraste suficiente em temas claro e escuro.

## 7. Linguagem editorial

Preferir:
- “Continue sua formação”;
- “Explore os percursos”;
- “Conhecer percurso”;
- “Etapas” e “Duração”.

Evitar jargão de produto, rótulos em latim sem explicação, chamadas excessivamente promocionais e termos técnicos desnecessários.

Conteúdo doutrinal, citações e fontes devem vir de registros editoriais verificáveis. A camada visual não pode criar ou alterar referências religiosas.

## 8. Limites de arquitetura

- Reutilizar a Sidebar e os componentes globais existentes.
- Não criar uma segunda navegação lateral.
- Não alterar Bíblia, Rezar, Estudar ou outros módulos.
- Não alterar autenticação, persistência ou regras de progresso nesta etapa visual.
- Não remover recursos para simplificar a interface.
- Não publicar em produção sem autorização explícita.
- Preservar a infraestrutura Cloudflare Workers.

## 9. Validação necessária

A implementação só pode ser considerada aprovada após:
1. inspeção visual em 390 × 844 px e desktop;
2. verificação de toque, foco, contraste, overflow e estados;
3. execução dos testes existentes relacionados a jornadas e navegação;
4. teste autenticado de início, retomada e progresso com conta autorizada;
5. evidências antes/depois e lista de arquivos modificados.

**Estado atual:** primeira melhoria editorial e de filtros implementada em src/pages/AtriumJornadasPage.tsx. A validação visual real e os testes ainda não foram executados nesta etapa.
