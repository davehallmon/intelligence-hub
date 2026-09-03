import { defineConfig } from "@playwright/test";

const CI = Boolean(process.env.CI);
const evidenceOutput = process.env.PIERVIEW_BROWSER_EVIDENCE_FILE || "test-results/browser-evidence.json";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.browser.test.js",
  testIgnore: process.env.PIERVIEW_NEGATIVE_CONTROL === "1"
    ? []
    : "**/negative-control.browser.test.js",
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: CI,
  outputDir: "test-results/artifacts",
  reporter: [
    ["line"],
    ["./tests/browser/evidence-reporter.js", { outputFile: evidenceOutput }]
  ],
  metadata: {
    fixtureVersion: "pre-v10-m10-browser-fixtures-v3",
    harnessVersion: "pre-v10-m10-browser-harness-v6"
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { viewport: { width: 1280, height: 900 } }
    },
    {
      name: "mobile-chromium",
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true
      }
    }
  ],
  webServer: {
    command: "node scripts/serve-static.mjs",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: !CI,
    timeout: 20_000
  }
});
