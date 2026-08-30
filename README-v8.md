# Intelligence Hub v8 — Dynamic Feed Dashboard

This feature branch evolves the existing static GitHub Pages bookmark directory into a hybrid **Launchpad + Dynamic Feed Dashboard** without adding a backend, database, framework, build step, or paid widget dependency.

## Architecture

The existing 356-link Launchpad remains unchanged and continues to use:

- `data-destinations-1.js`
- `data-destinations-2.js`
- `data-destinations-3.js`
- `data-watchlists-1.js`
- `data-watchlists-2.js`
- `app.js`

v8 adds browser-native ES modules:

- `js/feed-config.js` — public, repository-safe source configuration
- `js/settings.js` — browser-local private settings
- `js/feed-client.js` — direct RSS/Atom parser + public proxy fallback + Readwise client
- `js/renderers.js` — safe DOM renderers for cards/timelines/papers/videos/highlights
- `js/feeds.js` — tab-specific loading/merge/dedupe logic
- `js/navigation.js` — top-level tab router + Launchpad Destinations/Watchlists state
- `js/dashboard.js` — small bootstrap module
- `dashboard.css` — dynamic dashboard UI layer

## Privacy rules

Private values are never stored in repository source files.

The Settings dialog stores:

- unified Social RSS URL
- whether that feed is private
- Readwise API token
- Readwise lookback window
- optional RSS2JSON API key

These values are stored in `localStorage` under the GitHub Pages origin.

**Important:** localStorage is origin-scoped but is not encrypted. Use the private settings only on devices you trust.

Private/tokenized feed URLs are **direct-fetch only** and are never forwarded to RSS2JSON or another public proxy.

## Cross-origin feed strategy

Public feeds:

1. Attempt a direct CORS `fetch()`.
2. If the publisher blocks browser cross-origin access, fall back to `https://api.rss2json.com/v1/api.json`.
3. An optional free-tier RSS2JSON key can be stored locally in Settings.

Private feeds:

1. Direct fetch only.
2. If the feed host does not allow CORS, the dashboard reports the limitation rather than leaking the private URL to a third-party proxy.

## Readwise correction

Current Readwise documentation exposes token-authenticated APIs for highlights/export. It does not document the proposed private "highlight RSS export" as the canonical integration.

The Books tab therefore uses the Readwise Export API directly:

`GET https://readwise.io/api/v2/export/`

with:

`Authorization: Token <browser-local-token>`

The token never appears in repository source.

## Source strategy

### News

Google News RSS search queries with `when:1d`, merged and deduplicated client-side.

### Socials

- optional unified RSS URL from Settings
- public Substack/custom-domain feeds configured in `js/feed-config.js`

No X/LinkedIn/Threads scraping is performed.

### Academic

Configured public feeds for HBR, MIT Technology Review, and Stanford HAI. If a source feed fails—or no verified current feed is available—the source can fall back to a scoped Google News site query. Knowledge at Wharton is configured this way until a stable current article RSS endpoint is verified.

### Research

The arXiv Atom API is queried for recent `cs.AI`, `cs.CL`, and `cs.LG` papers. Keyword matches such as `agentic`, `genai`, and `RAG` are pinned visually in the browser.

### Video

Uses the public YouTube channel feed form:

`https://www.youtube.com/feeds/videos.xml?channel_id=UC...`

Add public channel IDs to `js/feed-config.js`.

### Books

Recent Readwise highlights/clippings are loaded through the Readwise Export API with the locally stored token.

## No iframe dependency

No major-platform iframe embeds are used.
