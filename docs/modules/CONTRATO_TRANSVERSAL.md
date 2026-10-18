# Contrato transversal dos módulos

**Versão:** 1.0.0 · **Estado:** proposta técnica para revisão.

## Arquitetura da informação
Átrio → Estudar (Bíblia, Catecismo, Magistério/Documentos, Nexus/Conexo, Biblioteca, Santos, Igreja Viva) → Rezar → Formar-se → Pesquisar → Minha Jornada.

## Autoridade e proveniência
1. Escritura, Catecismo, documentos oficiais e Magistério são fontes primárias nos respectivos contextos.
2. Tradição, Padres, santos e doutores devem ter atribuição e referência identificáveis.
3. Yá organiza, compara e explica; não cria doutrina, citações, parágrafos ou referências como se fossem oficiais.
4. Diferenciar texto integral, excerto, resumo editorial, comentário e conteúdo gerado.
5. Registrar idioma, título, autoridade/autoria, data quando conhecida, origem, URL canônica e estado editorial.

## Navegação e rotas
- Deep links abrem o conteúdo exato e sobrevivem a reload e voltar/avançar.
- Aliases normalizam sem descartar parâmetros relevantes.
- Redirecionamentos de autenticação preservam o destino interno permitido e rejeitam destinos externos para prevenir open redirect.
- Retorno de anotação/diário restaura recurso e posição de leitura.
- Estados de carregamento, vazio, erro recuperável e não autorizado são distintos.

## Acessibilidade e responsividade
- Teclado e leitores de tela, nome acessível, foco visível e estado anunciado.
- Validar mobile em 390 × 844; nenhum overflow horizontal não intencional.
- Menu, logo, botão voltar, título e ações primárias não podem se sobrepor.
- Evitar navegação duplicada; respeitar contraste e movimento reduzido.

## Dados e segurança
- Entidades de leitura: ID estável, tipo, título, idioma, origem, referência canônica, conteúdo e estado editorial.
- Relações de conhecimento: origem, alvo, tipo, referência/evidência, proveniência, revisão e destino navegável.
- Segredos privilegiados nunca no bundle cliente.
- Operações pessoais verificam autorização no backend; RLS é defesa adicional.
- Nunca confiar em user_id, papel ou permissão enviados pelo cliente.
- Diário e anotações não podem ser lidos por outro usuário; artefatos de teste não devem conter senhas ou tokens.

## Critérios transversais de aceite
- Build, typecheck, lint e validadores pertinentes aprovados.
- E2E desktop e mobile passam no mesmo SHA candidato.
- Nenhuma asserção removida ou relaxada para obter aprovação.
- Deep links, auth, estados vazios/erro, referências e limites cobertos.
- Deploy autorizado validado no domínio de produção; build isolado não prova publicação correta.

## Evidências
Registrar comando/workflow, URL da execução, SHA, ambiente, resultado, logs/artefatos e limitações. Sem evidência, estado = **Não verificado**.