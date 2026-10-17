# Segurança e privacidade — baseline operacional

Este documento complementa `docs/security/security.md`. Controles devem ser verificados em código, configuração e execução real.

## 1. Segredos e cadeia de suprimentos
- Não versionar chaves, tokens, cookies, credenciais ou arquivos de ambiente reais.
- Usar placeholders em exemplos e variáveis de ambiente protegidas no CI.
- Rotacionar credenciais expostas; remover artefatos sensíveis antigos quando possível.
- Fixar ações e dependências de automação em versões/revisões verificáveis conforme a política do projeto.
- Sanitizar traces, relatórios e logs antes de publicar artefatos; falhar fechado se a sanitização falhar.

## 2. Autenticação e autorização
- Login/logout e persistência de sessão devem ser testados com conta de teste real.
- Validar destino de retorno e impedir open redirects.
- Frontend guards melhoram UX, mas não substituem autorização no servidor.
- Aplicar RLS a cada tabela com dados de usuário; testar leitura, escrita e tentativa de acesso cruzado entre usuários.
- Operações administrativas exigem papel verificado no backend.

## 3. Supabase e Edge Functions
Para cada tabela/view/função, registrar: dados pessoais, exposição pública, RLS/policies, grants, autenticação exigida, validação de entrada, limites de uso, tratamento de erros e teste negativo.
- Não confiar em `user_id` fornecido pelo cliente; derivar identidade da sessão validada.
- Não retornar stack traces ou segredos ao cliente.
- Mudanças de schema precisam de migração versionada e verificação da API/schema cache.
- Funções públicas precisam de validação de origem, payload, rate limit e abuso conforme o caso.

## 4. Cabeçalhos, navegador e conteúdo
- Validar CSP e demais cabeçalhos compatíveis com a aplicação e suas integrações.
- Sanitizar HTML/Markdown não confiável; evitar sinks de execução.
- Links externos devem ser explícitos e seguros.
- Cookies e armazenamento local não devem conter segredos desnecessários.
- Configurar limites de upload/tamanho/tipo se houver arquivos.

## 5. Logs e observabilidade
- Redigir tokens, cookies, e-mails e dados pessoais.
- Não enviar conteúdo privado de diário ou jornada para telemetria sem base e consentimento adequados.
- Alertar sobre falhas de autenticação, autorização e funções críticas sem expor dados.

## 6. CI e publicação
- Checks necessários: lint, typecheck, validadores de módulos/rotas/segurança, build e E2E autenticado crítico.
- O mesmo SHA deve ter os resultados aprovados; commits posteriores invalidam a evidência anterior.
- Merge/deploy devem permanecer bloqueados enquanto qualquer gate crítico falhar ou não produzir evidência.
- Nenhum agente automatizado recebe permissão de merge ou deploy.
- Verificar branch protection com um owner; documentação de um gate não o torna obrigatório na configuração do GitHub.

## 7. Incidentes
1. Conter exposição e preservar evidências não sensíveis.
2. Revogar/rotacionar sessão ou segredo comprometido.
3. Remover artefato público quando a plataforma permitir.
4. Investigar alcance e janela de exposição.
5. Corrigir causa-raiz e adicionar teste de regressão.
6. Documentar impacto, mitigação e verificação.

## Checklist mínimo
- [ ] Segredos e histórico revisados.
- [ ] RLS testada positivamente e negativamente.
- [ ] Fluxos autenticados reais testados.
- [ ] Artefatos E2E sanitizados.
- [ ] Dependências e ações verificadas.
- [ ] Headers, redirects e erros revisados.
- [ ] Produção validada sem expor dados sensíveis.