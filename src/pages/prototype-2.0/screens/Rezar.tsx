import React from 'react';
import { Link } from '@/lib/rr-compat';
import PrototypeShell from '../PrototypeShell';
import { ChevronRight } from 'lucide-react';

const BASE = '/prototype-2.0';

const OFICIO = [
  { label: 'Missa', to: '/missal' },
  { label: 'Laudes', to: '/breviary?h=laudes' },
  { label: 'Meio-dia · Sexta', to: '/breviary?h=sexta' },
  { label: 'Vésperas', to: '/breviary?h=vesperas' },
  { label: 'Completas', to: '/breviary?h=completas' },
];

const DEVOCOES = [
  { label: 'Rosário', to: '/oracao/rosario' },
  { label: 'Via-Sacra', to: '/viacrucis' },
  { label: 'Ladainhas', to: '/litanies' },
  { label: 'Lectio Divina', to: '/lectio' },
  { label: 'Exame de consciência', to: '/oracao/exame-de-consciencia' },
  { label: 'Novenas', to: '/novenas' },
  { label: 'Livro de orações', to: '/oracao' },
];

const Rezar: React.FC = () => {
  return (
    <PrototypeShell title="Rezar" back={`${BASE}/atrio`} liturgicalColor="hsl(280 30% 40%)">
      <section>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Ofício</p>
        <ul className="border border-border rounded divide-y divide-border">
          {OFICIO.map((o) => (
            <li key={o.label}>
              <Link
                to={o.to}
                className="flex items-center justify-between p-3 text-sm hover:bg-muted/40"
              >
                {o.label} <ChevronRight size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Devoções</p>
        <ul className="border border-border rounded divide-y divide-border">
          {DEVOCOES.map((d) => (
            <li key={d.label}>
              <Link
                to={d.to}
                className="flex items-center justify-between p-3 text-sm hover:bg-muted/40"
              >
                {d.label} <ChevronRight size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PrototypeShell>
  );
};

export default Rezar;
