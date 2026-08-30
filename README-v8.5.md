# Intelligence Hub v8.5 — Social Source Policy

v8.5 formalizes the distinction between a canonical profile and the outlet used to ingest that profile's authored Social content.

## Governing rule

**A profile is an identity. A source is an outlet. Coverage or mentions are never treated as authored Social content.**

## Social source states

- **Direct** — the profile is attached to a verified public RSS/Atom/newsletter source already configured in the repository.
- **Bridge-eligible** — the profile's approved ingestion strategy allows a social bridge, but no bridge is enabled by default.
- **Coverage-only** — Intelligence Hub may identify the profile in News or other coverage, but it does not ingest a Social stream for that identity.
- **Watchlist** — the identity remains an outbound Launchpad/Watchlist reference only.

The state is derived from the canonical profile registry plus verified public Social sources. It is not maintained as a second manual profile list.

## Browser-local profile mappings

Settings now exposes optional RSS URL fields only for Bridge-eligible identities. Each configured URL is stored in the site's existing `localStorage` settings object under that profile's canonical ID.

Example conceptual mapping:

```text
person-andrej-karpathy -> https://…/private-feed.xml
```

The actual URL is never placed in repository files.

### Privacy behavior

- Profile bridge URLs are blank by default.
- Each mapping defaults to **private**.
- Private bridge feeds are fetched directly in the browser and are never sent through the public RSS2JSON fallback.
- A mapping explicitly marked public may use the normal public-feed transport/fallback behavior.
- `localStorage` is origin-scoped but not encrypted; configure private feeds only on devices you trust.

## Legacy unified feed

Earlier versions supported one generic unified Social RSS URL. v8.5 no longer loads that feed because its items cannot be attributed reliably to canonical profiles. If an older URL is still present in local storage, Settings displays a migration warning. Saving v8.5 Settings removes the legacy value.

## No paid or platform integration

v8.5 does not add X API access, LinkedIn API access, scraping, login, a backend, a database, or a paid RSS provider. It only creates the provenance-safe place where a future profile-specific feed can be configured locally if one becomes available.
