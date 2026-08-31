# Phase 8 — People & Organizations + Source-Gap Inventory

## Purpose

Phase 8 makes the second v10 intelligence lens visible while preserving the canonical runtime path:

```text
live source loaders
  → normalized intelligence objects
  → shared canonical item store
  → runtime lens service
  → People & Organizations read model
  → visible People & Organizations panel
```

The phase also turns source coverage into explicit data. A monitored entity must not look broken merely because the current connector catalog does not yet have a dedicated endpoint for it.

## Ratified population

The continuous People & Organizations lens contains only Priority and Active canonical entities:

- 19 People
  - 7 Priority
  - 12 Active
- 13 Organizations
  - 5 Priority
  - 8 Active
- 32 total followed entities

Parked and Known entities remain canonical but are not part of continuous monitoring.

## Coverage vocabulary

Coverage is evaluated against endpoints already represented in the v10 connector catalog.

- **Direct** — a current live endpoint explicitly belongs to the entity.
- **Shared** — a shared source can resolve the entity per item; the feed must not blindly attribute every item to every candidate.
- **Discovery** — a live search watches for coverage about the entity. Discovery is not authored/published-by evidence.
- **Related** — only a child/related entity has a live endpoint.
- **Gap** — no current direct, shared, discovery, or related live endpoint is represented.

Priority is `Direct > Shared > Discovery > Related > Gap` for inventory classification only. This is not content ranking.

## Current inventory

Current deterministic coverage summary:

| Coverage | Count |
| --- | ---: |
| Direct live source | 10 |
| Shared source | 2 |
| Discovery only | 0 |
| Related source only | 1 |
| Gap | 19 |
| **Total** | **32** |

### Priority People

- Ethan Mollick — Direct (`One Useful Thing`)
- Arvind Narayanan — Shared (`AI as Normal Technology`; author must resolve per item)
- Simon Willison — Direct
- Andrej Karpathy — Gap
- Paul Ford — Gap
- Benedict Evans — Gap
- Dario Amodei — Gap

### Active People

- Andrew Ng — Gap
- Rachel Woods — Direct
- Azeem Azhar — Gap
- Sayash Kapoor — Shared (`AI as Normal Technology`; author must resolve per item)
- Chip Huyen — Gap
- Jerry Liu — Gap
- Kevin Kelly — Gap
- Nathaniel Whittemore — Direct (`The AI Daily Brief` YouTube endpoint)
- Fei-Fei Li — Gap
- Dan Shipper — Gap
- Lance Eaton — Gap
- Lilian Weng — Gap

### Priority Organizations

- Anthropic — Direct (official YouTube) plus independent Google News discovery
- OpenAI — Direct (official RSS + YouTube) plus independent Google News discovery
- Google — Related-only through the separately canonical, Parked Google DeepMind child; DeepMind content is not silently relabeled as Google-wide publishing
- EDUCAUSE — Gap
- Stanford HAI — Direct (RSS) plus Google News fallback discovery

### Active Organizations

- Microsoft — Direct (Microsoft Research AI RSS + Microsoft Research YouTube)
- Hugging Face — Direct (blog RSS + YouTube)
- Meta AI — Gap
- Perplexity — Direct (official YouTube)
- NIST — Gap
- OECD.AI — Gap
- U.S. Department of Education — Gap
- Instructure — Gap

## Visible lens behavior

The new primary destination is inserted after Watchlist.

The visible lens:

- reads the existing `people-organizations` runtime lens
- loads the same shared source set already used by My Feed and Watchlist
- creates no new store or ingestion path
- keeps Priority/Active monitoring boundaries intact
- provides one compact `Following` selector instead of 32 persistent chips
- provides `All followed entities`, `All people`, and `All organizations` scopes
- groups individual options by Priority/Active and Person/Organization
- includes source-coverage status in individual selector labels
- exposes a collapsed Source coverage inventory
- displays explicit read-model relationship reasons on matching cards
- sorts only for presentation, newest first

## Zero-result interpretation

For a selected individual entity with no current item, the empty state includes the entity's current source coverage class.

This distinguishes:

- no live item despite a direct source,
- shared/discovery/related-only coverage,
- a true source gap.

A zero is therefore evidence about the current intake model, not an automatic implementation failure.

## Deliberately deferred source expansion

This PR does not invent or add feeds for any gap entity.

Before an endpoint is promoted into the live registry it should be verified for:

1. canonical ownership/identity,
2. endpoint URL or channel ID,
3. feed/transport availability,
4. item attribution semantics,
5. browser/static-site feasibility,
6. privacy boundary,
7. whether it is a source endpoint or only a discovery selector.

The first source-expansion pass should prioritize Priority gaps before Active gaps.

## Existing Phase 4 mobile-shell compatibility finding

During implementation, the existing `phase4.js` was confirmed to already contain:

- scroll-aware bottom controls,
- hide-on-scroll behavior,
- custom Pull-to-Refresh,
- static refresh-button removal for the legacy feed tabs.

Those mechanisms predate the v10 Watchlist and People & Organizations routes. Their current refresh/filter whitelists do not yet include the new v10 lenses.

This is recorded as an immediate follow-up mobile-shell integration task rather than duplicating that behavior inside Phase 8. The follow-up should:

- add Watchlist and People & Organizations to the existing Pull-to-Refresh eligibility model,
- remove their now-redundant static Refresh buttons through the existing mechanism,
- adapt Watchlist Topics into the existing scroll-aware bottom-control system,
- decide the compact People & Organizations bottom-control affordance from the existing `Following` selector,
- extend shared card observers to v10 lens containers instead of creating lens-specific Save/Share behavior.

## Preserved behavior

Phase 8 does not:

- add or alter feed URLs,
- change connector execution,
- change entity monitoring tiers,
- change Watchlist selection,
- change My Feed ranking,
- rename My Feed to Focus,
- implement Focus ranking,
- implement Signals/clustering,
- alter Saved storage semantics,
- silently treat Google DeepMind as Google-wide authored content,
- silently treat Google News discovery as target-authored content.

## Acceptance fixtures

`js/tests/validate-people-organizations-v10.js` asserts:

- 32 total followed entities,
- 19 People and 13 Organizations,
- 12 Priority and 20 Active,
- no Parked/Known entities in continuous selection,
- deterministic representative coverage classes,
- deterministic current coverage totals,
- newest-first presentation without mutation.

## Acceptance criterion

> Intelligence Hub exposes People & Organizations as a visible v10 lens over the shared canonical store and explicitly distinguishes current source coverage from source gaps, without adding unverified endpoints or creating a new ingestion silo.
