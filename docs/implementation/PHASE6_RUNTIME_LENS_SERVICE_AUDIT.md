# Phase 6 Runtime Lens Service Audit

## Status

Implemented on `feature/runtime-lens-service-v10` from the PR #23 merge base.

Phase 6 connects the Phase 5 canonical shared item store to the Phase 4 lens read model through a thin runtime service and a read-only browser API.

## Governing path

```text
live ingestion
  -> normalized intelligence object
  -> shared canonical item store
  -> runtime lens service
  -> v10 lens read model
```

This is the first complete executable v10 read path inside the running application.

## Files

### Added

- `js/lens-service.js`
- `js/tests/validate-lens-service-v10.js`
- `docs/implementation/PHASE6_RUNTIME_LENS_SERVICE_AUDIT.md`

### Minimally modified

- `js/dashboard.js`

No feed loader, renderer, ranking, navigation, HTML, CSS, settings, connector, source-registry, normalization, item-store, or lens-selector implementation is modified by this phase.

## RuntimeLensService

`RuntimeLensService` composes a `CanonicalItemStore` with the existing pure lens selectors.

It exposes:

- `getCanonicalItems()`
- `query(lensId, options)`
- `build(optionsByLens)`
- `membership(keyOrItem, optionsByLens)`
- `snapshot(optionsByLens)`

The global singleton `RUNTIME_LENS_SERVICE` uses the same `SHARED_ITEM_STORE` singleton already populated by the current live feed loaders.

## No second cache

The service does not cache lens results.

Each call reads `store.getItems()` at call time and applies the pure read-model selectors.

This is intentional. A feed refresh or invalidation changes the shared store, and the next lens query therefore sees that change immediately without a separate synchronization mechanism.

A returned `snapshot()` is an immutable point-in-time result, not an automatically updating object.

## Browser runtime API

`js/dashboard.js` now installs:

```js
window.intelligenceHubV10
```

with four read-only operations:

- `queryLens(lensId, options)`
- `buildLensReadModels(optionsByLens)`
- `lensMembership(keyOrItem, optionsByLens)`
- `snapshot(optionsByLens)`

The wrapper exposes no shared-store write methods and no feed invalidation/load methods.

This API is an **internal migration/diagnostic boundary**, not yet a stable public extension API.

## Example runtime inspection

After one or more current feeds have loaded, the browser can evaluate:

```js
window.intelligenceHubV10.snapshot()
```

or:

```js
window.intelligenceHubV10.queryLens("watchlist")
window.intelligenceHubV10.queryLens("people-organizations")
window.intelligenceHubV10.queryLens("products-platforms")
```

Those results operate over the canonical objects currently held in the shared session store.

## Same-object invariant

The runtime service preserves the Phase 4 rule:

> One canonical intelligence object may appear in multiple lens read models without being copied into separate ingestion silos.

The lens entries keep references to the canonical representative object supplied by the shared store.

## Selection vs ranking

Phase 6 still performs selection only.

It does not:

- calculate Focus scores
- change My Feed ranking
- apply freshness decay for Focus
- apply Focus hard-promotion rules
- cluster stories
- generate Signals
- generate AI summaries
- render v10 lens cards
- alter visible navigation

Those concerns remain explicitly downstream.

## Privacy

The runtime service is session-only because its underlying shared store is session-only.

It adds no persistence and commits no private locator, token, credential, or private source payload.

If a private normalized object is present in the shared store during the session, its existing private provenance remains attached. Phase 6 does not change the previously ratified rule that private material must not be silently blended into public-source claims.

## Acceptance fixtures

`js/tests/validate-lens-service-v10.js` covers:

1. empty-store behavior
2. immediate lens visibility after source ingestion
3. point-in-time snapshot behavior without hidden service caching
4. immediate lens removal after source invalidation
5. canonical cross-source deduplication across runtime lens queries
6. membership lookup by canonical key
7. Parked entity exclusion by default and explicit inclusion when requested
8. service read operations do not mutate store membership

## Runtime compatibility

`dashboard.js` gains only the lens-service import and the read-only `window.intelligenceHubV10` wrapper.

Current application initialization order remains otherwise unchanged:

- UI foundation
- My Feed UI
- v8.1 compatibility UI
- design decoration
- feed dashboard
- Settings
- legacy navigation
- Phase 4 UX

The current visible navigation continues to request legacy tabs from `feeds.load(tab)`.

## Acceptance criterion

> A running Intelligence Hub browser session can query current canonical ingested objects through the ratified v10 lenses without changing current visible feed behavior or creating lens-specific copies.

## Intentionally deferred

- visible v10 lens navigation
- lens-specific rendering/card designs
- additional live endpoints for newly ratified Priority/Active entities
- broad entity extraction from arbitrary full text
- transcript retrieval and enrichment
- Questions persistence/workspace UI
- Library/Saved lifecycle migration
- story clustering
- Signals
- Focus ranking and synthesis

## Recommended next phase

Phase 7 should be the first controlled **visible lens migration**.

The safest candidate is **Watchlist**, because it already has:

- a ratified taxonomy and facets
- deterministic legacy-topic compatibility
- live canonical objects in the shared store
- a validated runtime read model

Phase 7 should add a Watchlist view that reads from `window.intelligenceHubV10` / the runtime service while leaving the legacy tabs available during the migration. Focus should remain deferred until the supporting lenses and clustering/ranking layers exist.
