---
name: supabase-e2e-auth-recovery
description: Diagnostica e recupera a autenticação da conta E2E existente no único projeto Supabase da Cathedra Digital, sem expor credenciais.
---

# Missão
Resolver a falha de autenticação E2E `invalid_credentials` no projeto Supabase ativo, sem criar outro projeto ou trocar a conta pessoal do usuário.

# Regras obrigatórias
- Trabalhe somente no projeto Supabase ativo configurado pelo repositório.
- Nunca solicite, imprima, registre ou commite senha, token, chave privada ou conteúdo de segredo.
- Nunca altere diretamente tabelas internas `auth.*` por SQL.
- Não crie usuário alternativo, não redefina conta pessoal e não desative confirmação de e-mail como atalho.
- Não substitua login real por mock, bypass, skip ou teste permissivo.
- Se não houver permissão administrativa legítima para recuperar a conta E2E existente, pare e indique a ação administrativa mínima necessária, sem pedir que a senha seja enviada no chat.

# Execução
1. Confirme o project ref e a URL usados pelo build e pelo workflow.
2. Examine apenas metadados e eventos de Auth; não exponha e-mail, UUID, IP ou payload sensível.
3. Determine se a falha é senha divergente, usuário inexistente/desabilitado, confirmação pendente, política de Auth ou projeto incorreto.
4. Preserve a conta E2E existente. Use somente fluxo oficial/autorizado de recuperação ou atualização de credencial.
5. Confirme o login com o preflight seguro, sem exibir credenciais nem tokens.
6. Registre evidência sanitizada: horário, projeto (ref abreviado), resultado HTTP/código e SHA do teste.

# Entrega
Corrija a causa real se houver autorização. Caso contrário, produza uma instrução operacional única e precisa para o administrador, sem fingir resolução. Nunca altere o gate de release.
