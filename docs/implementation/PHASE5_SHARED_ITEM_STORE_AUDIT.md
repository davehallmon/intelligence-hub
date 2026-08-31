# Phase 5 — Canonical Shared Item Store Audit

## Status

Implemented on `feature/shared-item-store-v10` from the PR #22 merge commit `7f32c937636238dcf5958853c5303a11a8e7a021`.

## Purpose

Phase 5 introduces the first runtime bridge from the legacy v9.x feed architecture into the ratified v10 information architecture.

The goal is deliberately narrow:

> Current ingestion paths may continue to load and render through the existing tab-specific pipeline, while their finalized normalized items are also deposited into one session-scoped canonical shared store.

This phase does not migrate visible navigation, ranking, rendering, source execution, or persistence.

## Files

- `js/item-store.js` — canonical in-memory store
- `js/feeds.js` — minimal runtime integration
- `js/tests/validate-item-store-v10.js` — acceptance fixtures
- this audit record

## Canonical identity

The store prefers the normalized v10 identity fields in this order:

1. `dedupeKey`
2. `canonicalObjectKey`
3. `canonicalUrl`
4. `url`
5. `id` fallback

The store does not invent semantic story clustering. Two different URLs about the same event remain different canonical items until a later clustering phase establishes a stronger relationship.

## Source replacement semantics

The store is not append-only.

Each live ingestion surface is treated as a source collection:

- `news`
- `socials`
- `academic`
- `research`
- `video`
- `books`

When a source refreshes, `replaceSource(sourceId, items)` updates that source's complete membership.

If an old item is no longer present:

- that source membership is removed;
- the canonical item remains if another source still carries the same key;
- otherwise the canonical item is removed from the session store.

This prevents stale items from accumulating indefinitely during repeated refreshes.

## Cross-source duplicates

If two source collections contain the same canonical key, the shared store contains one canonical entry.

The entry retains:

- one representative intelligence-object reference;
- the source IDs that currently carry it;
- one source variant per carrying source.

Phase 5 does not merge different provenance records into a synthetic object. The representative remains stable while its source remains present. If that source disappears and another variant remains, representation transfers to a remaining variant.

## Legacy behavior boundary

The legacy `ITEM_CACHE` remains intact.

`cacheItems(tab, items)` now performs two actions:

1. writes the exact finalized array to the existing legacy cache;
2. for non-derived tabs, replaces that source's membership in the shared store.

The array returned to existing renderers is unchanged.

### My Feed is not an ingestion source

`myfeed` is explicitly excluded from shared-store insertion because it is a derived ranked view over News, Socials, Academic, Research, and Video.

Depositing My Feed would create a second source membership for already-ingested objects and would blur the distinction between collection and presentation.

## Invalidation

Force refresh and explicit invalidation clear the corresponding shared-store source before reload.

Full invalidation clears the entire shared store.

Settings changes retain current behavior:

- Socials invalidates
- Books invalidates
- My Feed invalidates

The first two clear their shared-store membership; My Feed does not because it never owns shared-store membership.

## Read access

`createFeedDashboard()` now exposes read-only accessors:

- `getSharedItems()`
- `getSharedEntries()`
- `getSharedStats()`

These are additive. Existing callers using `getItems(tab)` are unaffected.

A later phase can build v10 lens read models from `getSharedItems()` without re-ingesting or copying the underlying content.

## Persistence and privacy

The shared store is memory-only.

It does not write feed content, private URLs, tokens, Readwise credentials, RSS2JSON keys, or private source payloads to repository files or localStorage.

Private source objects may exist in memory because the current browser session fetched them, but their existing provenance privacy marker remains on the normalized object.

## Acceptance fixtures

`validate-item-store-v10.js` covers:

1. cross-source canonical deduplication;
2. stable representative while its source remains present;
3. representative transfer when that source disappears;
4. orphan removal;
5. same-source deduplication;
6. stale-object removal during source replacement;
7. one shared canonical reference queried through multiple v10 lenses;
8. separation of canonical-item count from source-membership count.

The new JavaScript files and the reconstructed `feeds.js` replacement were syntax-checked with `node --check` before repository write.

A full browser/network integration run is not claimed in this environment.

## Current runtime impact

Unlike Phases 1–4, Phase 5 modifies a live runtime module (`feeds.js`).

The change is intentionally restricted to the shared-cache boundary. It does not alter:

- feed URLs or connector execution;
- direct/proxy fallback behavior;
- source limits;
- freshness rules;
- per-source caps;
- current feed-level dedupe;
- My Feed scoring;
- renderer inputs;
- visible tabs/navigation;
- Saved behavior;
- localStorage schema;
- GitHub Pages deployment.

## Intentionally deferred

- replacing legacy `ITEM_CACHE` with the canonical store;
- rendering v10 lenses from the shared store;
- changing live deduplication to canonical-store identity;
- story clustering;
- Signals;
- Focus ranking;
- persistent 90-day history;
- transcript enrichment;
- broad relationship extraction.

## Acceptance criterion

> Current ingestion can populate one deduplicated canonical session collection while legacy tab output remains behaviorally compatible.

## Recommended next phase

Phase 6 should connect the already-built lens read model to the shared store through a runtime-safe lens service/API, still without replacing visible navigation. That creates an executable bridge:

`live ingestion → normalized object → shared canonical store → v10 lens read model`

Only after that bridge is validated should visible lens migration begin.
