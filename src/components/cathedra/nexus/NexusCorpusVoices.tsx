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
  const [popes, setPopes] = useState<CorpusPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(false);
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
        if (active) setError(true);
        if (active) setLoading(false);
        return;
      }
      setPeople((data ?? []) as CorpusPerson[]);
      const { data: papalData, error: papalError } = await supabase
        .from('corpus_people')
        .select('id,slug,display_name,person_kind,papal_number,papal_name,canonical_url')
        .eq('status', 'published').eq('person_kind', 'pope')
        .order('papal_number', { ascending: true }).limit(24);
      if (active) {
        if (papalError) console.error('Nexus papal chronology error', papalError.message);
        setPopes((papalData ?? []) as CorpusPerson[]);
        setError(Boolean(papalError));
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="mt-12 border-t border-stitch-secondary/20 pt-10" aria-label="Carregando acervo vivo"><div className="h-6 w-48 animate-pulse bg-stitch-surface-container-low" /><div className="mt-4 h-4 w-full max-w-2xl animate-pulse bg-stitch-surface-container-low" /></div>;
  if (error && people.length === 0 && popes.length === 0) return <section className="mt-12 border-t border-stitch-secondary/20 pt-10" aria-live="polite"><p className="font-stitch-body text-sm text-stitch-on-surface-variant">Não foi possível carregar o acervo agora.</p></section>;
  if (people.length === 0 && popes.length === 0) return null;

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
      {popes.length > 0 ? (
        <div className="mt-8 border border-stitch-secondary/15 bg-stitch-surface-container-lowest p-5">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-stitch-secondary" aria-hidden="true" />
            <h3 className="font-stitch-display text-[22px] text-stitch-primary">Cronologia pontifícia</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-stitch-on-surface-variant">A lista oficial completa dos pontífices é mantida pela Santa Sé; o Cátedra exibe aqui apenas registros já verificados no corpus.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {popes.map((pope) => (
              <a key={pope.id} href={pope.canonical_url ?? '/nexus'} target={pope.canonical_url ? '_blank' : undefined} rel={pope.canonical_url ? 'noreferrer' : undefined} className="flex items-center gap-2 border border-stitch-secondary/10 px-3 py-2 text-sm hover:bg-stitch-surface-container-low">
                <span className="font-bold text-stitch-secondary">{pope.papal_number ?? '—'}</span>
                <span className="truncate text-stitch-primary">{pope.display_name}</span>
              </a>
            ))}
          </div>
          <a className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-stitch-secondary" href="https://www.vatican.va/content/vatican/pt/holy-father.html" target="_blank" rel="noreferrer">Consultar lista oficial da Santa Sé <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      ) : null}
    </section>
  );
}
