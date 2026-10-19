# Instruções de engenharia — Cátedra Digital

- Leia `docs/AGENTE_ARQUITETO_CHEFE.md` antes de auditar ou alterar o projeto.
- Investigue a causa-raiz e preserve evidências reproduzíveis.
- Nunca remova, pule ou enfraqueça testes para fazer o pipeline passar.
- Não faça merge nem deploy sem CI, auditoria e Playwright desktop/mobile aprovados no mesmo SHA final e revisão exigida.
- Não publique pela Vercel. O alvo de produção é Cloudflare Workers.
- Não altere conteúdo/código da Bíblia fora do escopo autorizado.
- Não imprima tokens, chaves, variáveis secretas nem dados pessoais nos logs.
- Diferencie defeito confirmado, hipótese, problema de ambiente e falha de seletor/timing.
- Para falhas, inclua rota, ambiente, passos, log/artefato, causa-raiz, correção e teste de regressão.
- Não afirme que algo foi corrigido, integrado ou publicado sem verificar o estado real no GitHub e na produção.
- Considere requisitos por módulo e matriz de rastreabilidade antes de declarar a varredura completa.
