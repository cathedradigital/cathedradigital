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
import { AppRoute } from '@/types';
import { SpaceLayout, SpaceHeader, SpaceDoors, type SpaceDoor, SpaceFooter } from '@/components/cathedra/space/SpaceLayout';

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

  const visible = useMemo(() => {
    if (activeCategory === 'all') return journeys;
    return journeys.filter((j) => j.category === activeCategory);
  }, [journeys, activeCategory]);

  const featured = journeys[0];
  const inProgress = journeys.filter(
    (j) => (progressMap[j.id] ?? 0) > 0 && (progressMap[j.id] ?? 0) < j.steps_count,
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
          <EditorialHero.Eyebrow>Formação católica</EditorialHero.Eyebrow>
          <EditorialHero.Title>Formar-se</EditorialHero.Title>
          <EditorialHero.Subtitle>Percursos para aprofundar a fé, compreender a tradição da Igreja e levar o aprendizado à vida. Escolha um caminho e avance no seu ritmo.</EditorialHero.Subtitle>
        </EditorialHero>

        {/* ─── Continuidade: prioridade para quem já começou ─── */}
        {inProgress.length > 0 && (
          <section className="pt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-stitch-display text-[24px] font-semibold leading-[32px] text-stitch-primary">
                Continue sua formação
              </h2>
              <span className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant">
                {inProgress.length} em curso
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {inProgress.slice(0, 2).map((j) => {
                const done = progressMap[j.id] ?? 0;
                const pct = Math.round((done / Math.max(j.steps_count, 1)) * 100);
                return (
                  <Link
                    key={j.id}
                    to={`/jornadas/${j.id}`}
                    className="group relative flex flex-col overflow-hidden rounded border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-stitch-secondary transition-transform group-hover:scale-y-100" />
                    <span className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-secondary">
                      {CATEGORY_META[j.category]?.label ?? j.category}
                    </span>
                    <h3 className="mt-1 font-stitch-display text-[22px] leading-tight text-stitch-primary">
                      {j.title}
                    </h3>
                    <p className="mt-3 font-stitch-body text-[14px] text-stitch-on-surface-variant">
                      Etapa {done} de {j.steps_count}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-stitch-surface-container-highest">
                        <div
                          className="h-full bg-stitch-secondary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-stitch-body text-[12px] font-bold text-stitch-secondary">
                        {pct}%
                      </span>
                      <ArrowRight className="h-4 w-4 text-stitch-secondary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Jornada em destaque ───────────────────────────────────── */}
        {featured && (
          <section className="pt-10 md:pt-16">
            <Link
              to={`/jornadas/${featured.id}`}
              className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden bg-stitch-primary p-8 md:p-12"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 18% 22%, hsl(var(--stitch-secondary) / 0.35), transparent 68%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stitch-primary via-stitch-primary/50 to-transparent" />
              <div className="relative z-10 max-w-2xl text-stitch-primary-foreground">
                <span className="font-stitch-body text-[12px] font-bold uppercase tracking-[0.2em] text-stitch-secondary-fixed">
                  <Flame className="mr-2 inline h-3 w-3" />
                  Percurso em destaque
                </span>
                <h3 className="mt-2 font-stitch-display text-[32px] italic leading-tight text-stitch-primary-foreground md:text-[48px] md:leading-[56px] md:tracking-[-0.02em]">
                  {featured.title}
                </h3>
                {featured.description && (
                  <p className="mt-4 font-stitch-body text-[18px] leading-[28px] text-stitch-primary-foreground/80">
                    {featured.description}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-secondary-fixed">
                  <span>{featured.steps_count} etapas</span>
                  {featured.duration_days && <span>· {featured.duration_days} dias</span>}
                  <span>· {DIFFICULTY_LABELS[featured.difficulty] ?? featured.difficulty}</span>
                </div>
                <span className="mt-8 inline-flex min-h-11 items-center border border-stitch-secondary-fixed px-6 py-2 font-stitch-body text-[14px] font-medium uppercase tracking-[0.1em] text-stitch-secondary-fixed transition-colors group-hover:bg-stitch-secondary-fixed group-hover:text-stitch-primary">
                  Conhecer percurso
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* ─── Trilhas ──────────────────────────────────────────────── */}
        <section className="pt-10 md:pt-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="font-stitch-display text-[24px] font-semibold leading-[32px] text-stitch-primary">
              Explore os percursos
            </h2>
            <div
              className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
              role="group"
              aria-label="Filtrar percursos por categoria"
            >
              {categories.map((c) => {
                const meta = c === 'all' ? { label: 'Todas', Icon: Compass } : CATEGORY_META[c] ?? { label: c, Icon: Compass };
                const active = activeCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    aria-pressed={active}
                    className={
                      'inline-flex min-h-11 min-w-11 shrink-0 snap-start items-center justify-center gap-2 rounded-full border px-4 py-2 font-stitch-body text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-stitch-background ' +
                      (active
                        ? 'border-stitch-secondary bg-stitch-secondary/10 text-stitch-primary'
                        : 'border-stitch-outline-variant/40 bg-stitch-surface-container-low text-stitch-on-surface-variant hover:border-stitch-secondary hover:text-stitch-primary')
                    }
                  >
                    <meta.Icon className="h-3.5 w-3.5" />
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
                  className="h-[220px] animate-pulse rounded border border-stitch-outline-variant/20 bg-stitch-surface-container-lowest"
                />
              ))}
            </div>
          ) : loadError ? (
            <div className="border-t border-stitch-secondary/10 pt-8 text-center">
              <p className="font-stitch-body text-[14px] text-destructive">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-4 border border-stitch-secondary/40 px-4 py-2 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-secondary hover:bg-stitch-secondary/10"
              >
                Tentar novamente
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="border-t border-stitch-secondary/10 pt-8 text-center font-stitch-body text-[14px] italic text-stitch-on-surface-variant">
              Nenhuma jornada nesta trilha ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visible.map((j, i) => {
                const meta = CATEGORY_META[j.category] ?? { label: j.category, Icon: Compass };
                const done = progressMap[j.id] ?? 0;
                return (
                  <Link
                    key={j.id}
                    to={`/jornadas/${j.id}`}
                    className="group relative flex min-h-[220px] flex-col border border-stitch-outline-variant/20 bg-stitch-surface-container-lowest p-5 transition-colors hover:border-stitch-secondary/40 hover:shadow-lg hover:shadow-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-stitch-background md:p-6"
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
                    <h3 className="mt-1 font-stitch-display text-[20px] leading-tight text-stitch-primary transition-colors group-hover:text-stitch-secondary">
                      {j.title}
                    </h3>
                    {j.description && (
                      <p className="mt-3 line-clamp-3 font-stitch-body text-[14px] leading-relaxed text-stitch-on-surface-variant">
                        {j.description}
                      </p>
                    )}
                    <div className="mt-6 flex items-center justify-between font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-on-surface-variant">
                      <span>
                        {j.steps_count} etapas · {DIFFICULTY_LABELS[j.difficulty] ?? j.difficulty}
                      </span>
                      <ArrowRight className="h-4 w-4 text-stitch-secondary transition-transform group-hover:translate-x-1" />
                    </div>
                    {done > 0 && (
                      <div className="mt-4 h-1 overflow-hidden rounded-full bg-stitch-surface-container-highest">
                        <div
                          className="h-full bg-stitch-secondary"
                          style={{ width: `${Math.round((done / Math.max(j.steps_count, 1)) * 100)}%` }}
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/jornadas-legacy"
              className="inline-flex min-h-11 items-center border-b border-stitch-secondary/30 px-2 pb-0.5 font-stitch-body text-[12px] font-bold uppercase tracking-[0.15em] text-stitch-secondary transition-colors hover:border-stitch-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary focus-visible:ring-offset-2"
            >
              Ver versão completa com filtros e busca
            </Link>
          </div>

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
