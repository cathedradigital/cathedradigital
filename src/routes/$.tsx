import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

const App = lazy(() => import("@/App"));

export const Route = createFileRoute("/$")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cathedra Digital — Estudo e vida espiritual" },
      { name: "description", content: "Explore os módulos de estudo, oração, formação e pesquisa da Cathedra Digital." },
      { property: "og:title", content: "Cathedra Digital — Estudo e vida espiritual" },
      { property: "og:description", content: "Explore os módulos de estudo, oração, formação e pesquisa da Cathedra Digital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground"><div className="text-center"><div className="text-sm font-medium">Cathedra Digital</div><div className="mt-2 text-xs text-muted-foreground">Carregando…</div></div></div>}>
      <App />
    </Suspense>
  ),
});
