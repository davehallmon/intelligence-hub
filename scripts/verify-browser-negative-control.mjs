import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "playwright",
    "test",
    "tests/browser/negative-control.browser.test.js",
    "--project=desktop-chromium",
    "--retries=0"
  ],
  {
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      PIERVIEW_NEGATIVE_CONTROL: "1",
      PIERVIEW_BROWSER_EVIDENCE_FILE: "test-results/browser-negative-control-evidence.json"
    }
  }
);

process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");

const output = `${result.stdout || ""}\n${result.stderr || ""}`;

if (result.status === 0) {
  console.error("False-success control failed: the deliberately failing browser case was reported as passing.");
  process.exit(1);
}

if (!output.includes("This assertion is intentionally false")) {
  console.error("False-success control was inconclusive: the expected deliberate assertion did not execute.");
  process.exit(1);
}

console.log("False-success control passed: the browser failure produced a blocking non-zero exit status.");
