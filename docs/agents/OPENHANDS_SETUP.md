# Estrutura de agentes e skills — Cátedra Digital

## Componentes
- **Superpowers (metodologia):** conectado nesta sessão. Skills disponíveis incluem depuração sistemática, planejamento, TDD, revisão e verificação antes de declarar conclusão.
- **OpenHands (executor de código):** preparar o repositório com instruções persistentes em `.openhands/microagents/repo.md` e a skill especializada em `.agents/skills/e2e-playwright-diagnostics/SKILL.md`.
- **GitHub Actions (execução verificável):** continua sendo a fonte de verdade para CI, Playwright e artefatos. O executor não deve ter permissão de merge/deploy automático.

## Ativar o executor OpenHands
Os arquivos deste PR preparam o contexto do repositório, mas não iniciam um agente remoto por si só. Para ativar a execução remota, um administrador do repositório precisa instalar/configurar o OpenHands GitHub Resolver/Action conforme a documentação oficial: https://docs.openhands.dev/openhands/usage/run-openhands/github-action

Antes de ativar:
1. Confirmar a instalação/permissões do GitHub App para `cathedradigital/cathedradigital`.
2. Configurar pelo mecanismo seguro do OpenHands o provedor/modelo e a chave de API exigida; nunca registrar o segredo em arquivo.
3. Definir limite de iterações e permissões mínimas. O agente deve abrir branch/PR e não ter permissão de merge/deploy.
4. Testar primeiro com uma issue sem acesso a produção e revisar manualmente o PR criado.
5. Manter o gate obrigatório: CI + build + E2E crítico com artefatos no SHA final; desktop/mobile e autenticação real; sem merge/deploy antes de aprovação humana.

## Primeiro trabalho recomendado
Issue #173: https://github.com/cathedradigital/cathedradigital/issues/173
- Inspecionar traces/error-context do run 38501621497.
- Classificar as 11 falhas por causa-raiz.
- Corrigir cada grupo de forma isolada sem tocar no código-fonte da Bíblia, sem mudar credenciais e sem reduzir asserts.
- Reportar duração antes/depois e evidências.

## Publicação
Destino de produção: Cloudflare Workers. Nenhum deploy é executado por esta estrutura.
