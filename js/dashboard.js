import { initSettings } from "./settings.js";
import { createFeedDashboard } from "./feeds.js";
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
