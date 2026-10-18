# Ativação do Cátedra Arquiteto-Chefe

O perfil reutilizável está em `.github/agents/cathedra-architect.agent.md`.

## O que este arquivo faz
Define o papel, método de auditoria, critérios de teste, guardrails e condições de publicação para um agente compatível com perfis customizados do GitHub Copilot.

## O que ele não faz sozinho
Adicionar um perfil ao repositório não inicia um processo autônomo, não concede acesso a terminal/Playwright/Cloudflare, não ativa uma licença do Copilot coding agent, não cria credenciais e não autoriza merge ou deploy. A execução depende dos recursos habilitados para a conta e o repositório.

## Ativação segura
1. Revisar e integrar este PR pelo processo normal de CI.
2. Confirmar no GitHub que o recurso de agentes/perfis customizados está disponível para o repositório e para a conta.
3. Selecionar **Cátedra Arquiteto-Chefe** na interface de agentes compatível e atribuir uma tarefa inicial de auditoria.
4. Para execução automática por issue/PR, implementar separadamente um executor/workflow versionado, com permissões mínimas, branch isolada, limite de tentativas, logs sanitizados e sem permissão de merge/deploy automático.
5. Configurar os segredos de teste e publicação por ambiente protegido; nunca colocá-los no código.
6. Demonstrar a ativação com evidência observável: execução real, branch/PR gerado, logs e testes. Não considerar a mera existência do arquivo como ativação.

## Gates para produção
A publicação continua bloqueada até CI, auditoria e Playwright autenticado desktop/mobile passarem no mesmo SHA aprovado. Após o deploy, validar a versão servida no Cloudflare Workers e os endpoints de produção, além de `robots.txt` e `sitemap.xml`.

O executor não deve remover testes, mascarar falhas, alterar dados de produção, enfraquecer RLS ou publicar quando os gates estiverem inconclusivos.