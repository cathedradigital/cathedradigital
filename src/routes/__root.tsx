import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import cathedraLogo from "../assets/cathedra-logo.webp";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SEO_CONFIG } from "../config/seo";

function NotFoundComponent() {
  return (
    <main role="alert" aria-live="assertive" className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-light tracking-tight text-primary">404</h1>
        <h2 className="mt-4 font-display text-xl text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main role="alert" aria-live="assertive" className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-primary">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Algo interrompeu o carregamento. Você pode tentar novamente ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // The legacy Cathedra Digital application is a browser-only SPA. Keep the TanStack
  // Start HTML shell on the server, but never render the application tree in
  // the Cloudflare Worker. This prevents browser-only modules from executing
  // during Worker SSR while preserving client-side navigation.
  ssr: false,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cathedra Digital | Oração, estudo e formação católica" },
      {
        name: "description",
        content:
          "Uma plataforma católica para rezar, estudar a Bíblia, o Catecismo e o Magistério, acompanhar a liturgia e aprofundar a formação espiritual.",
      },
      { name: "author", content: "Cathedra Digital" },
      { property: "og:site_name", content: "Cathedra Digital" },
      { property: "og:image", content: SEO_CONFIG.DEFAULT_OG_IMAGE },
      { property: "og:image:alt", content: "Cathedra Digital — plataforma católica de oração, estudo e formação" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      {
        property: "og:title",
        content: "Cathedra Digital | Oração, estudo e formação católica",
      },
      {
        property: "og:description",
        content:
          "Bíblia, Catecismo, Magistério, liturgia, oração e formação espiritual em uma plataforma católica integrada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cathedra Digital | Oração, estudo e formação católica" },
      { name: "twitter:image", content: SEO_CONFIG.DEFAULT_OG_IMAGE },
      {
        name: "twitter:description",
        content:
          "Bíblia, Catecismo, Magistério, liturgia, oração e formação espiritual em uma plataforma católica integrada.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: cathedraLogo, type: "image/webp" },
      { rel: "apple-touch-icon", href: cathedraLogo },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <noscript>
          <main lang="pt-BR" aria-labelledby="cathedra-public-title">
            <header>
              <p>Cathedra Digital</p>
              <h1 id="cathedra-public-title">
                Oração, estudo e formação católica em um só lugar
              </h1>
              <p>
                A Cathedra Digital é uma plataforma católica que reúne recursos
                para a vida espiritual, o estudo da fé e a formação cristã.
                Consulte a Sagrada Escritura, o Catecismo da Igreja Católica,
                documentos do Magistério, liturgia, orações e vidas de santos,
                com conteúdos organizados para favorecer o aprofundamento e a
                continuidade da jornada espiritual.
              </p>
            </header>
            <nav aria-label="Principais áreas da Cathedra Digital">
              <ul>
                <li><a href="/bible">Bíblia Sagrada — leitura e estudo</a></li>
                <li><a href="/catechism">Catecismo da Igreja Católica</a></li>
                <li><a href="/magisterium">Documentos do Magistério da Igreja</a></li>
                <li><a href="/liturgia">Liturgia e calendário litúrgico</a></li>
                <li><a href="/oracao">Orações e devoções</a></li>
                <li><a href="/santos">Santos e testemunhos de vida cristã</a></li>
                <li><a href="/jornadas">Jornadas e itinerários de formação</a></li>
                <li><a href="/guia-modulos">Guia para conhecer os módulos</a></li>
                <li><a href="/about">Sobre a Cathedra Digital</a></li>
                <li><a href="/contato">Contato</a></li>
              </ul>
            </nav>
          </main>
        </noscript>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
