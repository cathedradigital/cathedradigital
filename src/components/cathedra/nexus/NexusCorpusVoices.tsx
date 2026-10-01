import React, { useEffect, useState } from 'react';
import { Feather, Heart, Crown, BookOpen, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/db';

interface CorpusPerson {
  id: string;
  slug: string;
  display_name: string;
  person_kind: string;
  papal_number: number | null;
  papal_name: string | null;
  canonical_url: string | null;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  father: Feather,
  doctor: BookOpen,
  saint: Heart,
  pope: Crown,
};

const LABELS: Record<string, string> = {
  father: 'Padre da Igreja',
  doctor: 'Doutor da Igreja',
  saint: 'Santo',
  pope: 'Pontífice',
};

export default function NexusCorpusVoices() {
  const [people, setPeople] = useState<CorpusPerson[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('corpus_people')
        .select('id,slug,display_name,person_kind,papal_number,papal_name,canonical_url')
        .eq('status', 'published')
        .in('person_kind', ['father', 'doctor', 'saint', 'pope'])
        .order('person_kind', { ascending: true })
        .order('display_name', { ascending: true })
        .limit(24);
      if (!active) return;
      if (error) {
        console.error('Nexus corpus voices error', error.message);
        return;
      }
      setPeople((data ?? []) as CorpusPerson[]);
    })();
    return () => { active = false; };
  }, []);

  if (people.length === 0) return null;

  return (
    <section className="mt-12 border-t border-stitch-secondary/20 pt-10" aria-labelledby="nexus-corpus-voices">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-stitch-body text-[11px] font-bold uppercase tracking-[0.2em] text-stitch-secondary">Acervo vivo</p>
          <h2 id="nexus-corpus-voices" className="mt-2 font-stitch-display text-[30px] leading-tight text-stitch-primary">Padres, santos e pontífices</h2>
          <p className="mt-2 max-w-2xl font-stitch-body text-[16px] leading-7 text-stitch-on-surface-variant">
            Vozes históricas conectadas ao Nexus. A presença no acervo não transforma um texto patrístico ou teológico em ensinamento do Magistério.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => {
          const Icon = ICONS[person.person_kind] ?? BookOpen;
          return (
            <a
              key={person.id}
              href={person.canonical_url ?? '/santos'}
              target={person.canonical_url ? '_blank' : undefined}
              rel={person.canonical_url ? 'noreferrer' : undefined}
              className="group flex items-start gap-3 border border-stitch-secondary/15 bg-stitch-surface-container-lowest p-4 transition hover:bg-stitch-surface-container-low"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-stitch-secondary" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stitch-on-surface-variant">{LABELS[person.person_kind] ?? 'Fonte histórica'}</span>
                <span className="mt-1 block font-stitch-display text-[18px] text-stitch-primary">{person.display_name}</span>
                {person.papal_number ? <span className="mt-1 block text-xs text-stitch-on-surface-variant">{person.papal_number}º pontífice romano</span> : null}
              </span>
              {person.canonical_url ? <ExternalLink className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-stitch-on-surface-variant" aria-hidden="true" /> : null}
            </a>
          );
        })}
      </div>
    </section>
  );
}
