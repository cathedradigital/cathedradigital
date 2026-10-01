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
  'sb_publishable_UFqiEo_riy69x8xXLnxf7Q_1hO6AG7N';
