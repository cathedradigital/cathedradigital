import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve("safe-playwright-evidence");

export function redactText(value) {
  let text = String(value ?? "");
  const secrets = [
    ["[REDACTED_EMAIL]", process.env.E2E_TEST_EMAIL],
    ["[REDACTED_SECRET]", process.env.E2E_TEST_PASSWORD],
  ].filter(([, secret]) => typeof secret === "string" && secret.length > 0);

  for (const [replacement, secret] of secrets) {
    text = text.split(secret).join(replacement);
  }

  text = text.replace(/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");
  text = text.replace(
    /((?:password|passwd|senha|token|secret|api[_-]?key|authorization)\s*["']?\s*[:=]\s*["']?)(?!\[REDACTED(?:_EMAIL|_SECRET)?\])[^\s,"'&]+/gi,
    "$1[REDACTED]",
  );
  text = text.replace(/([?&](?:email|password|senha|token|apikey)=)[^&#\s]*/gi, "$1[REDACTED]");
  text = text.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]");
  return text;
}

export default class SafePlaywrightReporter {
  constructor() {
    this.tests = [];
  }

  onBegin() {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });
    this.tests = [];
  }

  onTestEnd(test, result) {
    const titlePath = typeof test.titlePath === "function" ? test.titlePath() : [test.title];
    const project =
      typeof test.parent?.project === "function" ? test.parent.project()?.name : undefined;
    const rawMessage = result.error?.message ?? "";
    const safeErrorDetail = redactText(rawMessage).slice(0, 4000);

    const record = {
      title: redactText(titlePath.filter(Boolean).join(" › ")),
      project: redactText(project ?? titlePath[0] ?? "unknown"),
      file: path.relative(process.cwd(), test.location?.file ?? ""),
      line: test.location?.line ?? null,
      column: test.location?.column ?? null,
      status: result.status,
      durationMs: result.duration,
      retry: result.retry,
      error: result.error
        ? {
            name: redactText(result.error.name ?? "Error"),
            detail: safeErrorDetail,
          }
        : null,
    };

    this.tests.push(record);
    process.stdout.write(`[e2e-safe] ${record.status} ${record.project}: ${record.title}\n`);
  }

  onEnd(result) {
    const counts = {
      total: this.tests.length,
      passed: this.tests.filter((test) => test.status === "passed").length,
      failed: this.tests.filter((test) =>
        ["failed", "timedOut", "interrupted"].includes(test.status),
      ).length,
      skipped: this.tests.filter((test) => test.status === "skipped").length,
    };

    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      runStatus: result.status,
      counts,
      tests: this.tests,
    };

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, {
      mode: 0o600,
    });
    process.stdout.write(
      `[e2e-safe] run=${report.runStatus}; total=${counts.total}; passed=${counts.passed}; failed=${counts.failed}; skipped=${counts.skipped}\n`,
    );
  }
}
