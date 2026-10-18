import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from '@/lib/rr-compat';
import { BookOpen, Compass, Footprints, GraduationCap, HandHeart, House, Search } from 'lucide-react';
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

  const destinations = useMemo<Destination[]>(() => [
    { key: 'atrium', label: t('nav.inicio') || 'Átrio', path: '/', icon: House, accent: '#c6a45c' },
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
    openIndex(Math.max(0, Math.min(destinations.length - 1, activeIndex + (deltaX < 0 ? 1 : -1))));
  };

  if (isExcludedRoute || activeIndex < 0) return null;

  return (
    <nav
      aria-label="Navegação entre módulos"
      data-testid="mobile-module-carousel"
      className="relative z-[145] border-b border-primary/10 bg-background/95 backdrop-blur-xl md:hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex min-h-[60px] items-center gap-1 overflow-x-auto px-2 pb-1 pt-1 pl-[3.75rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                'group relative inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border px-3 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                active
                  ? 'border-[var(--module-carousel-accent)] bg-primary/[0.07] text-foreground shadow-sm'
                  : 'border-transparent text-muted-foreground hover:border-primary/15 hover:text-foreground',
              )}
              style={{ '--module-carousel-accent': destination.accent } as React.CSSProperties}
            >
              <Icon
                aria-hidden="true"
                className={cn('h-[18px] w-[18px] shrink-0 transition-transform duration-200', active && 'scale-110')}
                style={{ color: active ? destination.accent : undefined }}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={cn('whitespace-nowrap text-[11px] font-semibold tracking-[0.015em]', active && 'text-foreground')}>
                {destination.label}
              </span>
              {active && <span className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full" style={{ background: destination.accent }} />}
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
