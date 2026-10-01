import React, { useEffect, useState } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthoritySources, type AuthoritySource } from '@/services/authoritySourceService';

const TYPE_LABELS: Record<AuthoritySource['source_type'], string> = {
  sacred_scripture: 'Escritura',
  catechism: 'Catecismo',
  magisterium: 'Magistério',
  apostolic_tradition: 'Tradição Apostólica',
  patristic: 'Padres da Igreja',
  saint: 'Santos e Doutores',
  theology: 'Teologia',
};

export default function CaterAuthorityArchive() {
  const [sources, setSources] = useState<AuthoritySource[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAuthoritySources().then(setSources).catch(() => setError(true));
  }, []);

  if (error || sources.length === 0) return null;

  return (
    <section className="mt-spacing-xl" aria-labelledby="cater-authority-title">
      <Card className="border-primary/10 bg-card/70">
        <CardHeader>
          <div className="flex items-start gap-spacing-sm">
            <div className="rounded-full border border-secondary/30 bg-secondary/10 p-2">
              <ShieldCheck className="h-4 w-4 text-secondary-foreground" aria-hidden="true" />
            </div>
            <div>
              <CardTitle id="cater-authority-title" className="font-serif text-xl">
                Acervo de autoridade do Cáter
              </CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                O Cáter não transforma todas as fontes em “doutrina”. Ele identifica de onde cada afirmação vem e preserva a diferença entre Revelação, Magistério, testemunho da Tradição e reflexão teológica.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {sources.map((source) => (
            <div key={source.id} className="rounded-xl border border-border/70 bg-background/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-secondary">
                  {TYPE_LABELS[source.source_type]}
                </span>
                {source.canonical_url && (
                  <a
                    href={source.canonical_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir fonte: ${source.title}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
              <h3 className="mt-2 font-serif text-base text-primary">{source.title}</h3>
              <p className="mt-1 text-xs font-medium text-foreground/80">{source.authority_label}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{source.description}</p>
              {source.citation && (
                <p className="mt-3 text-[10px] uppercase tracking-wide text-muted-foreground/80">{source.citation}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
