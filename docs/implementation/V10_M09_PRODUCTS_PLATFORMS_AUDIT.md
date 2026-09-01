# V10-M09 — Products & Platforms Visible Migration Audit

**Stable milestone:** V10-M09  
**Pull request:** #35  
**Base SHA:** `e7e97ea02222a2618b3d2288999be7149eb68785`  
**Status:** Implementation complete; automated repository validation passed  
**Manual browser/device acceptance:** Not claimed

## Purpose

This milestone exposes **Products & Platforms** as the third visible v10 intelligence lens, after Watchlist and People & Organizations.

It deliberately reuses the existing canonical runtime path rather than introducing Product-specific ingestion or storage:

```text
live source loaders
  → normalized intelligence objects
  → shared canonical item store
  → runtime lens service
  → products-platforms read model
  → visible Products & Platforms UI
```

## Configuration reconciliation

Before implementation, `docs/configuration/RATIFIED_CONFIGURATION.md` was reconciled against `js/config/entities.js`.

The encoded continuous Product set matches the ratified configuration:

- **6 Priority** products;
- **10 Active** products;
- Parked products remain non-continuous by default;
- `Claude Skills` remains a child of `Claude`;
- `Custom GPTs` remains a child of `ChatGPT`;
- `STORM` remains Known and normalized toward Research/Questions rather than continuous Product monitoring.

No Product identity, monitoring tier, or source endpoint was invented for this milestone.

## Visible behavior added

The new Products & Platforms destination provides:

- primary navigation and hash routing for `products-platforms`;
- All followed / Priority / Active / individual Product filtering;
- monitored-parent inheritance for child Product capabilities;
- a default **Meaningful changes** view;
- an explicit **All matched items** escape hatch;
- newest-first presentation sorting;
- visible match-reason chips from the canonical lens read model;
- visible change-type chips for model, feature, workflow/UI, integration, and documentation changes;
- shared mobile Pull-to-Refresh;
- shared scroll-aware bottom controls;
- shared retry routing;
- shared Saved-star persistence.

## Meaningful-change classifier boundary

`js/product-change-classifier.js` is deterministic and presentation-only.

It may classify explicit product launches, releases, updates, upgrades, rollouts, integrations, model changes, workflow/UI changes, deprecations, and documentation/release-note changes as meaningful Product changes.

It does **not**:

- mutate canonical intelligence objects;
- alter source provenance;
- change Product monitoring state;
- change My Feed ranking;
- implement Focus ranking;
- implement story clustering or Signals;
- permanently discard generic Product matches.

Generic mentions remain available through **All matched items**.

## Architectural preservation

This milestone preserves:

- one canonical intelligence object across multiple lenses;
- the existing shared item store and runtime lens service;
- the existing Product read-model logic in `js/lens-read-model.js`;
- source/authorship/publisher/featured/about relationship semantics;
- Watchlist behavior;
- People & Organizations behavior;
- My Feed ranking and diversity rules;
- Saved storage schema;
- browser-local privacy boundaries;
- static GitHub Pages production architecture.

The runtime debug/read API now exposes the stable identifier `milestone: "V10-M09"` rather than adding another ambiguous bare phase number.

## Changed implementation paths

- `js/product-change-classifier.js` — deterministic Product-change classification.
- `js/products-platforms-ui.js` — visible Product lens UI and presentation controls.
- `products-platforms.css` — Product lens desktop/mobile presentation.
- `js/navigation.js` — Product primary route.
- `js/dashboard.js` — Product lens initialization/load/refresh integration.
- `js/phase4.js` — shared mobile/Saved/retry integration for the Product lens.
- `js/tests/validate-products-platforms-v10.js` — V10-M09 acceptance fixtures.
- `scripts/validate.mjs` — includes the V10-M09 fixture suite in the canonical validation gate.

Current-state documentation is updated in the same PR.

## Automated validation evidence

GitHub Actions run `33453616480`, job `99688760361`, executed `npm run validate` on PR #35's merge ref and passed.

Recorded results included:

- syntax validation for **58 JavaScript files**;
- Foundation validation passed;
- Normalization validation passed — 8 fixtures;
- Connector validation passed — 8 fixtures;
- Lens read-model validation passed — 9 fixtures;
- Shared item-store validation passed — 7 fixtures;
- Runtime lens-service validation passed;
- Watchlist visible-migration fixtures passed;
- People & Organizations fixtures passed;
- **Products & Platforms V10-M09 fixtures passed**;
- shared v10 mobile-shell structural validation passed;
- repository contract/accessibility checks passed.

The V10-M09 fixtures specifically assert:

- exact 6 Priority + 10 Active Product monitoring counts;
- exclusion of Parked/Known/Child entities from continuous selector slots;
- Claude Skills → Claude inheritance;
- Custom GPTs → ChatGPT inheritance;
- Parked Product exclusion by default and explicit queryability;
- meaningful model/workflow/integration/documentation change classification;
- generic Product-mention exclusion from the default change view;
- preservation through All matched items mode;
- newest-first non-mutating presentation sorting;
- Product navigation/runtime/shared-mobile/Saved/retry wiring.

## Verification boundary

Automated validation does not prove rendered browser behavior, touch gestures, remote CORS paths, or visual responsive acceptance.

After deployment, the Products & Platforms lens should be smoke-tested on mobile and desktop for:

1. destination visibility and navigation;
2. Product and Signal selectors;
3. default Meaningful changes behavior;
4. All matched items behavior;
5. child Product matching when relevant data is present;
6. Pull-to-Refresh on mobile;
7. scroll-aware bottom controls on mobile;
8. Saved-star persistence;
9. desktop inline controls;
10. loading, empty, error, and retry states.

Issue #30 remains the separate outstanding human iPhone acceptance record for PR #28 and is not closed or represented as completed by this milestone.

## Known limitation

The meaningful-change classifier is intentionally heuristic and deterministic. It is a first bounded implementation of the ratified “meaningful workflow-affecting changes only” rule. Future tuning should be based on observed false positives/false negatives from real loaded Product items, without silently converting the classifier into hidden ranking or Focus logic.

## Next stable milestone

After V10-M09, the stable milestone map defines:

**V10-M10 — Publications & Media migration**.
