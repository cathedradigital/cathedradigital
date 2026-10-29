import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const approvedProjectHost = "gpwrpmoniglarqwfyryp.supabase.co";
const configuredUrl = process.env.VITE_SUPABASE_URL ?? "";
assert(configuredUrl, "VITE_SUPABASE_URL must be set before build-host verification");

let configuredHost;
try {
  const parsed = new URL(configuredUrl);
  assert.equal(parsed.protocol, "https:", "Supabase URL must use HTTPS");
  assert.match(parsed.hostname, /^[a-z0-9-]+\.supabase\.co$/, "VITE_SUPABASE_URL must be a Supabase project URL");
  configuredHost = parsed.hostname.toLowerCase();
} catch (error) {
  console.error("[supabase-build-host] Configured URL is invalid; URL and key values are never printed.");
  throw error;
}

const dist = path.resolve("dist");
assert(fs.existsSync(dist), "dist/ does not exist; run the production build first");

const assets = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(?:js|mjs|html)$/i.test(entry.name)) assets.push(absolute);
  }
}
walk(dist);

const foundHosts = new Set();
for (const file of assets) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/[a-z0-9-]+\.supabase\.co/gi)) {
    foundHosts.add(match[0].toLowerCase());
  }
}

const sortedHosts = [...foundHosts].sort();
const evidence = {
  check: "supabase_build_host",
  approvedProjectHost,
  configuredHost,
  configuredHostMatchesApprovedProject: configuredHost === approvedProjectHost,
  hostsFoundInBuild: sortedHosts,
  approvedProjectHostPresentInBuild: foundHosts.has(approvedProjectHost),
  configuredHostPresentInBuild: foundHosts.has(configuredHost),
  filesScanned: assets.length,
};

// Hostnames are the only endpoint detail emitted. Never print the URL, API key,
// request headers, or environment values beyond the parsed public hostname.
console.log("[supabase-build-host-evidence]", JSON.stringify(evidence));

assert.equal(
  configuredHost,
  approvedProjectHost,
  "VITE_SUPABASE_URL points to a different Supabase project than the approved project; inspect the host-only evidence above.",
);
assert(
  foundHosts.has(approvedProjectHost),
  "Approved Supabase project host was not found in the built assets. Check build-time environment precedence and publicConfig fallback.",
);
