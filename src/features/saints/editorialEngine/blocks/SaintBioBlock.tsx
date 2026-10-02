import React from 'react';

interface Props {
  html?: string;
  text: string;
  /** Título editorial da seção. Default: "Vida". */
  title?: string;
  /** Id do heading — usado por aria-labelledby. Default: "saint-bio". */
  id?: string;
}

/**
 * Bloco de prosa editorial do santo. Reutilizado para Vida, Reflexão
 * espiritual e Legado — sem criar variantes paralelas.
 * Aceita texto puro ou HTML sanitizado a montante.
 */
export const SaintBioBlock: React.FC<Props> = ({ text, html, title = 'Vida', id = 'saint-bio' }) => (
  <section aria-labelledby={id} className="rounded-xl border border-border/50 bg-card/30 p-spacing-md">
    <h2 id={id} className="font-serif text-premium-lg text-foreground mb-spacing-xs">
      {title}
    </h2>
    {html ? (
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    ) : (
      <p className="text-premium-sm text-foreground/90 leading-[1.72] whitespace-pre-line">{text}</p>
    )}
  </section>
);
