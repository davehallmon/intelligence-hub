# Changelog

This changelog is a high-level orientation layer over the repository's detailed pull-request history. PR descriptions and implementation audits remain the authoritative transaction records.

## Unreleased — v10 visible-lens migration

- V10-M09A.2 — normalized current lens modules under `js/lenses/`, lens styles under `css/lenses/`, and Node-only fixtures under `tests/`; added production-resource and repository-root placement validation.
- V10-M09A.1 — moved v8–v9 release documentation into indexed history, removed unreachable `tabs.js`, added JavaScript reachability/configuration-surface validation, and established branch/contribution hygiene.
- PR #35 — added **V10-M09 Products & Platforms** as a visible lens over the shared canonical store/runtime lens service, with deterministic meaningful-change filtering, child Product inheritance, shared mobile controls, retry routing, and Saved behavior.
- Repository handoff remediation reframed root documentation around the PierView.io personal-intelligence product direction while preserving Intelligence Hub runtime compatibility naming.
- Added canonical present-state and agent/developer handoff documents.
- Added stable v10 milestone IDs to eliminate ambiguous phase-number references.
- Added repository authority/legacy map.
- Added a real development-time validation command and pull-request GitHub Actions gate.
- Corrected a stale shared-item-store fixture discovered by the new validator.
- Pinned Lucide to an exact CDN version.
- Centralized ARIA tab ↔ tabpanel relationships for current and future primary lenses.

## 2026-08-31 — v10 migration foundation and first visible lenses

- PR #28 — integrated Watchlist and People & Organizations with the shared mobile shell.
- PR #27 — added the visible People & Organizations lens and explicit source-gap inventory.
- PR #26 — refined Watchlist mobile controls and safe-area behavior.
- PR #25 — added the first visible v10 Watchlist lens.
- PR #24 — added the runtime lens service over the shared canonical store.
- PR #23 — added the shared canonical item store.
- PR #22 — added the reusable v10 lens read-model layer.
- PR #21 — added the connector/source-endpoint registry.
- PR #20 — added normalized intelligence-object relationships and provenance/evidence fields.
- PR #19 — added canonical v10 configuration/entity foundation.
- PR #18 — ratified the v10 product architecture, information architecture, configuration, and migration strategy.

## 2026-08-30 — UI and personal-intelligence evolution

- PR #17 — added shared dynamic mobile controls, Pull-to-Refresh, persistent Saved, and nested quick links.
- PR #16 — added command palette, interaction states, previews, and keyboard/focus refinements.
- PR #15 — added responsive tablet/desktop navigation rail.
- PR #14 — migrated to the topbar/flyout navigation shell.
- PR #13 — established the v9.1 UI foundation and technical specification.
- PR #12 — fixed My Feed automatic reranking after settings changes.
- PR #11 — introduced deterministic My Feed.
- PR #10 — added profile-specific browser-local Social source policy/bridges.
- PR #9 — added Video per-channel diversity balancing.

## Historical note

Earlier release documents are indexed under [`docs/history/`](docs/history/README.md). They remain historical evidence during migration and are not the present-state authority; use `README.md` and `STATUS.md` first.
