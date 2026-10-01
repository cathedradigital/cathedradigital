// @lovable.dev/vite-tanstack-config already includes TanStack Start, React,
// Tailwind, path aliases and the Cloudflare build integration.
// Do not register @cloudflare/vite-plugin a second time: duplicate plugin
// registration can make the Cloudflare Workers build fail.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Use the project's SSR error wrapper as the server entry.
    server: { entry: "server" },
  },
});
