(() => {
  const VIEW_GROUPS = {
    destinations: "DESTINATIONS",
    watchlists: "TRACKING & WATCHLISTS"
  };

  const VIEW_META = {
    destinations: {
      label: "Destinations",
      description: "Places to use, build, research, read, create, and publish.",
      placeholder: "Search destinations, tools, sources…"
    },
    watchlists: {
      label: "Watchlists",
      description: "Search people, topics, organizations, products, models, and platforms.",
      placeholder: "Search people, topics, organizations, products…"
    }
  };

  const search = document.getElementById("search");
  const searchStatus = document.getElementById("searchStatus");
  const emptyState = document.getElementById("emptyState");
  const navChips = document.getElementById("navChips");
  const tabList = document.getElementById("viewTabs");
  const tabs = [...document.querySelectorAll(".view-tab")];
  const description = document.getElementById("viewDescription");
  const groups = [...document.querySelectorAll(".group")];
  const categories = [...document.querySelectorAll(".category")];
  const cards = [...document.querySelectorAll(".bookmark-card")];
  const chips = [...navChips.querySelectorAll(".nav-chip")];

  if (!search || !searchStatus || !tabList || tabs.length !== 2 || groups.length !== 2) return;

  document.body.classList.add("tabs-enabled");

  const categoryChipPairs = categories.map((category, index) => ({
    category,
    chip: chips[index] || null
  }));

  const groupTotals = Object.fromEntries(
    Object.entries(VIEW_GROUPS).map(([key, groupName]) => [
      key,
      cards.filter(card => card.closest(".category")?.dataset.groupName === groupName).length
    ])
  );

  tabs.forEach(tab => {
    const key = tab.dataset.view;
    const count = tab.querySelector(".view-tab-count");
    if (count && groupTotals[key] != null) count.textContent = groupTotals[key];
  });

  function normalizeView(value) {
    return Object.hasOwn(VIEW_GROUPS, value) ? value : null;
  }

  function viewFromHash() {
    return normalizeView(location.hash.replace(/^#/, "").toLowerCase());
  }

  function preferredView() {
    return viewFromHash()
      || normalizeView(localStorage.getItem("intelligenceHubView"))
      || "destinations";
  }

  let activeView = preferredView();

  function setCategoryOpen(category, open) {
    const button = category.querySelector(".category-button");
    category.classList.toggle("is-open", open);
    if (button) button.setAttribute("aria-expanded", String(open));
  }

  function applyView() {
    const activeGroup = VIEW_GROUPS[activeView];
    const query = search.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.closest(".category");
      const inActiveGroup = category?.dataset.groupName === activeGroup;
      const matchesQuery = !query || (card.dataset.search || "").includes(query);
      const visible = inActiveGroup && matchesQuery;
      card.classList.toggle("is-hidden", !visible);
      if (visible) visibleCount += 1;
    });

    categories.forEach(category => {
      const inActiveGroup = category.dataset.groupName === activeGroup;
      const allCards = [...category.querySelectorAll(".bookmark-card")];
      const visibleCards = allCards.filter(card => !card.classList.contains("is-hidden")).length;
      const count = category.querySelector("[data-count]");

      if (count) count.textContent = query ? `${visibleCards}/${allCards.length}` : allCards.length;
      category.classList.toggle("is-hidden", !inActiveGroup || visibleCards === 0);

      if (query && inActiveGroup && visibleCards > 0) {
        setCategoryOpen(category, true);
      }
    });

    groups.forEach(group => {
      group.classList.toggle("is-hidden", group.dataset.group !== activeGroup);
    });

    categoryChipPairs.forEach(({category, chip}) => {
      if (!chip) return;
      chip.hidden = category.dataset.groupName !== activeGroup;
    });

    tabs.forEach(tab => {
      const selected = tab.dataset.view === activeView;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    const meta = VIEW_META[activeView];
    search.placeholder = meta.placeholder;
    description.textContent = meta.description;
    searchStatus.textContent = query
      ? `${visibleCount} match${visibleCount === 1 ? "" : "es"}`
      : `${groupTotals[activeView]} links`;

    emptyState.classList.toggle("visible", visibleCount === 0);

    if (!query) {
      const activeCategories = categories.filter(category =>
        category.dataset.groupName === activeGroup && !category.classList.contains("is-hidden")
      );
      if (activeCategories.length && !activeCategories.some(category => category.classList.contains("is-open"))) {
        setCategoryOpen(activeCategories[0], true);
      }
    }
  }

  function selectView(view, {updateHash = true, focusTab = false} = {}) {
    const normalized = normalizeView(view);
    if (!normalized) return;

    activeView = normalized;
    localStorage.setItem("intelligenceHubView", activeView);

    if (updateHash && location.hash !== `#${activeView}`) {
      history.replaceState(null, "", `#${activeView}`);
    }

    applyView();

    if (focusTab) {
      tabs.find(tab => tab.dataset.view === activeView)?.focus();
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => selectView(tab.dataset.view));
  });

  tabList.addEventListener("keydown", event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    let nextView = activeView;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      nextView = activeView === 'destinations' ? 'watchlists' : 'destinations';
    } else if (event.key === 'Home') {
      nextView = 'destinations';
    } else if (event.key === 'End') {
      nextView = 'watchlists';
    }

    selectView(nextView, {focusTab: true});
  });

  // app.js runs its global filtering first; this listener runs afterward and
  // scopes those results to the active primary view.
  search.addEventListener("input", applyView);

  // app.js clears search on Escape without firing an input event, so re-apply
  // the active-view filter immediately afterward.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setTimeout(applyView, 0);
  });

  window.addEventListener("hashchange", () => {
    const hashView = viewFromHash();
    if (hashView && hashView !== activeView) {
      selectView(hashView, {updateHash: false});
    }
  });

  selectView(activeView, {updateHash: true});
})();
