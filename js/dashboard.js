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

document.addEventListener("click", event => {
  const refresh = event.target.closest?.("[data-refresh-feed]");
  const tab = refresh?.dataset.refreshFeed;
  if (tab && tab !== "myfeed") feeds.invalidate("myfeed");
});

initNavigation({
  onPrimaryChange(tab) {
    if (tab !== "launchpad") {
      feeds.load(tab).catch(error => console.error(`Unable to load ${tab}:`, error));
    }
  }
});
