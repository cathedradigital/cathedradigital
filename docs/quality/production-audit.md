# Production Audit — Cathedra Digital

> **Historical report — superseded on 5 November 2026.** The findings below describe an earlier revision and must not be treated as current release blockers. The repository now installs with Bun 1.3.0 and `bun.lock`, and includes public and authenticated Playwright suites. On PR #302, commit `2d354d3395d25112ffacf56810d8f9613a3d2d5a`, GitHub Actions confirmed installation, typecheck, lint and build ([CI](https://github.com/cathedradigital/cathedradigital/actions/runs/42060128312)), public desktop/mobile tests ([Estudar E2E](https://github.com/cathedradigital/cathedradigital/actions/runs/42060128487)), security boundaries and dependency audit. The authenticated job was skipped on the PR by design; the complete main-branch gates and production checks remain required for publication. These results do not establish the status of the live database, authentication providers or deployed version.

## Status

Audit started against `main`.

This document records verified findings from the repository and CI. It is intentionally conservative: an item is marked verified only when supported by repository evidence or a CI result.

## Critical blockers

### 1. CI cannot install the dependency tree

The latest GitHub Actions run fails during `npm ci`, before typecheck, lint, or build. The failure is caused by `package.json` and `package-lock.json` being out of sync, including mismatched `@emnapi/wasi-threads` entries and missing `@emnapi/core` / `@emnapi/runtime` lock entries.

Required remediation:

1. Regenerate `package-lock.json` from the current `package.json` with `npm install --package-lock-only`.
2. Run `npm ci` locally.
3. Commit the regenerated lockfile.
4. Re-run CI.

Do not use `--force` or `--legacy-peer-deps` to hide the mismatch.

### 2. Production readiness is not yet verified

Because dependency installation currently fails in CI, typecheck, lint, tests and production build have not been proven on the current `main` revision.

The repository must not be described as production-ready until these checks pass.

## High priority findings

### 3. Test automation is incomplete

`package.json` currently exposes `dev`, `build`, `build:dev`, `preview`, `lint`, `typecheck` and `format`, but no `test` script. Repository code search also did not find conventional `.test.ts` or `.test.tsx` test files. CI therefore cannot satisfy the intended requirement of running automated tests yet.

Required remediation:

- introduce a supported test runner;
- add focused tests for authentication, authorization, critical routes and data access;
- add `npm test` to CI after the test suite exists.

### 4. Supabase authorization has multiple role mechanisms

The migrations contain both `public.has_role(...)` and `auth_internal.has_role(...)` implementations. The database also contains a `user_roles` table while older security functions reference role information on `profiles`/JWT metadata.

This must be consolidated and tested before declaring authorization stable. The intended source of truth should be explicit, and every privileged policy should use the same mechanism.

### 5. Service-role access exists and must remain server-only

`src/integrations/supabase/client.server.ts` creates a Supabase client using `SUPABASE_SERVICE_ROLE_KEY` and explicitly bypasses RLS. This is acceptable only in trusted server-side code. Every import/use of this module must be audited to ensure it cannot enter a browser bundle or an untrusted route.

## Medium priority findings

### 6. Deployment documentation is stale/inconsistent

`DEPLOYMENT.md` contains Cloudflare-first deployment instructions while the requested production target is Vercel. It also contains an old troubleshooting recommendation to use `npm install --legacy-peer-deps`, which conflicts with the current dependency-hardening policy.

The deployment guide should be rewritten around the actual production provider and should never recommend bypassing peer-dependency validation as the normal fix.

### 7. Vercel connection is not verifiable from the repository alone

No `vercel.json` is present. A repository file cannot prove whether the GitHub repository is connected to a Vercel project. The Vercel dashboard/project settings must be checked separately.

## Security actions already implemented

- `.env` is ignored by Git.
- `.env.example` has been added with variable names only and no credentials.
- No secret values are included in this audit document.

## Current CI result

Latest verified run: `Node.js CI` run `34082917483`.

Result: **FAIL** at `Install dependencies`.

Typecheck, lint and build were skipped because installation failed.

## Definition of done for production

- dependency lockfile synchronized;
- `npm ci` passes;
- typecheck passes;
- lint passes;
- automated tests pass;
- production build passes;
- RLS/authorization tests pass;
- service-role usage is server-only;
- environment variables are configured without secrets in Git;
- Vercel integration is verified;
- production deployment is smoke-tested.
