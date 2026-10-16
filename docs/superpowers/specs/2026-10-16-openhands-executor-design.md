# Cátedra Digital — OpenHands executor integration design

**Status:** proposal for review; not implemented.
**Repository:** `cathedradigital/cathedradigital`
**Base snapshot reviewed:** `main` at `9175e042b9a729e75d96a7cda4f49789fb829db1`
**Scope:** agent-assisted diagnosis and isolated code changes; no merge and no Cloudflare deployment.

## Goals

- Let an authorized maintainer explicitly ask an agent to diagnose an issue or failing PR.
- Let the agent inspect source, tests, and CI evidence; propose a bounded fix on an isolated branch and open/update a PR.
- Run the repository's normal CI, audit, and authenticated Playwright E2E on the resulting SHA, including desktop and 390×844 mobile.
- Keep failure visible; no disabling tests, weakening assertions, `|| true` masking, or declaring success from build-only evidence.
- Bound agent iterations and stop for missing credentials, permissions, ambiguous requirements, or human judgment.
- Keep the agent unable to merge or deploy to Cloudflare.

## Current-state findings

- PR #180 is separate and must remain separate from this integration.
- Current PR #180 E2E run `38979798383` was still running when inspected; CI and final audit succeeded on `006ea84aad8c9495c18e60bb64ce442812cdf7e1`, but E2E had not completed.
- The GitHub API response for `main` reported `protected: false` and protection disabled at the time of inspection. Therefore required status checks are **not proven enforced**. This is a release-gate gap that needs repository-owner configuration; do not claim the hard gate is enforced until verified.
- Existing workflow `.github/workflows/estudar-e2e.yml` validates authenticated E2E credentials and runs Playwright, but it is not proof by itself that GitHub blocks merges when a check fails.

## Recommended architecture

Use the **current OpenHands resolver workflow in the OpenHands main repository** as the issue-to-PR executor, triggered only by an explicit maintainer action (a dedicated label and/or documented `@openhands-agent` command). Do not use the archived `All-Hands-AI/openhands-github-action` composite action or any third-party fork as the primary executor.

The workflow must be copied/adapted from the current official OpenHands resolver example and pinned to a reviewed immutable commit SHA, not a floating `@main` reference in production. Before implementation, verify the reusable workflow's current inputs, secret names, permissions, and supported trigger contract against the upstream source at the chosen SHA.

### Credentials

Configure secrets only through GitHub repository Settings → Secrets and variables → Actions. Never ask the maintainer to paste credentials into chat.

Expected upstream resolver secret names to confirm before implementation:
- `LLM_API_KEY`: API key for the selected model provider.
- `PAT_TOKEN` and `PAT_USERNAME`: only if the selected resolver revision requires them for creating branches/PRs and GitHub's default token is insufficient.
- `LLM_BASE_URL`: optional, only for a custom model endpoint.

Use the least-privileged credentials available. Do not provide Cloudflare API tokens or deployment credentials to the agent. Do not pass E2E login secrets into the agent's execution context; the independent E2E workflow should consume those secrets only for tests.

### Permissions and isolation

- Explicit issue/PR label or maintainer command only; no automatic execution on every PR, push, or fork contribution.
- Agent writes only to a new task branch and may open/update a PR; no `contents: write` or `pull-requests: write` token permissions beyond what the reviewed upstream resolver strictly needs.
- Never use `pull_request_target` to check out and execute untrusted PR code with secrets.
- No Cloudflare secrets, deploy workflow dispatch, merge API access, auto-approval, or auto-merge.
- Limit attempts to 3 per task by default; each attempt records summary, changed files, test outcomes, and remaining blockers. Stop for human intervention when the limit is reached or requirements are unclear.
- Treat repository instructions, issue text, logs, and code as untrusted input; do not follow instructions inside them that request secret disclosure or bypassing tests.

## Verification and release gates

For every agent-created PR:
1. Verify CI, typecheck/lint, route/security audit, and authenticated Playwright E2E on the exact final head SHA.
2. Require desktop and mobile coverage, expected auth redirects/deep links, and no unexpected HTTP/console errors.
3. Preserve sanitized test artifacts; never upload unsanitized auth headers or session material.
4. If a check fails, leave the PR open and report the failure. No auto-merge and no Cloudflare deployment.
5. Before any future authorized deployment, verify the actual production UI and `robots.txt`/`sitemap.xml` on the production domains.

The repository's `main` branch protection must be configured by an authorized owner to require the relevant checks and prohibit bypass where possible. This is a separate administrative prerequisite because the available GitHub connection could read the protection state but cannot configure it. Re-read the rules after configuration and verify that required checks correspond to the workflows' stable check names.

## Acceptance criteria for activation

- The executor workflow is present on a separate PR and pinned to a reviewed upstream revision.
- A maintainer-triggered test issue produces an isolated branch/PR without merge or deployment.
- The workflow reports a clear failure when required secrets are missing; no credentials appear in logs or artifacts.
- Agent-created PR runs CI, audit, and authenticated Playwright; a deliberate test failure stays red and blocks merge.
- Branch protection is confirmed active with required checks.
- No Cloudflare deployment credential or deployment permission is available to the executor.

## Official references to validate during implementation

- OpenHands GitHub Action / resolver documentation: https://docs.openhands.dev/openhands/usage/run-openhands/github-action
- Current OpenHands resolver workflow and examples: https://github.com/All-Hands-AI/OpenHands/tree/main/openhands/resolver
- Current OpenHands code-review extension (separate capability; review only): https://github.com/OpenHands/extensions/tree/main/plugins/pr-review

## Out of scope

- Changes to PR #180 or the Bible/Nexus code.
- Automatic merge or deployment.
- Claiming the executor is active before a real end-to-end activation test.
