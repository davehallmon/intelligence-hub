import { initSettings } from "./settings.js";
import { createFeedDashboard } from "./feeds.js";
import { RUNTIME_LENS_SERVICE } from "./lens-service.js";
import { initNavigation } from "./navigation.js";
import { initV81UI } from "./v81-ui.js";
import { initMyFeedUI } from "./my-feed-ui.js";
import { MY_FEED_SOURCE_TABS } from "./my-feed-config.js";
import { initWatchlistUI } from "./watchlist-ui.js";
import { initWatchlistMobileRefinement } from "./watchlist-mobile.js";
import { initPeopleOrganizationsUI } from "./people-organizations-ui.js";
import { initUIFoundation, decorateUIFoundation } from "./main.js";
import { initPhase4UX } from "./phase4.js";

initUIFoundation();
initMyFeedUI();

async function loadLensSources({ force = false } = {}) {
  if (force) feeds.invalidate("myfeed");
  return Promise.allSettled(
    MY_FEED_SOURCE_TABS.map(tab => feeds.load(tab, { force }))
  );
}

const watchlist = initWatchlistUI({
  queryLens(lensId, options = {}) {
    return RUNTIME_LENS_SERVICE.query(lensId, options);
  },
  loadSources: loadLensSources
});
initWatchlistMobileRefinement();

const peopleOrganizations = initPeopleOrganizationsUI({
  queryLens(lensId, options = {}) {
    return RUNTIME_LENS_SERVICE.query(lensId, options);
  },
  loadSources: loadLensSources
});

initV81UI();
decorateUIFoundation();
const feeds = createFeedDashboard();

// Internal v10 runtime read API. It intentionally exposes no item-store mutation
// methods; Phase 8 adds the second visible lens on top of the same read service.
window.intelligenceHubV10 = Object.freeze({
  phase: 8,
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
    // Queue dependent views so feed invalidation completes first.
    setTimeout(() => {
      const active = document.body.dataset.primaryView;
      if (active === "myfeed") {
        feeds.load("myfeed").catch(error => console.error("Unable to rerank My Feed:", error));
      }
      if (active === "watchlist") {
        watchlist.load().catch(error => console.error("Unable to reload Watchlist:", error));
      }
      if (active === "people-organizations") {
        peopleOrganizations.load().catch(error => console.error("Unable to reload People & Organizations:", error));
      }
    }, 0);
  }
});

const navigation = initNavigation({
  onPrimaryChange(tab) {
    if (tab === "watchlist") {
      watchlist.load().catch(error => console.error("Unable to load Watchlist:", error));
      return;
    }
    if (tab === "people-organizations") {
      peopleOrganizations.load().catch(error => console.error("Unable to load People & Organizations:", error));
      return;
    }
    if (tab !== "launchpad") {
      feeds.load(tab).catch(error => console.error(`Unable to load ${tab}:`, error));
    }
  }
});

initPhase4UX({
  navigation,
  async refresh(tab) {
    if (tab === "watchlist") return watchlist.load({ force: true });
    if (tab === "people-organizations") return peopleOrganizations.load({ force: true });
    if (tab !== "myfeed") feeds.invalidate("myfeed");
    feeds.invalidate(tab);
    return feeds.load(tab, { force: true });
  }
});
