# Cathedra — Arquitetura UX/UI 2.0

## Objetivo
A interface pública da Cátedra deve parecer uma única plataforma, não uma coleção de aplicações antigas.

## Hierarquia canônica
1. **Estudar** — Bíblia, Catecismo, Magistério, Biblioteca, Santos, Nexus, Igreja Viva
2. **Rezar** — Orar, Liturgia, Lectio Divina, Rosário, Via Sacra, Novenas
3. **Formar-se** — Jornadas, Temas
4. **Pesquisar** — Buscar, Glossário, Atlas, Aquino, Dogmas, Papas, Aparições
5. **Minha Jornada** — Hoje, Diário, Favoritos, Conquistas, Perfil, Configurações

Transversais: Logos IA e Comunidade.
Administração, auditoria, telemetria e diagnóstico ficam fora da navegação de produto.

## Regra de entrada
`/` é a Home canônica. `/home`, `/home-v3` e `/legacy-home` são aliases que redirecionam para `/`.

## Sistema visual
- Uma linguagem visual compartilhada entre todos os ambientes.
- Hierarquia tipográfica consistente.
- Cards agrupam tarefas e conteúdo, não decoração.
- Bordas, sombras e animações com baixa intensidade.
- Primary/ouro é acento de ação e estado ativo, não preenchimento dominante.
- Espaçamento generoso no desktop e compacto no mobile.
- Desktop e mobile usam a mesma taxonomia.
- Cada tela deixa explícitos: onde estou, o que posso fazer agora e como continuo.

## UX por ambiente
### Estudar
Fonte, leitura e relações entre fontes são o centro.
### Rezar
Entrada rápida na prática, continuidade e leitura contemplativa.
### Formar-se
Progresso, próxima etapa e conclusão.
### Pesquisar
Busca, filtros, resultados e contexto apontando para a fonte canônica.
### Minha Jornada
Memória: continuar, histórico, favoritos, diário e progresso.
### Logos / Nexus
Camadas transversais. Logos auxilia; Nexus organiza relações. Nenhum substitui a fonte primária.

## Padrão de página
1. Cabeçalho contextual
2. Título + propósito
3. Ação primária
4. Conteúdo principal
5. Relações / próximos passos
6. Navegação de continuidade

## Estados
- Loading: skeleton contextual.
- Empty: explicar o que falta e oferecer ação.
- Error: explicar e oferecer recuperação.
- Success: confirmação curta.
- Active: ambiente e página atual claramente indicados.

## Responsividade
Desktop e mobile compartilham a mesma arquitetura mental. O mobile reduz densidade; não troca a taxonomia.

## Critério de conclusão
Uma mudança visual só termina quando não cria arquitetura paralela, respeita a navegação canônica, funciona em desktop/mobile, preserva acessibilidade e URLs legadas quando necessário e passa pelo build/deploy.