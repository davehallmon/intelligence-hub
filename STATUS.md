# PierView.io / Intelligence Hub — Current State

**Status authority:** Current implementation/handoff state  
**Last reconciled:** 2026-08-31  
**Repository:** `davehallmon/intelligence-hub`  
**Runtime baseline reconciled:** `815155efc5db83477bc523b967e87186d1d771b5` (merge of PR #28)

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

## Current visible v10 lenses

### Watchlist

- Priority + Active continuous topics only.
- Uses the shared source loaders, canonical store, runtime lens service, and Watchlist read model.
- Preserves the Watchlist / Library boundary.
- Mobile uses the shared Phase 4 Pull-to-Refresh and scroll-aware bottom-control shell.

### People & Organizations

- 19 continuously followed People: 7 Priority + 12 Active.
- 13 continuously followed Organizations: 5 Priority + 8 Active.
- 32 total continuously followed entities.
- Source coverage is explicitly classified as Direct, Shared, Discovery, Related, or Gap.
- Mobile uses the same shared Pull-to-Refresh, bottom controls, retry routing, and Saved-star infrastructure as Watchlist.

## Verification state

### Automated / structural evidence

- Multiple implementation PRs recorded `node --check` validation during development.
- Phase-specific validation fixtures exist under `js/tests/` and `js/config/validate-foundation.js`.
- GitHub Pages deployment after PR #28 succeeded.
- Repository-handoff remediation PR #29 adds the canonical `npm run validate` command and GitHub Actions workflow.
- PR #29's first complete GitHub Actions validation run passed, executing JavaScript syntax checks, the existing v10 validation suites, the corrected shared-item-store fixture, shared mobile-shell structural checks, and repository handoff/accessibility contract checks.

### Manual acceptance still required

A successful static deployment or source validation run is not a substitute for live browser/device testing. PR #28's documented iPhone acceptance checklist has **not been recorded in the repository as completed**. Treat it as pending manual confirmation until a human records the result.

## Next implementation milestone

**V10-M09 — Products & Platforms visible migration**

This is the next product milestone after repository-governance remediation.

Expected boundaries:

- use the existing canonical Product entities and parent/child relationships;
- use the shared canonical store and runtime lens service;
- do not create a product-specific ingestion silo;
- preserve existing My Feed ranking and Saved semantics;
- distinguish meaningful product/workflow changes from generic changelog volume;
- do not implement Focus ranking early.

## Known gaps / unresolved items

1. **Live iPhone acceptance for PR #28** — pending a recorded human smoke test.
2. **Source expansion** — many Priority/Active People and Organizations still have explicit source gaps; endpoint verification must precede adding new sources.
3. **Mockup binaries** — `assets/mockups/README.md` indexes the design references, but the image binaries are not currently stored in the repository.
4. **Repository license** — no license is currently declared. Do not invent one without an explicit owner decision.
5. **Legacy compatibility files** — intentionally retained until migrated replacements prove parity; cleanup belongs to V10-M18.
6. **Production/browser CI** — repository validation can test source structure and pure modules, but remote CORS behavior, touch gestures, and responsive visual acceptance still require browser/device verification.

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
