# Qualidade, varredura e auditoria por módulo

## Objetivo

Transformar a auditoria numa sequência repetível, baseada em evidências, sem declarar cobertura total quando apenas parte do repositório foi inspecionada.

## Fases

### A. Inventário
- Mapear rotas, aliases, páginas, layouts, componentes compartilhados, hooks, serviços, tabelas, policies, Edge Functions e workflows.
- Relacionar cada rota ao módulo, componente de entrada, dados, permissões e testes.
- Identificar arquivos órfãos, duplicações e contratos documentados sem implementação.

### B. Análise estática
- Executar typecheck, lint, validadores de módulos, links internos e fronteiras de segurança.
- Inspecionar TODO/FIXME, imports não utilizados, erros de tipagem, estados inacessíveis e handlers sem efeito.
- Não considerar um scanner estático substituto de revisão funcional.

### C. Fluxos funcionais
- Executar link direto, navegação interna, refresh, back/forward e retorno de contexto.
- Testar loading, vazio, falha de API, sessão expirada e ausência de permissões.
- Verificar console, requisições HTTP, acessibilidade e overflow.
- Para conteúdo, validar fonte, idioma, referências e comportamento de leitura.

### D. Backend e segurança
- Conferir tabelas/views/functions, RLS, grants, migrations e schema cache.
- Testar acesso permitido e negado com identidades distintas.
- Garantir que erros de persistência não sejam apresentados como sucesso.

### E. E2E e regressão
- Executar suíte crítica autenticada em desktop e mobile.
- Não remover nem enfraquecer assertions para fazer a suíte passar.
- Corrigir a causa-raiz e adicionar regressão específica.
- Comparar falhas novas, resolvidas e persistentes contra a execução anterior.

### F. Aceite e evidências
- Registrar SHA exato, comandos, status, duração, relatórios e artefatos sanitizados.
- Relacionar cada finding a severidade, arquivo/rota, reprodução, causa, correção e teste.
- Marcar como bloqueador qualquer falha P0/P1 em autenticação, privacidade, leitura canônica, navegação ou deploy.
- Diferenciar: não inspecionado, inspecionado sem falha, falha confirmada, correção em revisão, validado.

## Severidade

- **P0:** exposição de dados/segredos, acesso indevido, conteúdo crítico corrompido, produção indisponível ou deploy sem gate.
- **P1:** fluxo principal quebrado, login/destino perdido, deep link incorreto, Nexus enganoso, controle essencial inacessível.
- **P2:** degradação relevante com alternativa, responsividade ou SEO importante.
- **P3:** refinamento visual/editorial sem impacto crítico.

## Gates de publicação

1. CI e validadores verdes no SHA final.
2. E2E crítico autenticado aprovado em desktop e mobile.
3. Deep links e retornos críticos verificados.
4. Sem erros inesperados de console/rede.
5. Segurança e sanitização aprovadas.
6. Deploy Cloudflare autorizado.
7. Domínios reais, robots.txt e sitemap.xml validados após publicação.

Sem evidência, o status é pendente — nunca presumido.