# Cathedra — Digital Cathedral

**Sua formação católica para todos os dias.**

Reze. Estude. Aprofunde. Viva a fé.

Cathedra é uma plataforma digital de formação católica que reúne Bíblia, Evangelho do dia, Catecismo, liturgia, santos, orações, biblioteca, jornadas de formação e recursos de estudo em uma experiência contínua e pessoal.

## Visão

O centro da experiência é **Hoje**: uma entrada diária simples que ajuda o usuário a transformar intenção em prática — ler, refletir, rezar, aprender e continuar sua jornada.

A proposta não é apenas oferecer uma coleção de conteúdos católicos. É ajudar o católico a construir uma **vida espiritual digital consistente**, com conteúdo confiável, contexto, personalização e continuidade.

## Princípios

- Formação antes de funcionalidades.
- Hoje é o centro da experiência.
- Conteúdo com fonte; nunca inventar citações.
- IA como assistente, não como autoridade.
- Segurança no backend; guards de frontend não substituem autorização.
- Privacidade por padrão.
- Qualidade contínua em mobile, acessibilidade, SEO e testes.
- **GitHub → main → Cloudflare Workers** é a cadeia oficial de publicação.
- Vercel e Lovable não são ambientes oficiais de produção deste projeto.

## Documentação

- `docs/product/vision.md` — visão e tese
- `docs/product/positioning.md` — público e posicionamento
- `docs/product/user-journeys.md` — jornada principal
- `docs/product/roadmap.md` — prioridades
- `docs/commercial/business-model.md` — modelo de negócio
- `docs/commercial/pricing.md` — planos e preços
- `docs/commercial/metrics.md` — métricas
- `docs/architecture/overview.md` — arquitetura
- `docs/security/security.md` — segurança
- `docs/quality/testing.md` — qualidade
- `docs/ai/logos.md` — princípios do assistente

## Desenvolvimento

O código é mantido no GitHub e publicado no Cloudflare Workers. Não criar uma segunda cadeia de deploy nem reintroduzir dependência de plataforma de geração de código para publicação.

Antes de considerar uma mudança pronta:
1. valide tipos, lint e testes relevantes;
2. teste fluxos críticos em mobile e desktop;
3. verifique acessibilidade nas mudanças de interface;
4. valide dados e autorização no backend;
5. nunca comite segredos;
6. confirme o build e a publicação no Cloudflare;
7. valide as URLs de produção depois do deploy;
8. documente decisões relevantes de produto, arquitetura e segurança.
