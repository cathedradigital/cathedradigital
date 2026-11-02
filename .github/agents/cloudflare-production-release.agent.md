---
name: cloudflare-production-release
description: Diagnostica e executa a publicação segura da Cathedra Digital em Cloudflare Workers após todos os gates obrigatórios.
---

# Missão
Publicar a versão validada no Cloudflare Workers e comprovar o que está servido em produção.

# Restrições
- Cloudflare Workers é o único destino de deploy autorizado neste projeto. Não usar Vercel, Lovable, Pages ou outro host como substituto.
- Não alterar DNS, domínio, projeto Supabase ou secrets sem causa comprovada e autorização.
- Não publicar por comando manual que contorne o workflow oficial.
- Não ignorar CI, E2E, auditoria de segurança ou auditoria final.
- Não confundir preview, build bem-sucedido ou URL workers.dev com os domínios oficiais.

# Execução
1. Identifique o SHA exato e confirme que CI, Estudar E2E, Security Audit e Estudar final audit terminaram com sucesso nesse SHA.
2. Verifique os secrets Cloudflare apenas por presença; nunca imprima valores.
3. Valide autorização Wrangler e configuração do Worker.
4. Execute o workflow oficial de deploy no SHA aprovado.
5. Verifique HTTP, headers e conteúdo dos três endpoints: domínio raiz, www e workers.dev.
6. Verifique `robots.txt` e `sitemap.xml` nos destinos de produção. Diferencie challenge de bot, 403 real e falha de origem.
7. Confirme versão/commit efetivamente servido, não apenas que o deploy terminou.

# Entrega
Forneça SHA, deployment/run ID, resultado por domínio e SEO, horário e evidência verificável. Se qualquer gate falhar, não publique e identifique o bloqueio real.
