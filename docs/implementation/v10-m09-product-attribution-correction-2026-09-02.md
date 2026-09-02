# V10-M09 Product Attribution Correction

**Date:** 2026-09-02

**Gate:** [Pre-V10-M10 Readiness Gate](v10-m10-readiness-gate-2026-09-02.md)

**Tracker:** [Issue #40](https://github.com/davehallmon/intelligence-hub/issues/40)

**Candidate:** [PR #42](https://github.com/davehallmon/intelligence-hub/pull/42)

**Base:** `main@03db25dd785237063a7a82b4d71c82c08d90f577`

## Purpose

Correct the gap between the V10-M09 Product read model and live ingestion. Before this correction, a normalized item entered Products & Platforms only when a caller explicitly supplied a Product relationship. Production feed loaders generally supplied source/profile context, so a valid item such as a Google DeepMind Gemini announcement could remain absent from the Product lens.

## Implemented boundary

`js/product-attribution.js` now performs deterministic Product-name attribution inside the existing shared path:

```text
live feed loader
  → normalizeFeedItem
  → enrichIntelligenceObject
  → deterministic Product attribution
  → shared canonical item store
  → Products & Platforms read model
```

The resolver:

- requires a configured Product name or alias in the title or summary;
- uses source ownership only to disambiguate a present name;
- never assigns every Product owned by an organization;
- records method, matched alias, matched field, and deterministic reason;
- preserves explicit Product relationships;
- prevents broader aliases from swallowing Claude Code and Claude Skills;
- leaves monitoring-state selection to the existing read model;
- leaves meaningful-change classification to the existing presentation classifier.

## Executable evidence

`tests/product-attribution-v10.test.js` exercises the production normalization seam rather than constructing final relationship arrays by hand.

Positive cases include:

- Google DeepMind “Introducing Gemini…” → `product-gemini`;
- Instructure Canvas with owner context → `product-canvas`;
- Claude Code without generic Claude broadening;
- Claude Skills inheriting monitored parent Claude;
- named Parked OpenAI Codex remaining explicitly queryable;
- an explicit Product relationship remaining supported;
- one automatically attributed canonical object retaining identity across People & Organizations and Products & Platforms.

Deliberate rejection cases include:

- unrelated OpenAI, Microsoft, Google DeepMind, Anthropic, and Instructure content;
- the Gemini constellation;
- an artist's canvas;
- generic AI-mode language not tied to Google;
- the statistical term “perplexity.”

## Gate disposition supported by this candidate

| Requirement | Candidate evidence | Disposition boundary |
| --- | --- | --- |
| PROD-01 | Resolver executes inside shared normalization enrichment. | Code-level PASS candidate; final gate awaits accepted SHA. |
| PROD-02 | Production-shaped Gemini fixture resolves to `product-gemini`. | Code-level PASS candidate. |
| PROD-03 | Whole-phrase aliases, context controls, exclusions, and negative fixtures. | Code-level PASS candidate; future alias changes require the same standard. |
| PROD-04 | Five owner-only negative fixtures. | Code-level PASS candidate. |
| PROD-05 | Claude Skills inheritance fixture. | Code-level PASS candidate. |
| PROD-06 | OpenAI Codex default rejection and explicit Parked query. | Code-level PASS candidate. |
| PROD-07 | Deterministic reason unit assertion and read-model propagation. | Partial: browser DOM assertion remains required. |
| PROD-08 | Shared-store cross-lens strict object-identity assertion. | Code-level PASS candidate. |
| PROD-09 | Generic ChatGPT relationship remains present while meaningful classification is false. | Code-level PASS candidate. |
| PROD-10 | No browser execution in this transaction. | NOT EVALUATED. |
| PROD-11 | No browser execution in this transaction. | NOT EVALUATED. |
| PROD-12 | Multiple deterministic near-miss rejection traces. | Code-level PASS candidate. |

No final gate status should be inferred solely from this document. The accepted commit, GitHub CI, deterministic browser suite, and deployed acceptance evidence must be recorded in Issue #40.

## Validation

- `git diff --check` — PASS.
- `npm --offline run validate` — PASS.
- 59 JavaScript files syntax-checked.
- 45 production and 38 validation files reachable.
- All pre-existing suites passed.
- Product attribution production-path fixtures passed.
- All 31 configured resolver rules point to existing canonical Product entities.

## Intentionally unchanged

- Product monitoring counts and states;
- shared store and deduplication behavior;
- meaningful-change categories;
- feed sources, transport, persistence, ranking, and UI layout;
- Publications, Media, Research, Communities, Signals, and Focus;
- the V10-M10 pause.

## Remaining proof

The next package must execute the application in a real browser with deterministic intercepted feed fixtures. It must prove populated and empty Product states, rendered reasons, loading/error/timeout/retry behavior, Saved persistence, mobile/desktop navigation, and a false-success case in which browser failure blocks completion.
