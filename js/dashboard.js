import { initSettings } from "./settings.js";
import { createFeedDashboard } from "./feeds.js";
import { initNavigation } from "./navigation.js";
import { initV81UI } from "./v81-ui.js";
import { initMyFeedUI } from "./my-feed-ui.js";

initMyFeedUI();
initV81UI();
const feeds = createFeedDashboard();

initSettings({
  onSaved() {
    // The feed controller invalidates private-source and personalized tabs via its settings event.
  }
});

initNavigation({
  onPrimaryChange(tab) {
    if (tab !== "launchpad") {
      feeds.load(tab).catch(error => console.error(`Unable to load ${tab}:`, error));
    }
  }
});
