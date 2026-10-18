import React from 'react';
import { useAnnouncementsState } from '../../hooks';

const News: React.FC = () => {
  const state = useAnnouncementsState();

  return (
    <section data-atrium-block="P6" aria-labelledby="atrium-news" aria-live="polite">
      <h2 id="atrium-news" className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
        Novidades
      </h2>

      {state.status === 'loading' && (
        <p role="status" className="text-sm text-muted-foreground">
          Carregando novidades…
        </p>
      )}

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-muted-foreground">
          Não foi possível carregar as novidades. Tente novamente mais tarde.
        </p>
      )}

      {state.status === 'success' && state.items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma novidade disponível no momento.
        </p>
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {state.items.map((item) => (
            <li key={item.id} className="text-sm text-muted-foreground">
              · {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default News;
