# PierView.io — Intelligence Hub

PierView.io is a personal intelligence workspace: a browser-based application for collecting, organizing, filtering, connecting, and prioritizing information from the sources and subjects you choose to follow.

The repository and current deployed UI still use the working name **Intelligence Hub** in many runtime files and historical documents. During the v10 migration, **PierView.io describes the product direction while `intelligence-hub` remains the repository/runtime compatibility name**. Runtime branding should be changed only in an explicit product/UI migration, not as an incidental documentation cleanup.

## What the application does today

The current GitHub Pages application combines a static Launchpad with live browser-side intelligence feeds and browser-local preferences. Current capabilities include:

- curated Bookmarks / Launchpad destinations and watchlist references;
- live News, Social, Academic, Research, Video, and Readwise/Books sources;
- a deterministic **My Feed** that ranks normalized source items using explicit priorities, provenance, freshness, and diversity rather than behavioral tracking;
- persistent browser-local Saved stars;
- canonical v10 configuration for people, organizations, products, publications, media, communities, research sources, topics, connectors, and lenses;
- one shared canonical session item store beneath the existing source loaders;
- reusable v10 lens read models over that shared store;
- visible **Watchlist**, **People & Organizations**, and **Products & Platforms** v10 lenses;
- deterministic Product-change filtering that favors explicit model, feature, workflow/UI, integration, and documentation changes while preserving an All matched items view;
- shared mobile Pull-to-Refresh, bottom controls, retry routing, and Saved behavior across the visible v10 lenses.

## Where the product is going

PierView.io is intended to reduce repeated context switching across websites and services. Instead of inheriting every platform's recommendation algorithm, it creates a deliberate information environment organized around the people, organizations, products, topics, publications, communities, questions, evidence standards, and projects that matter to the user.

The target v10 navigation model is:

1. Focus
2. Watchlist
3. People & Organizations
4. Products & Platforms
5. Publications
6. Research
7. Media
8. Communities
9. Events & Learning
10. Library
11. Questions
12. Bookmarks
13. Personal
14. Settings

**Saved ⭐ is an action/state, not a navigation lens.**

See [`docs/architecture/PRODUCT_ARCHITECTURE.md`](docs/architecture/PRODUCT_ARCHITECTURE.md) for the ratified target product model and [`STATUS.md`](STATUS.md) for the current implementation state.

## Technical architecture

- Static GitHub Pages deployment.
- Semantic HTML, CSS, and vanilla ES modules.
- No backend server, database, login service, Node runtime, or mandatory paid API in production.
- RSS/Atom, Google News, arXiv, YouTube, Readwise, and configured browser-local feeds.
- Personal credentials and preferences remain browser-local.
- Public feeds may use the existing public RSS proxy fallback; private feeds remain direct-only.
- One normalized intelligence object may participate in multiple lenses without being copied into separate ingestion silos.
- Provenance and source/entity relationship semantics are retained through normalization and lens selection.

### Runtime flow

```text
Live source loaders
  → normalized intelligence objects
  → shared canonical item store
  → runtime lens service
  → lens read models
  → visible lens UI
```

The current v9.x UI/runtime compatibility rules remain governed by [`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md) while v10 components migrate incrementally.

## Repository map

| Path | Role |
| --- | --- |
| `index.html` | Current static page shell and legacy-compatible panels |
| `js/dashboard.js` | Browser composition root for feeds, navigation, settings, and visible v10 lenses |
| `js/config/` | Canonical v10 entities, lenses, topics, evidence vocabulary, preferences, compatibility maps |
| `js/connectors/` | Connector capabilities and canonical source-endpoint registry |
| `js/normalize.js`, `js/intelligence-object.js` | Normalization and v10 relationship/provenance enrichment |
| `js/item-store.js` | Shared session-scoped canonical item store |
| `js/lenses/` | Shared lens selection/service plus visible lens UI and lens-specific helpers |
| `css/lenses/` | Visible v10 lens styling |
| `tests/` | Node-only acceptance fixtures and structural validators |
| `docs/architecture/` | Product/information architecture and migration authority |
| `docs/configuration/` | Ratified product configuration |
| `docs/implementation/` | Historical implementation/audit records for completed migration work |
| `docs/history/` | Indexed superseded release and product documentation |
| root legacy CSS/JS/data files | Intentional compatibility layer retained until replacement parity is proven |

For a more explicit current/legacy authority map, see [`docs/architecture/REPOSITORY_MAP.md`](docs/architecture/REPOSITORY_MAP.md).

## Development and validation

No build step is required to serve the site. For local development, serve the repository root with any static HTTP server rather than opening `index.html` with a `file://` URL, because ES modules require normal web-origin behavior.

Node is used **only for development-time validation**, not as a production dependency.

```bash
npm run validate
```

The validation command syntax-checks JavaScript, verifies entry-point reachability and production resources, enforces the repository-root file contract, checks local Markdown references and the canonical configuration export surface, and runs the repository's v10 acceptance/structural fixtures. Pull requests also run the same validation in GitHub Actions.

Browser/device acceptance remains necessary for interaction changes, especially mobile gestures, responsive navigation, and remote-feed transport behavior.

## Documentation authority

For a cold-start developer or LLM, read in this order:

1. [`STATUS.md`](STATUS.md) — current implementation state and next milestone.
2. [`AGENTS.md`](AGENTS.md) — handoff rules, invariants, and validation expectations.
3. [`docs/architecture/PRODUCT_ARCHITECTURE.md`](docs/architecture/PRODUCT_ARCHITECTURE.md) — target product contract.
4. [`docs/architecture/INFORMATION_ARCHITECTURE.md`](docs/architecture/INFORMATION_ARCHITECTURE.md) — target information relationships.
5. [`docs/configuration/RATIFIED_CONFIGURATION.md`](docs/configuration/RATIFIED_CONFIGURATION.md) — approved configuration.
6. [`docs/architecture/MIGRATION_PLAN.md`](docs/architecture/MIGRATION_PLAN.md) — staged migration sequence and stable milestone IDs.
7. [`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md) — current UI/runtime compatibility requirements.
8. `docs/implementation/*` and PR history — historical evidence, not the single source of present status.

## Privacy

The public repository intentionally does not store private feed URLs, API tokens, or user-identifying workspace configuration. Browser-local values use `localStorage`; private feeds are not sent through the public RSS proxy fallback.

## Deployment

GitHub Pages publishes from the `main` branch and repository root. A successful Pages build proves static deployment, but does **not** by itself prove every browser-origin remote feed, CORS path, responsive layout, or touch interaction works correctly.

## Current status

**V10-M09 — Products & Platforms visible migration** is the latest implemented v10 product milestone. **V10-M09A — Repository Structure Normalization** is the active pre-M10 remediation concern. Continue from [`STATUS.md`](STATUS.md); the next stable product milestone remains **V10-M10 — Publications & Media migration**. Do not infer current work from a bare historical phase number.
