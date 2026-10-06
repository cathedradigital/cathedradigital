import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReadingSidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
  active?: boolean;
}

export interface ReadingSidebarProps {
  title: string;
  items: ReadingSidebarItem[];
  children?: React.ReactNode;
  className?: string;
}

/**
 * Sidebar de leitura: três estados — fechado, compacto e expandido.
 * O conteúdo permanece como prioridade; ações secundárias vivem aqui.
 */
export const ReadingSidebar: React.FC<ReadingSidebarProps> = ({
  title,
  items,
  children,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(true);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        setCompact(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) firstActionRef.current?.focus();
  }, [open]);

  const select = (item: ReadingSidebarItem) => {
    item.onSelect();
    setOpen(false);
    setCompact(true);
  };

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Fechar painel lateral de leitura' : 'Abrir painel lateral de leitura'}
        onClick={() => {
          setOpen((value) => !value);
          setCompact(false);
        }}
        className={cn(
          'fixed right-3 top-1/2 z-[150] -translate-y-1/2 md:right-4',
          'inline-flex h-10 w-10 items-center justify-center rounded-full',
          'border border-stitch-outline-variant/50 bg-stitch-background/95 text-stitch-on-surface-variant shadow-lg',
          'backdrop-blur-md transition-all hover:border-stitch-secondary hover:text-stitch-secondary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary',
          'safe-area-right',
          open && 'pointer-events-none opacity-0',
        )}
      >
        <PanelRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Fechar painel lateral"
          onClick={() => {
            setOpen(false);
            setCompact(true);
          }}
          className="fixed inset-0 z-[140] bg-black/5 md:hidden"
        />
      )}

      <aside
        aria-label={title}
        className={cn(
          'fixed right-0 top-0 z-[160] h-dvh',
          'border-l border-stitch-outline-variant/30 bg-stitch-background/98 backdrop-blur-xl',
          'shadow-xl transition-[width,transform] duration-200 ease-out',
          'flex flex-col overflow-hidden',
          open
            ? 'w-[min(18rem,88vw)] translate-x-0'
            : compact
              ? 'w-14 translate-x-full md:translate-x-full'
              : 'w-14 translate-x-full',
          className,
        )}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-stitch-outline-variant/20">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setCompact(false);
            }}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-stitch-on-surface-variant hover:text-stitch-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary"
            aria-label="Expandir painel de leitura"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          {open && (
            <>
              <span className="min-w-0 flex-1 truncate font-stitch-body text-[11px] font-bold uppercase tracking-[0.18em] text-stitch-primary">
                {title}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCompact(true);
                }}
                className="mr-1 inline-flex h-11 w-11 items-center justify-center text-stitch-on-surface-variant hover:text-stitch-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary"
                aria-label="Recolher painel de leitura"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-1.5" aria-label="Ferramentas da leitura">
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={index === 0 ? firstActionRef : undefined}
              type="button"
              onClick={() => select(item)}
              aria-current={item.active ? 'page' : undefined}
              aria-label={item.label}
              title={!open ? item.label : undefined}
              className={cn(
                'mb-1 flex min-h-11 w-full items-center rounded-xl text-left',
                'text-stitch-on-surface-variant transition-colors hover:bg-stitch-secondary/10 hover:text-stitch-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary',
                item.active && 'bg-stitch-secondary/10 text-stitch-secondary',
                open ? 'gap-3 px-3' : 'justify-center px-1',
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden="true">
                {item.icon}
              </span>
              {open && (
                <span className="min-w-0 flex-1 truncate font-stitch-body text-[12px] font-semibold">
                  {item.label}
                </span>
              )}
            </button>
          ))}
          {open && children}
        </nav>

        {open && (
          <div className="border-t border-stitch-outline-variant/20 p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCompact(true);
              }}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-stitch-on-surface-variant hover:bg-stitch-secondary/10 hover:text-stitch-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.14em]">Recolher</span>
            </button>
          </div>
        )}
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Fechar painel lateral"
          onClick={() => {
            setOpen(false);
            setCompact(true);
          }}
          className="fixed inset-0 z-[145] hidden bg-black/5 md:block"
        />
      )}

      <div className="sr-only" aria-live="polite">
        {open ? 'Painel lateral expandido' : 'Painel lateral fechado'}
      </div>
    </>
  );
};

export default ReadingSidebar;
