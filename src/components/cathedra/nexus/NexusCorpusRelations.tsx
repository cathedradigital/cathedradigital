import React, { useEffect, useState } from 'react';
import { ArrowRight, Link2 } from 'lucide-react';
import { supabase } from '@/lib/db';

type RelationRow = {
  id: string;
  relation_type: string;
  note: string | null;
  confidence: number | null;
  source_document: { title: string; canonical_url: string } | null;
  target_document: { title: string; canonical_url: string } | null;
  target_person: { display_name: string; slug: string; canonical_url: string | null } | null;
};

const LABELS: Record<string, string> = {
  written_by: 'escrito por',
  about: 'sobre',
  quotes: 'cita',
  comments_on: 'comenta',
  cites: 'cita',
  develops: 'desenvolve',
  witnesses: 'testemunha',
  officially_promulgates: 'promulga',
  historically_follows: 'segue historicamente',
  related_to: 'relaciona-se com',
};

const NexusCorpusRelations: React.FC = () => {
  const [rows, setRows] = useState<RelationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      const { data, error } = await supabase
        .from('corpus_relations')
        .select(
          'id, relation_type, note, confidence, source_document:source_document_id(title, canonical_url), target_document:target_document_id(title, canonical_url), target_person:target_person_id(display_name, slug, canonical_url)',
        )
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(8);

      if (!cancelled) {
        if (error) console.error('Nexus corpus relations error', error.message);
        setError(Boolean(error));
        setRows((data ?? []) as unknown as RelationRow[]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <section className="mt-16" aria-label="Carregando relações verificadas"><div className="h-6 w-64 animate-pulse bg-stitch-surface-container-low" /><div className="mt-6 h-24 animate-pulse border border-stitch-outline-variant/40 bg-stitch-surface-container-lowest" /></section>;
  if (error && !rows.length) return <section className="mt-16" aria-live="polite"><p className="font-stitch-body text-sm text-stitch-on-surface-variant">As relações verificadas não puderam ser carregadas agora.</p></section>;
  if (!rows.length) return null;

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center gap-4">
        <Link2 className="h-5 w-5 text-stitch-secondary" />
        <div>
          <p className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.2em] text-stitch-secondary">
            Nexus documental
          </p>
          <h2 className="font-stitch-display text-[24px] font-semibold leading-[32px] text-stitch-primary">
            Relações verificadas entre fontes
          </h2>
        </div>
        <div className="h-px flex-1 bg-stitch-outline-variant/40" />
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row) => {
          const target = row.target_document
            ? { label: row.target_document.title, href: row.target_document.canonical_url }
            : row.target_person
              ? { label: row.target_person.display_name, href: row.target_person.canonical_url }
              : null;
          if (!row.source_document || !target) return null;

          return (
            <li
              key={row.id}
              className="border border-stitch-outline-variant/40 bg-stitch-surface-container-lowest p-5"
            >
              <div className="flex flex-wrap items-center gap-2 font-stitch-display text-[17px] italic text-stitch-primary">
                {row.source_document.canonical_url ? (
                  <a
                    href={row.source_document.canonical_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-stitch-secondary"
                  >
                    {row.source_document.title}
                  </a>
                ) : (
                  row.source_document.title
                )}
                <ArrowRight className="h-4 w-4 shrink-0 text-stitch-secondary" />
                {target.href ? (
                  <a
                    href={target.href}
                    className="hover:text-stitch-secondary"
                    aria-label={`Abrir ${target.label} na Cátedra`}
                  >
                    {target.label}
                  </a>
                ) : (
                  target.label
                )}
              </div>
              <p className="mt-2 font-stitch-body text-[11px] font-bold uppercase tracking-[0.16em] text-stitch-secondary">
                {LABELS[row.relation_type] ?? row.relation_type}
                {row.confidence != null ? ` · confiança ${Math.round(row.confidence * 100)}%` : ''}
              </p>
              {row.target_person?.canonical_url && (
                <a
                  href={row.target_person.canonical_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] text-stitch-secondary hover:underline"
                >
                  Fonte externa verificada
                </a>
              )}
              {row.note && (
                <p className="mt-2 font-stitch-body text-[14px] leading-[22px] text-stitch-on-surface-variant">
                  {row.note}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default NexusCorpusRelations;
