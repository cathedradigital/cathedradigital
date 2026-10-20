# Auditoria técnica de produção — Cátedra Digital

## Estado verificado em 20/10/2026

A cadeia oficial de produção é **GitHub `main` → GitHub Actions → Cloudflare Workers → domínios oficiais**. Uma execução de CI ou auditoria em um pull request não comprova, por si só, que o site publicado está atualizado.

## Resultado do branch de correção

No SHA `1f1ea5f490564c5d2ff2a1b8e4b8f9905b8ad718`:
- CI: aprovado (typecheck, lint, validação de rotas e build Cloudflare).
- Auditoria final: aprovada.
- Playwright E2E: bloqueado no preflight de autenticação; Supabase respondeu HTTP 400 `invalid_credentials` para o par de credenciais dos GitHub Actions Secrets. A bateria funcional não foi iniciada nessa execução.
- O gate da URL Supabase passou e apontou para o único projeto ativo confirmado, `isojguvcnfncokoxoauk`.
- Os relatórios antigos `public/test-report.html` e `public/test-report.md` foram removidos do branch porque não eram referenciados pelo código e continham metadados obsoletos.

## Bloqueio crítico

Os secrets `E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD` precisam corresponder a uma conta de teste real no projeto Supabase ativo. O agente não consegue ler nem alterar o valor dos GitHub Secrets. Não compartilhar a senha no chat; atualizá-la diretamente em GitHub → Settings → Secrets and variables → Actions. O workflow agora valida o login antes de executar Playwright e falha sem expor credenciais se a autenticação não funcionar.

Não integrar nem publicar enquanto CI, auditoria e Playwright não passarem no mesmo SHA.

## Observações de segurança e desempenho do Supabase

- O Security Advisor reportou que a proteção de senhas comprometidas está desativada. Habilitá-la em Auth → Password Security no painel do Supabase.
- O Performance Advisor sinalizou uma chave estrangeira sem índice em `public.user_emotions.user_id`. Avaliar a criação de índice após confirmar o padrão de consultas.
- O Advisor listou índices ainda não usados e políticas permissivas sobrepostas. Não remover índices nem alterar políticas apenas com base nesses avisos: confirmar carga real, intenção de acesso e cobertura de RLS primeiro.

## Critério de publicação

1. CI, auditoria e Playwright passam no mesmo SHA final.
2. Os fluxos críticos autenticados e deep links do Catecismo (incluindo §2865) passam em desktop e mobile.
3. Nenhum erro inesperado de console ou HTTP 4xx/5xx nos fluxos testados.
4. A alteração é integrada a `main` somente depois dos gates.
5. O workflow Cloudflare confirma o HTML real e os assets nos domínios `cathedradigital.com.br`, `www.cathedradigital.com.br` e no endereço `workers.dev`.
6. `robots.txt` e `sitemap.xml` respondem corretamente.
7. Só então declarar a publicação concluída.
