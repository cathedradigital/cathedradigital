# Estrutura de agentes e skills — Cátedra Digital

## Componentes
- **Superpowers (metodologia):** conectado nesta sessão. Skills disponíveis incluem depuração sistemática, planejamento, TDD, revisão e verificação antes de declarar conclusão.
- **OpenHands (executor de código):** preparar o repositório com instruções persistentes em `.openhands/microagents/repo.md` e a skill especializada em `.agents/skills/e2e-playwright-diagnostics/SKILL.md`.
- **GitHub Actions (execução verificável):** continua sendo a fonte de verdade para CI, Playwright e artefatos. O executor não deve ter permissão de merge/deploy automático.

## Ativar o executor OpenHands
Os arquivos deste PR preparam o contexto do repositório, mas não iniciam um agente remoto por si só. A ativação exige uma integração mantida do OpenHands, acesso ao repositório e credenciais configuradas por um administrador. A documentação oficial de execução por GitHub está em https://docs.openhands.dev/openhands/usage/run-openhands/github-action.

**Atenção à manutenção:** o repositório `OpenHands/openhands-github-action` foi arquivado em 22/12/2025. Não instalar essa ação antiga sem uma revisão explícita de manutenção e segurança: https://github.com/OpenHands/openhands-github-action. Confirmar a integração atualmente suportada antes de habilitar automação.

Antes de ativar:
1. Confirmar qual integração OpenHands está atualmente mantida e revisar o workflow de instalação dessa versão.
2. Confirmar a instalação/permissões mínimas do GitHub App ou token para `cathedradigital/cathedradigital`.
3. Configurar o provedor/modelo e a chave exigida no cofre de secrets apropriado; nunca registrar segredos em arquivos ou logs. Nenhuma chave é criada por este PR.
4. Limitar iterações e permissões. O executor deve trabalhar em branch e abrir PR; não pode fazer merge, deploy, alterar secrets ou acessar produção.
5. Testar primeiro apenas com a issue #173 e revisar manualmente qualquer diff.
6. Manter o gate obrigatório: CI + build + E2E crítico com artefatos sanitizados no SHA final; desktop/mobile e autenticação real; sem merge/deploy antes de aprovação humana.

**Estado atual:** Superpowers está conectado, mas o executor remoto OpenHands ainda não está ativo. Este PR não declara uma execução de agente que não aconteceu.

## Primeiro trabalho recomendado
Issue #173: https://github.com/cathedradigital/cathedradigital/issues/173
- Inspecionar traces/error-context do run 38501621497.
- Classificar as 11 falhas por causa-raiz.
- Corrigir cada grupo de forma isolada sem tocar no código-fonte da Bíblia, sem mudar credenciais e sem reduzir asserts.
- Reportar duração antes/depois e evidências.

## Publicação
Destino de produção: Cloudflare Workers. Nenhum deploy é executado por esta estrutura.
