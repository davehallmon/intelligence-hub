// Intelligence Hub v10 — Phase 6 runtime lens service.
// Bridges the shared canonical item store to the pure Phase 4 lens read model.
// This module performs no ingestion, persistence, ranking, rendering, or navigation.

import { SHARED_ITEM_STORE } from "./item-store.js";
import {
  QUERYABLE_LENS_IDS,
  queryLens,
  buildLensReadModels,
  lensMembershipForItem
} from "./lens-read-model.js";

function freezeCounts(models) {
  return Object.freeze(Object.fromEntries(
    QUERYABLE_LENS_IDS.map(lensId => [lensId, models[lensId]?.items?.length || 0])
  ));
}

export class RuntimeLensService {
  constructor(store = SHARED_ITEM_STORE) {
    this.store = store;
  }

  getCanonicalItems() {
    return this.store.getItems();
  }

  query(lensId, options = {}) {
    return queryLens(this.store.getItems(), lensId, options);
  }

  build(optionsByLens = {}) {
    return buildLensReadModels(this.store.getItems(), optionsByLens);
  }

  membership(keyOrItem, optionsByLens = {}) {
    const item = typeof keyOrItem === "string"
      ? this.store.getEntry(keyOrItem)?.item
      : this.store.getEntry(keyOrItem || {})?.item || keyOrItem || null;

    if (!item) return Object.freeze([]);
    return lensMembershipForItem(item, optionsByLens);
  }

  snapshot(optionsByLens = {}) {
    const models = this.build(optionsByLens);
    return Object.freeze({
      store: this.store.stats(),
      lensCounts: freezeCounts(models),
      lenses: models
    });
  }
}

export const RUNTIME_LENS_SERVICE = new RuntimeLensService();
