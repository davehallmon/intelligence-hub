const PRIMARY_TABS = ["launchpad", "news", "socials", "academic", "research", "video", "books"];
const LAUNCHPAD_VIEWS = {
  destinations: "DESTINATIONS",
  watchlists: "TRACKING & WATCHLISTS"
};

const LAUNCHPAD_META = {
  destinations: {
    description: "Places to use, build, research, read, create, and publish.",
    placeholder: "Search destinations, tools, sources…"
  },
  watchlists: {
    description: "Search people, topics, organizations, products, models, and platforms.",
    placeholder: "Search people, topics, organizations, products…"
  }
};

function normalizePrimary(value) {
  return PRIMARY_TABS.includes(value) ? value : null;
}

function normalizeLaunchpad(value) {
  return Object.hasOwn(LAUNCHPAD_VIEWS, value) ? value : null;
}

function parseHash() {
  const raw = location.hash.replace(/^#/, "").toLowerCase();
  const [primaryRaw, secondaryRaw] = raw.split("/");

  // Backward compatibility with v7 hashes such as #destinations / #watchlists.
  if (normalizeLaunchpad(primaryRaw)) {
    return { primary: "launchpad", secondary: primaryRaw };
  }

  const primary =
    normalizePrimary(primaryRaw)
    || normalizePrimary(localStorage.getItem("intelligenceHubPrimaryTab"))
    || "launchpad";

  const secondary =
    primary === "launchpad"
      ? normalizeLaunchpad(secondaryRaw)
        || normalizeLaunchpad(localStorage.getItem("intelligenceHubView"))
        || "destinations"
      : null;

  return { primary, secondary };
}

export function initNavigation({ onPrimaryChange } = {}) {
  const primaryTabList = document.getElementById("primaryTabs");
  const primaryTabs = [...document.querySelectorAll("[data-primary-tab]")];
  const primaryPanels = [...document.querySelectorAll("[data-primary-panel]")];

  const search = document.getElementById("search");
  const searchStatus = document.getElementById("searchStatus");
  const emptyState = document.getElementById("emptyState");
  const navChips = document.getElementById("navChips");

  const launchpadTabList = document.getElementById("viewTabs");
  const launchpadTabs = [...document.querySelectorAll(".view-tab")];
  const launchpadDescription = document.getElementById("viewDescription");

  const groups = [...document.querySelectorAll(".group")];
  const categories = [...document.querySelectorAll(".category")];
  const cards = [...document.querySelectorAll(".bookmark-card")];
  const chips = [...navChips.querySelectorAll(".nav-chip")];

  const categoryChipPairs = categories.map((category, index) => ({
    category,
    chip: chips[index] || null
  }));

  const groupTotals = Object.fromEntries(
    Object.entries(LAUNCHPAD_VIEWS).map(([key, groupName]) => [
      key,
      cards.filter(card => card.closest(".category")?.dataset.groupName === groupName).length
    ])
  );

  document.body.classList.add("tabs-enabled");

  let { primary: activePrimary, secondary: activeLaunchpad } = parseHash();

  function setCategoryOpen(category, open) {
    const button = category.querySelector(".category-button");
    category.classList.toggle("is-open", open);
    if (button) button.setAttribute("aria-expanded", String(open));
  }

  function applyLaunchpadView() {
    if (!search) return;
    const groupName = LAUNCHPAD_VIEWS[activeLaunchpad];
    const query = search.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.closest(".category");
      const inView = category?.dataset.groupName === groupName;
      const matches = !query || (card.dataset.search || "").includes(query);
      const visible = inView && matches;
      card.classList.toggle("is-hidden", !visible);
      if (visible) visibleCount += 1;
    });

    categories.forEach(category => {
      const inView = category.dataset.groupName === groupName;
      const allCards = [...category.querySelectorAll(".bookmark-card")];
      const visibleCards = allCards.filter(card => !card.classList.contains("is-hidden")).length;
      const count = category.querySelector("[data-count]");

      if (count) count.textContent = query ? `${visibleCards}/${allCards.length}` : allCards.length;
      category.classList.toggle("is-hidden", !inView || visibleCards === 0);

      if (query && inView && visibleCards) setCategoryOpen(category, true);
    });

    groups.forEach(group => {
      group.classList.toggle("is-hidden", group.dataset.group !== groupName);
    });

    categoryChipPairs.forEach(({ category, chip }) => {
      if (chip) chip.hidden = category.dataset.groupName !== groupName;
    });

    launchpadTabs.forEach(tab => {
      const selected = tab.dataset.view === activeLaunchpad;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    const meta = LAUNCHPAD_META[activeLaunchpad];
    search.placeholder = meta.placeholder;
    launchpadDescription.textContent = meta.description;
    searchStatus.textContent = query
      ? `${visibleCount} match${visibleCount === 1 ? "" : "es"}`
      : `${groupTotals[activeLaunchpad]} links`;

    emptyState.classList.toggle("visible", activePrimary === "launchpad" && visibleCount === 0);

    if (!query) {
      const activeCategories = categories.filter(category =>
        category.dataset.groupName === groupName && !category.classList.contains("is-hidden")
      );
      if (activeCategories.length && !activeCategories.some(category => category.classList.contains("is-open"))) {
        setCategoryOpen(activeCategories[0], true);
      }
    }
  }

  function routeString() {
    return activePrimary === "launchpad"
      ? `#launchpad/${activeLaunchpad}`
      : `#${activePrimary}`;
  }

  function syncHash() {
    const next = routeString();
    if (location.hash !== next) history.replaceState(null, "", next);
  }

  function applyPrimary({ notify = true } = {}) {
    document.body.dataset.primaryView = activePrimary;

    primaryPanels.forEach(panel => {
      panel.hidden = panel.dataset.primaryPanel !== activePrimary;
    });

    primaryTabs.forEach(tab => {
      const selected = tab.dataset.primaryTab === activePrimary;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    document.querySelectorAll(".launchpad-action").forEach(button => {
      button.hidden = activePrimary !== "launchpad";
    });

    if (activePrimary === "launchpad") applyLaunchpadView();
    else emptyState.classList.remove("visible");

    localStorage.setItem("intelligenceHubPrimaryTab", activePrimary);
    syncHash();
    if (notify) onPrimaryChange?.(activePrimary);
  }

  function selectPrimary(tab, { focus = false } = {}) {
    const normalized = normalizePrimary(tab);
    if (!normalized) return;
    activePrimary = normalized;
    applyPrimary();
    if (focus) primaryTabs.find(button => button.dataset.primaryTab === activePrimary)?.focus();
  }

  function selectLaunchpad(view, { focus = false } = {}) {
    const normalized = normalizeLaunchpad(view);
    if (!normalized) return;
    activeLaunchpad = normalized;
    localStorage.setItem("intelligenceHubView", activeLaunchpad);
    applyLaunchpadView();
    syncHash();
    if (focus) launchpadTabs.find(button => button.dataset.view === activeLaunchpad)?.focus();
  }

  primaryTabs.forEach(tab => {
    tab.addEventListener("click", () => selectPrimary(tab.dataset.primaryTab));
  });

  primaryTabList?.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let index = PRIMARY_TABS.indexOf(activePrimary);
    if (event.key === "ArrowRight") index = (index + 1) % PRIMARY_TABS.length;
    if (event.key === "ArrowLeft") index = (index - 1 + PRIMARY_TABS.length) % PRIMARY_TABS.length;
    if (event.key === "Home") index = 0;
    if (event.key === "End") index = PRIMARY_TABS.length - 1;

    selectPrimary(PRIMARY_TABS[index], { focus: true });
  });

  launchpadTabs.forEach(tab => {
    tab.addEventListener("click", () => selectLaunchpad(tab.dataset.view));
  });

  launchpadTabList?.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home" ? "destinations"
      : event.key === "End" ? "watchlists"
      : activeLaunchpad === "destinations" ? "watchlists" : "destinations";
    selectLaunchpad(next, { focus: true });
  });

  // app.js performs a broad Launchpad filter first; this runs afterward to keep
  // the active Destinations/Watchlists scope authoritative.
  search?.addEventListener("input", applyLaunchpadView);

  // Prevent app.js's / shortcut from focusing a hidden Launchpad search field.
  document.addEventListener("keydown", event => {
    const shortcut =
      (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
      || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k");

    if (shortcut && activePrimary !== "launchpad") {
      event.stopImmediatePropagation();
    }

    if (event.key === "Escape" && activePrimary === "launchpad") {
      setTimeout(applyLaunchpadView, 0);
    }
  }, true);

  window.addEventListener("hashchange", () => {
    const route = parseHash();
    activePrimary = route.primary;
    if (route.secondary) activeLaunchpad = route.secondary;
    applyPrimary();
  });

  launchpadTabs.forEach(tab => {
    const count = tab.querySelector(".view-tab-count");
    if (count) count.textContent = groupTotals[tab.dataset.view] ?? "";
  });

  applyPrimary();

  return {
    get activePrimary() { return activePrimary; },
    get activeLaunchpad() { return activeLaunchpad; },
    selectPrimary,
    selectLaunchpad
  };
}
