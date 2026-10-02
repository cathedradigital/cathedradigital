/**
 * ReaderShell — Template Mestre oficial de leitura da Cathedra.
 *
 * Arquitetura única (Reader Template Master):
 *
 *   ReaderShell
 *     ├─ EditorialHero          (slot: `hero`)
 *     ├─ ReaderContent           (slot: children)
 *     ├─ ReferencePopover        (embutido dentro de children — inline)
 *     ├─ NexusPanel              (slot: `nexus`)
 *     └─ ReaderContinuation      (slot: `continuation`)
 *
 * Regra COS — Reader Architecture Rule:
 *  - Nenhum módulo pode criar Reader/Shell paralelo.
 *  - Nenhum módulo pode criar Nexus/Popover paralelo.
 *  - Toda leitura (Bíblia, Catecismo, Glossário, Santos, Missal, LH,
 *    Orações, Jornadas, Coleções, Magistério) obedece este esqueleto.
 *
 * O componente é puramente estrutural: NÃO importa hooks de domínio,
 * NÃO faz fetch, NÃO conhece rotas. Recebe slots já resolvidos.
 */

import React from 'react';
import { cn } from '@/lib/utils';

const NEXUS_RETURN_KEY = 'cathedra:nexus-return';

export interface ReaderShellProps {
  /** Cabeçalho editorial da leitura (use EditorialHero). */
  hero: React.ReactNode;
  /**
   * Slot opcional entre o Hero e o corpo — use uma implementação
   * canônica de HeaderContext (Liturgical, Journey, Catechesis, Study).
   * NÃO passe componentes ad-hoc; se precisar de uma variante nova,
   * adicione-a em `@/components/reader/HeaderContext`.
   */
  headerContext?: React.ReactNode;
  /** Corpo da leitura — texto contínuo, referências inline, ReferencePopover. */
  children: React.ReactNode;
  /** Painel de conexões teológicas (use NexusPanel). Opcional. */
  nexus?: React.ReactNode;
  /** Rodapé de continuidade (use ReaderContinuation). Opcional. */
  continuation?: React.ReactNode;
  /** Classe extra no container raiz. */
  className?: string;
  /** Largura máxima do corpo (default: `max-w-[68ch]`). */
  contentMaxWidth?: string;
  /** Aria-label da região de leitura. */
  ariaLabel?: string;
}

/**
 * ReaderShell aplica o layout canônico e garante ordem visual estável.
 * Se um módulo precisa de uma seção extra (ex.: Bíblia com barra de
 * versículos), passe-a como filho do `children` — nunca como novo slot.
 */
export const ReaderShell: React.FC<ReaderShellProps> = ({
  hero,
  headerContext,
  children,
  nexus,
  continuation,
  className,
  contentMaxWidth = 'max-w-[68ch]',
  ariaLabel = 'Leitura',
}) => {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let frame1 = 0;
    let frame2 = 0;
    try {
      const raw = sessionStorage.getItem(NEXUS_RETURN_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { source?: string; scrollY?: number };
      const current = window.location.pathname + window.location.search;
      if (saved.source !== current || typeof saved.scrollY !== 'number') return;

      frame1 = window.requestAnimationFrame(() => {
        frame2 = window.requestAnimationFrame(() => {
          window.scrollTo({ top: saved.scrollY!, behavior: 'auto' });
          sessionStorage.removeItem(NEXUS_RETURN_KEY);
        });
      });
    } catch {
      sessionStorage.removeItem(NEXUS_RETURN_KEY);
    }

    return () => {
      if (frame1) window.cancelAnimationFrame(frame1);
      if (frame2) window.cancelAnimationFrame(frame2);
    };
  }, []);

  return (
    <article
      className={cn(
        'relative w-full bg-transparent text-foreground',
        'flex flex-col min-h-screen',
        className,
      )}
      aria-label={ariaLabel}
      data-reader-shell
    >
      <header data-reader-slot="hero" className="order-first">{hero}</header>

      <div
        data-reader-slot="content"
        className={cn(
          'w-full mx-auto flex-1',
          contentMaxWidth,
          'px-[var(--stitch-margin-mobile)] md:px-0',
          'py-spacing-lg md:py-spacing-2xl',
          'space-y-spacing-lg',
        )}
      >
        {children}
      </div>

      <section
        data-reader-slot="progress"
        className="w-full px-[var(--stitch-margin-mobile)] md:px-0 py-spacing-md border-t border-border/10"
      >
        {headerContext}
      </section>

      {nexus && (
        <section
          data-reader-slot="nexus"
          className="w-full px-[var(--stitch-margin-mobile)] md:px-0 py-spacing-xl border-t border-border/40"
          aria-label="Conexões teológicas"
        >
          {nexus}
        </section>
      )}

      {continuation && (
        <footer
          data-reader-slot="continuation"
          className="w-full px-[var(--stitch-margin-mobile)] md:px-0 py-spacing-2xl border-t border-primary/5 bg-primary/[0.01] pb-[calc(var(--spacing-2xl,3rem)+var(--stitch-mobile-safe-bottom,0px))] md:pb-spacing-2xl"
          aria-label="Continuar leitura"
        >
          {continuation}
        </footer>
      )}
    </article>
  );
};

export default ReaderShell;
