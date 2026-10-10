import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from '@/lib/helmet-compat';
import { Link, useNavigate } from '@/lib/rr-compat';
import {
  ArrowRight, BookOpen, Compass, GraduationCap, HandHeart, Search,
  Clock3, Flame, ChevronRight, Library, Brain
} from 'lucide-react';
import { Icons } from '@/constants';
import { EnvironmentRegistry, RouteRegistry } from '@/core/navigation';
import {
  useResume, useLiturgyToday, useAnnouncements,
  useFeaturedThemes, useSearchSuggestions,
} from '@/modules/atrium/hooks';
import { useSpiritualJourney } from '@/hooks/useSpiritualJourney';
import { useAuth } from '@/hooks/useAuth';

const ENV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, HandHeart, GraduationCap, Search, Compass,
};

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  estudar: BookOpen,
  rezar: HandHeart,
  'formar-se': GraduationCap,
  pesquisar: Search,
  'minha-jornada': Compass,
};

const envCopy: Record<string, { eyebrow: string; action: string }> = {
  estudar: { eyebrow: 'Conhecimento', action: 'Entrar em Estudar' },
  rezar: { eyebrow: 'Vida espiritual', action: 'Entrar em Rezar' },
  'formar-se': { eyebrow: 'Percursos', action: 'Entrar em Formar-se' },
  pesquisar: { eyebrow: 'Descoberta', action: 'Entrar em Pesquisar' },
  'minha-jornada': { eyebrow: 'Continuidade', action: 'Abrir Minha Jornada' },
};

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/60">{children}</span>
);

const HomeUnified: React.FC = () => {
  const navigate = useNavigate();
  const environments = EnvironmentRegistry.all();
  const resume = useResume();
  const liturgy = useLiturgyToday();
  const news = useAnnouncements();
  const themes = useFeaturedThemes();
  const suggestions = useSearchSuggestions();
  const { lastRead, dailySteps } = useSpiritualJourney();
  const { profile, authenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    const key = 'catedra:atrium-opening-seen';
    if (window.sessionStorage.getItem(key) === '1') {
      setOpening(false);
      return;
    }
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(key, '1');
      setOpening(false);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const featured = themes[0];
  const firstStep = dailySteps[0];

  const greeting = useMemo(() => {
    const name = profile?.name?.split(' ')[0];
    return name ? `Olá, ${name}.` : 'Bem-vindo à Cátedra Digital.';
  }, [profile?.name]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/buscar?q=${encodeURIComponent(q)}`);
    else navigate('/buscar');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {opening && (
        <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Abrindo a Cátedra Digital">
          <div className="flex flex-col items-center px-6 text-center animate-[atrium-opening_1.8s_ease-out_forwards]">
            <span className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-[#D4AF37]/35 bg-[#102A3A] p-3 shadow-[0_18px_50px_rgba(8,25,35,0.28)] md:h-36 md:w-36 md:p-4" aria-hidden="true"><span className="absolute inset-2 rounded-xl border border-[#D4AF37]/20" /><Icons.Logo className="relative h-24 w-24 md:h-32 md:w-32" /></span>
            <span className="mt-5 font-display text-4xl tracking-tight md:text-6xl">Cátedra Digital</span>
            
            <span className="mt-8 text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">Átrio · Estudar · Rezar · Formar-se</span>
          </div>
        </div>
      )}
      <Helmet>
        <title>Cátedra Digital — sua jornada de estudo, oração e formação</title>
        <meta name="description" content="Estude, reze, forme-se e descubra a tradição cristã em uma única plataforma." />
        <link rel="canonical" href="/" />
      </Helmet>

      <main>
        {/* HERO: promessa clara + ação principal */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.12),transparent_55%)]" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="mb-8 flex items-center gap-5 md:gap-6" aria-label="Cátedra Digital">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/25 bg-[#102A3A] p-2 md:h-24 md:w-24 md:p-3"><Icons.Logo className="h-full w-full" /></span>
                  <div className="flex flex-col justify-center">
                    <span className="font-display text-3xl leading-none tracking-tight text-foreground md:text-5xl">Cátedra Digital</span>
                  </div>
                </div>
                <h1 className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
                  Bíblia, Catecismo e Magistério <span className="text-primary">em um só lugar — conectados.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  {greeting} Leia a Escritura, aprofunde-se no Catecismo e descubra as conexões com o Magistério e toda a Tradição Católica, sem sair do CATHEDRA Digital.
                </p>

                <form onSubmit={submitSearch} className="mt-9 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
                  <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="O que você quer estudar ou descobrir?"
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-muted-foreground/70 md:text-base"
                    aria-label="Buscar na CATHEDRA"
                  />
                  <button type="submit" className="min-h-11 rounded-xl bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    Buscar
                  </button>
                </form>

                {suggestions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.slice(0, 5).map((s) => (
                      <Link key={s.id} to={`/buscar?q=${encodeURIComponent(s.label)}`} className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <Eyebrow>Seu ponto de continuidade</Eyebrow>
                    <h2 className="mt-1 font-display text-xl">Hoje na CATHEDRA</h2>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {firstStep ? (
                    <Link to={firstStep.href} className="group flex items-center gap-4 rounded-2xl border border-border/70 p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]">
                      {(() => {
  const StepIcon = STEP_ICONS[firstStep.category] || Compass;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
      <StepIcon className="h-5 w-5" />
    </span>
  );
})()}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">{firstStep.category}</span>
                        <span className="mt-1 block font-medium">{firstStep.label}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{firstStep.description}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <Link to="/hoje" className="flex items-center gap-4 rounded-2xl border border-border/70 p-4 hover:border-primary/40">
                      <Clock3 className="h-5 w-5 text-primary" />
                      <span><strong>Comece pelo Hoje</strong><span className="block text-xs text-muted-foreground">Seu ponto de entrada diário.</span></span>
                    </Link>
                  )}
                  {lastRead && (
                    <Link to={lastRead.url || '/hoje'} className="flex items-center gap-4 rounded-2xl border border-border/70 p-4 hover:border-primary/40">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">Retomar</span><span className="block truncate font-medium">{lastRead.label || 'Última leitura'}</span></span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ARQUITETURA: cinco ambientes, mesma hierarquia em desktop/mobile */}
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
          <div className="mb-9 flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Arquitetura da plataforma</Eyebrow>
              <h2 className="mt-2 font-display text-3xl md:text-5xl">Cinco ambientes. Uma jornada.</h2>
            </div>
            <Link to="/guia-modulos" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary md:flex">Ver mapa <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {environments.map((env, index) => {
              const Icon = ENV_ICONS[env.iconToken] || Compass;
              const copy = envCopy[env.key] || { eyebrow: 'Ambiente', action: 'Entrar' };
              return (
                <Link
                  key={env.key}
                  to={RouteRegistry.resolve(env.route)}
                  className="group flex min-h-[250px] flex-col rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                    <span className="text-xs font-medium text-muted-foreground">0{index + 1}</span>
                  </div>
                  <div className="mt-auto">
                    <Eyebrow>{copy.eyebrow}</Eyebrow>
                    <h3 className="mt-2 font-display text-2xl">{env.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{env.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      {copy.action}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link to="/logos" className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 transition-colors hover:bg-primary/[0.08]">
              <Brain className="h-5 w-5 text-primary" />
              <span className="flex-1"><strong>Logos IA</strong><span className="block text-xs text-muted-foreground">Assistência transversal baseada nas fontes recuperadas pelo Nexus.</span></span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
            <Link to="/community" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
              <Library className="h-5 w-5 text-primary" />
              <span className="flex-1"><strong>Comunidade</strong><span className="block text-xs text-muted-foreground">Interação entre pessoas, sem competir com os ambientes principais.</span></span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </section>

        {/* CONTINUIDADE */}
        {(resume.length > 0 || authenticated) && (
          <section className="border-y border-border/60 bg-muted/20">
            <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
              <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
                <div>
                  <Eyebrow>Minha jornada</Eyebrow>
                  <h2 className="mt-2 font-display text-3xl md:text-4xl">Continue de onde parou.</h2>
                  <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Histórico, progresso e próximos passos ficam juntos para que a plataforma tenha memória.</p>
                  {profile?.streak ? <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm"><Flame className="h-4 w-4 text-primary" /> {profile.streak} dias consecutivos</div> : null}
                </div>
                <div className="rounded-3xl border border-border bg-card p-2">
                  {resume.length > 0 ? resume.slice(0, 4).map((item, i) => (
                    <Link key={item.id} to={item.targetPath} className="group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-muted">
                      <span className="w-7 text-center text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">{item.kind} {typeof item.progressPct === 'number' ? `· ${item.progressPct}%` : ''}</span><span className="mt-1 block truncate font-medium">{item.label}</span></span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </Link>
                  )) : (
                    <Link to="/hoje" className="flex items-center justify-between rounded-2xl p-5 hover:bg-muted">
                      <span><strong>Começar minha jornada</strong><span className="block text-xs text-muted-foreground">Abra o ambiente Hoje e escolha o próximo passo.</span></span><ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* DESTAQUE + LITURGIA */}
        {(featured || liturgy || news.length > 0) && (
          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-16 md:grid-cols-3 md:px-10 md:py-24">
            {featured && (
              <Link to={`/buscar?q=${encodeURIComponent(featured.label)}`} className="group rounded-3xl border border-border bg-card p-7 transition-all hover:border-primary/40 hover:shadow-md md:col-span-2">
                <Eyebrow>Tema em destaque</Eyebrow>
                <h2 className="mt-4 font-display text-3xl md:text-4xl">{featured.label}</h2>
                {featured.short && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{featured.short}</p>}
                <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">Explorar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            )}
            {liturgy && (
              <div className="rounded-3xl border border-border bg-card p-7">
                <Eyebrow>Liturgia do dia</Eyebrow>
                <h3 className="mt-4 font-display text-2xl">{liturgy.saintOfDay?.name || liturgy.season}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{liturgy.weekday} · {liturgy.season}</p>
                <Link to="/liturgia" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">Abrir liturgia <ArrowRight className="h-4 w-4" /></Link>
              </div>
            )}
            {news.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-7 md:col-span-3">
                <Eyebrow>Novidades</Eyebrow>
                <div className="mt-5 grid gap-4 md:grid-cols-3">{news.slice(0, 3).map(n => <div key={n.id} className="border-l-2 border-primary/30 pl-4"><p className="text-xs text-muted-foreground">{n.publishedAt}</p><p className="mt-1 font-medium">{n.label}</p></div>)}</div>
              </div>
            )}
          </section>
        )}
      </main>

        <footer className="border-t border-border/60 bg-muted/20">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
            <div className="max-w-3xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/70">Entenda a CATHEDRA</span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">Um pequeno guia para entrar e saber onde você está.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">Os nomes da plataforma não são apenas nomes de menu. Eles explicam a lógica da experiência: um lugar para entrar, encontrar fontes, aprender, rezar e continuar uma jornada.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-xl">Átrio</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">É a entrada da CATHEDRA. Como o átrio de uma igreja, é o espaço de acolhida, orientação e passagem para os diferentes ambientes.</p></div>
              <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-xl">CATHEDRA</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">É a cadeira ou lugar do ensinamento. Na tradição cristã, a cathedra também expressa a missão de ensinar com responsabilidade e fidelidade.</p></div>
              <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-xl">Biblioteca</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">É o espaço das fontes: livros, documentos, textos e referências que ajudam o visitante a estudar, pesquisar e voltar à fonte original.</p></div>
              <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-xl">Os ambientes</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Estudar, Rezar, Formar-se, Pesquisar e Minha Jornada organizam a experiência sem separar conhecimento e vida espiritual.</p></div>
            </div>
          </div>
        </footer>
    </div>
  );
};

export default HomeUnified;
