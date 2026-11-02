import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate, useLocation } from '@/lib/rr-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { prefetchRoute } from '@/lib/prefetch';
import { Icons } from '../../constants';
import { User, AppRoute } from '../../types';
import { isLegitimateClick } from '@/lib/navigation-utils';
import { getCacheStats } from '@/lib/offlineCache';
import { useLang } from '@/hooks/useLang';
import { useAvatarUrl } from '@/lib/avatar';
import { useReadingSettings } from '@/contexts/ReadingSettingsContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { MODULE_NAVIGATION } from '@/config/moduleNavigation';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';




interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isDark?: boolean;
  onToggleDark?: () => void;
  isHighContrast?: boolean;
  onToggleHighContrast?: () => void;
  isSpeaking?: boolean;
  onToggleSpeak?: () => void;
  onOpenA11y?: () => void;
  onSignOut?: () => void;
}

const Sidebar = memo(({ isOpen, onClose, user, isDark, onToggleDark, isHighContrast, onToggleHighContrast, isSpeaking, onToggleSpeak, onOpenA11y, onSignOut }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { lang, t } = useLang();
  const avatarSrc = useAvatarUrl(user?.avatar, 96);
  const [cacheCount, setCacheCount] = useState<number | null>(null);
  const { settings } = useReadingSettings();
  const { isAdmin } = useIsAdmin();


  const sidebarRef = React.useRef<HTMLElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getCacheStats().then(stats => setCacheCount(stats.total));
    
    const handleCacheUpdate = () => {
      getCacheStats().then(stats => setCacheCount(stats.total));
    };

    const previousBodyOverflow = document.body.style.overflow;
    let focusTimer: number | undefined;
    let previouslyFocused: HTMLElement | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const focusableElements = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) =>
        element.getAttribute('aria-hidden') !== 'true' &&
        element.getClientRects().length > 0
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      const currentIndex = focusableElements.indexOf(activeElement as HTMLElement);
      const focusIsInside = sidebarRef.current?.contains(activeElement) ?? false;

      // Keep keyboard focus inside the modal, including when focus starts outside it.
      if (e.key === 'Tab') {
        if (e.shiftKey && (activeElement === firstElement || !focusIsInside)) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && (activeElement === lastElement || !focusIsInside)) {
          e.preventDefault();
          firstElement.focus();
        }
      }

      // Arrow-key navigation remains available across the sidebar controls.
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        let nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= focusableElements.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = focusableElements.length - 1;

        focusableElements[nextIndex].focus();
      }
    };

    window.addEventListener('cathedra_cache_updated', handleCacheUpdate);
    window.addEventListener('keydown', handleKeyDown);

    if (isOpen) {
      previouslyFocused = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      document.body.style.overflow = 'hidden';
      // Focus the close control as soon as the dialog is mounted.
      focusTimer = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
    }

    return () => {
      window.removeEventListener('cathedra_cache_updated', handleCacheUpdate);
      window.removeEventListener('keydown', handleKeyDown);
      if (focusTimer !== undefined) window.clearTimeout(focusTimer);
      if (isOpen) {
        document.body.style.overflow = previousBodyOverflow;
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);
  
  const sections = useMemo(() => {
    const iconMap: Record<string, any> = {
      atrium: Icons.Home,
      bible: Icons.Bible,
      catechism: Icons.Catechism,
      magisterium: Icons.ScrollText,
      library: Icons.Library,
      saints: Icons.Saints,
      nexus: Icons.Orbit,
      church: Icons.Church,
      pray: Icons.Prayer,
      liturgy: Icons.Liturgy,
      lectio: Icons.Lectio,
      rosary: Icons.Rosary,
      viacrucis: Icons.ViaCrucis,
      novenas: Icons.Calendar,
      journeys: Icons.Journeys,
      themes: Icons.Themes,
      search: Icons.Search,
      glossary: Icons.Glossary,
      atlas: Icons.Globe,
      aquinas: Icons.Aquinas,
      dogmas: Icons.Shield,
      popes: Icons.User,
      apparitions: Icons.Star,
      today: Icons.Home,
      journal: Icons.FileText,
      favorites: Icons.Heart,
      achievements: Icons.Trophy,
      profile: Icons.User,
      settings: Icons.Settings,
    };

    const environmentSections = MODULE_NAVIGATION.map((group) => ({
      label: t(group.labelKey),
      items: group.items
        .filter((item) => item.id !== 'profile' && item.id !== 'settings')
        .map((item) => {
          const Icon = iconMap[item.id] ?? Icons.Circle;
          return {
            label: t(item.labelKey),
            path: item.path,
            description: item.description,
            icon: <Icon size={19} />,
          };
        }),
    }));

    return [
      {
        label: t('nav.inicio'),
        items: [
          {
            label: t('home'),
            path: '/',
            description: t('home'),
            icon: <Icons.Home size={19} />,
          },
        ],
      },
      ...environmentSections,
      {
        label: t('nav.conta'),
        items: [
          { label: t('nav.perfil'), path: AppRoute.PROFILE, description: t('profile'), icon: <Icons.User size={19} /> },
          { label: t('nav.configuracoes'), path: '/settings', description: t('settings_description'), icon: <Icons.Settings size={19} /> },
        ],
      },
      ...(isAdmin
        ? [{
            label: t('admin'),
            items: [
              { label: t('admin_panel'), path: '/admin', description: t('admin_description'), icon: <Icons.Lock size={19} /> },
            ],
          }]
        : []),
    ];
  }, [isAdmin, t]);

  // Em rotas aninhadas, apenas o destino mais específico fica selecionado
  // (por exemplo, Rosário em /oracao/rosario, sem marcar Orações também).
  const activePath = sections
    .flatMap((section) => section.items)
    .map((item) => item.path)
    .filter((path) => currentPath === path || (path !== '/' && currentPath.startsWith(`${path}/`)))
    .sort((a, b) => b.length - a.length)[0];

  const handleNav = useCallback((target: string | { path: string; onClick?: () => void }, event?: React.MouseEvent | React.KeyboardEvent | React.TouchEvent) => {
    if (event && !isLegitimateClick(event)) return;

    if (typeof target === 'object' && target.onClick) {
      target.onClick();
    } else {
      const path = typeof target === 'string' ? target : target.path;
      if (path !== '#') {
        navigate(path);
        onClose();
      }
    }
  }, [navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Elegant Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: settings.reduceAnimations ? 0.12 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-[3px] z-[165] will-change-opacity"
            aria-hidden="true"
          />

          {/* Premium Retractable Sidebar - Refined for a more elegant, floating feel */}
          <motion.aside
            ref={sidebarRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.1, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100 || info.velocity.x < -500) {
                onClose();
              }
            }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ 
              duration: settings.reduceAnimations ? 0.16 : 0.28, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="fixed inset-y-0 left-0 z-[170] flex w-[min(328px,88vw)] flex-col overflow-hidden border-r border-[#c9a84c]/15 bg-[hsl(var(--background))] px-4 shadow-[18px_0_48px_rgba(0,0,0,0.22)] backdrop-blur-xl admin-hide touch-none pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] will-change-transform sm:px-5"
            role="dialog"
            aria-modal="true"
            aria-label={t('navigation')}
            id="cathedra-global-sidebar"
            tabIndex={-1}
          >
            {/* Mobile Header — Noir & Gold wordmark */}
            <header className="flex items-center justify-between gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.25)' }}>
              <div
                className="flex items-baseline gap-2 cursor-pointer group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={(e) => handleNav('/', e)}
                role="button"
                tabIndex={0}
                aria-label="Cathedra Digital — Início"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNav('/', e);
                  }
                }}
              >
                <Icons.Logo className="w-12 h-12 text-primary" />
                <div className="flex flex-col leading-none gap-1">
                  <span
                    role="text"
                    aria-label="Cathedra Digital — Mosteiro Digital"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      letterSpacing: '0.08em',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    Cathedra Digital
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    Mosteiro Digital
                  </span>
                </div>
              </div>

              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-none min-h-11 min-w-11 bg-transparent hover:bg-transparent transition-all focus-visible:ring-2 focus-visible:ring-[#c9a84c]/40"
                style={{ border: '1px solid rgba(201,168,76,0.35)', color: 'var(--gold-text)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c9a84c'; e.currentTarget.style.color = '#0a0a0a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c9a84c'; }}
                aria-label={t('close_menu')}
              >
                <Icons.X className="w-4 h-4" />
              </Button>
            </header>

            <nav aria-label={t('navigation')} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-4 pr-1 no-scrollbar">
              {sections.map((section, sectionIdx) => {
                if (section.items.length === 0) return null;
                if (sectionIdx === 0 && section.items.length === 1) {
                  const item = section.items[0];
                  const isActive = item.path === activePath;
                  return (
                    <Button
                      key={section.label}
                      variant="ghost"
                      onClick={(event) => handleNav(item, event)}
                      onMouseEnter={() => prefetchRoute(item.path)}
                      onTouchStart={() => prefetchRoute(item.path)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={isActive ? `${section.label}, ${t('current_page')}` : section.label}
                      className={`group w-full flex min-h-11 items-center justify-start gap-3 rounded-md border px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-200 ${
                        isActive
                          ? 'border-l-2 border-l-[#c9a84c] border-[#c9a84c]/15 bg-[#c9a84c]/[0.10] text-[color:var(--gold-text)]'
                          : 'border-transparent text-foreground/75 hover:bg-[#c9a84c]/[0.055] hover:text-[color:var(--gold-text)]'
                      }`}
                    >
                      <span className={isActive ? 'opacity-100' : 'opacity-80'}>{item.icon}</span>
                      <span className="flex-1 text-left">{section.label}</span>
                      {isActive && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#c9a84c]" />}
                    </Button>
                  );
                }
                return (
                <Collapsible
                  key={section.label}
                  defaultOpen={section.items.some((item) => currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path + '/')))}
                >
                  <CollapsibleTrigger asChild>
                    <button className="group/trigger flex min-h-11 w-full items-center justify-between rounded-md px-2.5 py-2 transition-colors hover:bg-[#c9a84c]/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/45 focus-visible:ring-offset-2">
                      <h3 style={{ color: 'var(--gold-text)', fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>— {section.label}</h3>
                      <Icons.ChevronDown className="w-3 h-3 transition-all group-data-[state=open]:rotate-180" strokeWidth={1.5} style={{ color: 'var(--gold-text)' }} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden px-0.5"
                    >
                      <ul className="mt-1 space-y-1 border-l border-[#c9a84c]/15 pl-2">
                        {section.items.map((item, idx) => {
                          const isActive = item.path === activePath;
                          return (
                            <li key={idx}>
                              <Button
                                variant="ghost"
                                onClick={(e) => handleNav(item, e)}
                                onMouseEnter={() => prefetchRoute(item.path)}
                                onTouchStart={() => prefetchRoute(item.path)}
                                 aria-current={isActive ? 'page' : undefined}
                                 aria-label={isActive ? `${item.label}, ${t('current_page')}` : item.label}
                                className={`group w-full flex items-center justify-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-xs font-medium outline-none transition-colors duration-200 h-auto min-h-11
                                  ${isActive
                                    ? 'bg-[#c9a84c]/[0.10] text-[color:var(--gold-text)] border-l-2 border-l-[#c9a84c] shadow-[inset_0_0_0_1px_rgba(201,168,76,0.08)]'
                                    : 'text-foreground/75 hover:bg-[#c9a84c]/[0.055] hover:text-[color:var(--gold-text)] hover:border-[#c9a84c]/10'}`}
                              >
                                  <span className={`transition-all duration-300 transform ${isActive ? 'opacity-100 scale-105' : 'opacity-80'}`}>
                                    {item.icon}
                                  </span>
                                <span className="min-w-0 flex-1 truncate text-left text-[0.875rem] leading-5 tracking-[0.01em]">{item.label}</span>
                                {item.path === AppRoute.CACHE_MANAGER && cacheCount !== null && cacheCount > 0 && (
                                  <span className="ml-auto text-premium-xs font-bold px-2 py-0.5 rounded-none flex-shrink-0" style={{ background: '#c9a84c', color: '#0a0a0a' }}>
                                    {cacheCount}
                                  </span>
                                )}
                                {/* Badge "PRO" removido da UI de uso — sinalização de plano fica na landing pública / /pricing. */}
                                {isActive && <motion.div layoutId="sidebar-active" className="ml-auto w-1 h-1 flex-shrink-0" style={{ background: '#c9a84c' }} />}
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-primary/10 pt-3 mt-2 space-y-3">
              <div className="flex flex-col gap-spacing-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="ghost"
                    onClick={onToggleDark} 
                    className="min-h-11 h-auto rounded-lg border border-primary/[0.01] dark:border-white/[0.01] bg-primary/[0.01] dark:bg-white/[0.01] flex items-center justify-center gap-spacing-xs transition-all hover:bg-primary/5 dark:hover:bg-white/5 group/btn"
                    aria-label={isDark ? t('light') : t('dark')}
                  >
                    {isDark ? <Icons.Sun className="w-spacing-sm h-spacing-sm text-primary/40 group-hover/btn:text-primary transition-colors" /> : <Icons.Moon className="w-spacing-sm h-spacing-sm opacity-30 group-hover/btn:opacity-60 transition-opacity" />}
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 group-hover/btn:text-muted-foreground transition-colors">{isDark ? t('light') : t('dark')}</span>
                  </Button>

                  <Button 
                    variant="ghost"
                    data-testid="a11y-trigger"
                    onClick={onOpenA11y} 
                    className={`min-h-11 h-auto rounded-premium border flex items-center justify-center gap-spacing-xs transition-all ${
                      isHighContrast 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'border-primary/[0.01] dark:border-white/[0.01] bg-primary/[0.01] dark:bg-white/[0.01] text-muted-foreground/30 hover:bg-primary/5'
                    }`}
                  >
                    <Icons.ShieldCheck className="w-spacing-sm h-spacing-sm" />
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]">{t('accessibility')}</span>
                  </Button>
                </div>

                {!settings.totalSilence && (
                  <Button 
                    variant="ghost"
                    onClick={onToggleSpeak} 
                    className={`w-full min-h-11 h-auto rounded-premium border flex items-center justify-center gap-spacing-sm transition-all ${
                      isSpeaking 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'border-primary/[0.01] dark:border-white/[0.01] bg-primary/[0.01] dark:bg-white/[0.01] text-muted-foreground/30 hover:bg-primary/5'
                    }`}
                  >
                    {isSpeaking ? <Icons.MessageCircle className="w-spacing-sm h-spacing-sm animate-pulse" /> : <Icons.Volume2 className="w-spacing-sm h-spacing-sm" />}
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]">{isSpeaking ? t('stop') : t('listen')}</span>
                  </Button>
                )}

                <div className="pt-1">
                  <label
                    htmlFor="cathedra-language"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70"
                  >
                    {t('language_select')}
                  </label>
                  <div className="relative">
                    <select
                      id="cathedra-language"
                      value={lang}
                      onChange={(e) =>
                        (window as any).dispatchEvent(
                          new CustomEvent('change-lang', { detail: e.target.value }),
                        )
                      }
                      className="w-full min-h-11 appearance-none rounded-premium-lg border border-primary/10 bg-background/70 px-3 pr-9 text-xs font-semibold text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
                      aria-label={t('language_select')}
                    >
                      {SUPPORTED_LOCALES.map((locale) => (
                        <option key={locale.code} value={locale.code}>
                          {locale.nativeName}
                        </option>
                      ))}
                    </select>
                    <Icons.ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50"
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-3 py-1">
                  <a href="https://www.instagram.com/cathedradigital/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-primary/70 transition-colors hover:bg-primary/5 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t('instagram_follow')}><Icons.Instagram size={18} /></a>
                  <a href="https://www.youtube.com/@cathedradigital" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-primary/70 transition-colors hover:bg-primary/5 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t('youtube_subscribe')}><Icons.Youtube size={18} /></a>
                </div>
              </div>

              {user ? (
                <div className="p-3 bg-primary/[0.025] dark:bg-white/[0.02] rounded-xl border border-primary/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleNav(AppRoute.PROFILE)}
                    aria-label={`${t('profile_open')}: ${user.name}`}
                    className="flex w-full min-h-11 h-auto items-center justify-start gap-spacing-sm rounded-lg px-1 text-left group"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground font-bold shadow-premium-none group-hover:scale-105 transition-transform overflow-hidden">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-premium-xs">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-spacing-0">
                      <p className="text-sm font-semibold truncate text-primary">{user.name}</p>
                      <p className="text-xs uppercase text-primary/70 font-semibold tracking-[0.1em] mt-spacing-3xs">{user.isPremium ? t('member_premium') : t('free_account')}</p>
                    </div>
                  </Button>
                  
                  <div className="flex items-center justify-between gap-2 mt-3">
                    {!user.isPremium && (
                      <Button 
                        onClick={() => handleNav(AppRoute.UPGRADE)}
                        className="flex-1 min-h-11 h-auto bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-premium-lg text-premium-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Upgrade
                      </Button>
                    )}
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={onSignOut}
                      aria-label={t('sign_out')}
                      className="min-h-11 min-w-11 rounded-premium-lg text-primary/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Icons.LogOut className="w-spacing-sm h-spacing-sm" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => handleNav(AppRoute.LOGIN)} className="w-full min-h-11 h-auto bg-primary/90 hover:bg-primary text-primary-foreground rounded-premium font-bold uppercase text-xs tracking-[0.2em] transition-all">
                  {t('enter')}
                </Button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
