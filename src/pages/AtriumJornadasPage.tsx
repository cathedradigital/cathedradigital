/**
 * AtriumJornadasPage — Etapa 5 (reskin Stitch, "Formação/Jornadas").
 *
 * Regras:
 *  - Landing editorial com tokens `stitch-*` (hero + trilhas + jornada em destaque).
 *  - Reaproveita a view `view_journeys_with_stats` (mesma fonte da versão legada).
 *  - Reaproveita `journey_progress` para "Continue sua jornada".
 *  - Versão anterior (filtros, busca fuzzy, categorias) segue em /jornadas-legacy.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from '@/lib/helmet-compat';
import { Link } from '@/lib/rr-compat';
import {
  ArrowRight,
  Sparkles,
  Compass,
  Heart,
  Sun,
  Calendar,
  BookOpen,
  Stethoscope,
  Zap,
  Flame,
} from 'lucide-react';
import { EditorialHero } from '@/components/editorial/harmony';
import { supabase } from '@/lib/db';
import { JourneyService } from '@/core/journey';
import { useAuth } from '@/hooks/useAuth';
import { SpaceLayout, SpaceFooter } from '@/components/cathedra/space/SpaceLayout';

type JourneyRow = {
  id: string;
  title: string;
  description: string | null;
  subtitle?: string | null;
  category: string;
  difficulty: string;
  steps_count: number;
  duration_days?: number | null;
  sort_order?: number | null;
};

const CATEGORY_META: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  fundamentos: { label: 'Fundamentos', Icon: Sparkles },
  formacao: { label: 'Formação', Icon: BookOpen },
  rotina: { label: 'Rotina', Icon: Calendar },
  oracao: { label: 'Oração', Icon: Heart },
  mistico: { label: 'Místico', Icon: Sun },
  cura: { label: 'Cura', Icon: Stethoscope },
  transformacao: { label: 'Transformação', Icon: Zap },
};

const DIFFICULTY_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  'avançado': 'Avançado',
};

const AtriumJornadasPage: React.FC = () => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<JourneyRow[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      setProgressError(null);
      setProgressMap({});
      try {
        const { data, error } = await supabase
          .from('view_journeys_with_stats')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) {
          console.error('AtriumJornadas load error:', error);
          if (!cancelled) setLoadError('Não foi possível carregar as jornadas.');
        }
        if (!cancelled && data) setJourneys(data as JourneyRow[]);

        if (user) {
          const progressRes = await JourneyService.listUserJourneyProgress(user.id);
          if (progressRes.error) {
            console.error('AtriumJornadas progress load error:', progressRes.error);
            if (!cancelled) setProgressError('O progresso pessoal não pôde ser carregado.');
          }
          if (!cancelled && progressRes.data) {
            const m: Record<string, number> = {};
            progressRes.data.forEach((p) => {
              m[p.journey_id] = (m[p.journey_id] || 0) + 1;
            });
            setProgressMap(m);
          }
        }
      } catch (error) {
        console.error('AtriumJornadas unexpected load failure:', error);
        if (!cancelled) setLoadError('Não foi possível carregar as jornadas. Tente novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    journeys.forEach((j) => set.add(j.category));
    return ['all', ...Array.from(set)];
  }, [journeys]);

  const inProgress = journeys.filter(
    (j) => (progressMap[j.id] ?? 0) > 0 && (progressMap[j.id] ?? 0) < j.steps_count,
  );
  const inProgressIds = useMemo(() => new Set(inProgress.map((j) => j.id)), [inProgress]);
  const completedIds = useMemo(
    () => new Set(journeys.filter((j) => j.steps_count > 0 && (progressMap[j.id] ?? 0) >= j.steps_count).map((j) => j.id)),
    [journeys, progressMap],
  );
  const featured = journeys.find((j) => !inProgressIds.has(j.id) && !completedIds.has(j.id));
  const visible = useMemo(
    () => journeys.filter((j) =>
      !inProgressIds.has(j.id) &&
      j.id !== featured?.id &&
      (activeCategory === 'all' || j.category === activeCategory),
    ),
    [journeys, activeCategory, inProgressIds, completedIds, featured?.id],
  );

  return (
    <div
      className="min-h-screen w-full bg-background text-foreground"
    >
      <Helmet>
        <title>Cathedra Digital — Formação</title>
        <meta
          name="description"
          content="Trilhas guiadas de formação católica: fundamentos, oração, vida mística e transformação. Um passo por vez, no ritmo do silêncio."
        />
        <meta property="og:title" content="Cathedra Digital — Formação" />
      </Helmet>

      <SpaceLayout>
        <EditorialHero density="minimal">
          <EditorialHero.Eyebrow>Itinerarium Mentis · Formação</EditorialHero.Eyebrow>
          <EditorialHero.Title>Formar-se</EditorialHero.Title>
          <EditorialHero.Subtitle>Percursos de fé para transformar conhecimento em vida — um passo por vez, no ritmo possível para você.</EditorialHero.Subtitle>
        </EditorialHero>

        {/* ─── Claustro: Prioridade de continuidade ─── */}
        {inProgress.length > 0 && (
          <section aria-labelledby="journeys-continue-title" className="pt-8 md:pt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 id="journeys-continue-title" className="font-stitch-display text-[22px] font-semibold leading-tight text-stitch-primary md:text-[24px] md:leading-[32px]">
                CONTINUAR
              </h2>
              <span className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant">
                {inProgress.length} em curso
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {inProgress.slice(0, 2).map((j) => {
                const done = progressMap[j.id] ?? 0;
                const pct = Math.min(100, Math.round((done / Math.max(j.steps_count, 1)) * 100));
                return (
                  <Link
                    key={j.id}
                    to={`/jornadas/${j.id}`}
                    aria-label={`Continuar jornada ${j.title}. ${done} de ${j.steps_count} etapas concluídas.`}
                    className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2 md:p-6"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-stitch-secondary transition-transform group-hover:scale-y-100" />
                    <span className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-secondary">
                      {CATEGORY_META[j.category]?.label ?? j.category}
                    </span>
                    <h3 className="mt-1 break-words font-stitch-display text-[20px] leading-tight text-stitch-primary [overflow-wrap:anywhere] md:text-[22px]">
                      {j.title}
                    </h3>
                    <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
                      <p className="min-w-0 break-words font-stitch-body text-[13px] text-stitch-on-surface-variant">
                        {done} de {j.steps_count} etapas concluídas
                      </p>
                      <span className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-full border border-stitch-secondary/35 px-3 font-stitch-body text-[10px] font-bold uppercase tracking-[0.1em] text-stitch-secondary transition-colors group-hover:bg-stitch-secondary/10 sm:text-[11px]">
                        Continuar <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        role="progressbar"
                        aria-label={`Progresso na jornada ${j.title}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                        className="h-1 flex-1 overflow-hidden rounded-full bg-stitch-surface-container-highest"
                      >
                        <div
                          className="h-full bg-stitch-secondary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-stitch-body text-[12px] font-bold text-stitch-secondary">
                        {pct}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Jornada em destaque ───────────────────────────────────── */}
        {featured && (
          <section aria-labelledby="journey-featured-title" className="pt-10 md:pt-14">
            <Link
              to={`/jornadas/${featured.id}`}
              aria-label={`Conhecer a jornada ${featured.title}`}
              className="group relative flex min-h-[290px] min-w-0 flex-col justify-end overflow-hidden rounded-xl bg-stitch-primary p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2 sm:p-8 md:min-h-[360px] md:p-12"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 18% 22%, hsl(var(--stitch-secondary) / 0.35), transparent 68%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stitch-primary via-stitch-primary/50 to-transparent" />
              <div className="relative z-10 min-w-0 max-w-2xl text-stitch-primary-foreground">
                <span className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.2em] text-stitch-secondary-fixed">
                  <Flame className="mr-2 inline h-3 w-3" />
                  Jornada em Destaque
                </span>
                <h3 id="journey-featured-title" className="mt-2 break-words font-stitch-display text-[clamp(2rem,8vw,3rem)] italic leading-[1.08] text-stitch-primary-foreground [overflow-wrap:anywhere] md:leading-[56px] md:tracking-[-0.02em]">
                  {featured.title}
                </h3>
                {featured.description && (
                  <p className="mt-4 max-w-[60ch] break-words font-stitch-body text-[15px] leading-6 text-stitch-primary-foreground/80 [overflow-wrap:anywhere] md:text-[18px] md:leading-[28px]">
                    {featured.description}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-stitch-body text-[11px] font-bold uppercase tracking-[0.12em] text-stitch-secondary-fixed sm:text-[12px] sm:tracking-[0.15em]">
                  <span>{featured.steps_count} etapas</span>
                  {featured.duration_days && <span>· {featured.duration_days} dias</span>}
                  <span>· {DIFFICULTY_LABELS[featured.difficulty] ?? featured.difficulty}</span>
                </div>
                <span className="mt-6 inline-flex min-h-11 items-center justify-center border border-stitch-secondary-fixed px-5 text-center font-stitch-body text-[12px] font-medium uppercase tracking-[0.1em] text-stitch-secondary-fixed transition-colors group-hover:bg-stitch-secondary-fixed group-hover:text-stitch-primary sm:text-[14px]">
                  Conhecer jornada
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* ─── Outras jornadas ───────────────────────────────────────── */}
        <section aria-labelledby="journey-recommendations-title" className="pt-10 md:pt-14">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.16em] text-stitch-secondary">Filtrar por tema</p>
              <h2 id="journey-recommendations-title" className="font-stitch-display text-[22px] font-semibold leading-tight text-stitch-primary md:text-[24px] md:leading-[32px]">
                Outras jornadas
              </h2>
            </div>
            <div role="group" aria-label="Filtrar outras jornadas por tema" className="flex min-w-0 flex-wrap gap-2">
              {categories.map((c) => {
                const meta = c === 'all' ? { label: 'Todas', Icon: Compass } : CATEGORY_META[c] ?? { label: c, Icon: Compass };
                const active = activeCategory === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    aria-pressed={active}
                    style={{ minHeight: 'var(--stitch-mobile-touch-min, 44px)' }}
                    className={
                      'inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 font-stitch-body text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2 ' +
                      (active
                        ? 'border-stitch-secondary bg-stitch-secondary/10 text-stitch-primary'
                        : 'border-stitch-outline-variant/40 bg-stitch-surface-container-low text-stitch-on-surface-variant hover:border-stitch-secondary hover:text-stitch-primary')
                    }
                  >
                    <meta.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[220px] animate-pulse rounded-lg border border-stitch-outline-variant/20 bg-stitch-surface-container-lowest"
                />
              ))}
            </div>
          ) : loadError ? (
            <div role="alert" className="border-t border-stitch-secondary/10 pt-8 text-center">
              <p className="font-stitch-body text-[14px] text-destructive">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-4 min-h-[44px] rounded-md border border-stitch-secondary/40 px-4 py-2 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-secondary hover:bg-stitch-secondary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p role="status" className="rounded-lg border border-stitch-outline-variant/30 bg-stitch-surface-container-low px-4 py-6 text-center font-stitch-body text-[14px] leading-relaxed text-stitch-on-surface-variant">
              {journeys.length === 0
                ? 'Nenhuma jornada disponível no momento.'
                : activeCategory === 'all'
                  ? 'As jornadas disponíveis já estão organizadas em andamento ou em destaque acima.'
                  : 'Não há outras jornadas neste tema no momento; percursos em andamento ou em destaque aparecem acima.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {visible.map((j, i) => {
                const meta = CATEGORY_META[j.category] ?? { label: j.category, Icon: Compass };
                const done = progressMap[j.id] ?? 0;
                const pct = Math.min(100, Math.round((done / Math.max(j.steps_count, 1)) * 100));
                return (
                  <Link
                    key={j.id}
                    to={`/jornadas/${j.id}`}
                    aria-label={`Jornada ${j.title}. ${j.steps_count} etapas. ${DIFFICULTY_LABELS[j.difficulty] ?? j.difficulty}${done >= j.steps_count && done > 0 ? '. Concluída' : ''}`}
                    className="group relative flex min-w-0 flex-col rounded-lg border border-stitch-outline-variant/20 bg-stitch-surface-container-lowest p-5 transition-all hover:border-stitch-secondary/40 hover:shadow-xl hover:shadow-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2 md:p-6"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-stitch-secondary transition-transform group-hover:scale-y-100" />
                    <div className="mb-4 flex items-center justify-between">
                      <meta.Icon className="h-6 w-6 text-stitch-secondary" />
                      <span className="font-stitch-display text-[32px] italic text-stitch-secondary/75">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-secondary">
                      {meta.label}
                    </span>
                    <h3 className="mt-1 line-clamp-2 break-words font-stitch-display text-[19px] leading-tight text-stitch-primary transition-colors [overflow-wrap:anywhere] group-hover:text-stitch-secondary md:text-[20px]">
                      {j.title}
                    </h3>
                    {j.description && (
                      <p className="mt-3 line-clamp-3 break-words font-stitch-body text-[14px] leading-relaxed text-stitch-on-surface-variant [overflow-wrap:anywhere]">
                        {j.description}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 font-stitch-body text-[11px] font-bold uppercase tracking-[0.12em] text-stitch-on-surface-variant sm:text-[12px] sm:tracking-[0.15em]">
                      <span className="min-w-0 break-words">
                        {done > 0 && done >= j.steps_count
                          ? 'Concluída'
                          : `${j.steps_count} etapas · ${DIFFICULTY_LABELS[j.difficulty] ?? j.difficulty}`}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-stitch-secondary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </div>
                    {done > 0 && (
                      <div
                        role="progressbar"
                        aria-label={`Progresso na jornada ${j.title}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                        className="mt-4 h-1 overflow-hidden rounded-full bg-stitch-surface-container-highest"
                      >
                        <div
                          className="h-full bg-stitch-secondary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {progressError && (
            <p role="status" className="mt-6 text-center font-stitch-body text-[12px] italic text-stitch-on-surface-variant">
              {progressError}
            </p>
          )}

          <SpaceFooter 
            note='"Ensina-me, Senhor, o teu caminho, e guia-me por vereda plana." — Sl 27,11'
            links={[
              { label: 'Átrio', to: '/', hint: 'Voltar à entrada do Mosteiro' },
              { label: 'Biblioteca', to: '/acervo', hint: 'Estudar a Tradição' },
              { label: 'Rezar', to: '/rezar', hint: 'Levar a formação à oração' },
            ]}
          />
        </section>
      </SpaceLayout>
    </div>
  );
};

export default AtriumJornadasPage;
