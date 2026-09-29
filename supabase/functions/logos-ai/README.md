# Logos AI Edge Function

A função `logos-ai` é o gateway server-side da Logos.

## Entrada

`query`, `context`, `selectedText`, `type`, `journeyId` e `history`.

## Saída

`{ "text": "..." }` ou erro HTTP estruturado.

## Segurança

- `LOVABLE_API_KEY` fica exclusivamente no ambiente server-side.
- O browser chama apenas a Edge Function do Supabase.
- A entrada é limitada e normalizada antes de chegar ao modelo.
- O histórico é limitado às últimas 6 mensagens.
- O upstream tem timeout de 45 segundos.
- O erro 429 é traduzido para o contrato de fallback já usado pelo frontend.
- A função mantém `verify_jwt = true`.

## Provedor

A função usa o Lovable AI Gateway em `https://ai.gateway.lovable.dev/v1/chat/completions`, com o modelo `google/gemini-3.7-flash`. O secret esperado é `LOVABLE_API_KEY`.

## Observação

A etapa seguinte é conectar o retrieval do Nexus ao contexto da função, usando as tabelas e políticas existentes. Até essa etapa, o Logos não fabrica referências para compensar ausência de fonte recuperada.
