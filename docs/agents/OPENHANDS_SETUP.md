# Estrutura de agentes e skills — Cátedra Digital

## Componentes
- **Superpowers (metodologia):** conectado nesta sessão. Skills disponíveis incluem depuração sistemática, planejamento, TDD, revisão e verificação antes de declarar conclusão.
- **OpenHands (executor de código):** preparar o repositório com instruções persistentes em `.openhands/microagents/repo.md` e a skill especializada em `.agents/skills/e2e-playwright-diagnostics/SKILL.md`.
- **GitHub Actions (execução verificável):** continua sendo a fonte de verdade para CI, Playwright e artefatos. O executor não deve ter permissão de merge/deploy automático.

## Ativar o executor OpenHands

A estrutura de instruções e skills deste repositório está pronta, mas isso **não inicia um agente remoto**. A integração antiga `OpenHands/openhands-github-action` está arquivada desde 22/12/2025 e não deve ser usada como executor novo: https://github.com/OpenHands/openhands-github-action.

### Caminho recomendado para ativação
Usar a integração atual do OpenHands Agent Canvas/OpenHands Cloud com GitHub, ou hospedar o Agent Server + Automation Server em ambiente controlado. O projeto OpenHands mantém o Agent Canvas e a infraestrutura de automações; consulte a documentação oficial atual antes de habilitar:
- OpenHands Agent Canvas: https://github.com/OpenHands/OpenHands
- OpenHands Automation: https://github.com/OpenHands/automation
- Documentação oficial: https://docs.openhands.dev/

### Configuração mínima e segura
1. Um administrador deve autenticar no OpenHands, conectar GitHub e conceder acesso somente ao repositório `cathedradigital/cathedradigital`.
2. Configurar o provedor/modelo e as chaves no cofre de secrets do ambiente OpenHands. Não colocar tokens, chaves ou dados de sessão em arquivos do repositório.
3. Usar perfil de agente com permissões mínimas. Permitir branch e PR, mas não merge, deploy, edição de secrets ou acesso à produção.
4. Iniciar com a issue #173, em branch de trabalho isolada. Revisar manualmente cada diff antes de qualquer integração.
5. Exigir CI, build, auditoria e E2E crítico no SHA final, com artefatos sanitizados e cobertura desktop/mobile; só então um humano pode autorizar merge.
6. Não adicionar workflow automático que dispare em `pull_request_target` ou execute código não confiável com secrets. Não instalar actions arquivadas sem revisão explícita de manutenção e segurança.

**Estado atual:** Superpowers está conectado nesta sessão e as instruções/skill estão versionadas nesta branch. OpenHands ainda não está autenticado nem executando tarefas neste repositório; a conexão de conta e a configuração de credenciais exigem ação administrativa fora deste PR.

## Primeiro trabalho recomendado
Issue #173: https://github.com/cathedradigital/cathedradigital/issues/173
- Inspecionar traces/error-context do run 38501621497.
- Classificar as 11 falhas por causa-raiz.
- Corrigir cada grupo de forma isolada sem tocar no código-fonte da Bíblia, sem mudar credenciais e sem reduzir asserts.
- Reportar duração antes/depois e evidências.

## Publicação
Destino de produção: Cloudflare Workers. Nenhum deploy é executado por esta estrutura.
