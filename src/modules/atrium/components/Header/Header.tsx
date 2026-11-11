import React from 'react';
import { Search, RotateCcw, User } from 'lucide-react';
import { useAtriumProfile, useLiturgyToday } from '../../hooks';
import { useLang } from '@/hooks/useLang';

const Header: React.FC = () => {
  const { t } = useLang();
  const user = useAtriumProfile();
  const liturgy = useLiturgyToday();
  const today = liturgy ? `${t('today')} · ${liturgy.season} · ${liturgy.weekday}${liturgy.saintOfDay ? ` · ${liturgy.saintOfDay.name}` : ''}` : t('today');
  return (
    <header data-atrium-block="HEADER" className="catedra-surface mt-4 flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <p className="text-base font-serif font-semibold tracking-tight">Cathedra Digital</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{today}{user.displayName && <> · <span className="text-foreground/80">{user.displayName}</span></>}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" aria-label={t('atrium_search')} className="catedra-icon-button text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Search aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" aria-label={t('resume')} className="catedra-icon-button text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><RotateCcw aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" aria-label={t('profile')} className="catedra-icon-button text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><User aria-hidden="true" className="h-4 w-4" /></button>
      </div>
    </header>
  );
};
export default Header;