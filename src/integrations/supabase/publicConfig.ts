/**
 * Configuração PÚBLICA do Supabase de produção (projeto isojguvcnfncokoxoauk).
 *
 * URL e chave anon/publishable são públicas por design (vão no bundle do
 * navegador; o acesso é protegido por RLS). Servem de fallback quando as
 * variáveis de ambiente não existem ou estão vazias — por exemplo, variáveis
 * cadastradas em branco no painel da Vercel, que têm prioridade sobre o
 * .env.production e zeravam a configuração no build.
 *
 * NUNCA coloque a service_role key aqui.
 */
export const PUBLIC_SUPABASE_URL = 'https://isojguvcnfncokoxoauk.supabase.co';
export const PUBLIC_SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwd3JwbW9uaWdsYXJxd2Z5cnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODYxNDMsImV4cCI6MjA4ODE2MjE0M30.wvD9JCiH1edvigTFg6RP3EFNIqXF7T9GPC01hTTiTTw';
