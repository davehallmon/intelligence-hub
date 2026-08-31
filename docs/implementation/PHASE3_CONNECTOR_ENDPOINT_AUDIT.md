# Intelligence Hub v10 — Phase 3 Connector / Endpoint Audit

**Phase:** Reusable connector catalog and source-endpoint registry  
**Branch:** `feature/connector-endpoint-registry-v10`  
**Base:** `1872b63bd425a978ef2d46f291493976854f4adc`  
**Visible runtime behavior changed:** No intentional UI/feed-routing change

## Scope implemented

Phase 3 strengthens the v10 intake model without replacing the current v9.x fetch pipeline.

Implemented:

- richer connector capability metadata
- canonical endpoint IDs for every current public legacy source
- canonical endpoint declarations for academic direct feeds, arXiv, and Readwise
- canonical discovery endpoint declarations for current Google News searches and academic fallbacks
- explicit distinction between source-bearing entities and selector/subject entities
- v10 Media augmentation for the AI Daily Brief YouTube endpoint
- lookup helpers by endpoint, connector, entity, topic, and legacy source ID
- validation of endpoint IDs, connector IDs, and entity references
- a compatibility map proving current `FEED_CONFIG` sources have v10 endpoint identities
- a browser-local private-social-bridge descriptor contract that never serializes the private feed URL
- Phase 3 acceptance fixtures

## Governing distinction

A discovery target is not automatically a source or publisher.

Example:

```text
Google News query: OpenAI coverage
  selectorEntityIds: [org-openai]
  entityIds: []
```

This means the connector searches **about OpenAI** without claiming that OpenAI published the returned coverage.

By contrast:

```text
OpenAI official RSS
  entityIds: [org-openai]
```

This is a genuine source-bearing endpoint.

## Current live intake coverage

The Phase 3 compatibility map represents:

- News direct RSS feeds
- News Google News discovery queries
- Social public RSS/Atom feeds
- Academic direct RSS feeds
- Academic Google News fallbacks
- arXiv research query
- YouTube channel feeds
- Readwise browser-local API access
- browser-local social bridge identity/capability contract

The live fetchers remain where they are today. Phase 3 gives those paths canonical endpoint identities first; later migration can reroute ingestion through reusable connector execution without changing identity again.

## Privacy boundary

No private social-feed URL, Readwise token, RSS2JSON key, or other private locator is added to repository configuration.

The browser-local social bridge descriptor records:

- runtime endpoint identity
- connector type
- canonical entity IDs
- private provenance
- whether a runtime locator exists

It intentionally stores `url: null` in the reusable descriptor.

## Verification

Repository-level verification performed:

- branch starts from PR #20 merge SHA
- connector catalog preserves all previous legacy endpoint IDs
- current feed sources map deterministically to canonical v10 endpoint IDs
- discovery selectors are separated from source-bearing `entityIds`
- connector registry declares credential/privacy behavior
- pending/new external sources are not fabricated into live endpoints
- Phase 3 fixtures assert source-vs-selector semantics, current feed coverage, media endpoint augmentation, connector evidence roles, Readwise privacy, and browser-local private-locator non-disclosure

Attempted checkout-based execution was blocked in this environment because `github.com` could not resolve. No successful local execution result is claimed for this session. The repository includes `js/tests/validate-connectors-v10.js` for execution in a normal checkout or future CI.

## Intentionally deferred

- replacing current feed fetch functions with connector executors
- dynamically constructing all Personal/private endpoints through the registry
- authenticated connector execution beyond current browser-local patterns
- new endpoint verification for Priority/Active entities not already supported by live sources
- transcript retrieval
- story clustering
- lens-query execution
- Focus ranking

## Acceptance conclusion

Phase 3 establishes a stable boundary:

> **Connectors describe how content can be obtained; endpoints describe where/what to obtain; entities describe who/what the endpoint belongs to or targets; lenses decide how the resulting intelligence is viewed.**

The current application remains operationally on its existing fetch path while the v10 identity model becomes reusable underneath it.
