# Intelligence Hub v10 — Phase 2 Normalization Audit

**Phase:** Normalized Intelligence Object v10 relationships  
**Branch:** `feature/normalized-intelligence-object-v10`  
**Base:** `305fa52e4cc824af463bce4ad68f429cd2982484`  
**Runtime behavior intentionally redesigned:** No visible UI/ranking redesign

## Scope implemented

Phase 2 extends the existing normalized feed object without removing or renaming legacy fields consumed by the live v9.x UI.

Added v10 fields include:

- `objectType`
- `canonicalUrl`
- `canonicalObjectKey`
- `dedupeKey`
- `sourceEndpointId`
- `entityIds`
- `sourceEntityIds`
- `authorEntityIds`
- `publisherEntityIds`
- `featuredEntityIds`
- `mentionedEntityIds`
- typed entity arrays for organizations, products, publications, media, communities, and research sources
- `relationships`
- `evidenceType`
- `verificationStatus`
- `provenance`

## Relationship rules

The implementation preserves the ratified distinction:

`authored by ≠ published by ≠ featuring ≠ about/mentioned ≠ source entity`

Important safeguards:

- legacy profile IDs remain available for the current UI/ranking;
- author relationships resolve from explicit author references and known author names;
- coverage subjects are not silently promoted into publishers;
- source entities are tracked separately from publishers;
- products may be related to an item without becoming publishers;
- guest appearances can be expressed explicitly even when the host channel is not monitored;
- generic v10 product/media/community relationships are supported through explicit entity refs rather than reckless full-text inference.

## Canonicalization / dedupe hooks

`canonicalUrl` removes:

- URL fragments;
- common tracking parameters including `utm_*`, `fbclid`, `gclid`, and related identifiers;
- a leading `www.` host prefix;
- non-root trailing slashes;

Remaining query parameters are preserved and sorted.

`canonicalObjectKey` defaults to the canonical URL (then legacy ID if needed) but may be supplied explicitly so podcast, YouTube, transcript, and recap variants can later resolve to one canonical episode/story object.

The current feed-level dedupe function is intentionally not replaced in this PR; Phase 2 provides the normalized dedupe authority/hook first. A later clustering/deduplication phase may adopt it after compatibility evidence.

## Provenance and privacy

The normalized object now records:

- resolved source endpoint when deterministic;
- source entity IDs;
- source label and URL;
- transport;
- public/private provenance;
- existing badges.

Private bridge transport (`direct-private`) remains explicitly marked private. No credentials or private feed secrets are introduced into repository configuration.

## Evidence classification

Conservative defaults only:

- research feed item → `research`
- Official / Direct badge → `primary-source`
- Coverage / Google News fallback → `independent-reporting`
- academic feed item → `independent-reporting`
- community object → `community-report-unverified`
- otherwise no evidence class is invented

Verification status defaults to `unverified` unless explicitly supplied. This avoids treating successful ingestion as factual verification.

## Source endpoint resolution

Resolution order:

1. explicit endpoint ID;
2. Readwise fixed local endpoint for highlights;
3. exact source/feed URL match;
4. source name + compatible legacy tab;
5. canonical source entity + compatible legacy tab.

The final path supports cases such as:

`arXiv → research-source-arxiv → endpoint-arxiv-current`

without hard-coded source-specific logic.

## Acceptance fixtures

`js/tests/validate-normalization-v10.js` covers:

1. authored-by vs. publisher vs. featuring vs. mentioned role separation;
2. canonical URL / tracking-parameter dedupe equivalence;
3. shared canonical object key across podcast and YouTube variants;
4. official organization announcement related to a Product without Product→publisher collapse;
5. Priority-person guest appearance on an otherwise unmonitored channel;
6. explicit private-source provenance;
7. coverage subject not becoming publisher;
8. arXiv research-source/entity/endpoint resolution.

The fixtures also assert that legacy normalized fields remain present.

## Verification performed

- branch starts exactly from merged PR #19 SHA;
- repository compare shows the branch ahead and not behind `main`;
- no renderer, ranking, navigation, settings, storage, source registry, or feed-fetching module is modified;
- `normalize.js` preserves its established legacy output fields and adds enrichment after constructing the legacy object;
- the new enrichment module and fixture module were syntax-checked during development with `node --check` before repository write;
- later structural changes were re-audited through the connected GitHub repository after local GitHub DNS access proved unavailable.

## Intentionally deferred

- live lens-query behavior;
- broad automatic entity extraction for Products/Publications/Media/Communities from arbitrary article text;
- actual cross-format episode auto-matching;
- story clustering;
- replacement of current feed-level dedupe with `dedupeKey`;
- Focus ranking use of evidence/entity relationships;
- private-source use outside the already-ratified Questions/Search/Library boundaries.

## Acceptance conclusion

Phase 2 provides the v10 normalized relationship vocabulary and compatibility hooks while preserving the live v9.x presentation and deterministic My Feed inputs.

The next migration phase can build reusable connector/source-endpoint behavior on top of these normalized relationships rather than inventing another identity layer.
