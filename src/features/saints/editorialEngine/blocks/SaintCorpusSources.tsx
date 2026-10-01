import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCorpusPersonDocuments, type CorpusSaintDocument } from '@/services/corpusService';

interface Props {
  slug: string;
  name: string;
}

const KIND_LABEL: Record<string, string> = {
  patristic_work: 'Obra patrística',
  saint_work: 'Escrito do santo',
  papal_document: 'Documento papal',
  letter: 'Carta',
  homily: 'Homilia',
  encyclical: 'Encíclica',
};

export const SaintCorpusSources: React.FC<Props> = ({ slug, name }) => {
  const [documents, setDocuments] = useState<CorpusSaintDocument[]>([]);

  useEffect(() => {
    let active = true;
    getCorpusPersonDocuments(slug, name).then((rows) => {
      if (active) setDocuments(rows);
    });
    return () => {
      active = false;
    };
  }, [slug, name]);

  if (documents.length === 0) return null;

  return (
    <section className="rounded-premium border border-border/60 bg-card/60 p-spacing-md space-y-spacing-sm" aria-labelledby="saint-corpus-sources">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 id="saint-corpus-sources" className="text-premium-lg font-semibold">Obras e fontes verificadas</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Referências do acervo documental da Cátedra, separadas da biografia editorial. O Cáter pode usar estas fontes quando houver trecho verificável.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {documents.map((document) => (
          <a
            key={document.slug}
            href={document.canonical_url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-premium border border-border/50 bg-background/60 p-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {KIND_LABEL[document.document_kind] ?? 'Fonte documental'}
                </p>
                <h3 className="mt-1 font-medium leading-snug group-hover:underline">{document.title}</h3>
              </div>
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>
            {document.excerpt && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{document.excerpt}</p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};
