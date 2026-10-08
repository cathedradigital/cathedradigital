import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

const App = lazy(() => import("@/App"));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "CATHEDRA Digital — Bíblia, Catecismo e Oração" },
      { name: "description", content: "Leia a Bíblia, estude o Catecismo, reze o terço e cresça na fé com a CATHEDRA Digital: sua plataforma católica completa." },
      { property: "og:title", content: "CATHEDRA Digital — Bíblia, Catecismo e Oração" },
      { property: "og:description", content: "Leia a Bíblia, estude o Catecismo, reze o terço e cresça na fé com a CATHEDRA Digital: sua plataforma católica completa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground"><div className="text-center"><div className="text-sm font-medium">CATHEDRA Digital</div><div className="mt-2 text-xs text-muted-foreground">Carregando…</div></div></div>}>
      <App />
    </Suspense>
  ),
});
