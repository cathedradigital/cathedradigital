// @ts-expect-error Bun provides this test module at runtime; it is not a production dependency.
import { describe, expect, it } from 'bun:test';
import { __testables__ } from './useLiturgyMeditation';

describe('useLiturgyMeditation backend failure classification', () => {
  it('classifies a missing table or Edge Function as backend unavailable', () => {
    expect(__testables__.inferCode(404)).toBe('backend_unavailable');
    expect(__testables__.inferCode(undefined, undefined, 'PGRST205')).toBe('backend_unavailable');
    expect(__testables__.inferCode(undefined, 'Requested function was not found', 'NOT_FOUND')).toBe(
      'backend_unavailable',
    );
  });

  it('classifies Edge Function fetch/relay errors as backend unavailable', () => {
    expect(__testables__.inferCode(undefined, 'Failed to send a request', undefined, 'FunctionsFetchError')).toBe(
      'backend_unavailable',
    );
    expect(__testables__.inferCode(undefined, 'Relay error', undefined, 'FunctionsRelayError')).toBe(
      'backend_unavailable',
    );
  });

  it('preserves distinct AI credit and rate-limit classifications', () => {
    expect(__testables__.inferCode(402)).toBe('ai_credits_exhausted');
    expect(__testables__.inferCode(429)).toBe('ai_rate_limited');
  });

  it('returns a backend-specific, non-technical message for missing functions', async () => {
    const failure = await __testables__.readInvokeFailure({
      name: 'FunctionsHttpError',
      context: new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'Requested function was not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      }),
    });

    expect(failure.code).toBe('backend_unavailable');
    expect(failure.message).toContain('serviço editorial');
    expect(failure.message).not.toContain('Requested function');
  });
});
