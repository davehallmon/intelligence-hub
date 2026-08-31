# Intelligence Hub v10 — Phase 1 Foundation Audit

**Phase:** Canonical Configuration / Data Foundation  
**Branch:** `feature/config-data-foundation-v10`  
**Base:** `03100ac52d18020ba6ad3dae43a760ef9c3c5dc5`  
**Runtime behavior changed:** No

## Scope implemented

- canonical entity and monitoring-state vocabulary
- canonical entity registry with legacy profile compatibility
- ratified Watchlist topic/facet taxonomy
- ratified monitoring and lens preferences
- evidence / verification vocabulary
- locked 14-lens registry plus Saved as a non-lens action
- connector capability catalog and bridge from current public source registry
- deterministic legacy profile/topic compatibility helpers
- pure development-time foundation validator

## Preservation rules

The following existing runtime authorities remain unchanged in Phase 1:

- `js/profiles.js`
- `js/source-registry.js`
- `js/feed-config.js`
- `js/my-feed-config.js`
- current navigation and renderers
- current Saved/localStorage behavior
- current deterministic My Feed ranking

The v10 modules are intentionally not imported by the live v9.x entry point yet.

## Compatibility observations

The old profile tiers cannot be reused as v10 monitoring state. The v10 entity registry overlays ratified state while preserving old tier metadata for migration purposes.

Examples:

- Paul Ford: legacy watchlist-only → v10 Priority
- Sam Altman: legacy core-active → v10 Parked
- Google DeepMind: legacy core-active → v10 Parked child/related organization under canonical Google

This is configuration migration, not a mutation of the legacy runtime registry.

## Verification

Repository-level checks performed:

- branch starts from merged PR #18 base SHA
- only new Phase 1 foundation files are added
- no existing HTML/CSS/JavaScript runtime files are modified
- legacy profile IDs map deterministically to same canonical IDs
- parent/relation targets are represented in the entity registry
- configured scarce counts are explicitly validated for:
  - 5 Priority + 7 Active Watchlist topics
  - 7 Priority + 12 Active people
  - 5 Priority + 8 Active organizations
  - 6 Priority + 10 Active products
- connector bridge preserves current public source identifiers and live source ownership
- Readwise/private credentials remain browser-local

The PR development record also reports that all new ES modules passed `node --check` and that `validate-foundation.js` was exercised against the 65-profile legacy inventory without configuration-reference or scarce-count errors. Node is used only for development validation; it is not introduced as an application runtime dependency.

During a later continuation session, the available local shell could not resolve `github.com`, so that session could not independently repeat the checkout-based Node validation. Repository-side structure and references were re-audited through the connected GitHub source instead.

## Intentionally unresolved

Per the ratified specification, the following remain pending and must not be guessed during Phase 1:

- exact current names/casing/feed feasibility for newly added communities marked `verificationStatus: pending`
- exact canonical YouTube handles/URLs for newly added YouTube-first sources marked pending
- dedicated Core ingestion rule for `r/WritingWithAI`
- endpoint feasibility for new v10 entities not already supported by current live connectors

## Acceptance conclusion

Phase 1 satisfies the migration requirement:

> The new architecture exists underneath the application while the existing experience still works.

Visible migration and runtime adoption remain deferred to later phases.
