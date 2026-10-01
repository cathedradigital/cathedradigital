import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

const App = lazy(() => import("@/App"));

export const Route = createFileRoute("/$")({
  ssr: false,
  component: () => (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground"><div className="text-center"><div className="text-sm font-medium">Cátedra Digital</div><div className="mt-2 text-xs text-muted-foreground">Carregando…</div></div></div>}>
      <App />
    </Suspense>
  ),
});
