/**
 * Entrada canônica da Bíblia.
 *
 * O leitor real vive em src/components/cathedra/Bible.tsx, que já concentra
 * navegação, busca, seletor, leitura, Conexo e estados de erro.
 * Este wrapper existe apenas para manter o ponto de entrada de /bible;
 * não cria uma segunda landing ou segunda experiência bíblica.
 */
import React, { lazy, Suspense } from 'react';
import BibleReadGate from '@/components/cathedra/BibleReadGate';
import { BibleSkeleton } from '@/components/cathedra/RouteSkeletons';

const Bible = lazy(() => import('@/components/cathedra/Bible'));

const AtriumBibleReader: React.FC = () => (
  <div data-catedra-module="bible">
    <Suspense fallback={<BibleSkeleton />}>
      <BibleReadGate>
        <Bible />
      </BibleReadGate>
    </Suspense>
  </div>
);

export default AtriumBibleReader;
