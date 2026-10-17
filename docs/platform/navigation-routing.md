# Rotas, navegação e transições

## Objetivo

Evitar páginas sem saída, destinos perdidos, estado de leitura descartado e diferenças de comportamento entre navegação interna, refresh e links compartilhados.

## Regras canônicas

- Cada página pública tem uma rota canônica documentada e um único destino final.
- Aliases antigos devem redirecionar preservando parâmetros semanticamente válidos.
- Query strings que representam destino de leitura ou retorno não podem ser descartadas em redirecionamentos intermediários.
- Parâmetros internos de retorno devem ser validados como caminhos locais permitidos para evitar open redirects.
- Navegação por link, menu, voltar/avançar do navegador e refresh deve convergir para o mesmo estado esperado.
- URLs com conteúdo selecionado devem refletir o destino selecionado; o estado visual não pode sobrescrever silenciosamente um deep link válido.

## Contratos específicos conhecidos

- Bíblia: preservar livro/capítulo/versículo e normalizar aliases sem acentos quando aplicável; validar links legados como `/bible?book=joao&chapter=1&v=1`.
- Catecismo: suportar `?p=N` como forma canônica e `?paragraph=N` como alias legado; testar pelo menos §§ 1, 2262 e 2865. A restauração do parágrafo precisa terminar antes de liberar observadores de scroll concorrentes.
- Autenticação: rotas protegidas preservam `next` durante o fluxo de login e só navegam ao destino depois que a sessão foi persistida e hidratada.
- Diário/Jornada: ao retornar ao estudo, preservar a passagem/parágrafo que originou a anotação.
- Navegação global: um acionador primário de sidebar; não manter gatilhos duplicados em mobile.

## Transição de página

1. Resolver rota e alias.
2. Validar parâmetros.
3. Obter/hidratar sessão quando necessário.
4. Carregar dados e mostrar estado de carregamento real.
5. Restaurar seleção/posição solicitada.
6. Habilitar observadores e interações concorrentes.
7. Registrar erro recuperável se o destino ou dado não existir.

## Segurança e privacidade

- Não aceitar destinos externos arbitrários em `next`.
- Não colocar tokens, e-mails privados ou dados pessoais em URLs.
- Respostas 401/403 não devem ser mascaradas como sucesso.
- Recursos privados devem negar acesso no backend mesmo quando a URL é acessada diretamente.

## Testes mínimos

- Link direto, navegação interna, refresh, back/forward.
- Desktop e mobile (390×844 como viewport obrigatório do gate atual).
- Login real, preservação de destino e logout.
- Parâmetros inválidos, aliases e rotas inexistentes.
- Sem erros inesperados de console/rede e sem respostas 403 interpretadas como renderização funcional.