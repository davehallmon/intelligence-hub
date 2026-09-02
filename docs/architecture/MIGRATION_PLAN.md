# Intelligence Hub — v10 Migration Plan

**Status:** Ratified migration strategy  
**Version:** v10 target  
**Adopted:** 2026-08-31

## 1. Objective

Migrate the existing Intelligence Hub incrementally from source-type feeds and hard-coded configuration toward the v10 canonical entity/lens architecture **without a big-bang rewrite**.

The migration must preserve current working behavior while new foundations are introduced underneath it.

---

## 2. Non-negotiable constraints

- GitHub Pages static deployment remains in force.
- Semantic HTML/CSS and vanilla ES6 JavaScript remain the runtime stack.
- No backend, database, login service, Node runtime, or mandatory paid API is introduced by default.
- Browser-local privacy behavior must not regress.
- Provenance must not regress.
- Existing Saved behavior must not regress.
- Existing ranking must remain deterministic until the v10 Focus engine is explicitly introduced.
- Existing working source ingestion should be reused where feasible rather than replaced for architectural purity.
- Existing v9.x UI/runtime rules in `TECHNICAL_SPEC.md` remain authoritative during staged migration.
- Each implementation PR should be bounded, independently reviewable, and reversible.

---

## 3. Migration philosophy

The migration sequence is:

```text
Ratified documentation
→ canonical configuration/data foundation
→ normalized relationships
→ reusable lens engine
→ lens-by-lens visible migration
→ Questions
→ Focus / Signals last
→ cleanup and legacy removal only after parity
```

Focus is intentionally last because it depends on nearly every other model being trustworthy.

Stable milestone IDs are governed by [`V10_MILESTONE_MAP.md`](V10_MILESTONE_MAP.md). The original planning ordinals remain below only as historical cross-references.

---

## Original Phase 0 / V10-M00 — Architecture ratification

### Scope

Documentation only.

#### Deliverables

- `docs/architecture/PRODUCT_ARCHITECTURE.md`
- `docs/architecture/INFORMATION_ARCHITECTURE.md`
- `docs/configuration/RATIFIED_CONFIGURATION.md`
- `docs/architecture/MIGRATION_PLAN.md`

#### Forbidden changes

- HTML
- CSS
- JavaScript runtime behavior
- source configuration
- ranking
- Saved/local storage behavior

#### Acceptance criteria

- exactly documentation/configuration governance files are added/changed;
- current application remains byte-for-byte unchanged outside documentation;
- target architecture and existing `TECHNICAL_SPEC.md` relationship is explicit;
- unresolved implementation-verification items are identified rather than guessed.

---

## Original Phase 1 / V10-M01 — Canonical configuration and entity foundation

### Goal

Introduce the target data model underneath the existing UI while preserving current visible behavior.

### Likely modules

Names are illustrative; implementation may refine them without changing responsibility boundaries.

```text
/js/config/
  entities.js
  lenses.js
  preferences.js
  evidence-types.js
  topic-taxonomy.js

/js/connectors/
  catalog.js
```

### Work

1. Create a canonical entity registry supporting:
   - Person
   - Organization
   - Product/Platform
   - Publication
   - Media Property
   - Community
   - Research Source/Institution
2. Migrate current profile/watchlist identities into that registry.
3. Preserve aliases and canonical URLs.
4. Encode Priority / Active / Parked / Known state from `RATIFIED_CONFIGURATION.md`.
5. Introduce parent/child entity relationships.
6. Introduce source-endpoint declarations without replacing working connectors.
7. Encode lens configuration separately from entity existence.

### Critical rule

**Bookmark != monitored entity.**

Existing bookmark/destination data may establish a known entity or Launchpad destination, but must not automatically grant Active/Priority monitoring.

### Acceptance criteria

- current app renders and behaves as before;
- old profile IDs map deterministically to canonical entity IDs;
- no duplicate canonical entities are introduced for endpoint variants;
- configuration can distinguish global entity priority from lens relevance;
- static deployment remains intact.

---

## Original Phase 2 / V10-M02 — Normalized Intelligence Object v10 relationships

### Goal

Extend the existing normalization layer so one item can relate to several entities and lenses without duplication.

### Work

1. Preserve current normalized fields.
2. Add relationship fields for:
   - author
   - publisher
   - featured people
   - mentioned/about entities
   - organizations
   - products
   - publications
   - media properties
   - communities
   - topics/facets
3. Add evidence classification and verification status.
4. Add canonical URL / deduplication support.
5. Add relationship hooks for Questions, Library, and future story clusters.
6. Add parent/child product relationship resolution.

### Tests / verification

At minimum, fixtures should cover:

- authored by vs. featuring vs. about;
- same article via RSS and newsletter;
- same episode via podcast + YouTube + recap;
- organization announcement tied to product;
- Priority-person guest appearance on an otherwise unmonitored channel;
- private-source provenance preserved.

### Acceptance criteria

- one incoming item normalizes once;
- one object can be selected by multiple lenses;
- no UI duplication is required to express multiple relationships;
- provenance remains traceable to raw source input.

---

## Original Phase 3 / V10-M03 — Connector catalog and source-endpoint registry

### Goal

Separate **what exists** from **how it is ingested**.

### Work

1. Register reusable connector types.
2. Declare supported selector types per connector.
3. Attach source endpoints to canonical entities.
4. Preserve current working RSS/Atom, Google News, arXiv, YouTube, Readwise, and local-source behavior.
5. Add explicit distinction between evidence sources and discovery connectors.
6. Add endpoint health/capability metadata where practical.

### YouTube requirement

YouTube must support:

- Organization/Product endpoints;
- Person endpoints;
- Media-property endpoints;
- independent YouTube-first Media entities;
- guest-person discovery independent of followed channel;
- transcript enrichment when feasible;
- Shorts exclusion by default.

### Acceptance criteria

- the same connector implementation can serve multiple lenses/entities;
- endpoint identity is not conflated with canonical entity identity;
- source feasibility failures do not silently alter Priority/Core configuration.

---

## Original Phase 4 / V10-M04 — Lens engine

### Goal

Introduce a reusable lens-selection engine while existing tabs can still coexist during transition.

### Work

1. Implement generic lens configuration:
   - entity selectors
   - topic/facet selectors
   - endpoint-type rules
   - include/exclude rules
   - freshness policy
   - ranking policy
   - display policy
2. Build lens queries over normalized objects.
3. Support multi-lens eligibility for one object.
4. Preserve current route behavior until each visible lens is migrated.

### Acceptance criteria

- a single normalized object can appear logically in several lens results without data duplication;
- lens behavior is configuration-driven rather than source-type hard-coded;
- legacy source-type feeds can remain available during transition.

### Inserted runtime-foundation milestones

Implementation added two stable milestones that were not separate numbered phases in the original plan:

- **V10-M05 — Shared canonical item store** — complete in PR #23;
- **V10-M06 — Runtime lens service** — complete in PR #24.

These insertions are why later original planning ordinals do not match implementation ordinals.

---

## Original Phase 5 / V10-M07 — Watchlist migration

### Goal

Make Watchlist the first visible v10 intelligence lens because its topic/facet configuration is already strongly ratified.

### Work

- encode 5 Priority + 7 Active topics;
- encode Core/Secondary/Parked facets;
- broad discovery with strict Focus relevance separation;
- support include/exclude/search rules;
- keep Parked topics searchable but non-continuous.

### Acceptance criteria

- no more than the ratified topics are continuously monitored;
- parked topics do not leak into continuous monitoring merely because they exist in the taxonomy;
- source provenance remains visible.

---

## Original Phase 6 / V10-M08 — People & Organizations migration

### Goal

Replace profile-as-feed assumptions with canonical entity monitoring.

### Work

- encode ratified Priority/Active/Parked people;
- implement authored/social/appearance preferences for Priority people;
- encode ratified organizations and activity types;
- support authoredBy / publishedBy / featuring / about distinctions;
- attach newsletters, blogs, social profiles, YouTube, podcasts, research, and event endpoints to one entity.

### Acceptance criteria

- a person is never duplicated merely because they publish in several formats;
- general press mentions are not treated as authored work;
- independent convergence among Priority people can be represented.

---

## Original Phase 7 / V10-M09 — Products & Platforms migration

### Goal

Monitor meaningful workflow-affecting changes with parent/child product relationships.

### Work

- encode Priority/Active/Parked products;
- support child capabilities such as Claude Skills and Custom GPTs;
- implement change-signal types (feature/model/workflow/integration/docs/etc.);
- implement relevance rules for previews/experimental products;
- avoid treating every changelog entry as important.

### Acceptance criteria

- parent/child product hierarchy works;
- product updates can also relate to parent organization without duplicate items;
- Priority Product status alone does not guarantee Focus placement.

---

## V10-M09A — Repository Structure Normalization

### Goal

Establish a durable repository structure before additional visible lenses arrive, without changing deployed behavior or removing active compatibility paths.

### Work

- archive indexed historical release documentation;
- delete only source proven unreachable from production and validation entry points;
- enforce JavaScript reachability and local-resource checks;
- establish short-lived branch and pull-request lifecycle guidance;
- move current lens modules, lens styles, and Node-only tests into durable responsibility-based locations;
- preserve runtime load order, stylesheet cascade, object identity, and GitHub Pages behavior.

### Acceptance criteria

- repository validation passes;
- no intentional product behavior or visual change occurs;
- historical evidence remains discoverable;
- production-active compatibility files remain until parity exists;
- V10-M10 begins in the normalized directory and naming contract.

---

## Original Phase 8 / V10-M10 — Publications & Media migration

### Goal

Unify editorial and long-form audiovisual monitoring while preserving format distinctions.

### Publications work

- Core/Active/Parked publication configuration;
- canonical-article resolution across RSS/email/web;
- primary-source preference in story relationships;
- Analysis/Opinion evidence labels.

### Media work

- Core/Active/Parked Media properties;
- episode trigger rules;
- independent YouTube-first sources;
- transcript enrichment;
- multi-format canonical episode;
- Priority-person guest discovery.

### Acceptance criteria

- newsletter/podcast/video copies of one episode do not become duplicate objects;
- person-owned outlets attach to Person where appropriate;
- official organization channels remain endpoints rather than redundant Media entities.

---

## Original Phase 9 / V10-M11 — Research migration

### Goal

Replace the generic arXiv-heavy feed with an evidence-oriented research lens.

### Work

- Core/Active/Parked Research domains;
- approved/parked Research sources;
- ERIC and NBER program/filter support;
- discovery-connector distinction for Consensus/Elicit;
- research metadata fields;
- methodology and publication-status presentation;
- research-specific Focus eligibility.

### Acceptance criteria

- general frontier-model research is not overrepresented merely because it is easy to ingest;
- research cards expose method, sample, limitations, status, and why-it-matters;
- highly cited/new alone does not promote research.

---

## Original Phase 10 / V10-M12 — Communities migration

### Goal

Capture practitioner signals without building a social engagement feed.

### Preflight requirement

Before wiring new communities:

- verify exact names/casing;
- verify community existence/activity;
- verify practical feed/API accessibility;
- resolve the specific Core ingestion behavior for `r/WritingWithAI`.

### Work

- Core/Active/Parked community configuration;
- practical-evidence preferences;
- community convergence into one signal;
- unverified-community-report state;
- official-confirmation update path.

### Acceptance criteria

- popularity alone never promotes a post;
- repeated reports may cluster into one community signal;
- unverified and confirmed states remain distinguishable.

---

## Original Phase 11 / V10-M13 — Events & Learning migration

### Goal

Create an actionable opportunity lens rather than a generic calendar/event feed.

### Work

- opportunity-type preferences;
- Core/Active/Parked learning domains;
- Priority/Active/Parked providers;
- person/media/publication event endpoints;
- time-budget preferences;
- Save / Calendar / Reminder actions;
- post-event conversion into Media/Library material.

### Acceptance criteria

- only exceptional opportunities qualify for Focus;
- event prestige/popularity does not substitute for applicability;
- calendar commitment boosts rather than guarantees Focus relevance.

---

## Original Phase 12 / V10-M14 — Library, Saved, Bookmarks, Personal

### Goal

Formalize personal-state boundaries without collapsing them into one storage bucket.

### Work

#### Library

- incorporate approved Library content types;
- full-text and related-knowledge search;
- previous-encounter and contradiction support;
- Library-to-Focus relevance signal.

#### Saved

- preserve current star behavior;
- add read/unread/archive state;
- AI classification with correction;
- separate Saved from Library promotion.

#### Bookmarks

- preserve Launchpad/directory behavior;
- known-entity mapping;
- no automatic monitoring.

#### Personal

- support approved manual/private inputs;
- suggest lens/entity classification for approval;
- enforce private provenance and Focus exclusion.

### Acceptance criteria

- `Library = learned`, `Saved = keep`, `Bookmarks = go`, `Personal = add` remains observable in state/UI;
- private content cannot silently leak into Focus or public-source claims.

---

## Original Phase 13 / V10-M15 — Questions

### Goal

Implement a persistent plan-first investigation workspace over the shared intelligence graph.

### Work

- support all ratified Question modes;
- create/approve research plan before execution;
- default and optional information-space scopes;
- evidence hierarchy and research standards;
- output formats;
- saved Question state;
- monitored Question triggers/cadence;
- Question ↔ Watchlist promotion paths;
- maximum 5 monitored Questions.

### Acceptance criteria

- no substantial Question executes before approved plan;
- private evidence remains visibly private;
- AI synthesis is never treated as higher authority than source evidence;
- monitored Questions update on material change, not mere matching volume.

---

## Original Phase 14 / V10-M16 — Story clustering and Signals engine

### Goal

Create the synthesis layer required before v10 Focus can safely replace the current ranking experience.

### Work

- canonical duplicate resolution;
- story cluster creation;
- source-role assignment;
- confidence/verification state;
- cross-source disagreement representation;
- signal detection;
- signal maturity state.

### Acceptance criteria

- one development does not flood Focus with near-duplicate cards;
- clusters retain all constituent provenance;
- Signals cannot be created by popularity alone;
- maturity can move forward or reverse based on evidence.

---

## Original Phase 15 / V10-M17 — Focus v10

### Goal

Implement the final decision layer after the underlying data relationships are trustworthy.

### Work

- ratified promotion weights;
- hard eligibility rules;
- hybrid Focus sections;
- max 8 Worth Your Attention;
- max 15 before Show more;
- freshness policy;
- clustering-first diversity;
- visible `Why am I seeing this?`;
- evidence labels;
- concise `What happened / Why it matters` synthesis;
- explicit interaction feedback only;
- negative controls;
- pull-not-push behavior;
- continuous ingestion with materially slower attention refresh.

### Acceptance criteria

The north-star test must be demonstrably supportable:

> **Focus is working if I can open Intelligence Hub for 10 minutes and know precisely how emerging evidence, structural shifts, or product realities change the underlying assumptions of my ongoing consulting, writing, or instructional projects.**

Additionally:

- popularity has zero ranking weight;
- passive engagement behavior has no default ranking weight;
- every Focus card can explain its ranking;
- hard promotion means Focus eligibility, not guaranteed top-eight placement;
- Focus remains finite and finishable.

---

## Original Phase 16 / V10-M18 — Legacy cleanup

### Goal

Remove legacy pathways only after migrated replacements have parity and regression evidence.

### Work

- identify source-type tabs/modules no longer needed;
- remove compatibility aliases incrementally;
- consolidate duplicate configuration;
- update root README and `TECHNICAL_SPEC.md` when v10 becomes the live authority;
- document final v10 runtime structure.

### Rule

Legacy code is technical debt only after the replacement has proven safe. Do not delete working compatibility code early merely to make the repository look cleaner.

---

## Pull-request discipline

Each implementation PR should include:

1. explicit phase/scope;
2. base SHA;
3. changed paths;
4. behavior intentionally changed;
5. behavior intentionally preserved;
6. tests/fixtures/manual verification performed;
7. migration/rollback notes;
8. unresolved risks;
9. confirmation that unrelated lenses were not changed.

Preferred implementation characteristic:

> **One architectural concern per PR, with old behavior preserved until the new path is verified.**

---

## Historical post-ratification starting point — completed

This section preserves the first implementation recommendation made when the architecture was ratified. The Configuration/Data Foundation work was completed in PR #19. It is no longer the current next action; use [`STATUS.md`](../../STATUS.md) and the stable milestone map for present sequencing.

The recommended first runtime PR was:

**Configuration/Data Foundation**

Scope recorded at ratification:

- canonical entity types;
- ratified Priority/Active/Parked configuration;
- parent/child relationships;
- connector/endpoint declaration structure;
- lens configuration model;
- compatibility mapping from existing profile/watchlist data;
- no intentional visible UX redesign.

Acceptance test:

> **The new architecture exists underneath the application while the existing experience still works.**
