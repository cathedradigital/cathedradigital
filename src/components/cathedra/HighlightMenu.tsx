import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/constants';
import { cn } from '@/lib/utils';
import PassageActions from '@/components/shared/PassageActions';
import type { PassageDescriptor } from '@/lib/passageUrl';

interface HighlightMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor?: (color: string) => void;
  onAddNote: () => void;
  onShare?: () => void;
  verseText?: string;
  reference?: string;
  passage?: PassageDescriptor;
  onOpenNexus?: () => void;
}

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', label: 'Amarelo' },
  { name: 'green', bg: 'bg-green-200', label: 'Verde' },
  { name: 'blue', bg: 'bg-blue-200', label: 'Azul' },
  { name: 'red', bg: 'bg-red-200', label: 'Vermelho' },
];

const SOURCE_LABELS: Record<string, string> = {
  bible: 'Bíblia',
  catechism: 'Catecismo',
  magisterium: 'Magistério',
};

export const HighlightMenu: React.FC<HighlightMenuProps> = ({
  isOpen,
  onClose,
  onSelectColor,
  onAddNote,
  verseText,
  reference,
  passage,
  onOpenNexus,
}) => {
  const sourceLabel = SOURCE_LABELS[passage?.kind ?? ''] ?? 'Leitura';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/5 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-4 left-3 right-3 z-[160] mx-auto max-w-xl rounded-3xl border border-primary/10 bg-background/95 p-4 shadow-2xl backdrop-blur-xl md:bottom-6 md:p-5"
            role="dialog"
            aria-label={`Ações da leitura: ${reference ?? sourceLabel}`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/45">
                    Cátedra · {sourceLabel}
                  </p>
                  {reference && (
                    <p className="mt-1 truncate text-sm font-medium text-foreground/80">
                      {reference}
                    </p>
                  )}
                  {verseText && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      “{verseText}”
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Fechar ações da leitura"
                >
                  <Icons.X className="h-5 w-5" />
                </button>
              </div>

              {onSelectColor && (
              <div className="grid grid-cols-4 gap-2" aria-label="Cores de destaque">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => onSelectColor(color.name)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/5 px-2 py-2 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Destacar em ${color.label}`}
                  >
                    <span className={cn('h-5 w-5 rounded-full border border-primary/10', color.bg)} />
                    <span className="hidden text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:inline">
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onAddNote}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary-foreground shadow-sm transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Icons.PenLine className="h-4 w-4" />
                  Anotar / refletir
                </button>

                {onOpenNexus && (
                  <button
                    type="button"
                    onClick={onOpenNexus}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary/80 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Icons.Link className="h-4 w-4" />
                    Nexus
                  </button>
                )}
              </div>

              {verseText && reference && (
                <div className="border-t border-primary/8 pt-3">
                  <PassageActions
                    text={verseText}
                    reference={reference}
                    title={`Cathedra — ${reference}`}
                    passage={passage}
                    size="sm"
                    className="justify-center"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
