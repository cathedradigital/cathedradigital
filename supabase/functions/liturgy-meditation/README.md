# `liturgy-meditation`

Edge Function pública usada pela página `/liturgia` para gerar e persistir a meditação do dia quando ainda não há conteúdo publicado.

## Segurança e comportamento

- `verify_jwt = false` porque a liturgia é pública; a chave service-role nunca sai do servidor.
- A função busca as leituras por data diretamente na mesma fonte Railway do provider; conteúdo de leitura enviado pelo navegador é ignorado. A chave `reading_key` é derivada da referência do Evangelho confiável, não do modelo.
- Leituras aceitam conteúdo editorial somente para hoje e os dias adjacentes. Registros já existentes podem ser consultados em qualquer data.
- O lock SQL limita globalmente a até duas tentativas por data litúrgica por dia UTC e evita gerações paralelas; não depende de cabeçalhos de IP encaminhados pelo proxy. Falhas mantêm um cooldown de cinco minutos.
- O conteúdo é validado antes de persistir: os campos do modelo devem ser strings e chaves inesperadas são rejeitadas. Citações de Padres, Catecismo, Magistério e história não são inventadas: os campos opcionais ficam vazios até existir pipeline editorial com fontes verificáveis.
- O gateway responde 402/429 com códigos distintos; erros de infraestrutura não incluem detalhes nem segredos.

## Pré-requisitos e publicação

1. Configurar `LOVABLE_API_KEY` como secret de Supabase Functions pelo secret manager/dashboard; não passá-lo em argumentos shell nem commitá-lo. A função também lê `SUPABASE_URL` e `SUPABASE_SECRET_KEYS` (com fallback para `SUPABASE_SERVICE_ROLE_KEY`, fornecidos pelo projeto Supabase).
2. Com a CLI autenticada, vincular o projeto `supabase link --project-ref isojguvcnfncokoxoauk` e aplicar `supabase db push`.
3. Implantar com `supabase functions deploy liturgy-meditation --project-ref isojguvcnfncokoxoauk`.
4. Confirmar a tabela por leitura e a rota da função com uma requisição sem geração; só então validar uma geração do dia após autorização/controle de consumo.

A publicação Cloudflare do frontend **não** aplica migrations nem implanta Edge Functions. Estes passos precisam acontecer no projeto Supabase `isojguvcnfncokoxoauk` após revisão e aprovação próprias.
