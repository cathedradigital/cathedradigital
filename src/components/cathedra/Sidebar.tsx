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

  // Keep the latest onClose without re-running the open/close effect when the
  // parent passes a new function identity.
  const onCloseRef = React.useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const refreshCacheCount = () => {
      getCacheStats()
        .then((stats) => {
          if (!cancelled) setCacheCount(stats.total);
        })
        .catch(() => {
          if (!cancelled) setCacheCount(null);
        });
    };
    refreshCacheCount();
    const handleCacheUpdate = refreshCacheCount;

    const previousBodyOverflow = document.body.style.overflow;
    let focusTimer: number | undefined;
    let previouslyFocused: HTMLElement | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
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
      // Native form controls (e.g. the language select) keep their own arrow keys.
      const isFormControl =
        activeElement instanceof HTMLSelectElement ||
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isFormControl) {
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
      cancelled = true;
      window.removeEventListener('cathedra_cache_updated', handleCacheUpdate);
      window.removeEventListener('keydown', handleKeyDown);
      if (focusTimer !== undefined) window.clearTimeout(focusTimer);
      if (isOpen) {
        document.body.style.overflow = previousBodyOverflow;
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
      }
    };
  }, [isOpen]);
  
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
            className="fixed inset-y-0 left-0 z-[170] flex w-[min(328px,88vw)] flex-col overflow-hidden border-r border-stitch-outline-variant/35 bg-stitch-background/95 px-4 shadow-[18px_0_48px_rgba(0,0,0,0.18)] backdrop-blur-xl admin-hide touch-none pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] will-change-transform sm:px-5"
            role="dialog"
            aria-modal="true"
            aria-label={t('navigation')}
            id="cathedra-global-sidebar"
            tabIndex={-1}
          >
            {/* Mobile Header — Noir & Gold wordmark */}
            <header className="mb-4 flex items-center justify-between gap-3 border-b border-stitch-outline-variant/30 pb-4">
              <button
                type="button"
                className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={(e) => handleNav('/', e)}
                aria-label={t('sidebar_home_label')}
              >
                <Icons.Logo className="h-10 w-10 shrink-0 text-primary sm:h-11 sm:w-11" />
                <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                  <span
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontWeight: 600,
                      fontSize: 'clamp(1rem, 4.6vw, 1.2rem)',
                      letterSpacing: '0.055em',
                      color: 'hsl(var(--foreground))',
                    }}
                    className="block max-w-full truncate uppercase"
                  >
                    Cathedra
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-brand)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: 'var(--gold-text)',
                    }}
                    className="block"
                  >
                    Digital
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-brand)',
                      fontSize: '0.58rem',
                      fontWeight: 500,
                      letterSpacing: '0.035em',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                    className="block max-w-full truncate pt-0.5"
                  >
                    {t('sidebar_tagline')}
                  </span>
                </div>
              </button>

              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                onClick={onClose}
                style={{ minHeight: 'var(--stitch-mobile-touch-min, 44px)', minWidth: 'var(--stitch-mobile-touch-min, 44px)' }}
                className="min-h-[44px] min-w-[44px] rounded-full border border-stitch-outline-variant/40 bg-stitch-surface-container-low text-stitch-on-surface-variant transition-colors [@media(hover:hover)]:hover:border-stitch-secondary [@media(hover:hover)]:hover:bg-stitch-secondary-container [@media(hover:hover)]:hover:text-stitch-primary focus-visible:ring-2 focus-visible:ring-stitch-secondary/40"
                aria-label={t('close_menu')}
              >
                <Icons.X className="w-4 h-4" />
              </Button>
            </header>

            <nav aria-label={t('navigation')} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-4 pr-1 no-scrollbar">
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
                      style={{
                        minHeight: 'var(--stitch-mobile-touch-min, 44px)',
                        ...(isActive ? {
                          borderLeftColor: 'var(--catedra-module-accent, #c9a84c)',
                          backgroundColor: 'var(--catedra-module-accent-soft, rgba(201,168,76,0.10))',
                        } : {}),
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={isActive ? `${section.label}, ${t('current_page')}` : section.label}
                      className={`group w-full flex min-h-[44px] items-center justify-start gap-3 rounded-md border px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-200 ${
                        isActive
                          ? 'border-l-2 border-l-[#c9a84c] border-[#c9a84c]/15 bg-[#c9a84c]/[0.10] font-semibold text-foreground'
                          : 'border-transparent text-foreground/75 hover:bg-[#c9a84c]/[0.055] hover:text-[color:var(--gold-text)]'
                      }`}
                    >
                      <span className={isActive ? 'opacity-100' : 'opacity-80'} style={isActive ? { color: 'var(--catedra-module-accent, #c9a84c)' } : undefined}>{item.icon}</span>
                      <span className="flex-1 text-left">{section.label}</span>
                      {isActive && <span aria-hidden="true" className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--catedra-module-accent, #c9a84c)' }} />}
                    </Button>
                  );
                }
                return (
                <Collapsible
                  key={section.label}
                  defaultOpen={section.items.some((item) => currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path + '/')))}
                >
                  <CollapsibleTrigger asChild>
                    <button style={{ minHeight: 'var(--stitch-mobile-touch-min, 44px)' }} className="group/trigger flex min-h-[44px] w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-stitch-outline-variant/30 hover:bg-stitch-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary/45 focus-visible:ring-offset-2">
                      <span className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.18em] text-stitch-secondary">{section.label}</span>
                      <Icons.ChevronDown className="h-3.5 w-3.5 text-stitch-on-surface-variant transition-all group-data-[state=open]:rotate-180" strokeWidth={1.5} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden px-0.5"
                    >
                      <ul className="mt-1 space-y-1 border-l border-stitch-secondary/20 pl-2">
                        {section.items.map((item, idx) => {
                          const isActive = item.path === activePath;
                          return (
                            <li key={idx}>
                              <Button
                                variant="ghost"
                                onClick={(e) => handleNav(item, e)}
                                onMouseEnter={() => prefetchRoute(item.path)}
                                onTouchStart={() => prefetchRoute(item.path)}
                                style={{
                                  minHeight: 'var(--stitch-mobile-touch-min, 44px)',
                                  ...(isActive ? {
                                    borderLeftColor: 'var(--catedra-module-accent, #c9a84c)',
                                    backgroundColor: 'var(--catedra-module-accent-soft, rgba(201,168,76,0.10))',
                                  } : {}),
                                }}
                                 aria-current={isActive ? 'page' : undefined}
                                 aria-label={isActive ? `${item.label}, ${t('current_page')}` : item.label}
                                className={`group w-full flex items-center justify-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-xs font-medium outline-none transition-colors duration-200 h-auto min-h-[44px]
                                  ${isActive
                                    ? 'bg-[#c9a84c]/[0.10] font-semibold text-foreground border-l-2 border-l-[#c9a84c] shadow-[inset_0_0_0_1px_rgba(201,168,76,0.08)]'
                                    : 'text-foreground/75 hover:bg-[#c9a84c]/[0.055] hover:text-[color:var(--gold-text)] hover:border-[#c9a84c]/10'}`}
                              >
                                  <span className={`transition-all duration-300 transform ${isActive ? 'opacity-100 scale-105' : 'opacity-80'}`} style={isActive ? { color: 'var(--catedra-module-accent, #c9a84c)' } : undefined}>
                                    {item.icon}
                                  </span>
                                <span className="min-w-0 flex-1 break-words whitespace-normal text-left text-[0.875rem] leading-5 tracking-[0.01em] [overflow-wrap:anywhere]">{item.label}</span>
                                {item.path === AppRoute.CACHE_MANAGER && cacheCount !== null && cacheCount > 0 && (
                                  <span className="ml-auto text-premium-xs font-bold px-2 py-0.5 rounded-none flex-shrink-0" style={{ background: '#c9a84c', color: '#0a0a0a' }}>
                                    {cacheCount}
                                  </span>
                                )}
                                {/* Badge "PRO" removido da UI de uso — sinalização de plano fica na landing pública / /pricing. */}
                                {isActive && <motion.div layoutId="sidebar-active" className="ml-auto w-1 h-1 flex-shrink-0" style={{ background: 'var(--catedra-module-accent, #c9a84c)' }} />}
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

            <div className="mt-2 max-h-[50dvh] shrink-0 space-y-3 overflow-y-auto overscroll-contain border-t border-stitch-outline-variant/30 pt-4 touch-pan-y no-scrollbar">
              <Button
                type="button"
                variant="ghost"
                onClick={(event) => handleNav(AppRoute.HOJE, event)}
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-stitch-secondary/35 bg-stitch-secondary-container/20 px-3 font-stitch-body text-[10px] font-bold uppercase tracking-[0.16em] text-stitch-primary transition-colors hover:border-stitch-secondary hover:bg-stitch-secondary-container/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary"
              >
                <span className="flex items-center gap-2"><Icons.Home className="h-4 w-4 text-stitch-secondary" /> Painel do dia</span>
                <Icons.ChevronRight className="h-4 w-4 text-stitch-secondary" aria-hidden="true" />
              </Button>
              <div className="space-y-3 rounded-2xl border border-stitch-outline-variant/25 bg-stitch-surface-container-low/70 p-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="ghost"
                    onClick={onToggleDark} 
                    className="min-h-11 h-auto rounded-xl border border-stitch-outline-variant/30 bg-stitch-surface-container-lowest flex items-center justify-center gap-2 transition-colors hover:border-stitch-secondary/45 hover:bg-stitch-secondary-container/15 group/btn"
                    aria-label={isDark ? t('light') : t('dark')}
                  >
                    {isDark ? <Icons.Sun className="h-4 w-4 text-stitch-secondary transition-colors" /> : <Icons.Moon className="h-4 w-4 text-stitch-on-surface-variant transition-colors group-hover/btn:text-stitch-secondary" />}
                    <span className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.13em] text-stitch-on-surface-variant transition-colors group-hover/btn:text-stitch-primary">{isDark ? t('light') : t('dark')}</span>
                  </Button>

                  <Button 
                    variant="ghost"
                    data-testid="a11y-trigger"
                    onClick={onOpenA11y} 
                    className={`min-h-11 h-auto rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                      isHighContrast
                        ? 'border-stitch-secondary/50 bg-stitch-secondary-container/25 text-stitch-primary'
                        : 'border-stitch-outline-variant/30 bg-stitch-surface-container-lowest text-stitch-on-surface-variant hover:border-stitch-secondary/45 hover:bg-stitch-secondary-container/15'
                    }`}
                  >
                    <Icons.ShieldCheck className="h-4 w-4" />
                    <span className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.13em]">{t('accessibility')}</span>
                  </Button>
                </div>

                {!settings.totalSilence && (
                  <Button 
                    variant="ghost"
                    onClick={onToggleSpeak} 
                    className={`w-full min-h-11 h-auto rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                      isSpeaking
                        ? 'border-stitch-secondary/50 bg-stitch-secondary-container/25 text-stitch-primary'
                        : 'border-stitch-outline-variant/30 bg-stitch-surface-container-lowest text-stitch-on-surface-variant hover:border-stitch-secondary/45 hover:bg-stitch-secondary-container/15'
                    }`}
                  >
                    {isSpeaking ? <Icons.MessageCircle className="h-4 w-4 animate-pulse" /> : <Icons.Volume2 className="h-4 w-4" />}
                    <span className="font-stitch-body text-[10px] font-bold uppercase tracking-[0.15em]">{isSpeaking ? t('stop') : t('listen')}</span>
                  </Button>
                )}

                <div className="pt-1">
                  <label
                    htmlFor="cathedra-language"
                    className="mb-2 block font-stitch-body text-[10px] font-bold uppercase tracking-[0.18em] text-stitch-on-surface-variant"
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
                      className="w-full min-h-11 appearance-none rounded-xl border border-stitch-outline-variant/35 bg-stitch-surface-container-lowest px-3 pr-9 font-stitch-body text-[13px] font-bold text-stitch-on-surface outline-none transition-colors focus:border-stitch-secondary focus:ring-2 focus:ring-stitch-secondary/15"
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
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stitch-on-surface-variant"
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-3 py-1">
                  <a href="https://www.instagram.com/cathedradigital/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-primary/70 transition-colors hover:bg-primary/5 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t('instagram_follow')}><Icons.Instagram size={18} /></a>
                  <a href="https://www.youtube.com/@cathedradigital" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-primary/70 transition-colors hover:bg-primary/5 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t('youtube_subscribe')}><Icons.Youtube size={18} /></a>
                </div>
              </div>

              {user ? (
                <div className="rounded-2xl border border-stitch-outline-variant/30 bg-stitch-surface-container-low p-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleNav(AppRoute.PROFILE)}
                    aria-label={`${t('profile_open')}: ${user.name}`}
                    className="flex w-full min-h-11 h-auto items-center justify-start gap-3 rounded-xl px-1 text-left group"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-stitch-primary flex items-center justify-center font-bold text-stitch-on-primary transition-transform group-hover:scale-105">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-stitch-body text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-spacing-0">
                      <p className="truncate font-stitch-display text-[17px] text-stitch-primary">{user.name}</p>
                      <p className="mt-0.5 font-stitch-body text-[10px] font-bold uppercase tracking-[0.12em] text-stitch-secondary">{user.isPremium ? t('member_premium') : t('free_account')}</p>
                    </div>
                  </Button>
                  
                  <div className="flex items-center justify-between gap-2 mt-3">
                    {!user.isPremium && (
                      <Button 
                        onClick={() => handleNav(AppRoute.UPGRADE)}
                        className="flex-1 min-h-11 h-auto rounded-xl bg-stitch-secondary-container text-stitch-on-secondary-container font-stitch-body text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-stitch-secondary hover:text-stitch-on-secondary"
                      >
                        {t('upgrade')}
                      </Button>
                    )}
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={onSignOut}
                      aria-label={t('sign_out')}
                      className="min-h-11 min-w-11 rounded-xl text-stitch-on-surface-variant transition-colors hover:bg-stitch-error-container hover:text-stitch-on-error-container"
                    >
                      <Icons.LogOut className="w-spacing-sm h-spacing-sm" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => handleNav(AppRoute.LOGIN)} className="w-full min-h-11 h-auto rounded-xl bg-stitch-primary text-stitch-on-primary font-stitch-body text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-stitch-primary-container">
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
