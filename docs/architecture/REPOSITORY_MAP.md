# Repository Map — Current, Canonical, Compatibility, and Legacy Layers

**Purpose:** Help a cold-start developer or LLM identify which files are current authorities, which are compatibility seams, and which are intentionally retained legacy assets during the PierView.io / Intelligence Hub v10 migration.

## 1. Present-state authorities

| Path | Authority |
| --- | --- |
| `STATUS.md` | Present implementation state, completed milestones, verification state, next milestone |
| `AGENTS.md` | Contributor/LLM operating rules, invariants, validation and PR discipline |
| `README.md` | Project orientation and current product/runtime overview |

## 2. Target product authorities

| Path | Authority |
| --- | --- |
| `docs/architecture/PRODUCT_ARCHITECTURE.md` | Target PierView.io / Intelligence Hub product model and lens contract |
| `docs/architecture/INFORMATION_ARCHITECTURE.md` | Canonical entities, sources, relationships, provenance, evidence and information boundaries |
| `docs/configuration/RATIFIED_CONFIGURATION.md` | Approved Priority / Active / Parked / Core configuration and product preferences |
| `docs/architecture/MIGRATION_PLAN.md` | Staged migration sequence; stable milestone IDs are the preferred future reference |
| `TECHNICAL_SPEC.md` | Current v9.x UI/runtime compatibility requirements during staged migration |

## 3. Canonical v10 runtime foundation

| Path | Responsibility |
| --- | --- |
| `js/config/entity-types.js` | Canonical entity and monitoring-state vocabulary |
| `js/config/entities.js` | Canonical entity registry |
| `js/config/topic-taxonomy.js` | Ratified Watchlist topic/facet taxonomy |
| `js/config/preferences.js` | Product/lens preferences and ratified defaults |
| `js/config/evidence-types.js` | Evidence and verification vocabulary |
| `js/config/lenses.js` | Canonical lens registry |
| `js/config/legacy-map.js` | Deterministic compatibility mapping from pre-v10 identities/tags |
| `js/connectors/catalog.js` | Connector capabilities and canonical source endpoints |
| `js/connectors/live-source-map.js` | Mapping from current live feed configuration to canonical endpoints |
| `js/intelligence-object.js` | v10 relationship, evidence, provenance and canonicalization enrichment |
| `js/normalize.js` | Current normalization seam that preserves legacy fields while adding v10 relationships |
| `js/item-store.js` | Shared session-scoped canonical item store |
| `js/lens-read-model.js` | Pure read-only lens selection |
| `js/lens-service.js` | Runtime bridge from shared store to lens read models |

## 4. Current composition and visible v10 UI

| Path | Responsibility |
| --- | --- |
| `js/dashboard.js` | Browser composition root; creates feeds, navigation, settings and visible v10 lenses |
| `js/watchlist-ui.js` | Visible Watchlist lens over the shared read model |
| `js/watchlist-mobile.js` | Watchlist mobile integration seam into the shared interaction shell |
| `js/people-organizations-ui.js` | Visible People & Organizations lens over the shared read model |
| `js/entity-source-coverage.js` | Explicit monitored-entity source coverage inventory |
| `watchlist.css`, `watchlist-mobile.css` | Current visible Watchlist styling |
| `people-organizations.css` | Current visible People & Organizations styling |

## 5. Cross-route interaction authorities

These files predate the visible v10 lens migration but remain active authorities. New lenses should reuse or deliberately extend them rather than creating parallel interaction systems.

| Path | Responsibility |
| --- | --- |
| `js/main.js` | UI foundation compatibility entry, navigation shell initialization, Lucide loading |
| `js/phase3.js` | Command palette, focus behavior, previews and cross-card interaction layer |
| `js/phase4.js` | Pull-to-Refresh, scroll-aware bottom controls, Saved state/drawer, retry routing |
| `css/phase3.css`, `css/phase4.css` | Final interaction cascade layers |

## 6. Current live intake / compatibility layer

These files are still production-active. They are not “dead code” merely because v10 has a newer conceptual architecture.

| Path | Responsibility |
| --- | --- |
| `js/feed-config.js` | Current feed-level settings/caps |
| `js/source-registry.js` | Current public source registry used by live loaders |
| `js/feed-client.js` | Browser-side RSS/Atom/Readwise transport and parsing |
| `js/feeds.js` | Current source loading, cache and ingestion orchestration |
| `js/renderers.js` | Current feed/card rendering |
| `js/profiles.js` | Legacy/current profile registry still used by live compatibility paths |
| `js/topics.js` | Legacy/current topic classifier used by existing runtime paths |
| `js/my-feed.js`, `js/my-feed-config.js`, `js/my-feed-ui.js` | Current deterministic My Feed implementation |
| `js/navigation.js` | Current route/tab state and Launchpad view routing |
| `js/settings.js` | Browser-local configuration |

Do not delete or bypass these files until the migrated v10 replacement has parity and regression evidence.

## 7. Root-era Launchpad assets

The repository began as a static directory/Launchpad. These files remain intentionally active for Bookmarks/Launchpad behavior:

- `app.js`
- `data-destinations-1.js`
- `data-destinations-2.js`
- `data-destinations-3.js`
- `data-watchlists-1.js`
- `data-watchlists-2.js`
- `styles.css`
- `tabs.css`
- `dashboard.css`
- other root compatibility CSS files

They should migrate or be consolidated only when V10-M18 Legacy Cleanup has explicit parity evidence.

## 8. Historical documentation

- `README-v8.md`
- `README-v8.1.md`
- `README-v8.5.md`
- `README-v9.md`
- `docs/implementation/*`

These are valuable historical evidence. They are **not present-state authorities**. The versioned root READMEs may move into `docs/history/` during the final legacy/documentation cleanup once references are verified.

## 9. Validation

- `package.json` defines the canonical development-time validation command.
- `scripts/validate.mjs` runs syntax and acceptance/structural checks.
- `js/config/validate-foundation.js` validates canonical configuration references and scarce-tier counts.
- `js/tests/` contains phase/milestone acceptance fixtures.
- `.github/workflows/validate.yml` runs the same validation on pull requests and `main`.

Automated source validation does not replace deployed browser/device acceptance.

## 10. Change rule

A file's age or location is not sufficient reason to remove it. During migration, classify a candidate file as:

1. canonical target authority;
2. active compatibility/runtime authority;
3. historical evidence;
4. proven redundant legacy.

Only category 4 is eligible for deletion without replacement work.
