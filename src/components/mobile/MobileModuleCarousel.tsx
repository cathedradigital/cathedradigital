import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from '@/lib/rr-compat';
import { BookOpen, Footprints, GraduationCap, HandHeart, House, Search } from 'lucide-react';
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
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const destinations = useMemo<Destination[]>(() => [
    { key: 'atrium', label: 'Átrio', path: '/', icon: House, accent: '#c6a45c' },
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

  const openIndex = useCallback((index: number) => {
    const destination = destinations[index];
    if (destination && index !== activeIndex) navigate(destination.path);
  }, [activeIndex, destinations, navigate]);

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
    openIndex(Math.max(0, Math.min(destinations.length - 1, activeIndex + (deltaX < 0 ? 1 : -1))));
  };

  if (isExcludedRoute || activeIndex < 0) return null;

  return (
    <nav
      aria-label="Navegação entre módulos"
      data-testid="mobile-module-carousel"
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-primary/10 bg-background/95 pb-[var(--stitch-mobile-safe-bottom,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClickCapture={(event) => {
        if (!didSwipe.current) return;
        event.preventDefault();
        event.stopPropagation();
        didSwipe.current = false;
      }}
    >
      <div className="flex min-h-[64px] items-center justify-around gap-1 overflow-x-auto px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {destinations.map((destination, index) => {
          const Icon = destination.icon;
          const active = index === activeIndex;
          return (
            <button
              key={destination.key}
              ref={active ? activeRef : undefined}
              type="button"
              aria-current={active ? 'page' : undefined}
              aria-label={`Abrir módulo ${destination.label}`}
              onClick={() => openIndex(index)}
              className={cn(
                'group relative inline-flex min-h-[48px] min-w-[54px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-1 transition-all duration-200',
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
              <span className={cn('max-w-[78px] truncate whitespace-nowrap text-[9px] font-semibold tracking-[0.005em] sm:text-[10px]', active && 'text-foreground')}>
                {destination.label}
              </span>
              {active && <span className="absolute inset-x-3 top-0 h-[2px] rounded-full" style={{ background: destination.accent }} />}
            </button>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {activeIndex >= 0 ? `Módulo atual: ${destinations[activeIndex]?.label}` : ''}
      </span>
    </nav>
  );
}

export default MobileModuleCarousel;
