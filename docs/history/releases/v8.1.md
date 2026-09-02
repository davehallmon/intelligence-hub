# Intelligence Hub v8.1 — Feed Intelligence Layer

v8.1 keeps the static GitHub Pages architecture and the existing 356-link Launchpad, while adding a shared browser-side intelligence pipeline for dynamic feeds.

## What changed

### Normalized content model

Every dynamic feed item is normalized into a common object with:

- `id`
- `type`
- `title`
- `url`
- `source` / `sourceUrl`
- `author` / `authors`
- `profiles`
- `publishedAt`
- `summary`
- `imageUrl`
- `faviconUrl`
- `topics`
- `badges`

This prepares News, Socials, Academic, Research, Video, Books, and a future My Feed view to share filtering and rendering logic.

### Image-aware feeds

The RSS/Atom parser now looks for images in this order:

1. `media:thumbnail`
2. image-type `media:content`
3. image-type `<enclosure>`
4. the first `<img>` embedded in feed HTML/content
5. platform-derived thumbnail (YouTube)
6. source favicon / branded placeholder

Remote article pages are not scraped for `og:image`, avoiding a fragile browser-side CORS scraping architecture.

### Topic intelligence

`js/topics.js` implements the existing 23-topic tracked taxonomy as a conservative client-side string classifier. Sources can also seed known topic labels (for example, the AI Agents Google News query seeds `AI Agents`).

After each feed loads, the most common detected topics appear as filter chips. Selecting a topic filters the already-loaded items locally; no new network request is needed.

### Profile-ready schema

The normalized schema includes a `profiles` array. Current known feeds seed obvious profiles such as Ethan Mollick, Rachel Woods, OpenAI, Anthropic, Google DeepMind, and institutional publishers. Full profile mapping/filtering is intentionally deferred to the next approved product step.

## New modules

- `js/topics.js` — tracked-topic taxonomy + classifier
- `js/normalize.js` — common content schema
- `js/feed-filters.js` — topic filter chips and client-side filtering
- `js/v81-ui.js` — v8.1 visual bootstrap
- `feed-intelligence.css` — rich media card and topic-filter styles

## Updated modules

- `js/feed-client.js` — richer RSS/Atom media extraction
- `js/feed-config.js` — profile/topic metadata on configured sources
- `js/feeds.js` — normalization, topic tagging, image-aware status reporting
- `js/renderers.js` — rich media cards and topic badges
- `js/dashboard.js` — v8.1 UI initialization

## Privacy and architecture

No backend, database, authentication flow, iframe integration, or new paid service is introduced. Private settings remain in localStorage, and private/tokenized feed URLs continue to bypass public RSS proxies.
