# Repository Tests

This directory contains development-time Node fixtures and structural checks. Tests are not production browser entry points.

Use `<responsibility>.test.js` names and import production modules from `js/`. The canonical command is:

```bash
npm run validate
```

Source validation does not replace deployed browser/device acceptance for rendering, interaction, responsive layout, or remote-feed transport.

## Browser acceptance

`tests/browser/` contains the dependency-pinned Playwright acceptance suite for the real static application. It uses deterministic intercepted RSS fixtures rather than mutable third-party feeds and runs in desktop and mobile Chromium projects.

Run:

```bash
npm ci
npx playwright install chromium
npm run test:browser
```

`npm run test:browser:negative-control` proves that a deliberately failing browser assertion produces a blocking non-zero Playwright result. The wrapper passes only when that exact assertion executed and failed; a missing browser or undiscovered test is inconclusive and fails the wrapper.

Browser reports and failure traces are written beneath ignored `test-results/`. GitHub Actions preserves them as a SHA-specific artifact. Fixtures and committed traces must never contain real credentials or private feed locators.
