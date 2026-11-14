import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};
type EdgeCache = {
  match: (request: Request) => Promise<Response | undefined>;
  put: (request: Request, response: Response) => Promise<void>;
};
type WorkerExecutionContext = {
  waitUntil?: (promise: Promise<unknown>) => void;
};

// Incrementar a versão após uma publicação editorial do Glossário.
// Isso cria um namespace novo sem depender de purge global do Cloudflare.
const GLOSSARY_CACHE_NAMESPACE = "v1";

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function healthResponse(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== "/__health") return null;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD", "cache-control": "no-store" },
    });
  }

  return new Response(request.method === "HEAD" ? null : JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function withAssetCache(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const isVersionedAsset =
    request.method === "GET" &&
    url.pathname.startsWith("/assets/") &&
    /-[a-z0-9_-]{8,}\.(js|css|map|svg|png|jpg|jpeg|webp|avif|woff2?)$/i.test(
      url.pathname,
    );

  if (!isVersionedAsset || response.status !== 200) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const privateDocumentPrefixes = [
  "/admin",
  "/auth",
  "/login",
  "/conta",
  "/profile",
  "/settings",
  "/diario",
  "/community",
  "/favorites",
  "/achievements",
  "/onboarding",
  "/spiritual-profile",
];

function withPublicDocumentCache(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const contentType = response.headers.get("content-type") ?? "";
  const isPublicAnonymousDocument =
    (request.method === "GET" || request.method === "HEAD") &&
    response.status === 200 &&
    contentType.includes("text/html") &&
    !request.headers.has("authorization") &&
    !request.headers.has("cookie") &&
    !privateDocumentPrefixes.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));

  if (!isPublicAnonymousDocument) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  headers.set("Vary", "Accept-Encoding, Cookie, Authorization");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function edgeCacheKey(request: Request): Request | null {
  const url = new URL(request.url);
  const isAnonymousRequest =
    (request.method === "GET" || request.method === "HEAD") &&
    !request.headers.has("authorization") &&
    !request.headers.has("cookie");
  if (!isAnonymousRequest) return null;

  const isGlossaryRoute =
    url.pathname === "/glossario" ||
    url.pathname.startsWith("/glossario/");
  const isAllowlisted =
    url.pathname === "/dogmas" ||
    url.pathname === "/aparicoes" ||
    url.pathname === "/about" ||
    url.pathname === "/docs" ||
    url.pathname.startsWith("/docs/") ||
    isGlossaryRoute;
  if (!isAllowlisted) return null;

  // Os filtros de Dogmas/Aparições, a busca/idioma de Docs e os filtros da
  // listagem do Glossário são client-side; não devem fragmentar o documento SSR.
  const cachePath = isGlossaryRoute
    ? `/__cache/glossary/${GLOSSARY_CACHE_NAMESPACE}${url.pathname}`
    : url.pathname;
  return new Request(`${url.origin}${cachePath}`, { method: "GET" });
}

function getEdgeCache(): EdgeCache | null {
  const runtime = globalThis as typeof globalThis & {
    caches?: { default?: EdgeCache };
  };
  return runtime.caches?.default ?? null;
}

function withAllowlistedDocumentCache(request: Request, response: Response): Response {
  if (!edgeCacheKey(request) || response.status !== 200) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400");
  headers.set("Vary", "Accept-Encoding");
  if (new URL(request.url).pathname === "/glossario" || new URL(request.url).pathname.startsWith("/glossario/")) {
    headers.set("X-Cathedra-Cache-Namespace", `glossary:${GLOSSARY_CACHE_NAMESPACE}`);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const health = healthResponse(request);
      if (health) return health;

      const cacheKey = edgeCacheKey(request);
      const edgeCache = cacheKey ? getEdgeCache() : null;
      if (cacheKey && edgeCache) {
        const cached = await edgeCache.match(cacheKey);
        if (cached) {
          if (request.method === "HEAD") return new Response(null, cached);
          return cached;
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      const publicResponse = withPublicDocumentCache(request, withAssetCache(request, normalizedResponse));
      const allowlistedResponse = withAllowlistedDocumentCache(request, publicResponse);
      if (cacheKey && edgeCache && allowlistedResponse.status === 200) {
        const executionContext = ctx as WorkerExecutionContext;
        const cacheWrite = edgeCache.put(cacheKey, allowlistedResponse.clone()).catch((error) => {
          console.error("Allowlisted edge cache write failed", error);
        });
        if (executionContext.waitUntil) executionContext.waitUntil(cacheWrite);
        else await cacheWrite;
      }
      return allowlistedResponse;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
