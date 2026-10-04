import React from 'react';
import { Search, RotateCcw, User } from 'lucide-react';
import { useAtriumProfile, useLiturgyToday } from '../../hooks';

const Header: React.FC = () => {
  const user = useAtriumProfile();
  const liturgy = useLiturgyToday();
  const today = liturgy ? `Hoje · ${liturgy.season} · ${liturgy.weekday}${liturgy.saintOfDay ? ` · ${liturgy.saintOfDay.name}` : ''}` : 'Hoje';
  return (
    <header data-atrium-block="HEADER" className="catedra-surface mt-4 flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <p className="text-base font-serif font-semibold tracking-tight">Cátedra Digital</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{today}{user.displayName && <> · <span className="text-foreground/80">{user.displayName}</span></>}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" aria-label="Buscar" className="catedra-icon-button text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Search aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" aria-label="Retomar" className="catedra-icon-button text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><RotateCcw aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" aria-label="Perfil" className="catedra-icon-button text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><User aria-hidden="true" className="h-4 w-4" /></button>
      </div>
    </header>
  );
};
export default Header;