import React from 'react';
import { Icons } from '@/constants';
import type { MagisteriumDocument } from '@/data/magisterium-urls';

interface MagisteriumDocumentHeaderProps {
  doc: MagisteriumDocument;
}


/**
 * STAB-004.2 — Ficha rica do documento.
 * STAB-004.3.1 — Breadcrumb + ações de compartilhamento.
 * Renderiza apenas os metadados existentes em `MAGISTERIUM_DOCUMENTS`
 * (sem novas fontes de dados, sem chamadas de rede).
 */
const formatDate = (iso?: string, year?: number): string | null => {
  if (iso) {
    try {
      const d = new Date(iso + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      }
    } catch { /* noop */ }
  }
  return year ? String(year) : null;
};

const MetaRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-spacing-sm py-spacing-2xs">
      <dt className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground min-w-[92px]">
        {label}
      </dt>
      <dd className="text-premium-sm text-foreground/90 font-medium">{value}</dd>
    </div>
  );
};

const MagisteriumDocumentHeader: React.FC<MagisteriumDocumentHeaderProps> = ({ doc }) => {
  const dateLabel = formatDate(doc.date, doc.year);

  return (
    <header
      className="w-full max-w-[70ch] mx-auto px-spacing-md md:px-0 mb-spacing-2xl"
      aria-label="Metadados do documento"
    >
      <div className="border-y border-primary/10 py-spacing-md md:py-spacing-lg">
        <div className="flex flex-wrap items-center gap-x-spacing-sm gap-y-spacing-2xs text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="text-primary/80">{doc.type}</span>
          <span aria-hidden="true">·</span>
          <span>{doc.author}</span>
          {doc.pontificate && doc.pontificate !== doc.author && (
            <>
              <span aria-hidden="true">·</span>
              <span>{doc.pontificate}</span>
            </>
          )}
          {dateLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span>{dateLabel}</span>
            </>
          )}
        </div>

        {doc.summary && (
          <p className="mt-spacing-sm max-w-[62ch] text-sm md:text-base leading-relaxed text-muted-foreground">
            {doc.summary}
          </p>
        )}

        <div className="mt-spacing-md flex flex-wrap items-center gap-x-spacing-md gap-y-spacing-xs text-xs">
          <span className="font-semibold text-muted-foreground">Fonte oficial</span>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-spacing-2xs font-bold text-primary hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary"
          >
            Santa Sé · vatican.va
            <Icons.ExternalLink className="w-spacing-sm h-spacing-sm" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
};
export default React.memo(MagisteriumDocumentHeader);
