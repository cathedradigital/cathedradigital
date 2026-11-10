# População automática da Liturgia

O projeto inclui a migração `20261110195500_create_liturgy_population_tables.sql` e o script `scripts/populate-liturgy-weeks.mjs`.

O script calcula o próximo domingo e popula, por padrão, quatro semanas (28 dias). Ele:

- busca cada data usando `LITURGY_SOURCE_URL_TEMPLATE`;
- valida que a resposta corresponde exatamente à data solicitada;
- normaliza Primeira Leitura, Salmo, Segunda Leitura e Evangelho;
- trata `Não há segunda leitura hoje!` como ausência, mas preserva textos válidos retornados como string;
- faz upsert idempotente em `liturgy_readings`;
- cria meditações locais seguras em `liturgy_meditations`;
- não substitui uma meditação editorial não-fallback, salvo com `--force`.

A URL da fonte deve realmente aceitar a data. O endpoint legado `https://liturgia.up.railway.app` responde o dia corrente mesmo quando recebe query strings ignoradas e, portanto, não deve ser usado diretamente como template sem um adaptador que preserve a data.

## Aplicação

A migração deve ser aplicada com o fluxo administrativo do Supabase. Depois, execute o script em ambiente seguro, nunca no navegador:

```bash
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
export LITURGY_SOURCE_URL_TEMPLATE="https://<fonte>/liturgia/{date}"

bun run populate:liturgy -- --weeks=4
```

Para substituir meditações marcadas como fallback:

```bash
bun run populate:liturgy -- --weeks=4 --force
```

A chave `SUPABASE_SERVICE_ROLE_KEY` concede acesso administrativo e não pode ser incluída em código de frontend, logs, workflow público ou arquivo versionado.

O provider da aplicação tenta primeiro a Edge Function oficial e, quando ela estiver indisponível, lê o mesmo dia em `liturgy_readings`. Isso permite uma transição gradual para a fonte populada sem mascarar uma resposta de data incorreta.
