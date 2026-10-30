import fs from "node:fs";
import { load } from "js-yaml";

const workflowPath = ".github/workflows/estudar-e2e.yml";
const packagePath = "package.json";

function fail(message) {
  console.error(`[e2e-security] ${message}`);
  process.exit(1);
}

const workflow = load(fs.readFileSync(workflowPath, "utf8"));
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const triggers = workflow?.on;
const jobs = workflow?.jobs;
const publicJob = jobs?.["public-e2e"];
const authenticatedJob = jobs?.["authenticated-e2e"];

if (!triggers?.pull_request || !triggers?.push || !triggers?.workflow_dispatch) {
  fail("Expected pull_request, push, and workflow_dispatch triggers.");
}
if (Object.hasOwn(triggers, "pull_request_target")) {
  fail("pull_request_target must not be used for the credentialed E2E workflow.");
}
if (
  !triggers.pull_request.branches?.includes("main") ||
  !triggers.push.branches?.includes("main")
) {
  fail("PR and push E2E triggers must be restricted to main.");
}
if (
  triggers.workflow_dispatch.inputs?.run_authenticated?.type !== "boolean" ||
  triggers.workflow_dispatch.inputs.run_authenticated.default !== false
) {
  fail("Manual authenticated E2E must require an explicit boolean opt-in defaulting to false.");
}
if (!publicJob || !authenticatedJob)
  fail("Expected separate public-e2e and authenticated-e2e jobs.");

const publicJson = JSON.stringify(publicJob);
if (/E2E_TEST_(?:EMAIL|PASSWORD)|secrets\./.test(publicJson)) {
  fail("Public PR job must not reference E2E credentials or GitHub secrets.");
}
if (!String(publicJob.if ?? "").includes("pull_request")) {
  fail("Public job must execute for pull_request.");
}
const publicRuns = (publicJob.steps ?? []).map((step) => step.run ?? "").join("\n");
if (!publicRuns.includes("npm run test:e2e:public")) {
  fail("Public job must use the public Playwright script.");
}
if (/\bnpx\s+playwright\s+test\b/.test(publicRuns)) {
  fail("Public job must not execute the full Playwright suite.");
}
if (
  !/--project=chromium/.test(packageJson.scripts?.["test:e2e:public"] ?? "") ||
  !/--project=mobile-chrome/.test(packageJson.scripts?.["test:e2e:public"] ?? "")
) {
  fail("Public Playwright script must cover desktop and mobile-chrome projects.");
}

const authCondition = String(authenticatedJob.if ?? "");
const trustedReleasePr =
  authCondition.includes("github.event_name == 'pull_request'") &&
  authCondition.includes("github.event.pull_request.head.repo.full_name == github.repository") &&
  authCondition.includes("github.event.pull_request.head.ref == 'ops/manual-release-gates-403-evidence-20261030'");
const trustedMain =
  authCondition.includes("refs/heads/main") &&
  authCondition.includes("workflow_dispatch") &&
  authCondition.includes("inputs.run_authenticated") &&
  authCondition.includes("push");
if (!trustedMain || !trustedReleasePr) {
  fail("Authenticated job must require main for normal runs and the exact same-repository release branch for pre-merge validation.");
}
const authCheckout = (authenticatedJob.steps ?? []).find(
  (step) => step.name?.startsWith("Checkout trusted main"),
);
if (authCheckout?.with?.ref !== "${{ github.event.pull_request.head.sha || 'main' }}") {
  fail("Authenticated job must checkout the exact trusted release PR SHA, or main for post-merge runs.");
}
if (!(authenticatedJob.steps ?? []).some((step) => step.run === "npx playwright test")) {
  fail("Authenticated job must retain the complete Playwright suite.");
}

const secretReferences = [];
for (const [jobName, job] of Object.entries(jobs)) {
  for (const step of job.steps ?? []) {
    const content = JSON.stringify(step);
    if (/secrets\.E2E_TEST_(?:EMAIL|PASSWORD)/.test(content)) {
      secretReferences.push({ jobName, stepName: step.name ?? "" });
    }
  }
}
if (secretReferences.some(({ jobName }) => jobName !== "authenticated-e2e")) {
  fail("E2E credentials may be referenced only inside authenticated-e2e.");
}
const permittedCredentialSteps = new Set([
  "Check authenticated E2E secrets are configured",
  "Run complete authenticated Playwright suite",
  "Validate sanitized authenticated evidence",
]);
if (secretReferences.some(({ stepName }) => !permittedCredentialSteps.has(stepName))) {
  fail("E2E credentials are exposed to an unexpected authenticated-job step.");
}

console.log(
  "[e2e-security] Workflow isolation validated: public PR job has no secrets; authenticated suite is restricted to main or the exact trusted same-repository release PR SHA.",
);
