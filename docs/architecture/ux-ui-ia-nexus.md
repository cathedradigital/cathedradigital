# Cathedra — integração UX, UI, IA e Nexus

## Objetivo
Transformar os módulos existentes em uma experiência contínua, evitando ilhas funcionais.

## Fluxo canônico

Usuário → UI → fluxo UX → módulo → serviço → Supabase/RLS → Nexus → Logos → retorno ao conteúdo.

## Responsabilidades

- **UX:** descoberta, leitura, continuidade, progresso e próximos passos.
- **UI:** componentes consistentes e estados de carregamento/erro.
- **Nexus:** relaciona Escritura, Catecismo, Magistério, Santos, jornadas e biblioteca.
- **Logos:** interpreta a pergunta dentro do contexto e aponta para fontes e módulos.
- **Supabase/RLS:** persistência, autenticação e autorização.
- **Deploy:** GitHub → pipeline → aplicação publicada.

## Correções desta etapa

1. `/logos` deixa de redirecionar para `/buscar`.
2. `/logos` passa a ter uma página própria que usa o componente LogosAI integrado.
3. `/logos` recebe `q` e `context` pela URL, permitindo chamadas vindas de Bíblia, Catecismo, Magistério e outros módulos.
4. O Nexus continua sendo a camada de conexão de conteúdo, sem duplicar acervos.
5. O contrato do Logos permanece baseado em fontes identificáveis, contexto e referências.

## Próxima integração

A função `logos-ai` precisa existir no ambiente Supabase/Lovable e possuir um provedor de modelo configurado. O frontend já envia contexto, tipo, texto selecionado, jornada e histórico limitado; não deve receber chaves privadas no navegador.

## Critério de conclusão

Uma integração só é considerada concluída quando:
- a rota abre diretamente;
- o componente recebe contexto;
- a chamada de backend responde;
- as fontes retornadas conseguem levar o usuário de volta ao conteúdo;
- autenticação/RLS e limites são respeitados;
- o build/deploy publica o commit.
