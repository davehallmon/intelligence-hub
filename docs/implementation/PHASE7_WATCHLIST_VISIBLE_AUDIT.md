# Phase 7 — Visible Watchlist Lens Audit

**Branch:** `feature/watchlist-visible-v10`  
**Base:** `cb586fcd3069e976afa5b472e2a4e86fb2b7050f`  
**Base meaning:** merge commit for PR #24 / Phase 6 Runtime Lens Service  
**Scope:** first controlled user-visible v10 lens migration

## Acceptance criterion

> The running Intelligence Hub exposes Watchlist as a visible primary destination backed by the canonical shared item store and v10 Watchlist read model, without creating a new ingestion silo or removing the legacy views.

## What changed

Phase 7 adds the first visible v10 lens: **Watchlist**.

The user-visible path is now:

```text
live source loaders
  → normalized intelligence objects
  → shared canonical item store
  → runtime lens service
  → Watchlist read model
  → visible Watchlist panel
```

No separate Watchlist fetch pipeline or Watchlist-specific object store is introduced.

## Watchlist navigation

`Watchlist` is injected into the existing primary navigation immediately after `My Feed`.

`js/navigation.js` now recognizes `watchlist` as a valid primary route, including direct `#watchlist` navigation and stored primary-view restoration.

Legacy destinations remain available:

- My Feed
- News
- Socials
- Academic
- Research
- Video
- Books
- Bookmarks / Launchpad

This PR does not relabel My Feed as Focus and does not remove any legacy source-type view.

## Visible monitored-topic controls

The Watchlist UI reads directly from the ratified `WATCHLIST_TOPICS` configuration.

Continuous controls expose exactly:

- 5 Priority topics
- 7 Active topics
- 0 Parked topics

Parked topics remain part of the canonical taxonomy but do not enter continuous Watchlist controls.

The topic buttons are **view filters only**. Selecting one does not edit monitoring configuration, rewrite source settings, or mutate the shared item store.

Each monitored topic remains visible even when its current item count is zero. This is intentional: a zero means the currently loaded source set has no matching intelligence, not that the topic has disappeared from the user's configuration.

## Live source loading

Opening Watchlist loads the same source tabs already used to construct My Feed:

- News
- Socials
- Academic
- Research
- Video

Those loaders continue to normalize and deposit their finalized arrays into the Phase 5 shared canonical store.

Watchlist then queries the store through the Phase 6 runtime lens service.

Books / Readwise is not proactively loaded for Watchlist.

## Library boundary

A migration audit identified an important lifecycle edge case: if Readwise had already been loaded elsewhere, a highlight carrying a monitored topic could previously satisfy the generic Watchlist topic selector because it existed in the shared store.

Phase 7 closes that boundary in `js/lens-read-model.js`.

By default, continuous Watchlist selection excludes:

- `type: highlight`
- `objectType: highlight`
- the canonical Readwise endpoint `endpoint-readwise-local`

An explicit future investigation may opt in with `includeKnowledge: true`, preserving the ability to query learned material without mixing Library content into continuous monitoring.

This preserves the ratified conceptual separation:

- Watchlist = what is continuously monitored
- Library = what has been learned / incorporated

## Presentation behavior

Watchlist selection remains non-ranking.

The visible Watchlist presentation applies only a deterministic **newest-first display sort** after lens selection. It does not calculate a relevance score or promote items.

Each visible card includes explicit match reasons supplied by the read model, for example:

- `Priority Watchlist: AI Adoption & Future of Work`
- `Active Watchlist: AI Agents & Agentic Workflows`

This makes Watchlist membership inspectable rather than opaque.

## Shared card interactions

The existing Phase 3 global rich-card interaction layer now observes `watchlistFeed` as well as the legacy feed containers.

Therefore Watchlist cards reuse the existing:

- Save / bookmark state
- Share behavior
- session dismiss behavior
- delayed preview behavior

The same URL-derived saved key is used across lenses, preserving global Saved semantics rather than creating Watchlist-specific saved state.

## Refresh behavior

The Watchlist Refresh action forces the existing News, Socials, Academic, Research, and Video source loaders to refresh.

A forced Watchlist refresh also invalidates the derived My Feed cache so a later return to My Feed cannot display a ranking based on pre-refresh source arrays.

Settings changes continue to invalidate their existing source caches. If Watchlist is active after a settings save, it reloads from the refreshed shared-store state.

## Focus remains deferred

This PR does **not** implement or relabel Focus.

It does not introduce:

- Focus promotion scoring
- the ratified 8 / 15 attention budget
- hard-promotion rules
- story clustering
- signal maturity
- cross-source convergence scoring
- Focus summaries
- Focus negative controls

Those depend on additional supporting layers and remain intentionally deferred.

## Current source-coverage limitation

The ratified Watchlist configuration is broader than the current legacy live source/query set.

As a result, some Priority or Active Watchlists may legitimately display a zero count today because the current ingestion configuration has not yet been expanded to dedicated discovery for every v10 domain. Phase 7 does not silently add new feeds or queries simply to make those counts nonzero.

That work should be handled as an explicit source-expansion phase against the canonical connector/endpoint model rather than hidden inside the visible migration.

## Verification fixtures

`js/tests/validate-watchlist-visible-v10.js` covers:

1. exactly 5 Priority continuous Watchlists
2. exactly 7 Active continuous Watchlists
3. Parked topics excluded from continuous controls
4. newest-first presentation sorting
5. presentation sorting does not mutate source lens entries
6. per-topic match counts
7. duplicate topic IDs on one entry count once
8. zero-count monitored topics remain represented
9. Library / Readwise highlights excluded from continuous Watchlist
10. knowledge objects remain explicitly queryable with `includeKnowledge: true`

## Repository delta before PR creation

At the final pre-audit comparison stage:

- branch based exactly on PR #24 merge commit
- 0 commits behind `main`
- existing source loaders are not replaced
- no feed URLs or connector execution changed
- no My Feed ranking weights changed
- no settings/localStorage schema changed
- no HTML source file changed; the visible tab/panel is injected by the v10 Watchlist UI module before navigation initialization

The intentionally modified existing runtime files are limited to:

- `js/dashboard.js` — Watchlist lifecycle orchestration
- `js/navigation.js` — recognize the Watchlist route
- `js/phase3.js` — include Watchlist in shared interaction/view behavior
- `js/lens-read-model.js` — enforce the Library/continuous-Watchlist boundary

## Execution limitation

A checkout-based local test run was attempted, but this execution environment could not resolve `github.com`.

No successful full browser/network integration run is claimed for this session.

The repository comparison confirms the intended structural delta; the visible deployment should receive a normal browser smoke test after merge.

## Recommended next phase

After Phase 7 is merged and the live Watchlist view is smoke-tested, the next migration should **not** jump to Focus.

Recommended Phase 8: migrate **People & Organizations** as the next visible lens over the same shared runtime path, while beginning a separate explicit source-gap inventory for Priority/Active v10 entities and Watchlists.
