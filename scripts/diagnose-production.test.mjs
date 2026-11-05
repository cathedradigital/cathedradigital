import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseProduction } from './diagnose-production.mjs';

const token = 'synthetic-token-must-never-be-logged';
const accountId = 'a'.repeat(32);
const hiddenOrigin = '203.0.113.99';
const domain = 'cathedradigital.com.br';

function fixture({ challenge = false, challengeStatus = 530, apiError = false, nonJsonApiError = false } = {}) {
  return async (input, options = {}) => {
    const url = new URL(input);
    assert.equal(options.method, 'GET', 'diagnostics must never mutate remote resources');
    if (url.hostname !== 'api.cloudflare.com') {
      assert.equal(new Headers(options.headers).has('authorization'), false, 'public probes must not receive credentials');
      if (challenge && url.hostname === domain) {
        return new Response('Error 1033', { status: challengeStatus, headers: { server: 'cloudflare' } });
      }
      return new Response('<html><title>Cathedra Digital</title><main>Cathedra</main></html>', {
        headers: { 'content-type': 'text/html' },
      });
    }
    assert.equal(new Headers(options.headers).get('authorization'), `Bearer ${token}`);
    assert.equal(options.redirect, 'error', 'credentials must not follow redirects');
    if (nonJsonApiError) return new Response('Upstream unavailable', { status: 503 });
    if (apiError) return Response.json({ success: false, errors: [{ code: 10000, message: token }] }, { status: 403 });
    let result;
    if (url.pathname.endsWith('/workers/domains')) {
      result = [{ hostname: domain, service: 'cathedradigital', enabled: true }];
    } else if (url.pathname.endsWith('/subdomain')) {
      result = { enabled: true };
    } else if (url.pathname.endsWith('/scripts/cathedradigital/settings')) {
      result = { bindings: [
        { name: 'SUPABASE_URL', type: 'plain_text', text: 'https://abcdefghijklmnopqrst.supabase.co' },
        { name: 'PRIVATE_CONFIG', type: 'plain_text', text: token },
      ] };
    } else if (url.pathname.endsWith('/content/v2')) {
      return new Response(`const endpoint = "https://abcdefghijklmnopqrst.supabase.co"; const privateValue = "${token}";`);
    } else if (url.pathname.endsWith('/zones')) {
      result = [{ id: 'b'.repeat(32), name: domain, status: 'active', paused: false }];
    } else if (url.pathname.endsWith('/dns_records')) {
      result = [
        { name: domain, type: 'A', content: hiddenOrigin, proxied: true },
        { name: `www.${domain}`, type: 'CNAME', content: 'cathedradigital.vercel.app', proxied: true },
      ].filter(record => (!url.searchParams.get('name') || record.name === url.searchParams.get('name'))
        && (!url.searchParams.get('type') || record.type === url.searchParams.get('type')));
    } else if (url.pathname.endsWith('/workers/routes')) {
      result = [{ pattern: `${domain}/*`, script: 'cathedradigital' }];
    } else if (url.pathname.endsWith('/settings/security_level')) {
      result = { value: 'under_attack' };
    } else if (url.pathname.endsWith('/bot_management')) {
      result = { fight_mode: true, enable_js: true };
    } else if (url.pathname.endsWith('/rulesets/phases/http_request_firewall_custom/entrypoint')) {
      result = { rules: [
        { action: 'managed_challenge', enabled: true, expression: 'true' },
        { action: 'block', enabled: false, expression: `ip.src eq ${hiddenOrigin}` },
      ] };
    } else {
      assert.fail(`Unexpected Cloudflare endpoint: ${url.pathname}`);
    }
    return Response.json({ success: true, result });
  };
}

test('read-only diagnostics isolate credentials and hide origin addresses', async () => {
  const dnsQueries = [];
  const base = fixture();
  const request = (input, options) => {
    const url = new URL(input);
    if (url.pathname.endsWith('/dns_records')) dnsQueries.push([url.searchParams.get('name'), url.searchParams.get('type')]);
    return base(input, options);
  };
  const report = await diagnoseProduction({ token, accountId, request });
  assert.equal(report.publicHealthy, true);
  assert.equal(report.public.length, 6);
  assert.equal(report.cloudflare.zone.status, 'active');
  assert.equal(report.cloudflare.bindings[0].intendedWorker, true);
  assert.deepEqual(report.cloudflare.runtimePublicSupabaseHosts, ['abcdefghijklmnopqrst.supabase.co']);
  assert.deepEqual(report.cloudflare.sourcePublicSupabaseHosts, ['abcdefghijklmnopqrst.supabase.co']);
  assert.equal(report.cloudflare.securityLevel, 'under_attack');
  assert.equal(report.cloudflare.botFightMode, true);
  assert.equal(report.cloudflare.customFirewallRules[0].scope, 'entire-zone');
  assert.equal(report.cloudflare.records[0].originClass, 'other-origin');
  assert.equal(report.cloudflare.records[1].originClass, 'vercel');
  assert.deepEqual(dnsQueries.sort(), [domain, `www.${domain}`].flatMap(name => ['A', 'AAAA', 'CNAME'].map(type => [name, type])).sort());
  const serialized = JSON.stringify(report);
  for (const value of [token, accountId, hiddenOrigin]) assert.equal(serialized.includes(value), false);
});

test('an error page with HTTP 200 is not reported as healthy', async () => {
  const report = await diagnoseProduction({ token, accountId, request: fixture({ challenge: true, challengeStatus: 200 }) });
  assert.equal(report.publicHealthy, false);
});

test('public redirects cannot expand the diagnostic to other paths or query strings', async () => {
  for (const location of ['/logout', '/auth?token=synthetic', 'https://unrelated.example/']) {
    const publicRequests = [];
    const base = fixture();
    const request = async (url, options) => {
      if (new URL(url).hostname !== 'api.cloudflare.com') publicRequests.push(url);
      if (url === `https://${domain}/`) return new Response(null, { status: 302, headers: { location } });
      return base(url, options);
    };
    const report = await diagnoseProduction({ token, accountId, request });
    assert.equal(report.publicHealthy, false);
    assert.equal(report.public[0].kind, 'unexpected-redirect');
    assert.equal(publicRequests.some(url => !['/', '/auth'].includes(new URL(url).pathname) || new URL(url).search), false);
    assert.equal(publicRequests.some(url => new URL(url).hostname === 'unrelated.example'), false);
  }
});

test('Cloudflare HTML error responses preserve their HTTP status without printing the body', async () => {
  const report = await diagnoseProduction({ token, accountId, request: fixture({ nonJsonApiError: true }) });
  assert.ok(report.cloudflare.errors.length > 0);
  assert.ok(report.cloudflare.errors.every(error => error.http === 503));
  assert.equal(JSON.stringify(report).includes('Upstream unavailable'), false);
});

test('public failures and Cloudflare permission errors stay visible without secret-bearing error bodies', async () => {
  const report = await diagnoseProduction({ token, accountId, request: fixture({ challenge: true, apiError: true }) });
  assert.equal(report.publicHealthy, false);
  assert.equal(report.public.find(item => item.url === `https://${domain}/`).kind, 'cloudflare-error-1033');
  assert.equal(report.cloudflare.errors[0].http, 403);
  assert.deepEqual(report.cloudflare.errors[0].codes, [10000]);
  assert.equal(JSON.stringify(report).includes(token), false);
});
