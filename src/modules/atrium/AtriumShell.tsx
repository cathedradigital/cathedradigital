import React from 'react';

interface Props { children: React.ReactNode; }

/**
 * Shell único do Átrio.
 * A composição visual vem da Fundação Cátedra; blocos não definem largura própria.
 */
const AtriumShell: React.FC<Props> = ({ children }) => (
  <div data-shell="atrium" data-catedra-module="atrium" className="catedra-module-shell min-h-dvh bg-background text-foreground pb-[env(safe-area-inset-bottom)]">
    <main className="catedra-page catedra-stack pb-16">
      {children}
    </main>
  </div>
);

export default AtriumShell;
