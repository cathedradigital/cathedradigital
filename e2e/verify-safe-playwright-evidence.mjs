import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve("safe-playwright-evidence");
const reportPath = path.join(outputDir, "report.json");

function fail() {
  // Never include matching data in the CI log.
  console.error("[e2e-safe] Evidence validation failed; upload is blocked.");
  process.exit(1);
}

if (!fs.existsSync(reportPath)) fail();
const entries = fs.readdirSync(outputDir);
if (entries.length !== 1 || entries[0] !== "report.json") fail();

const raw = fs.readFileSync(reportPath, "utf8");
for (const secret of [process.env.E2E_TEST_EMAIL, process.env.E2E_TEST_PASSWORD]) {
  if (typeof secret === "string" && secret.length > 0 && raw.includes(secret)) fail();
}
if (/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/i.test(raw)) fail();
if (
  /\b(?:password|passwd|senha|token|secret|api[_-]?key|authorization)\s*["']?\s*[:=]\s*["']?(?!\[REDACTED(?:_EMAIL|_SECRET)?\])[^\s,"'&]+/i.test(
    raw,
  )
)
  fail();

let report;
try {
  report = JSON.parse(raw);
} catch {
  fail();
}
if (!Array.isArray(report.tests) || !report.counts || typeof report.runStatus !== "string") fail();

console.log(
  `[e2e-safe] Verified ${report.tests.length} test records; only report.json is eligible for upload.`,
);
