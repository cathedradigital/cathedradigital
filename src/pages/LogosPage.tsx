import React from "react";
import { useSearchParams } from "@/lib/rr-compat";
import LogosAI from "@/components/cathedra/LogosAI";
import SEOHead from "@/components/SEOHead";

const LogosPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || undefined;
  const context = searchParams.get("context") || "global";

  return (
    <>
      <SEOHead
        title="Cáter — Assistente Teológico da Cátedra"
        description="Assistente teológico fundamentado nas fontes verificáveis da Cátedra, sem criar doutrina."
      />
      <main className="mx-auto w-full max-w-5xl px-spacing-md md:px-spacing-xl py-spacing-2xl">
        <div className="mb-spacing-2xl">
          <p className="text-[10px] uppercase tracking-[0.32em] text-secondary/80">
            Assistente Teológico da Cátedra
          </p>
          <h1 className="mt-spacing-sm font-serif italic text-3xl md:text-5xl text-primary">
            Cáter
          </h1>
          <p className="mt-spacing-md max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Estude a partir do contexto da Cathedra e aprofunde conexões entre Escritura,
            Catecismo, Magistério, Santos, jornadas e oração.
          </p>
        </div>

        <LogosAI
          isOpen
          onClose={() => window.history.back()}
          variant="integrated"
          context={context}
          initialQuery={initialQuery}
        />
      </main>
    </>
  );
};

export default LogosPage;
