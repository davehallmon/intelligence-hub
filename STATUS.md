# PierView.io / Intelligence Hub — Current State

**Status authority:** Current implementation/handoff state  
**Last reconciled:** 2026-09-02
**Repository:** `davehallmon/intelligence-hub`  
**V10-M09 implementation base:** `e7e97ea02222a2618b3d2288999be7149eb68785` (merge of PR #29)  
**Latest implementation evidence:** PR #35 — V10-M09 Products & Platforms
**Latest repository-structure evidence:** PR #38 — V10-M09A.2 forward directory normalization

This file is the **present-tense status authority** for development handoff. Architecture documents define the target product; implementation audits and PRs describe historical transactions. When a historical audit says a follow-up is still pending but this file records that a later PR completed it, this file governs current status.

## Product identity

- **Product direction:** PierView.io.
- **Current repository/runtime compatibility name:** Intelligence Hub / `intelligence-hub`.
- The product is a browser-based personal intelligence aggregation and monitoring workspace: part RSS reader, part research dashboard, part knowledge-management tool.
- Runtime branding remains intentionally unchanged unless an explicit UI/branding migration is approved.

## Current production architecture

The application remains a zero-backend GitHub Pages site using semantic HTML, CSS, and vanilla JavaScript modules.

Current live intake includes RSS/Atom, Google News, arXiv, YouTube, Readwise, and configured browser-local feeds. Personal settings and credentials remain local to the browser.

The v10 canonical runtime path now exists:

```text
live source loaders
  → normalized intelligence objects
  → shared canonical item store
  → runtime lens service
  → reusable lens read models
  → visible lens UI
```

The legacy v9.x feed tabs and compatibility CSS/JS remain intentionally available while v10 lenses migrate.

## Completed v10 implementation milestones

Use the stable milestone IDs below rather than bare phase numbers. The canonical ordinal-reconciliation map is `docs/architecture/V10_MILESTONE_MAP.md`.

| ID | Milestone | State | Evidence |
| --- | --- | --- | --- |
| V10-M00 | Architecture ratification | Complete | PR #18 |
| V10-M01 | Canonical configuration/entity foundation | Complete | PR #19 |
| V10-M02 | Normalized intelligence-object relationships | Complete | PR #20 |
| V10-M03 | Connector/source-endpoint registry | Complete | PR #21 |
| V10-M04 | Lens query/read-model layer | Complete | PR #22 |
| V10-M05 | Shared canonical item store | Complete | PR #23 |
| V10-M06 | Runtime lens service | Complete | PR #24 |
| V10-M07 | Visible Watchlist lens | Complete | PR #25; mobile refinement PR #26 |
| V10-M08 | Visible People & Organizations lens | Complete | PR #27; shared mobile-shell integration PR #28 |
| V10-M09 | Visible Products & Platforms lens | Complete | PR #35 |

## Current visible v10 lenses

### Watchlist

- Priority + Active continuous topics only.
- Uses the shared source loaders, canonical store, runtime lens service, and Watchlist read model.
- Preserves the Watchlist / Library boundary.
- Mobile uses the shared Pull-to-Refresh and scroll-aware bottom-control shell.

### People & Organizations

- 19 continuously followed People: 7 Priority + 12 Active.
- 13 continuously followed Organizations: 5 Priority + 8 Active.
- 32 total continuously followed entities.
- Source coverage is explicitly classified as Direct, Shared, Discovery, Related, or Gap.
- Mobile uses the same shared Pull-to-Refresh, bottom controls, retry routing, and Saved-star infrastructure as Watchlist.

### Products & Platforms

- 6 Priority + 10 Active continuously monitored Products.
- Parked Products remain explicitly queryable but are not continuous defaults.
- Child capabilities inherit monitored parents where ratified: `Claude Skills → Claude` and `Custom GPTs → ChatGPT`.
- STORM remains outside continuous Product monitoring and is normalized toward Research/Questions.
- The default visible view favors deterministic meaningful changes: model, feature, workflow/UI, integration, and documentation/release-note changes.
- **All matched items** remains available so generic canonical Product matches are not destroyed by the presentation filter.
- Match reasons come from the existing Products & Platforms read model.
- Mobile reuses the shared Pull-to-Refresh, bottom controls, retry routing, and Saved-star infrastructure; no Product-specific gesture or persistence system was added.

## Verification state

### Automated / structural evidence

- The canonical validation command is `npm run validate`.
- GitHub Actions runs the same validation on pull requests and pushes to `main`.
- PR #35 GitHub Actions run `33453616480`, job `99688760361`, passed on the merge ref.
- That run syntax-checked 58 JavaScript files and passed foundation, normalization, connector, lens read-model, shared item-store, runtime lens-service, Watchlist, People & Organizations, Products & Platforms, shared mobile-shell, and repository contract/accessibility validation.
- Dedicated V10-M09 fixtures verify the ratified 6/10 Product counts, child inheritance, Parked boundaries, meaningful-change classification, generic-mention filtering, all-match preservation, non-mutating newest-first sorting, and shared navigation/mobile/Saved/retry wiring.
- PR #38 GitHub Actions run `33611154736` passed after the path-only normalization. Its repository contract checks cover JavaScript reachability, configuration exports, local Markdown references, production resource resolution, and the root-file allowlist in addition to all existing product fixtures.

### Manual acceptance still required

A successful static deployment or source validation run is not a substitute for live browser/device testing.

- **Issue #30:** PR #28's documented iPhone acceptance checklist has still not been recorded as completed. It remains a separate human verification item.
- **V10-M09:** rendered Products & Platforms behavior should be smoke-tested after deployment on mobile and desktop, including selector behavior, Pull-to-Refresh, Saved persistence, loading/empty/error/retry states, and remote-feed/CORS behavior.

Do not represent either manual browser/device boundary as completed without recorded evidence.

## Repository normalization follow-through

**V10-M09A — Repository Structure Normalization** is implementation-complete in PRs #37–38. Its remaining administrative and human-verification follow-through is tracked in Issue #36.

- M09A.1 is complete in PR #37: historical release documentation is indexed under `docs/history/`, proven-dead `tabs.js` is removed, and repository reachability/contribution rules are enforced.
- M09A.2 is complete in PR #38: current lens modules are under `js/lenses/`, lens styles are under `css/lenses/`, and Node-only fixtures are under `tests/`; production paths and validation were updated without intentional runtime behavior change.
- Issue #36 remains open for deletion of the verified merged remote branches, enabling automatic merged-branch deletion, and recording deployed mobile/desktop smoke testing.
- Production-active compatibility files remain protected until their owning replacement milestones prove parity.

## Next product milestone

**V10-M10 — Publications & Media migration**

Expected direction from the ratified architecture/migration plan:

- migrate Publications and Media using their canonical entities and current source relationships;
- continue reusing the shared item store and runtime lens service;
- preserve distinctions among authored-by, published-by, featuring, about/mentioned, and endpoint ownership;
- preserve primary-source anchoring and cross-lens reuse of one intelligence object;
- do not turn YouTube into a separate v10 lens when it is a connector/format for canonical Media or entity endpoints;
- do not implement later Research, Communities, Signals, or Focus behavior early.

## Known gaps / unresolved items

1. **Live iPhone acceptance for PR #28** — Issue #30 remains pending a recorded human smoke test.
2. **V10-M09 browser/device acceptance** — automated validation passed; live rendered Product-lens acceptance remains to be recorded after deployment.
3. **Source expansion** — many monitored entities still have explicit source gaps; endpoint verification must precede adding new sources.
4. **Product-change classifier tuning** — deterministic first implementation may need evidence-based tuning from observed live false positives/false negatives; do not silently convert it into hidden ranking or Focus logic.
5. **Mockup binaries** — `assets/mockups/README.md` indexes the design references, but the image binaries are not currently stored in the repository.
6. **Repository license** — no license is currently declared. Do not invent one without an explicit owner decision.
7. **Legacy compatibility files** — intentionally retained until migrated replacements prove parity; cleanup belongs to V10-M18.
8. **Production/browser CI** — repository validation can test source structure and pure modules, but remote CORS behavior, touch gestures, and responsive visual acceptance still require browser/device verification.
9. **Repository hygiene follow-through** — PRs #37–38 completed historical-document archival, dead-file removal, and forward directory normalization. Issue #36 remains open for settings-level merged-branch cleanup and deployed smoke evidence.

## Authority order for handoff

When sources appear to conflict, use this order:

1. `STATUS.md` — present state and next milestone.
2. `docs/configuration/RATIFIED_CONFIGURATION.md` — approved configuration values and product choices.
3. `docs/architecture/PRODUCT_ARCHITECTURE.md` — target product contract.
4. `docs/architecture/INFORMATION_ARCHITECTURE.md` — target data/information relationships.
5. `docs/architecture/V10_MILESTONE_MAP.md` — stable milestone IDs and phase-number reconciliation.
6. `docs/architecture/MIGRATION_PLAN.md` — detailed staged scope/acceptance roadmap; translate old numeric headings through the milestone map.
7. `TECHNICAL_SPEC.md` — current v9.x UI/runtime compatibility rules during migration.
8. `docs/implementation/*` — historical implementation evidence at the time each file was written.
9. Pull-request descriptions/commits — transaction history and verification evidence.

Never infer current status from a historical phase audit alone.

## Handoff rule

Before beginning a new implementation PR:

1. read this file;
2. verify current `main` SHA;
3. identify the stable milestone ID and named concern;
4. confirm the files/behaviors intentionally preserved;
5. run `npm run validate` before proposing merge;
6. update this status file when the current milestone or next milestone changes.
