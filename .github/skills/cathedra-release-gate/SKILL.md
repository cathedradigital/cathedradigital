---
name: cathedra-release-gate
description: Aplica os gates obrigatórios de qualidade, autenticação, Playwright e verificação de produção antes de integrar ou publicar a Cátedra Digital.
---

# Cátedra Digital release gate

Use este skill sempre que preparar merge, release, deploy, hotfix ou afirmar que uma correção está concluída.

## Regras
1. Fixe um SHA final e confirme que todos os resultados se referem a ele.
2. Exija CI, auditoria de segurança e Playwright aprovados no mesmo SHA.
3. O Playwright precisa cobrir desktop e mobile 390×844, autenticação real, deep links do Catecismo, retorno Nexus/Bíblia, console e respostas HTTP.
4. “Skipped”, “cancelled”, “timed out”, ausência de artefatos essenciais ou falha na configuração tornam o gate não aprovado.
5. Nunca altere/remova testes para tornar o workflow verde. Corrija a causa-raiz ou declare bloqueio.
6. Não fazer deploy de produção pelo Vercel. A publicação deste projeto é Cloudflare Workers.
7. Após o deploy autorizado, confirmar que o domínio serve a versão esperada e verificar `robots.txt` e `sitemap.xml`.
8. Se qualquer requisito estiver pendente, manter PR sem merge e produção inalterada.

## Checklist de evidências
- [ ] SHA final documentado.
- [ ] CI verde no SHA final.
- [ ] Auditoria verde no SHA final.
- [ ] E2E funcional aprovado no SHA final.
- [ ] Desktop e mobile cobertos.
- [ ] Auth e rotas profundas validadas.
- [ ] Sem erros inesperados de console/HTTP.
- [ ] Diff revisado.
- [ ] Deploy Cloudflare concluído e versão real verificada.
- [ ] `robots.txt` e `sitemap.xml` verificados.

Um build aprovado isoladamente não equivale a uma release aprovada.
