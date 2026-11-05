import { pathToFileURL } from 'node:url';

const domain = 'cathedradigital.com.br';
const worker = 'cathedradigital';
const origins = [
  `https://${domain}`,
  `https://www.${domain}`,
  `https://${worker}.${worker}.workers.dev`,
];

async function snippet(response, limit = 16_384) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  try {
    while (text.length < limit) {
      const part = await reader.read();
      if (part.done) break;
      text += decoder.decode(part.value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return text.slice(0, limit);
}

async function probe(url, request) {
  let current = new URL(url);
  try {
    for (let hop = 0; hop < 5; hop++) {
      // This client never receives the Cloudflare API token.
      const response = await request(current.href, {
        method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(15_000),
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location) {
          const next = new URL(location, current);
          if (!origins.includes(next.origin) || next.username || next.password || !['/', '/auth'].includes(next.pathname) || next.search) {
            await response.body?.cancel();
            return { url, status: response.status, kind: 'unexpected-redirect' };
          }
          await response.body?.cancel();
          current = next;
          continue;
        }
      }
      const body = await snippet(response);
      const error = body.match(/error\s*(?:code)?\s*[:\-]?\s*(1\d{3}|52\d|530)\b/i)?.[1];
      const kind = response.headers.get('cf-mitigated') === 'challenge'
        ? 'cloudflare-challenge'
        : error ? `cloudflare-error-${error}`
        : response.headers.get('x-vercel-error') ? 'vercel-error'
        : /text\/html/i.test(response.headers.get('content-type') ?? '') ? 'html' : 'other';
      return { url, status: response.status, kind, server: response.headers.get('server') };
    }
    return { url, status: null, kind: 'redirect-loop' };
  } catch {
    return { url, status: null, kind: 'network-or-tls-error' };
  }
}

function originClass(record) {
  const content = String(record.content ?? '').toLowerCase();
  if (content.includes('vercel-dns') || content.endsWith('.vercel.app') || ['76.76.21.21', '216.198.79.1', '64.29.17.1'].includes(content)) return 'vercel';
  if (content.endsWith('.workers.dev') || content === '100::') return 'workers';
  if (content.startsWith('192.0.2.')) return 'placeholder';
  return 'other-origin';
}

export async function diagnoseProduction({
  token = process.env.CLOUDFLARE_API_TOKEN,
  accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
  request = globalThis.fetch,
} = {}) {
  const errors = [];
  async function cf(path, label, format = 'json') {
    let response;
    try {
      response = await request(`https://api.cloudflare.com/client/v4/${path}`, {
        method: 'GET', redirect: 'error',
        headers: { authorization: `Bearer ${token}`, accept: format === 'source-hosts' ? '*/*' : 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (format === 'source-hosts' && response.ok) {
        // Keep source and bindings private; report public project hostnames only.
        const source = await snippet(response, 2 * 1024 * 1024);
        return [...new Set(source.match(/\b[a-z0-9]{20}\.supabase\.co\b/gi) ?? [])].map(host => host.toLowerCase()).sort().slice(0, 20);
      }
      const body = await response.json();
      if (!response.ok || body.success !== true) {
        // Never print raw API error messages: they can reflect request data.
        errors.push({ resource: label, http: response.status, codes: (body.errors ?? []).map(error => error.code).filter(Number.isFinite) });
        return null;
      }
      return body.result;
    } catch {
      errors.push({ resource: label, http: response?.status ?? null, codes: [] });
      return null;
    }
  }

  const publicPromise = Promise.all(origins.flatMap(origin => ['/', '/auth'].map(path => probe(origin + path, request))));
  const cloudflare = { errors };
  if (token && /^[a-f\d]{32}$/i.test(accountId ?? '')) {
    const [bindings, subdomain, zones, settings, sourceHosts] = await Promise.all([
      cf(`accounts/${accountId}/workers/domains?zone_name=${domain}`, 'worker-domains'),
      cf(`accounts/${accountId}/workers/scripts/${worker}/subdomain`, 'worker-subdomain'),
      cf(`zones?name=${domain}&account.id=${accountId}`, 'zone'),
      cf(`accounts/${accountId}/workers/scripts/${worker}/settings`, 'worker-public-config'),
      cf(`accounts/${accountId}/workers/scripts/${worker}/content/v2`, 'worker-public-project-hosts', 'source-hosts'),
    ]);
    cloudflare.bindings = Array.isArray(bindings) ? bindings
      .filter(binding => [domain, `www.${domain}`].includes(binding.hostname))
      .map(binding => ({ hostname: binding.hostname, intendedWorker: binding.service === worker, enabled: binding.enabled })) : null;
    cloudflare.workersDevEnabled = subdomain?.enabled ?? null;
    cloudflare.runtimePublicSupabaseHosts = Array.isArray(settings?.bindings) ? [...new Set(settings.bindings
      .filter(binding => binding.type === 'plain_text' && ['SUPABASE_URL', 'VITE_SUPABASE_URL'].includes(binding.name))
      .flatMap(binding => {
        try {
          const parsed = new URL(binding.text);
          return parsed.protocol === 'https:' && /^[a-z0-9]{20}\.supabase\.co$/i.test(parsed.hostname) ? [parsed.hostname] : [];
        } catch { return []; }
      }))].sort() : null;
    cloudflare.sourcePublicSupabaseHosts = Array.isArray(sourceHosts) ? sourceHosts : null;
    const matchingZones = Array.isArray(zones) ? zones.filter(zone => zone.name === domain) : [];
    if (matchingZones.length === 1 && /^[a-f\d]{32}$/i.test(matchingZones[0].id)) {
      const zone = matchingZones[0];
      cloudflare.zone = { name: zone.name, status: zone.status, paused: zone.paused };
      const [recordGroups, routes, security, bots, firewall] = await Promise.all([
        Promise.all([domain, `www.${domain}`].flatMap(name => ['A', 'AAAA', 'CNAME'].map(type =>
          cf(`zones/${zone.id}/dns_records?name=${name}&type=${type}&per_page=100`, `dns-${name}-${type}`)))),
        cf(`zones/${zone.id}/workers/routes`, 'worker-routes'),
        cf(`zones/${zone.id}/settings/security_level`, 'zone-security-level'),
        cf(`zones/${zone.id}/bot_management`, 'bot-management'),
        cf(`zones/${zone.id}/rulesets/phases/http_request_firewall_custom/entrypoint`, 'custom-firewall-rules'),
      ]);
      const records = recordGroups.every(Array.isArray) ? recordGroups.flat() : null;
      // Reveal classifications only; proxied DNS records can hide a private origin.
      cloudflare.records = Array.isArray(records) ? records
        .filter(record => [domain, `www.${domain}`].includes(record.name) && ['A', 'AAAA', 'CNAME'].includes(record.type))
        .map(record => ({ name: record.name, type: record.type, proxied: record.proxied, originClass: originClass(record) })) : null;
      cloudflare.routes = Array.isArray(routes) ? routes
        .filter(route => String(route.pattern).includes(domain))
        .map(route => ({ pattern: route.pattern, intendedWorker: route.script === worker, excludesWorkers: !route.script })) : null;
      cloudflare.securityLevel = ['under_attack', 'high', 'medium', 'low', 'essentially_off', 'off'].includes(security?.value) ? security.value : null;
      cloudflare.botFightMode = typeof bots?.fight_mode === 'boolean' ? bots.fight_mode : null;
      cloudflare.jsDetection = typeof bots?.enable_js === 'boolean' ? bots.enable_js : null;
      cloudflare.customFirewallRules = Array.isArray(firewall?.rules) ? firewall.rules.map(rule => ({
        enabled: rule.enabled !== false,
        action: ['skip', 'block', 'managed_challenge', 'js_challenge', 'challenge', 'execute', 'log'].includes(rule.action) ? rule.action : 'other',
        // Rule expressions may contain private addresses or header values.
        scope: ['true', '(true)'].includes(String(rule.expression).trim().toLowerCase()) ? 'entire-zone' : 'conditional',
      })) : null;
    }
  } else {
    errors.push({ resource: 'cloudflare-config-missing-or-invalid', http: null, codes: [] });
  }
  const publicResults = await publicPromise;
  return {
    observedAt: new Date().toISOString(),
    publicHealthy: publicResults.every(result => result.status === 200 && result.kind === 'html'),
    public: publicResults,
    cloudflare,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await diagnoseProduction();
  console.log('[production-diagnostics] ' + JSON.stringify(report));
  if (!report.publicHealthy) process.exitCode = 1;
}
