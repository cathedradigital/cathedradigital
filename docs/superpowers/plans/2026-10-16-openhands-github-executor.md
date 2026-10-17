# OpenHands GitHub Executor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a maintainer-triggered coding agent for Cátedra Digital that proposes isolated PRs and proves changes through the existing CI, audit, and authenticated E2E workflows without merge or deploy access.

**Architecture:** First verify a currently maintained OpenHands Agent Canvas/SDK or official automation contract. Do not add a GitHub workflow until the runtime, inputs, permissions, and supported trigger are proven from upstream source. Trigger explicitly; keep agent credentials separate from E2E credentials and all Cloudflare secrets. The agent can propose changes but cannot merge or deploy.

**Tech Stack:** GitHub Actions, a verified maintained OpenHands integration if available, existing Node/Playwright CI.

**Spec:** `docs/superpowers/specs/2026-10-16-openhands-executor-design.md`

## Global Constraints

- Do not modify PR #180 or Bible/Nexus application code as part of executor integration.
- No merge, auto-merge, or Cloudflare deployment by the agent.
- No Cloudflare tokens or authenticated E2E credentials in the agent job.
- Maximum 3 agent iterations; stop on missing secrets, permission errors, ambiguous requirements, or exhausted attempts.
- Do not disable tests, weaken assertions, mask errors, or claim activation without a real run.
- Do not use `pull_request_target` to execute untrusted PR code with secrets.
- Pin third-party actions/reusable workflows to reviewed immutable SHAs.
- `main` currently has no active branch protection; the repository owner must configure and verify required checks.

## Review Focus

- Missing model/GitHub credentials must fail closed with a clear message and no secret output.
- Untrusted issue/PR text must not be treated as instructions to reveal secrets or bypass tests.
- A failed E2E run must leave the PR open and visibly failing.
- A workflow rerun must not create duplicate branches or PRs without checking existing task state.
- A fork-origin PR must not gain access to repository secrets.

---

### Task 1: Verify upstream executor contract

**Files:**
- Read: official OpenHands resolver workflow and README at the exact current upstream revision.
- Create: `.github/workflows/openhands-resolver.yml` only after upstream contract is verified.

- [ ] Identify the current official repository and workflow path; confirm current inputs, secret names, permissions, and trigger behavior from source, not a copied old example.
- [ ] Resolve the upstream revision to a full commit SHA and record it in comments/docs.
- [ ] Reject the archived `openhands-github-action` and archived `openhands-resolver` repository as execution dependencies.
- [ ] If no currently maintained resolver workflow is verifiable, stop and use the current OpenHands SDK/extension route only after reviewing its official example.

### Task 2: Add explicit trigger and least privilege

**Files:**
- Create: `.github/workflows/openhands-resolver.yml`
- Modify: `.openhands_instructions` only if an existing project-specific instruction file is present and verified.

- [ ] Trigger only on an explicit maintainer-controlled label or documented command; do not run on every push/PR.
- [ ] Give the agent only the permissions required to create a task branch and PR; no deployments, environment secrets, merge permissions, or auto-merge.
- [ ] Set a default maximum of 3 iterations using the supported resolver input/variable.
- [ ] Use a dedicated task branch and make repeated invocations idempotent where the upstream executor supports it.
- [ ] Add instructions forbidding test weakening, secret access, merges, deploys, and changes outside the assigned task.
- [ ] Validate YAML and review the resulting workflow diff for secret exposure and event-trigger risks.

### Task 3: Keep test credentials and publication gates isolated

**Files:**
- Read: `.github/workflows/estudar-e2e.yml` and existing CI/audit workflow files.
- Modify: only if a concrete integration defect is found; otherwise no changes.

- [ ] Confirm the agent job cannot access `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, or Cloudflare credentials.
- [ ] Confirm agent-created PRs trigger the existing CI, audit, and authenticated Playwright workflows.
- [ ] Confirm E2E artifacts are sanitized before upload and failures are not swallowed.
- [ ] Record stable required check names for the branch protection configuration.

### Task 4: Prepare activation proof and operator instructions

**Files:**
- Create: `docs/operations/openhands-executor.md`

- [ ] Document the explicit trigger, supported model configuration, secret names confirmed from the pinned source, max attempts, and failure behavior.
- [ ] Give repository-owner instructions to add secrets through GitHub Settings → Secrets and variables → Actions; never request secrets in chat.
- [ ] Run a harmless test issue through the actual executor and verify an isolated branch/PR is created without merge/deploy.
- [ ] Verify CI, audit, and authenticated E2E run on the generated PR; capture sanitized evidence.
- [ ] Re-read branch protection/ruleset and verify required checks are enforced. If the available connection cannot configure it, report the precise owner action as a remaining external blocker.

### Task 5: Final verification

- [ ] Validate the final workflow diff and upstream pin.
- [ ] Confirm test run IDs and exact commit SHA; distinguish passed, failed, and not-yet-run checks.
- [ ] Confirm no merge/deploy occurred.
- [ ] Keep PR draft/open until activation evidence and branch protection are verified.
