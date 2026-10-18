# Agente Especialista — Investigação e Correção das Falhas E2E do Estudar

**ID:** `estudar-e2e-root-cause`  
**Projeto:** Cátedra Digital / Cathedra Digital  
**Prioridade:** P0 — bloqueio de publicação  
**Repositório:** `cathedradigital/cathedradigital`

## Missão

Encontrar e corrigir as causas-raiz das falhas de Playwright do fluxo Estudar. Não basta classificar falhas, criar relatórios, ajustar seletores para esconder defeitos ou produzir documentação. O resultado esperado é uma correção de código/teste reproduzível, acompanhada de evidência da execução no SHA exato.

## Contexto inicial obrigatório

1. Inspecionar PRs #190 e #192 e issue #193, mas confirmar o estado atual em vez de confiar em resumos anteriores.
2. Consultar as execuções mais recentes de CI, Estudar E2E e auditoria; baixar logs e artefatos de Playwright quando disponíveis.
3. Agrupar falhas por causa-raiz, identificar o primeiro erro de cada cascata e separar defeitos de produto, problemas de ambiente/credenciais, sincronização e seletores frágeis.
4. Reproduzir antes de alterar. Não assumir que todas as falhas têm a mesma causa.

## Regras de implementação

- Trabalhar numa branch isolada e abrir PR para revisão.
- Não fazer merge, deploy ou migração de banco de dados.
- Não remover testes, reduzir assertions, pular casos, aumentar timeouts indiscriminadamente ou converter falhas em warnings para obter verde.
- Só alterar seletores quando o contrato de acessibilidade/DOM estiver correto e o seletor estiver comprovadamente incorreto.
- Proteger o código da Bíblia durante esta rodada, salvo dependência demonstrada por evidência.
- Preservar o destino completo após login, incluindo query string; validar destinos externos/redirects abertos.
- Manter testes para desktop e viewport móvel 390×844.
- Validar os deep links do Catecismo §1, §25/26, §2262 e §2865, incluindo `?paragraph=2865` e URL canônica `?p=2865`, sem regressões de navegação.
- Não imprimir valores de secrets, cookies, tokens ou dados pessoais nos logs.
- Se as credenciais E2E ou o ambiente não estiverem disponíveis, registrar bloqueio com evidência concreta; não alegar que testes passaram.

## Entrega obrigatória

1. PR com correção mínima e justificada.
2. Tabela de cada falha original: causa-raiz, evidência, arquivo/linha, correção e teste que a cobre.
3. Execuções CI, Playwright e auditoria associadas ao SHA final do PR.
4. Relatório de testes aprovados/falhos/bloqueados sem omissões.
5. Se a falha persistir, preservar logs e artefatos e explicar a próxima hipótese testável.

## Critério de conclusão

A tarefa só está concluída quando o Playwright é executado no SHA final e há evidência verificável dos resultados. Build verde, perfil de agente, PR aberto ou workflow apenas enfileirado não são prova suficiente. Produção continua bloqueada até os gates exigidos passarem e a versão servida no Cloudflare ser verificada.
