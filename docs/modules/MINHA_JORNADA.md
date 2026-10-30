# Especificação do módulo Minha Jornada

**Versão:** 1.0.0 · **Prioridade:** P0 para privacidade · **Estado:** aceite não verificado.

## Propósito
Reunir progresso, histórico de leitura, anotações e atividades pessoais para retomar formação e oração.

## Recursos e privacidade
Diário espiritual, notas, marcações, histórico e progresso devem declarar se são pessoais, opcionais e persistidos. Recursos privados exigem sessão e autorização no servidor; RLS limita operações ao usuário proprietário.

## Retorno contextual
Anotações guardam tipo de conteúdo, ID estável, referência estruturada (livro/capítulo/versículo, parágrafo ou documento), rota canônica e metadados necessários. “Ver Contexto” abre a posição exata, não apenas a home do módulo.

## Segurança e estados
- Não confiar em user_id enviado pelo cliente para autorizar leitura/escrita.
- Testar acesso cruzado com duas contas distintas.
- Sessão expirada redireciona para autenticação preservando destino interno.
- Logs não expõem texto de diário, notas ou tokens.
- Falha de salvamento não pode exibir sucesso; oferecer recuperação.
- Documentar exclusão, exportação e retenção.

## Critérios P0
- [ ] Rotas protegidas preservam destino interno no login.
- [ ] Dados pessoais não podem ser lidos por outra conta.
- [ ] Anotação bíblica retorna ao versículo exato.
- [ ] Anotação do Catecismo retorna ao parágrafo exato.
- [ ] Anotação do Magistério retorna ao documento/parágrafo.
- [ ] Falhas de salvamento explícitas.
- [ ] RLS e autorização backend verificadas.
- [ ] Mobile e acessibilidade testados.

**Evidência:** a especificação não afirma que todos os fluxos já foram aprovados.