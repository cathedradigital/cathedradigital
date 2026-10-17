# Publicação e verificação de produção

## Cadeia oficial

**GitHub → CI/testes → merge autorizado → Cloudflare Workers → validação real dos domínios.**

Cloudflare Workers é o destino oficial. Não usar Vercel como alternativa de produção. O workflow não deve ser contornado para forçar publicação.

## Antes do merge

- Confirmar branch base e SHA final.
- Revisar diff completo e risco de migração.
- CI: lint, typecheck, validadores de módulos/rotas/segurança e build.
- E2E crítico autenticado com credenciais válidas, desktop e mobile.
- Verificar deep links, autenticação, retornos e Nexus.
- Sanitização de artefatos aprovada.
- Sem segredos nos diffs, logs ou artefatos.
- Checks obrigatórios e proteção de branch confirmados por owner; não presumir que existem.

## Antes do deploy

- Deploy deve partir do SHA aprovado de `main`.
- Confirmar secrets e conta Cloudflare no ambiente correto.
- Não executar deploy se testes críticos falharem ou estiverem pendentes.
- Agentes automatizados não recebem permissão para merge/deploy.

## Verificação após deploy

Validar a interface real, não somente o status do comando:

- `https://cathedradigital.com.br`
- `https://www.cathedradigital.com.br`
- URL do Worker `cathedradigital.cathedradigital.workers.dev`
- `/robots.txt` e `/sitemap.xml`

Verificar status HTTP, corpo HTML, recursos, navegação, console e comportamento visual em desktop e mobile. Um 403, shell vazio ou HTML mínimo não é sucesso funcional. Confirmar marca, Átrio, rotas canônicas e links prioritários.

## Relatório obrigatório

- SHA implantado e origem do deploy.
- Workflow/run e checks com status.
- E2E e artefatos sanitizados.
- URLs verificadas, hora e resultados HTTP/HTML.
- Falhas residuais, impacto e plano de correção.
- Separar claramente publicado, validado e ainda pendente.

## Rollback

Se a versão implantada causar indisponibilidade ou regressão crítica, seguir o procedimento autorizado de rollback do Cloudflare, registrar a versão revertida e repetir os smoke tests. Não improvisar alteração de DNS como primeira resposta a um problema de aplicação.