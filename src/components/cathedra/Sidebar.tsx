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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const focusableElements = sidebarRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);

      // Focus Trap
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }

      // Arrow Key Navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        let nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
        
        if (nextIndex >= focusableElements.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = focusableElements.length - 1;
        
        (focusableElements[nextIndex] as HTMLElement).focus();
      }
    };

    window.addEventListener('cathedra_cache_updated', handleCacheUpdate);
    window.addEventListener('keydown', handleKeyDown);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus close button on open for immediate exit capability
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('cathedra_cache_updated', handleCacheUpdate);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
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
            label: t('nav.inicio'),
            path: '/',
            description: 'Entrada principal da Cathedra.',
            icon: <Icons.Home size={19} />,
          },
        ],
      },
      ...environmentSections,
      {
        label: t('nav.conta'),
        items: [
          { label: t('nav.perfil'), path: AppRoute.PROFILE, description: 'Identidade e preferências pessoais.', icon: <Icons.User size={19} /> },
          { label: t('nav.configuracoes'), path: AppRoute.SETTINGS, description: 'Preferências da conta e experiência.', icon: <Icons.Settings size={19} /> },
        ],
      },
      ...(isAdmin
        ? [{
            label: t('admin'),
            items: [
              { label: 'Painel Admin', path: '/admin', description: 'Operação protegida da plataforma.', icon: <Icons.Lock size={19} /> },
            ],
          }]
        : []),
    ];
  }, [isAdmin, t]);


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
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-background/20 backdrop-blur-md z-[165] will-change-opacity"
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
              duration: settings.reduceAnimations ? 0.3 : 0.6, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="fixed top-0 left-0 bottom-0 w-[min(304px,88vw)] bg-background/98 backdrop-blur-2xl border-r border-primary/10 flex flex-col px-3 sm:px-4 z-[170] shadow-xl overflow-hidden admin-hide touch-none pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] will-change-transform"
            role="dialog"
            aria-modal="true"
            aria-label={t('navigation_menu') || 'Menu de navegação'}
            tabIndex={-1}
          >
            {/* Mobile Header — Noir & Gold wordmark */}
            <header className="flex items-center justify-between gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.25)' }}>
              <div 
                className="flex items-baseline gap-2 cursor-pointer group outline-none" 
                onClick={(e) => handleNav('/', e)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNav('/', e)}
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
                aria-label="Fechar menu"
              >
                <Icons.X className="w-4 h-4" />
              </Button>
            </header>

            <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto pb-3 no-scrollbar pr-1" role="navigation">
              {sections.map((section, sectionIdx) => (section.items.length > 0 && (
                <Collapsible
                  key={section.label}
                  defaultOpen={
                    section.label === 'Início' ||
                    section.items.some((item) => currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path + '/')))
                  }
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full min-h-10 flex items-center justify-between py-1.5 px-2.5 group/trigger hover:bg-[#c9a84c]/[0.05] rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/40 focus-visible:ring-offset-2">
                      <h3 style={{ color: 'var(--gold-text)', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>— {section.label}</h3>
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
                      <ul className="space-y-0.5 mt-0.5">
                        {section.items.map((item, idx) => {
                          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                          return (
                            <li key={idx}>
                              <Button
                                variant="ghost"
                                onClick={(e) => handleNav(item, e)}
                                onMouseEnter={() => prefetchRoute(item.path)}
                                onTouchStart={() => prefetchRoute(item.path)}
                                 aria-current={isActive ? 'page' : undefined}
                                 aria-label={`${item.label}${isActive ? ', página atual' : ''}`}
                                className={`w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 outline-none h-auto min-h-11 border
                                  ${isActive
                                    ? 'bg-[#c9a84c]/[0.08] text-[color:var(--gold-text)] border-[#c9a84c]/40'
                                    : 'text-foreground/70 hover:bg-[#c9a84c]/[0.04] hover:text-[color:var(--gold-text)] border-transparent hover:border-[#c9a84c]/20'}`}
                              >
                                  <span className={`transition-all duration-300 transform ${isActive ? 'opacity-100 scale-105' : 'opacity-80'}`}>
                                    {item.icon}
                                  </span>
                                <span className="tracking-[0.06em] truncate text-[0.82rem]">{item.label}</span>
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
              )))}
            </nav>

            <div className="shrink-0 border-t border-primary/10 pt-3 mt-2 space-y-3">
              <div className="flex flex-col gap-spacing-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="ghost"
                    onClick={onToggleDark} 
                    className="min-h-11 h-auto rounded-lg border border-primary/[0.01] dark:border-white/[0.01] bg-primary/[0.01] dark:bg-white/[0.01] flex items-center justify-center gap-spacing-xs transition-all hover:bg-primary/5 dark:hover:bg-white/5 group/btn"
                    aria-label={isDark ? "Modo Claro" : "Modo Escuro"}
                  >
                    {isDark ? <Icons.Sun className="w-spacing-sm h-spacing-sm text-primary/40 group-hover/btn:text-primary transition-colors" /> : <Icons.Moon className="w-spacing-sm h-spacing-sm opacity-30 group-hover/btn:opacity-60 transition-opacity" />}
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 group-hover/btn:text-muted-foreground transition-colors">{isDark ? 'Claro' : 'Escuro'}</span>
                  </Button>

                  <Button 
                    variant="ghost"
                    data-testid="a11y-trigger"
                    onClick={onOpenA11y} 
                    className={`h-spacing-xl rounded-premium border flex items-center justify-center gap-spacing-xs transition-all ${
                      isHighContrast 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'border-primary/[0.01] dark:border-white/[0.01] bg-primary/[0.01] dark:bg-white/[0.01] text-muted-foreground/30 hover:bg-primary/5'
                    }`}
                  >
                    <Icons.ShieldCheck className="w-spacing-sm h-spacing-sm" />
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]">A11y</span>
                  </Button>
                </div>

                {!settings.totalSilence && (
                  <Button 
                    variant="ghost"
                    onClick={onToggleSpeak} 
                    className={`w-full h-spacing-xl rounded-premium border flex items-center justify-center gap-spacing-sm transition-all ${
                      isSpeaking 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'border-primary/[0.01] dark:border-white/[0.01] bg-primary/[0.01] dark:bg-white/[0.01] text-muted-foreground/30 hover:bg-primary/5'
                    }`}
                  >
                    {isSpeaking ? <Icons.MessageCircle className="w-spacing-sm h-spacing-sm animate-pulse" /> : <Icons.Volume2 className="w-spacing-sm h-spacing-sm" />}
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
                  </Button>
                )}

                <div className="pt-1">
                  <label
                    htmlFor="cathedra-language"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70"
                  >
                    Idioma
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
                      aria-label="Selecionar idioma"
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
                <div className="flex justify-center gap-5 py-1">
                  <a href="https://www.instagram.com/cathedradigital/" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-secondary transition-colors" aria-label="Siga-nos no Instagram"><Icons.Instagram size={14} /></a>
                  <a href="https://www.youtube.com/@cathedradigital" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-secondary transition-colors" aria-label="Inscreva-se no nosso canal do Youtube"><Icons.Youtube size={14} /></a>
                </div>
              </div>

              {user ? (
                <div className="p-3 bg-primary/[0.025] dark:bg-white/[0.02] rounded-xl border border-primary/10">
                  <div 
                    onClick={() => handleNav(AppRoute.PROFILE)} 
                    className="flex items-center gap-spacing-sm cursor-pointer group"
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
                      <p className="text-xs uppercase text-primary/70 font-semibold tracking-[0.1em] mt-spacing-3xs">{user.isPremium ? 'Membro Premium' : 'Conta Gratuita'}</p>
                    </div>
                  </div>
                  
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
                      aria-label="Sair da conta"
                      className="h-spacing-xl w-spacing-xl rounded-premium-lg text-primary/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
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