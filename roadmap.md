# Migração Catedra Digital → Lovable (TanStack Start)

- [x] Clonar repo em /tmp/cathedradigital
- [x] Copiar src/ + public/ (sem testes/entry)
- [x] Instalar 269 dependências
- [x] Shim react-router-dom → src/lib/rr-compat.tsx
- [x] Shim react-helmet-async → src/lib/helmet-compat.tsx
- [x] Codemod de imports (router/helmet) + fixture __test copiada
- [x] tsconfig relaxado (strict off) para código legado
- [x] CSS: styles.css reescrito com @config tailwind.config.legacy.ts + legacy-index.css
- [x] Rotas hospedeiras: src/routes/index.tsx e $.tsx renderizam App (ssr:false)
- [ ] Banco: aplicar 459 migrações (squash em 8 lotes /tmp/migchunks) via supabase--migration — psql direto falhou (permission denied); rodar ferramenta lote a lote
- [ ] Após migrações: GRANTs finais (authenticated/service_role/anon+RLS) em todas as tabelas public
- [ ] Buckets storage: criar 'avatars' e 'public-assets' (públicos) via storage_create_bucket
- [ ] Verificar tipos regenerados (erros TS2769 'never' devem sumir)
- [ ] Testar preview no navegador (/) e corrigir erros de runtime
- [ ] Edge functions (76): bloqueadas para escrita via shell — avaliar alternativas
- [ ] Configurar Google sign-in (configure_social_auth) se app usar

## Auditoria completa do front-end
- [ ] Consolidar home/landing ativa, navegação e chamadas principais sem redesign
- [ ] Padronizar componentes e tokens visuais compartilhados com mudanças seguras
- [ ] Corrigir acessibilidade, ícones, responsividade e estados principais
- [ ] Validar rotas e fluxos principais em 390, 768, 1024 e desktop largo
- [ ] Rodar typecheck, lint, testes relevantes e build; fazer segunda revisão visual
