# Pre-V10-M10 — Deterministic Browser Harness

**Gate:** Issue #40

**Stable product milestone under test:** V10-M09 — Products & Platforms

**Base SHA:** `3fcdc371eab9580031b929cdb9608b2af624f574`

**Branch:** `test/pre-v10-m10-browser-harness`

**Status:** Candidate implementation; CI and post-deployment evidence must be attached before final dispositions

## Purpose

This package adds a dependency-pinned browser acceptance layer around the real static application. It does not introduce a production framework, backend, database, account system, or alternate ingestion path.

The suite serves `index.html` and the production modules from a local static server, runs Chromium through Playwright, and intercepts external feed requests with stable RSS fixtures. Deterministic acceptance therefore does not depend on current third-party content, remote CORS timing, or external feed availability.

## Browser-discovered corrections

The initial deployed read-only smoke exposed a state-integrity defect: Product cards could be visible while `#productsPlatformsFeed` still retained `data-state="loading"`, `aria-busy="true"`, and its loading label. The correction explicitly transitions the rendered populated state to `ready` and clears stale busy semantics.

The package also makes three narrow runtime corrections required for replayable acceptance:

- route selections use browser history entries so back/forward navigation restores prior lenses while initial hash normalization remains replace-only;
- the shared lens loader returns a bounded source-health summary, allowing a total source failure to render an actual Product error with Retry instead of a misleading empty success state.
- subordinate Launchpad state remains valid after a non-Launchpad reload, so keyboard entry into Bookmarks cannot partially update the DOM and then fail before recording history.

No Product identity, monitoring tier, source endpoint, ranking weight, or Focus behavior changes.

## Dependency and fixture identity

- `@playwright/test`: `1.62.1`, exact development dependency
- `@axe-core/playwright`: `4.13.0`, exact development dependency
- Browser engine: pinned Chromium revision installed by Playwright
- Harness version: `pre-v10-m10-browser-harness-v5`
- Fixture version: `pre-v10-m10-browser-fixtures-v3`
- Fixture file SHA-256: `41a0d2903abfeb297992015c050f3d5405346c819fa9c939abc3be8e87aee99e`

Real tokens, private URLs, and private content are prohibited from fixtures and persisted artifacts.

## Replayable cases

| Case | Observable behavior |
| --- | --- |
| BROWSER-01 | Production-shaped Gemini item normalizes, enters the shared store, reuses one reference across lenses, and renders provenance plus deterministic Product reason. |
| BROWSER-02 | Gemini constellation near miss is rejected; generic ChatGPT attribution remains available only through All matched items. |
| BROWSER-03 | A healthy zero-item fixture renders the Product empty state, not success cards or an error. |
| BROWSER-04 | Delayed feeds expose loading/busy semantics, then transition cleanly to ready. |
| BROWSER-05 | Total transport failure renders error + Retry; a subsequent healthy response recovers. |
| BROWSER-06 | Deep links, reload, history navigation, selected-tab state, and keyboard tab movement remain coherent without uncaught application errors. |
| BROWSER-07 | Saved persists through reload; passive scrolling does not mutate priority settings. |
| BROWSER-08 | A synthetic private bridge locator is requested directly, never sent to RSS2JSON, and never exposed in UI. |
| BROWSER-09 | Retrieved script/event-handler markup remains non-executable. |
| BROWSER-10 | The visible Product panel receives an automated WCAG A/AA scan. |
| BROWSER-11 | Mobile drawer navigation and the shared Product bottom-control handoff remain usable. |
| NEG-01 | An intentionally false browser assertion must produce a non-zero Playwright result; missing test/browser execution is inconclusive rather than a pass. |

## Commands and evidence

```bash
npm ci
npx playwright install chromium
npm run validate
npm run test:browser
npm run test:browser:negative-control
```

`npm run verify` composes repository validation and deterministic browser acceptance. GitHub Actions keeps `validate` and `browser` as separate jobs so browser failure remains visible and can be configured as a required check.

The custom reporter writes positive acceptance to `test-results/browser-evidence.json` with repository SHA, fixture/harness versions, Playwright/browser identity, case results, retry count, duration, final status, and sanitized failure summaries. The deliberate false assertion writes separately to `test-results/browser-negative-control-evidence.json`, so it cannot overwrite evidence of the positive matrix; retries are disabled for that intentionally failing case. An automatic per-test guard rejects every uncaught page exception and every undeclared console error. The two deliberate transport-failure cases declare only their expected 503 or direct-abort console signatures; any other error still fails the case. CI preserves both reports and failure-only trace/screenshot/video artifacts for 30 days.

## Verification boundary

This harness can prove deterministic Chromium behavior. The route-history and mobile-navigation cases intentionally start from the no-fetch Launchpad route so shared-shell navigation is tested independently of My Feed's asynchronous source fan-out. It cannot substitute for Issue #30's physical iPhone acceptance, real third-party transport availability, My Feed live-readiness evidence, or a post-merge read-only check of the exact deployed SHA. Those remain separate evidence items under the live acceptance boundary.

The local execution environment could install the pinned Node packages but could not download the Playwright Chromium archive from the browser CDN. Therefore local source validation and test discovery are recorded separately; candidate browser execution must be established by GitHub Actions before merge. A green source validator alone is not completion.
