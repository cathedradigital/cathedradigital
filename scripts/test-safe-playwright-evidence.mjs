import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(repoRoot, "safe-playwright-evidence");
const reportPath = path.join(outputDir, "report.json");
const syntheticEmail = "synthetic.user@example.invalid";
const syntheticPassword = "SYNTHETIC-ONLY-password-9f3a";

process.env.E2E_TEST_EMAIL = syntheticEmail;
process.env.E2E_TEST_PASSWORD = syntheticPassword;

function verify() {
  return spawnSync(
    process.execPath,
    [path.join(repoRoot, "e2e/verify-safe-playwright-evidence.mjs")],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: process.env,
    },
  );
}

try {
  const { default: SafePlaywrightReporter } = await import("../e2e/safe-reporter.mjs");
  const reporter = new SafePlaywrightReporter();
  reporter.onBegin();
  reporter.onTestEnd(
    {
      title: "synthetic auth failure",
      titlePath: () => ["chromium", `login ${syntheticEmail}`],
      parent: { project: () => ({ name: "chromium" }) },
      location: { file: "e2e/synthetic.spec.ts", line: 1, column: 1 },
    },
    {
      status: "failed",
      duration: 12,
      retry: 0,
      error: {
        name: "AssertionError",
        message: `Failure for ${syntheticEmail}; password=${syntheticPassword}\nSensitive second line`,
      },
    },
  );
  reporter.onEnd({ status: "failed" });

  const safeReport = fs.readFileSync(reportPath, "utf8");
  assert(!safeReport.includes(syntheticEmail), "email must be redacted");
  assert(!safeReport.includes(syntheticPassword), "password must be redacted");
  assert(safeReport.includes("[REDACTED_EMAIL]"), "redaction marker must be present");
  assert(safeReport.includes("password=[REDACTED_SECRET]"), "secret marker must be present");
  assert(
    safeReport.includes("Sensitive second line"),
    "multiline error detail must remain inspectable",
  );

  let validation = verify();
  assert.equal(validation.status, 0, "sanitized report must pass validation");
  assert(!validation.stdout.includes(syntheticEmail), "validator stdout must not expose email");
  assert(
    !validation.stderr.includes(syntheticPassword),
    "validator stderr must not expose password",
  );

  fs.writeFileSync(
    reportPath,
    JSON.stringify({ email: syntheticEmail, password: syntheticPassword }),
  );
  validation = verify();
  assert.notEqual(validation.status, 0, "unsafe report must fail closed");
  assert(
    !validation.stdout.includes(syntheticEmail),
    "failed validation stdout must not expose email",
  );
  assert(
    !validation.stderr.includes(syntheticPassword),
    "failed validation stderr must not expose password",
  );

  console.log(
    "[e2e-safe-test] Synthetic redaction and fail-closed checks passed; no real credentials or browser were used.",
  );
} finally {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
