import { initSettings } from "./settings.js";
import { createFeedDashboard } from "./feeds.js";
import { RUNTIME_LENS_SERVICE } from "./lens-service.js";
import { initNavigation } from "./navigation.js";
import { initV81UI } from "./v81-ui.js";
import { initMyFeedUI } from "./my-feed-ui.js";
import { initUIFoundation, decorateUIFoundation } from "./main.js";
import { initPhase4UX } from "./phase4.js";

initUIFoundation();
initMyFeedUI();
initV81UI();
decorateUIFoundation();
const feeds = createFeedDashboard();

// Internal v10 runtime read API. It intentionally exposes no item-store mutation
// methods and does not alter the current v9.x navigation or rendering path.
window.intelligenceHubV10 = Object.freeze({
  phase: 6,
  queryLens(lensId, options = {}) {
    return RUNTIME_LENS_SERVICE.query(lensId, options);
  },
  buildLensReadModels(optionsByLens = {}) {
    return RUNTIME_LENS_SERVICE.build(optionsByLens);
  },
  lensMembership(keyOrItem, optionsByLens = {}) {
    return RUNTIME_LENS_SERVICE.membership(keyOrItem, optionsByLens);
  },
  snapshot(optionsByLens = {}) {
    return RUNTIME_LENS_SERVICE.snapshot(optionsByLens);
  }
});

initSettings({
  onSaved() {
    // Settings dispatches ih:settings-saved immediately after this callback.
    // Queue the rerank so feed invalidation completes first, and only refresh
    // when My Feed is the active view.
    setTimeout(() => {
      if (document.body.dataset.primaryView !== "myfeed") return;
      feeds.load("myfeed").catch(error => console.error("Unable to rerank My Feed:", error));
    }, 0);
  }
});

const navigation = initNavigation({
  onPrimaryChange(tab) {
    if (tab !== "launchpad") {
      feeds.load(tab).catch(error => console.error(`Unable to load ${tab}:`, error));
    }
  }
});

initPhase4UX({
  navigation,
  async refresh(tab) {
    if (tab !== "myfeed") feeds.invalidate("myfeed");
    feeds.invalidate(tab);
    return feeds.load(tab, { force: true });
  }
});
