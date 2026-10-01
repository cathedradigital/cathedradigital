import React, { useEffect, useState } from 'react';
import { Network } from 'lucide-react';
import { getAuthorityRelations, type AuthoritySourceRelation } from '@/services/authorityRelationService';

const LABELS: Record<AuthoritySourceRelation['relation_type'], string> = {
  grounds: 'fundamenta',
  interprets: 'é interpretado por',
  develops: 'aprofundamento',
  witnesses: 'testemunha',
  contextualizes: 'contextualiza',
  echoes: 'faz eco de',
};

export default function CaterAuthorityNexus() {
  const [relations, setRelations] = useState<AuthoritySourceRelation[]>([]);

  useEffect(() => {
    getAuthorityRelations().then(setRelations).catch(() => setRelations([]));
  }, []);

  if (!relations.length) return null;

  return (
    <section className="mt-6" aria-labelledby="cater-nexus-title">
      <div className="mb-3 flex items-center gap-2">
        <Network className="h-4 w-4 text-secondary" aria-hidden="true" />
        <div>
          <h2 id="cater-nexus-title" className="font-serif text-lg text-primary">Nexus de autoridade</h2>
          <p className="text-xs text-muted-foreground">Relações entre fontes, sem confundir seus níveis de autoridade.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {relations.map((relation) => (
          <article key={relation.id} className="rounded-xl border border-border/70 bg-card/50 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
              {LABELS[relation.relation_type]}
            </div>
            <div className="mt-2 text-sm">
              <span className="font-serif text-primary">{relation.source.title}</span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span className="font-serif text-primary">{relation.related_source.title}</span>
            </div>
            {relation.note && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{relation.note}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
