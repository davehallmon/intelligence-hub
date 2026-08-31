# Intelligence Hub v10 — Phase 4 Lens Read-Model Audit

**Phase:** Lens Query / Read-Model Layer  
**Branch:** `feature/lens-read-model-v10`  
**Base:** `f602c49afc218bb56c3d9978fb5e362e86da736c`  
**Visible navigation changed:** No  
**Ranking changed:** No

## Purpose

Phase 4 makes the central v10 information-architecture rule executable:

> One canonical intelligence object can be relevant to many lenses without being copied into separate feed silos.

The new read model is a pure selection layer over the canonical normalized intelligence objects introduced in Phase 2 and the entity/lens configuration introduced in Phase 1.

## Scope implemented

`js/lens-read-model.js` provides read-only selectors for:

- Watchlist
- People & Organizations
- Products & Platforms
- Publications
- Research
- Media
- Communities

It exposes:

- `queryLens(items, lensId, options)`
- `buildLensReadModels(items, optionsByLens)`
- `lensMembershipForItem(item, optionsByLens)`
- `watchlistTopicIdsForItem(item)`
- `QUERYABLE_LENS_IDS`

## Object identity rule

Lens selection retains the original intelligence-object reference.

The read model does not create a Watchlist copy, Product copy, Media copy, etc. A single object can therefore be selected simultaneously into several read models while retaining one canonical identity, URL/dedupe key, provenance record, evidence class, and relationship graph.

This is the executable foundation for the ratified rule:

> One canonical intelligence object, many relevant lenses.

## Watchlist behavior

The Watchlist selector bridges current normalized topic labels to v10 Watchlist IDs through the existing deterministic legacy-topic mapping.

Default continuous selection includes only Priority and Active Watchlists.

Parked Watchlists remain available when explicitly requested through query options; they do not enter the default continuous read model.

Phase 4 does not perform full-text facet inference. Explicit future `watchlistTopicIds` / `topicIds` can be consumed when present, while current legacy topic classifications remain compatible.

## Entity-lens behavior

People & Organizations, Products & Platforms, Publications, Media, and Communities select canonical entity relationships from the normalized object.

Default continuous selection includes entities whose canonical monitoring state is:

- Priority
- Active

Parked and Known entities can be included explicitly for search/investigation use without becoming continuous-monitoring defaults.

### Child products

Products & Platforms honors the ratified parent/child model.

A child such as `Claude Skills` can be selected through its monitored parent `Claude` without consuming a separate Priority/Active slot. The read-model entry records the monitored parent as the `monitoringAnchorId`.

## Relationship roles

For entity matches, the read model preserves available semantic roles:

- source
- authored-by
- published-by
- featuring
- about

The selector does not collapse these into one generic provenance claim.

## Research behavior

An object is Research-readable when it is explicitly represented as research through its normalized object type, legacy type, Research evidence class, or canonical research-source relationship.

Research can simultaneously appear in Watchlist when its topic classification maps to an active monitored Watchlist.

## Ordering / ranking boundary

Phase 4 preserves input order.

It does not:

- calculate relevance scores
- apply Focus promotion weights
- sort by Priority/Active state
- apply freshness boosts
- apply diversity caps
- cluster stories
- promote trends/signals

Selection and ranking remain separate concerns.

## Acceptance fixtures

`js/tests/validate-lens-read-model-v10.js` covers:

1. same-object reuse across Watchlist, People & Organizations, and Products & Platforms
2. Publication + Priority Person + Watchlist overlap
3. Research + Watchlist overlap
4. Media + featured Person overlap
5. Community selection
6. child Product inheritance through a monitored parent
7. Parked entity excluded from continuous selection but available explicitly
8. membership introspection for one object
9. no intra-lens duplication when multiple relationships match

Both new Phase 4 JavaScript files were syntax-checked with `node --check` before repository write.

## Important limitation

The read model selects relationships that normalization has established. It does not infer arbitrary new Product, Publication, Media, Community, Person, or Organization relationships from unrestricted full text.

That conservative boundary is intentional. Phase 2 explicitly deferred broad v10 entity extraction, and Phase 4 does not bypass that safeguard.

As a result, current live items receive richer lens membership where existing endpoints/profile mappings or explicit normalization context establish the relationship. Coverage will expand as later migration phases attach additional v10 endpoints and relationship extractors.

## Current runtime preservation

This phase does not modify:

- `app.js`
- `index.html`
- `js/feeds.js`
- `js/feed-client.js`
- `js/feed-config.js`
- `js/source-registry.js`
- `js/my-feed.js`
- renderers
- settings/localStorage
- current visible tab navigation

The live v9.x UI therefore continues to use its existing source-type tabs and My Feed behavior.

## Deferred by design

- visible v10 navigation
- Lens-specific UI rendering
- Focus ranking
- story clustering
- trend/signal synthesis
- Events & Learning read model
- Library/Saved/Questions read models
- broad full-text relationship extraction
- migration of current feed caches into a canonical shared item store

## Acceptance conclusion

Phase 4 establishes a reusable, read-only lens selection layer without creating duplicate intelligence objects or changing the current application experience.

The system can now answer:

> Which lenses is this canonical object relevant to, and why?

without making each lens its own ingestion silo.

## Next phase

Phase 5 should introduce the canonical shared item-store/cache boundary beneath the current feed loaders. The goal is to make all current ingestion paths deposit normalized objects into one deduplicated collection that both the legacy tabs and v10 read models can query, while preserving existing visible behavior.
