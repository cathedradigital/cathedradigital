import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from '@/lib/rr-compat';
import { MODULE_NAVIGATION, getModuleByPath, type ModuleEnvironment } from '@/config/moduleNavigation';
import { cn } from '@/lib/utils';

const ROOT_PATHS: Partial<Record<ModuleEnvironment, string>> = {
  estudar: '/estudar',
};

function resolveEnvironment(pathname: string): ModuleEnvironment | undefined {
  if (pathname === '/estudar') return 'estudar';
  const item = getModuleByPath(pathname);
  if (item) {
    return MODULE_NAVIGATION.find((group) => group.items.some((candidate) => candidate.id === item.id))?.key;
  }
  return undefined;
}

export function EnvironmentModuleNav({ environmentKey }: { environmentKey?: ModuleEnvironment }) {
  const { pathname } = useLocation();
  const key = environmentKey ?? resolveEnvironment(pathname);
  const group = key ? MODULE_NAVIGATION.find((item) => item.key === key) : undefined;
  const activeItem = getModuleByPath(pathname);
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activeItem?.id]);

  if (!group || group.items.length === 0) return null;

  return (
    <nav
      aria-label={`Módulos de ${group.label}`}
      className="sticky z-30 border-b border-stitch-outline-variant/45 bg-stitch-surface/95 backdrop-blur-md md:hidden"
      style={{ top: `calc(var(--stitch-mobile-topbar-h) + var(--stitch-mobile-safe-top))` }}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto px-[var(--stitch-margin-mobile)] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {group.items.map((item) => {
          const active = activeItem?.id === item.id;
          return (
            <Link
              key={item.id}
              ref={active ? activeRef : undefined}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5',
                'font-[var(--font-stitch-label)] text-[10px] font-bold uppercase tracking-[0.08em]',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary',
                active
                  ? 'border-stitch-secondary bg-stitch-secondary-container text-stitch-primary'
                  : 'border-stitch-outline-variant/45 bg-stitch-surface-container-lowest text-stitch-on-surface-variant hover:border-stitch-secondary/60 hover:text-stitch-primary',
              )}
            >
              <span>{item.label}</span>
              {active && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
