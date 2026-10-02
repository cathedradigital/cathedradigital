import React from 'react';
import type { SaintVirtue } from '../types';

interface Props {
  virtues: SaintVirtue[];
}

export const SaintVirtuesBlock: React.FC<Props> = ({ virtues }) => (
  <section aria-labelledby="saint-virtues" className="rounded-xl border border-border/50 bg-card/30 p-spacing-md">
    <h2 id="saint-virtues" className="font-serif text-premium-lg text-foreground mb-spacing-xs">
      Virtudes e carisma
    </h2>
    <ul className="grid gap-spacing-xs sm:grid-cols-2">
      {virtues.map((v, i) => (
        <li key={i} className="rounded-lg border border-border/50 p-spacing-sm">
          <p className="font-serif text-premium-md text-foreground">{v.label}</p>
          {v.description && (
            <p className="text-premium-sm text-muted-foreground mt-spacing-2xs leading-relaxed">
              {v.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  </section>
);
