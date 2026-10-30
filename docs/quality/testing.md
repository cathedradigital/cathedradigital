# Estratégia de qualidade e validação — Cátedra Digital

**Status:** contrato de qualidade; não é relatório de testes executados.

## 1. Pirâmide de validação

1. TypeScript/typecheck.
2. Lint e formatação quando aplicável.
3. Testes unitários e de componentes.
4. Validadores de contratos, rotas e limites de segurança.
5. Testes de integração com serviços e banco.
6. Playwright E2E crítico em desktop e mobile.
7. Verificação pós-publicação dos domínios e recursos de produção.

Uma etapa não substitui outra. Build aprovado não comprova autenticação, autorização, UX ou publicação correta.

## 2. Fluxos críticos

Cobrir, conforme o escopo implementado:
- Átrio e navegação principal;
- Bíblia: catálogo, referência, capítulo/versículo, reload, back/forward e retorno contextual;
- Catecismo: §§1, 25, 26, 2262 e 2865, aliases de URL e retorno contextual;
- Magistério/Documentos: documento, idioma, fonte, parágrafo e retorno;
- Nexus: conexões válidas e cobertura negativa para referências inexistentes;
- login, logout, sessão expirada e preservação do destino interno `next`;
- Diário e Minha Jornada: gravação confirmada, recuperação e isolamento entre contas;
- Rezar, Formar-se e Pesquisar: fluxos principais, estados vazios e falhas;
- links internos, SEO, console e respostas de rede inesperadas.

Não criar testes duplicados antes de localizar os testes existentes.

## 3. Matriz de dispositivos

- Desktop: viewport representativo e navegador suportado pelo workflow.
- Mobile: **390 × 844** como viewport de referência do gate crítico.
- Cobertura responsiva adicional pode incluir 320, 360 e 412 px conforme o componente.

Verificar overflow horizontal, controles sobrepostos, foco, teclado, rolagem, legibilidade e ações acionáveis por toque.

## 4. Autenticação e privacidade

Os testes autenticados devem usar a conta de teste autorizada e os secrets do GitHub Actions. Nunca imprimir email, senha, token, cookie ou conteúdo de sessão.

Executar testes negativos de autorização e isolamento entre duas contas de teste quando o cenário exigir. Falha no preflight de autenticação deve ser classificada como falha de ambiente/configuração; não deve ser confundida com reprovação funcional do navegador.

## 5. Integridade dos testes

- Não remover nem enfraquecer asserções para obter aprovação.
- Não mascarar falhas com `|| true`, retries excessivos ou timeouts arbitrários.
- Distinguir teste único de repetição/retry.
- Classificar falha como produto, ambiente, dados, configuração, automação ou inconclusiva.
- Guardar trace, screenshot, relatório e logs sanitizados quando disponíveis.

## 6. Gate de liberação

CI, auditoria de dependências e Playwright desktop/mobile devem estar aprovados no **mesmo SHA final**. Os resultados devem apontar para o mesmo commit; não combinar aprovação de commits diferentes.

Antes de produção, verificar os três destinos configurados:
- `https://cathedradigital.com.br`
- `https://www.cathedradigital.com.br`
- `https://cathedradigital.cathedradigital.workers.dev`

Verificar também `robots.txt`, `sitemap.xml`, versão efetivamente servida, rotas críticas, autenticação e ausência de erros relevantes.

## 7. Registro obrigatório

Para cada execução, registrar:
- workflow e URL da execução;
- SHA exato;
- ambiente e navegador/viewport;
- comando ou job;
- quantidade de testes únicos, retries, aprovados, reprovados e ignorados;
- relatório, trace, screenshots e logs sanitizados;
- bloqueios externos e classificação das falhas.

## 8. Definition of Done

Uma entrega só é aprovada quando os critérios do requisito foram satisfeitos, os testes pertinentes passaram no SHA final e a revisão exigida foi concluída. O status **publicado** exige ainda prova da versão efetivamente servida no ambiente de destino.
