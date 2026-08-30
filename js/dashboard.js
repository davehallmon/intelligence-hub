import { initSettings } from "./settings.js";
import { createFeedDashboard } from "./feeds.js";
import { initNavigation } from "./navigation.js";

const feeds = createFeedDashboard();

initSettings({
  onSaved() {
    // The feed controller invalidates private-source tabs via its settings event.
  }
});

initNavigation({
  onPrimaryChange(tab) {
    if (tab !== "launchpad") {
      feeds.load(tab).catch(error => console.error(`Unable to load ${tab}:`, error));
    }
  }
});
