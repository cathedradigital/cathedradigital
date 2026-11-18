# Auditoria (somente leitura) — recursos de backend ausentes

Nenhum arquivo do app foi alterado. Este plano não traz código; ele só registra o resultado da auditoria.

## Alerta principal
O banco ligado a este preview tem **34 tabelas e só 3 funções**. Ele **não** tem várias tabelas da sua lista "existente": nexus_relations, corpus_*, authority_*, liturgy_readings, liturgy_meditations, missal_propers, community_posts, bible_favorites, user_emotions, seo_*, bible_audit_* e outras. Também faltam bible_read_gate_status e search_fuzzy_*. A sua lista provavelmente descreve o Supabase de produção. A comparação abaixo usa a **sua lista**; no preview, a falta é ainda maior.

## Inventário (src/)
- 137 nomes em `.from()`. Os que não são tabela: `avatars` (bucket), `x` (falso positivo). saintWorksService usa constantes; o nome não foi resolvido.
- 34 RPCs, 49 Edge Functions.

## Ausentes, por impacto (rota/módulo · arquivos)
1. **view_journeys_with_stats / view_itineraria_with_stats / itineraria(_steps/_progress)**: Formar-se › Jornadas e Itinerários · AtriumJornadasPage, JornadasPage, ItinerariaPage, JourneyService, ItinerariumDetail/StepPage.
2. **global_search_v2 (RPC)**: Pesquisar › Buscar · globalSearchService. A falha foi vista antes, já com mensagem de erro recuperável.
3. **liturgy-hours-office (função) + liturgy_hours_offices**: Rezar › Liturgia das Horas · useLiturgyHoursOffice.
4. **liturgical-calendar / missal-proper (funções)**: Rezar › Liturgia, Missal · useLiturgicalMonth, useMissalProper, prefetch.
5. **saint-of-the-day / search-saint / saint-ai-reflection (funções), search_saints_fuzzy (RPC)**: Pesquisar › Santos e Minha Jornada › Hoje · useSaintOfDay, useSaints, useDashboardData, Saints, SaintAILearn.
6. **library_items_v1 + search_library_items (RPC)**: Pesquisar › Biblioteca · libraryService, useChurchContext.
7. **get_active_primary_translation (RPC), reading_state_history**: Estudar › Bíblia · bibleTranslation, Bible.tsx.
8. **user_sensitive_data, reading_reflections**: Minha Jornada › Hoje, Diagnóstico, Onboarding · useDashboardData, useSpiritualProfile, OnboardingPage, SpiritualQuiz.
9. **achievements, user_achievements, weekly_goals_history**: Minha Jornada › Conquistas, Metas · AchievementsPage, SpiritualGoals.
10. **audit_logs, transactions, community_likes**: Minha Jornada › Perfil · ProfilePage.
11. **collection_progress**: contadores da conta e coleções · useAccountCounters, useCollectionProgress.
12. **glossary_role_for (RPC)**: Pesquisar › Glossário (permissões de edição) · useGlossaryRole.
13. **public_profiles, community_likes**: Comunidade (fora do menu principal).
14. **colloquium_conversations/messages**: modo Estudo · StudyMode.
15. **logos-spiritual-insight (função)**: Formar-se › Temas (detalhe) · TemaDetailPage.
16. **prayer-tts (função)**: botão Ouvir nas orações · PrayerTTSButton.
17. **Comércio** (transactions, validate-coupon, mercadopago-*): Checkout e doação.
18. **Telemetria silenciosa** (analytics_events, app_metrics, web_vitals, security_logs, log_rls_denial, push_subscriptions, landing_leads, coming_soon_leads, quiz_results, partners): enviam ou leem dados em segundo plano. Isso não deve apagar a tela.
19. **Só no admin/diagnóstico** (fora dos 5 módulos): bible_cache_metrics, bible_diagnostic_runs, bible_integrity_reports, catechism_cache, core_audit_logs, admin_* RPCs, funções bible-*/saint-import/seo-*.

## Como cada falha aparece na tela
- Já confirmado em verificações anteriores: o Glossário tem plano B com aviso amigável, o Nexus esconde o cartão quando dá erro e a Busca mostra um erro recuperável.
- Itens 1 e 3–16: o tratamento **não foi verificado nesta auditoria**. Não é possível afirmar se a tela mostra vazio, mostra erro ou fica em branco sem abrir cada rota. Esse é o próximo passo sugerido: abrir as rotas no preview, com login, e registrar o comportamento.
- Funções ausentes não puderam ser confirmadas daqui: a lista de funções publicadas não está acessível neste ambiente.
