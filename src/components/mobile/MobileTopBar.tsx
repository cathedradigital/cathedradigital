import { ArrowLeft, Search, Menu, MoreVertical } from "lucide-react";
import { useNavigate, Link } from '@/lib/rr-compat';
import { cn } from "@/lib/utils";
import { EnvironmentModuleNav } from "@/components/mobile/EnvironmentModuleNav";
import type { ReactNode } from "react";

interface MobileTopBarProps {
  /** Título curto exibido no centro. Se ausente, usa apenas kicker. */
  title?: string;
  /** Etiqueta em versalete acima do título (ex.: "Cathedra · Bíblia"). */
  kicker?: string;
  /** Mostra botão de voltar. Se `onBack` não for passado, usa navigate(-1). */
  showBack?: boolean;
  onBack?: () => void;
  /** Ações à direita (ícones). */
  actions?: ReactNode;
  /** Abre a navegação lateral global no mobile. */
  onMenu?: () => void;
  /** Deixa o fundo transparente com blur (útil sobre Hero). */
  transparent?: boolean;
  className?: string;
}

/**
 * MobileTopBar — barra superior fixa para telas mobile do Cathedra 3.0.
 * Consome tokens `stitch-*` e respeita safe-area do notch.
 */
export function MobileTopBar({
  title,
  kicker,
  showBack = false,
  onBack,
  actions,
  onMenu,
  transparent = false,
  className,
}: MobileTopBarProps) {
  const navigate = useNavigate();

  const handleMenu = () => {
    if (onMenu) {
      onMenu();
      return;
    }
    window.dispatchEvent(new CustomEvent("open-sidebar"));
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="md:hidden" data-mobile-topbar="true">
    <header
      className={cn(
        "sticky top-0 z-40 w-full max-w-[100vw] overflow-hidden",
        "flex items-center gap-3 px-[var(--stitch-margin-mobile)]",
        "border-b transition-colors",
        transparent
          ? "bg-stitch-surface/70 border-transparent backdrop-blur-md"
          : "bg-stitch-surface border-stitch-outline-variant",
        className,
      )}
      style={{
        height: `calc(var(--stitch-mobile-topbar-h) + var(--stitch-mobile-safe-top))`,
        paddingTop: "var(--stitch-mobile-safe-top)",
      }}
    >
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className={cn(
            "inline-flex items-center justify-center rounded-full mr-1",
            "text-stitch-on-surface hover:bg-stitch-surface-container",
            "transition-colors focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-stitch-secondary",
          )}
          style={{
            width: "var(--stitch-mobile-touch-min)",
            height: "var(--stitch-mobile-touch-min)",
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <Link to="/" className="shrink-0">
        <img src="/monograma-cathedra.svg" alt="Cathedra" className="h-8 w-8" />
      </Link>

      <div className="min-w-0 flex-1">
        {kicker && (
          <span className="block truncate font-[var(--font-stitch-label)] text-[9px] font-bold uppercase tracking-[0.12em] text-stitch-on-surface-variant">
            {kicker}
          </span>
        )}
        {title && (
          <p
            className={cn(
              "font-[var(--font-stitch-display)] text-[18px] leading-tight",
              "text-stitch-on-surface truncate",
            )}
          >
            {title}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          to="/buscar"
          aria-label="Busca"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stitch-on-surface hover:bg-stitch-surface-container"
        >
          <Search className="h-5 w-5" />
        </Link>
        {actions && <div className="flex items-center">{actions}</div>}
        <button
          type="button"
          aria-label="Configurações de leitura"
          onClick={() => window.dispatchEvent(new CustomEvent("open-reading-preferences"))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stitch-on-surface hover:bg-stitch-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Abrir menu lateral"
          onClick={handleMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stitch-on-surface hover:bg-stitch-surface-container disabled:opacity-40"
          disabled={false}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

    </header>
    <EnvironmentModuleNav />
    </div>
  );
}
