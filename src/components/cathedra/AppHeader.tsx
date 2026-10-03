// SKILLS ATIVADOS: cathedra-operating-system, cathedra-design-system-guardian, cathedra-architecture-guardian, cathedra-saints-expert
import React, { memo, useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from '@/lib/rr-compat';
import { motion } from 'framer-motion';
import { AppRoute, Language } from '@/types';
import { Icons } from '@/constants';
import { Button } from '@/components/ui/button';
import { useLang } from '@/hooks/useLang';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';


import { cn } from '@/lib/utils';
import { useAvatarUrl } from '@/lib/avatar';
import { isLegitimateClick } from '@/lib/navigation-utils';
import { getBreadcrumbs } from '@/config/routes';
import { MODULE_NAVIGATION, type ModuleEnvironment } from '@/config/moduleNavigation';

interface AppHeaderProps {
  user: any;
  isDark: boolean;
  onToggleDark: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onSignOut: () => void;
  onOpenSidebar: () => void;
  isLanding?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = memo(({
  user, isDark, onToggleDark, lang, onChangeLang, onSignOut, onOpenSidebar, isLanding = false
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLang();
  const avatarSrc = useAvatarUrl(user?.avatar, 96);
  const [isReady, setIsReady] = useState(false);
  const [openEnvironment, setOpenEnvironment] = useState<ModuleEnvironment | null>(null);
  const activeGroup = MODULE_NAVIGATION.find((group) =>
    pathname === group.items[0]?.path || group.items.some((item) => pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'))),
  );

  useEffect(() => {
    const root = document.documentElement;
    if (!activeGroup) {
      root.style.removeProperty('--catedra-module-accent');
      root.style.removeProperty('--catedra-module-accent-soft');
      root.removeAttribute('data-catedra-module');
      return;
    }
    root.style.setProperty('--catedra-module-accent', activeGroup.accent);
    root.style.setProperty('--catedra-module-accent-soft', activeGroup.accentSoft);
    root.setAttribute('data-catedra-module', activeGroup.key);
    return () => {
      root.style.removeProperty('--catedra-module-accent');
      root.style.removeProperty('--catedra-module-accent-soft');
      root.removeAttribute('data-catedra-module');
    };
  }, [activeGroup]);

  
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  const isDashboard = pathname === '/';
  const breadcrumbs = useMemo(() => getBreadcrumbs(pathname), [pathname]);
  const headerRoutes = useMemo(() =>
    MODULE_NAVIGATION.map((group) => ({
      path: group.items[0]?.path ?? '/',
      label: group.label,
    })),
  []);
  const activeEnvironment = useMemo(() =>
    MODULE_NAVIGATION.find((group) => group.items.some((item) =>
      pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'))
    )),
  [pathname]);

  return (
    <>
      <header 
        className={cn(
          "hidden md:block sticky top-spacing-0 z-[140] transition-all duration-700 pt-[env(safe-area-inset-top,0px)] will-change-[transform,opacity] admin-hide header-reading-auto-hide border-b border-primary/[0.005] header-auto-hide",
          !isReady && "opacity-0 translate-y-[-10px]",
          isLanding && !user ? "bg-transparent border-none py-spacing-lg" : "bg-background/20 backdrop-blur-3xl h-[var(--header-height)]"
        )}
        role="banner"
      >
        <div className={cn("flex items-center justify-between py-0 px-spacing-sm md:px-[var(--layout-padding)] max-w-spacing-4xl mx-auto", !isLanding || user ? "h-full" : "")}>

          {/* Logo Section — assinatura editorial Playfair (Sprint Visual 3.0) */}
          <button
            type="button"
            className="flex items-baseline gap-spacing-sm cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded-premium-full"
            aria-label="Ir para a página inicial" 
            onClick={(e) => {
              if (!isLegitimateClick(e)) return;
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          >
            <div className="flex items-center gap-2">
              <Icons.Logo className="w-14 h-14 sm:w-16 sm:h-16 md:w-[4.75rem] md:h-[4.75rem] lg:w-20 lg:h-20 text-primary transition-all duration-300 group-hover:scale-105 shrink-0" />
              <div className="flex flex-col leading-none gap-0.5">
                <span
                  className="text-primary/90 group-hover:text-primary transition-colors"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600,
                    fontSize: 'clamp(1.35rem, 2.8vw, 1.9rem)',
                    letterSpacing: '0.1em',
                  }}
                >
                  CATHEDRA
                </span>
                <span className="hidden md:block text-[7px] text-gold uppercase tracking-[0.3em] font-bold">
                  Mosteiro Digital
                </span>
              </div>
            </div>
          </button>


          {/* Breadcrumbs for desktop */}
          {!isDashboard && (
            <nav className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/30 ml-4 overflow-hidden truncate">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path}>
                  <span className={cn(
                    "min-h-[44px] px-2 inline-flex items-center hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded-premium-full",
                    idx === breadcrumbs.length - 1 && "text-primary/60 font-bold"
                  )} onClick={() => navigate(crumb.path)}>
                    {crumb.label}
                  </span>
                  {idx < breadcrumbs.length - 1 && <span className="opacity-20">/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Navigation & Controls Section */}
          <div className="flex items-center justify-end gap-spacing-2xs md:gap-spacing-lg">
            <div className="flex items-center gap-spacing-2xs md:gap-spacing-md lg:gap-spacing-lg">

              {!isDashboard && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => isLegitimateClick(e) && navigate(-1)}
                  className="w-[44px] h-[44px] rounded-premium-full border border-primary/5 hover:bg-primary/[0.02] transition-all duration-300 tap-premium"
                  aria-label={t('back') || 'Voltar'}
                >
                  <Icons.ChevronLeft className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              )}

              <div className="flex items-center gap-spacing-2xs md:gap-spacing-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => isLegitimateClick(e) && (window as any).dispatchEvent(new CustomEvent('open-command-center'))}
                  className="w-[44px] h-[44px] md:w-spacing-2xl md:h-spacing-2xl rounded-premium-full hover:bg-primary/[0.03] transition-all duration-300 group tap-premium"
                  aria-label={t('search') || 'Buscar'}
                >
                  <Icons.Search className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleDark}
                  className="w-spacing-xl h-spacing-xl md:w-spacing-2xl md:h-spacing-2xl rounded-premium-full hover:bg-primary/[0.03] transition-all duration-300 group hidden md:flex"
                  aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
                >
                  {isDark ? 
                    <Icons.Sun className="opacity-70" /> : 
                    <Icons.Moon className="opacity-70" />
                  }
                </Button>
              </div>

              <div className="flex items-center gap-spacing-2xs md:gap-spacing-md">
                <LanguageSwitcher className="hidden sm:inline-flex" />
                <div className="flex md:block">

                  {user ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => isLegitimateClick(e) && navigate(AppRoute.PROFILE)}
                      className="w-[44px] h-[44px] md:w-spacing-2xl md:h-spacing-2xl rounded-premium-full border-primary/10 hover:border-primary/20 overflow-hidden bg-primary/[0.03] tap-premium"
                      aria-label={user.name ? `Perfil de ${user.name}` : 'Abrir perfil'}
                      title={user.name ? `Perfil de ${user.name}` : 'Abrir perfil'}
                    >
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icons.User className="opacity-70" aria-hidden="true" />
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={(e) => isLegitimateClick(e) && navigate(AppRoute.LOGIN)} 
                      variant="ghost"
                      className="h-[44px] md:h-spacing-2xl px-spacing-md md:px-spacing-xl rounded-none border text-[9px] md:text-[10px] uppercase tracking-[0.28em] md:tracking-[0.32em] transition-all bg-transparent hover:bg-[#c9a84c] hover:text-[#0a0a0a]"
                      style={{ borderColor: '#c9a84c', color: 'var(--gold-text)', fontFamily: 'Inter, sans-serif' }}
                    >
                      {t('enter')}
                    </Button>
                  )}

                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            {isDashboard && (
              <nav className="hidden lg:flex items-center gap-spacing-xs border-l border-primary/10 pl-spacing-xl ml-spacing-md" aria-label="Navegação principal">
                {headerRoutes.map(item => (
                  <Button 
                    key={item.path} 
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      if (!isLegitimateClick(e)) return;
                      navigate(item.path);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className={`min-h-[44px] px-spacing-md py-spacing-xs h-auto text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative group ${
                      pathname === item.path ? 'text-primary font-medium' : 'text-muted-foreground/60 hover:text-primary'
                    }`}
                  >
                    {item.label}
                    {pathname === item.path && (
                      <motion.div layoutId="nav-active" className="absolute -bottom-spacing-2xs left-spacing-2xs/2 -translate-x-1/2 w-spacing-2xs h-spacing-2xs rounded-premium-full bg-primary" />
                    )}
                  </Button>
                ))}
              </nav>
            )}
          </div>
        </div>
        {!isLanding && activeEnvironment && (
          <div className="hidden border-t border-border/40 bg-background/70 backdrop-blur-xl lg:block">
            <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-spacing-sm md:px-[var(--layout-padding)]" aria-label="Ambientes da Cátedra">
              {MODULE_NAVIGATION.map((group) => {
                const active = group.key === activeEnvironment.key;
                const expanded = openEnvironment === group.key;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => setOpenEnvironment(expanded ? null : group.key)}
                    className={cn("relative flex min-h-[44px] shrink-0 items-center gap-1 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors", active ? "font-bold" : "text-muted-foreground hover:text-foreground")}
                    style={active ? { color: group.accent } : undefined}
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    aria-current={active ? "page" : undefined}
                  >
                    {group.label}<span className={cn("text-[10px] transition-transform", expanded && "rotate-180")} aria-hidden>⌄</span>
                    {active && <span className="absolute inset-x-3 bottom-0 h-0.5" style={{ backgroundColor: group.accent }} aria-hidden />}
                  </button>
                );
              })}
            </nav>
            {openEnvironment && (() => {
              const group = MODULE_NAVIGATION.find((item) => item.key === openEnvironment);
              if (!group) return null;
              return (
                <div className="border-t border-border/30" style={{ backgroundColor: group.accentSoft, borderTopColor: group.accent }}>
                  <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-spacing-sm py-1.5 md:px-[var(--layout-padding)]" aria-label={`Tópicos de ${group.label}`}>
                    {group.items.map((item) => {
                      const selected = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'));
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setOpenEnvironment(group.key); navigate(item.path); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                          className={cn("min-h-[44px] shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold tracking-[0.08em] transition-colors", selected ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground")}
                          style={selected ? { color: group.accent } : undefined}
                          title={item.description}
                          aria-current={selected ? "page" : undefined}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              );
            })()}
          </div>
        )}
      </header>
    </>
  );
});

AppHeader.displayName = 'AppHeader';

export default AppHeader;
