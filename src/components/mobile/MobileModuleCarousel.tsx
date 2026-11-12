import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from '@/lib/rr-compat';
import { BookOpen, ChevronRight, Footprints, GraduationCap, HandHeart, House, Search, X } from 'lucide-react';
import { MODULE_NAVIGATION, type ModuleEnvironment } from '@/config/moduleNavigation';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';

type Destination = {
  key: 'atrium' | ModuleEnvironment;
  label: string;
  path: string;
  icon: typeof House;
  accent: string;
};

const ENVIRONMENT_ICONS: Record<ModuleEnvironment, Destination['icon']> = {
  'estudar': BookOpen,
  'rezar': HandHeart,
  'formar-se': GraduationCap,
  'pesquisar': Search,
  'minha-jornada': Footprints,
};

const ROOT_DESTINATIONS: Record<ModuleEnvironment, string> = {
  'estudar': '/estudar',
  'rezar': '/oracao',
  'formar-se': '/jornadas',
  'pesquisar': '/buscar',
  'minha-jornada': '/hoje',
};

function getActiveIndex(pathname: string, destinations: Destination[]) {
  if (pathname === '/' || pathname === '/atrium') return 0;
  const match = destinations.findIndex((destination) =>
    destination.key !== 'atrium' &&
    (pathname === destination.path || pathname.startsWith(destination.path + '/')),
  );
  if (match >= 0) return match;
  const group = MODULE_NAVIGATION.find((environment) =>
    environment.items.some((item) => pathname === item.path || pathname.startsWith(item.path + '/')),
  );
  if (group) return destinations.findIndex((destination) => destination.key === group.key);
  return -1;
}

/**
 * Mobile module carousel: a compact, swipeable switcher for the Atrium and
 * the five canonical environments. It changes routes rather than local tabs,
 * so browser history, deep links and each module's state remain authoritative.
 */
export function MobileModuleCarousel() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();
  const [expandedGroupKey, setExpandedGroupKey] = useState<ModuleEnvironment | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const swipeResetTimer = useRef<number | null>(null);

  const destinations = useMemo<Destination[]>(() => [
    { key: 'atrium', label: t('nav.inicio'), path: '/', icon: House, accent: '#c6a45c' },
    ...MODULE_NAVIGATION.map((environment) => ({
      key: environment.key,
      label: t(environment.labelKey) || environment.label,
      path: ROOT_DESTINATIONS[environment.key],
      icon: ENVIRONMENT_ICONS[environment.key],
      accent: environment.accent,
    })),
  ], [t]);

  const activeIndex = getActiveIndex(pathname, destinations);
  const isExcludedRoute = pathname === '/auth' || pathname === '/login' ||
    pathname.startsWith('/conta') || pathname.startsWith('/admin') ||
    pathname.startsWith('/prototype-2.0') || pathname.startsWith('/dev/');

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeIndex]);

  useEffect(() => () => {
    if (swipeResetTimer.current !== null) window.clearTimeout(swipeResetTimer.current);
  }, []);

  const openIndex = useCallback((index: number) => {
    const destination = destinations[index];
    if (!destination) return;
    if (destination.key === 'atrium') {
      setExpandedGroupKey(null);
      if (pathname !== '/') navigate('/');
      return;
    }
    const groupKey = destination.key as ModuleEnvironment;
    const isSameGroup = expandedGroupKey === groupKey;
    setExpandedGroupKey(isSameGroup ? null : groupKey);
  }, [destinations, expandedGroupKey, navigate, pathname]);

  const navigateToItem = useCallback((path: string) => {
    setExpandedGroupKey(null);
    navigate(path);
  }, [navigate]);

  const expandedGroup = expandedGroupKey
    ? MODULE_NAVIGATION.find((group) => group.key === expandedGroupKey)
    : undefined;

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    const end = event.changedTouches[0];
    touchStartX.current = null;
    touchStartY.current = null;
    if (startX === null || startY === null || !end || activeIndex < 0) return;
    const deltaX = end.clientX - startX;
    const deltaY = end.clientY - startY;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    didSwipe.current = true;
    if (swipeResetTimer.current !== null) window.clearTimeout(swipeResetTimer.current);
    swipeResetTimer.current = window.setTimeout(() => {
      didSwipe.current = false;
      swipeResetTimer.current = null;
    }, 700);
    const next = destinations[Math.max(0, Math.min(destinations.length - 1, activeIndex + (deltaX < 0 ? 1 : -1)))];
    if (next) navigate(next.path);
  };

  if (isExcludedRoute || activeIndex < 0) return null;

  return (
    <nav
      aria-label={t('navigation')}
      data-testid="mobile-module-carousel"
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-primary/10 bg-background/95 pb-[var(--stitch-mobile-safe-bottom,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClickCapture={(event) => {
        if (!didSwipe.current) return;
        event.preventDefault();
        event.stopPropagation();
        didSwipe.current = false;
        if (swipeResetTimer.current !== null) {
          window.clearTimeout(swipeResetTimer.current);
          swipeResetTimer.current = null;
        }
      }}
    >
      {expandedGroup && (
        <section
          id="mobile-module-submenu"
          aria-label={`${t('navigation')}: ${t(expandedGroup.labelKey)}`}
          className="mx-3 mb-2 overflow-hidden rounded-3xl border border-border/80 bg-card/98 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl animate-in slide-in-from-bottom-2 fade-in duration-200"
          style={{ borderTopColor: expandedGroup.accent }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="mt-1 font-serif text-xl font-semibold text-foreground">{t(expandedGroup.labelKey)}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{expandedGroup.description}</p>
            </div>
            <button
              type="button"
              aria-label={t('close_menu')}
              onClick={() => setExpandedGroupKey(null)}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid max-h-[min(46vh,360px)] grid-cols-2 gap-2 overflow-y-auto overscroll-contain">
            {expandedGroup.items.map((item) => {
              const selected = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => navigateToItem(item.path)}
                  className={cn(
                    'flex min-h-[58px] items-center justify-between gap-2 rounded-2xl border px-3 py-3 text-left transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    selected
                      ? 'border-primary/35 bg-primary/[0.08] text-foreground'
                      : 'border-border/70 bg-background/75 text-foreground hover:border-primary/25 hover:bg-primary/[0.04]',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">{t(item.labelKey)}</span>
                    <span className="mt-1 block line-clamp-2 text-[10px] leading-snug text-muted-foreground">{item.description}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      )}
      <div className="flex min-h-[64px] items-center justify-around gap-0.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {destinations.map((destination, index) => {
          const Icon = destination.icon;
          const active = index === activeIndex;
          return (
            <button
              key={destination.key}
              ref={active ? activeRef : undefined}
              type="button"
              aria-current={active ? 'page' : undefined}
              aria-expanded={destination.key !== 'atrium' ? expandedGroupKey === destination.key : undefined}
              aria-controls={destination.key !== 'atrium' ? 'mobile-module-submenu' : undefined}
              aria-label={`${t('navigation')}: ${destination.label}`}
              onClick={() => openIndex(index)}
              className={cn(
                'group relative inline-flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                active
                  ? 'border-[var(--module-carousel-accent)] bg-primary/[0.07] text-foreground shadow-sm'
                  : 'border-transparent text-muted-foreground hover:border-primary/15 hover:text-foreground',
              )}
              style={{ '--module-carousel-accent': destination.accent } as React.CSSProperties}
            >
              <Icon
                aria-hidden="true"
                className={cn('h-[19px] w-[19px] shrink-0 transition-transform duration-200', active && 'scale-110')}
                style={{ color: active ? destination.accent : undefined }}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={cn('max-w-full text-center whitespace-normal break-words text-[9px] font-semibold leading-[1.1] tracking-[0.005em] sm:text-[10px]', active && 'text-foreground')}>
                {destination.label}
              </span>
              {active && <span className="absolute inset-x-3 top-0 h-[2px] rounded-full" style={{ background: destination.accent }} />}
            </button>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {activeIndex >= 0 ? `${t('navigation')}: ${destinations[activeIndex]?.label}` : ''}
      </span>
    </nav>
  );
}

export default MobileModuleCarousel;
