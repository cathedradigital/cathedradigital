// @lovable.dev/vite-tanstack-config already includes TanStack Start, React,
// Tailwind, path aliases and the Cloudflare build integration.
// Do not register @cloudflare/vite-plugin a second time: the wrapper owns it.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Keep the SSR error wrapper as the generated server entry.
    server: { entry: "server" },
  },
});
