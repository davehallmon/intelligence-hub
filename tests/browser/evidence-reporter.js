import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwrightVersion = require("@playwright/test/package.json").version;

function repositorySha() {
  if (/^[0-9a-f]{40}$/i.test(process.env.GITHUB_SHA || "")) return process.env.GITHUB_SHA;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "unresolved";
  }
}

function sanitizeFailure(error) {
  const message = String(error?.message || error?.value || "")
    .replace(/([?&](?:token|api_key|key|secret)=)[^\s&]+/gi, "$1[REDACTED]")
    .replace(/Authorization:\s*[^\s]+/gi, "Authorization: [REDACTED]");
  return message.split("\n").slice(0, 8).join("\n").slice(0, 1800);
}

export default class EvidenceReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || "test-results/browser-evidence.json";
    this.startedAt = Date.now();
    this.cases = [];
  }

  onBegin(config) {
    this.config = config;
  }

  onTestEnd(test, result) {
    this.cases.push({
      caseId: test.title,
      project: test.parent?.project()?.name || "unknown",
      status: result.status,
      expectedStatus: result.expectedStatus,
      durationMs: result.duration,
      retry: result.retry,
      failures: (result.errors || []).map(sanitizeFailure).filter(Boolean)
    });
  }

  onEnd(result) {
    const endedAt = Date.now();
    const payload = {
      schemaVersion: "1.0.0",
      repositorySha: repositorySha(),
      fixtureVersion: this.config?.metadata?.fixtureVersion || "unresolved",
      harnessVersion: this.config?.metadata?.harnessVersion || "unresolved",
      playwrightVersion,
      browserEngine: "chromium",
      startedAt: new Date(this.startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      durationMs: endedAt - this.startedAt,
      finalStatus: result.status,
      cases: this.cases
    };

    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, `${JSON.stringify(payload, null, 2)}\n`);
  }
}
