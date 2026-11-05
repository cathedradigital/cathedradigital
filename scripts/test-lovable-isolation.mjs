import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

const source = readFileSync(new URL('../src/lib/lovable-error-reporting.ts', import.meta.url), 'utf8');
function load(production, window) {
  const js = stripTypeScriptTypes(source.replaceAll('import.meta.env.PROD', String(production))).replace('export function reportLovableError', 'exports.reportLovableError = function reportLovableError');
  const context = { exports: {}, window, Response, Error };
  vm.runInNewContext(js, context);
  return context.exports.reportLovableError;
}
let calls = 0;
const window = {
  location: { pathname: '/auth' },
  __lovableEvents: { captureException() { calls++; } },
  __lovableReportRuntimeError() { calls++; },
};
load(true, window)(new Error('private error'));
assert.equal(calls, 0, 'Production must not forward errors to Lovable hooks');
load(false, window)(new Error('preview error'));
assert.equal(calls, 2, 'Development preview reporting remains available');
load(true, undefined)(new Error('SSR error'));
load(false, undefined)(new Error('SSR development error'));
load(false, { location: { pathname: '/' } })(new Error('No preview hooks'));
console.log('Lovable isolation: production disabled, preview preserved, SSR safe.');
