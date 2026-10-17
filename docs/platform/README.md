# Manual técnico e editorial — Cátedra Digital

Este diretório é o índice operacional da plataforma. A documentação descreve contratos que devem ser verificados no código e nos testes; não substitui evidência de execução.

## Documentos normativos

1. [Carta do produto e princípios](./product-charter.md)
2. [Design system e identidade visual](./design-system.md)
3. [Arquitetura e contratos dos módulos](./module-contracts.md)
4. [Rotas, navegação e transições](./navigation-routing.md)
5. [Nexus/Conexo e proveniência](./nexus-conexo.md)
6. [Segurança e privacidade](./security-baseline.md)
7. [SEO técnico e indexação](./seo-standard.md)
8. [Acessibilidade, responsividade e desempenho](./accessibility-performance.md)
9. [Qualidade, testes e varredura](./quality-and-audit.md)
10. [Conteúdo editorial e Átrio](./editorial-content.md)
11. [Publicação e verificação Cloudflare](./release-and-production.md)

## Regra de verdade

- **Documentado** não significa implementado.
- **Implementado** não significa testado.
- **Build verde** não prova fluxo funcional.
- **Deploy concluído** não prova que a versão servida está correta.
- Cada requisito deve apontar para código, teste automatizado ou evidência de produção.
- Pendências permanecem explícitas; não marcar itens como concluídos por inferência.

## Responsabilidade

O processo técnico deve trabalhar em branch isolada, preservar histórico e mudanças de terceiros, abrir PR revisável e executar os gates definidos. Merge e deploy só podem ocorrer depois dos critérios de segurança, CI, E2E autenticado desktop/mobile e verificação de produção estarem comprovados.