# SEO técnico — padrão de publicação

## Identidade e metadados

- Usar o nome público **Cátedra Digital** de modo consistente em título, descrição, Open Graph, Twitter cards e dados estruturados.
- Cada página indexável deve ter título único, descrição útil, canonical absoluto e idioma coerente com o conteúdo.
- Não declarar indexável uma página privada, administrativa, duplicada ou sem conteúdo útil.
- Dados estruturados devem representar apenas informações verdadeiras e visíveis na página.

## Rotas e indexação

- `robots.txt` deve permitir rastreamento de páginas públicas canônicas e bloquear áreas privadas quando apropriado; não é controle de autorização.
- `sitemap.xml` deve listar URLs canônicas únicas, sem parâmetros transitórios, aliases que redirecionam ou rotas privadas/noindex.
- Não inventar `lastmod`; usar apenas data real de alteração relevante.
- Aliases devem ter destino estável e canonical coerente.
- Páginas de leitura devem preservar referências canônicas e links de origem.

## Conteúdo e fontes

- Notícias e dossiês devem mostrar data, veículo/fonte e link para o conteúdo original.
- Traduções devem identificar idioma de origem e idioma de leitura; o idioma do caminho da URL, sozinho, não prova o idioma do conteúdo.
- Não usar dados estruturados para sugerir aprovação institucional que não existe.

## Verificação de release

- Validar localmente os metadados e o sitemap gerado.
- Após deploy autorizado, requisitar `https://cathedradigital.com.br/robots.txt` e `https://cathedradigital.com.br/sitemap.xml`; exigir status esperado e conteúdo válido.
- Repetir nos domínios raiz e `www) para as páginas de entrada prioritárias.
- Verificar redirects, canonical, título, description, status HTTP e conteúdo servido.
- Inspecionar URLs prioritárias no Search Console quando houver acesso.
- Um teste HTTP 200 isolado não prova que o HTML contém a interface correta; conferir tamanho/conteúdo e navegador.

## Métricas

Acompanhar indexação, cobertura, canonical selecionada, erros de rastreamento, Core Web Vitals e páginas órfãs. SEO melhora a capacidade de descoberta, mas não garante ranking específico.