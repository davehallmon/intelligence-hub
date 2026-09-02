# Lens Modules

This directory owns the shared v10 lens query/service layer and visible lens-specific UI or presentation helpers.

| Responsibility | Current modules |
| --- | --- |
| Shared selection and runtime bridge | `lens-read-model.js`, `lens-service.js` |
| Watchlist | `watchlist-ui.js`, `watchlist-mobile.js` |
| People & Organizations | `people-organizations-ui.js`, `entity-source-coverage.js` |
| Products & Platforms | `products-platforms-ui.js`, `product-change-classifier.js` |

Lenses query the shared canonical item store; they do not own ingestion silos or duplicate canonical objects. New visible lens work, beginning with V10-M10 Publications & Media, should start here unless the responsibility is genuinely shared application infrastructure.
