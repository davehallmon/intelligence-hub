const PHASE4_STYLESHEET = "css/phase4.css";
const SAVED_ITEMS_KEY = "intelligenceHub.savedItems.v2";
const LEGACY_SAVED_ITEMS_KEY = "intelligenceHub.savedItems.v1";
const PULL_THRESHOLD = 72;
const MAX_PULL_DISTANCE = 118;
const V10_MOBILE_SHELL_QUERY = "(max-width: 767px)";
const mobileShellMedia = window.matchMedia(V10_MOBILE_SHELL_QUERY);
const REFRESHABLE_TABS = new Set([
  "myfeed", "watchlist", "people-organizations", "news", "socials", "academic", "research", "video", "books"
]);

const COMMUNITY_LINKS = Object.freeze([
  { label: "r/singularity", url: "https://www.reddit.com/r/singularity/" },
  { label: "Hacker News", url: "https://news.ycombinator.com/" }
]);

const CONTROL_LABELS = Object.freeze({
  myfeed: { route: "My Feed", topic: "Topics", person: "Figures", organization: "Organizations" },
  watchlist: { route: "Watchlist", topic: "Topics", person: "Figures", organization: "Organizations" },
  "people-organizations": { route: "People & Orgs", topic: "Topics", person: "People", organization: "Organizations" },
  news: { route: "News", topic: "Topics", person: "Figures", organization: "Regions / Orgs" },
  socials: { route: "Socials", topic: "Topics", person: "Figures", organization: "Organizations" },
  academic: { route: "Academic", topic: "Fields", person: "Authors", organization: "Journals / Institutions" },
  research: { route: "Research", topic: "Fields", person: "Authors", organization: "Institutions" },
  video: { route: "Videos", topic: "Topics", person: "Creators", organization: "Channels" },
  books: { route: "Books", topic: "Topics", person: "Authors", organization: "Sources" }
});

let refreshFeed = null;
let navigation = null;
let lastScrollY = window.scrollY;
let scrollTicking = false;
let controlsHidden = false;
let pullStartY = 0;
let pullDistance = 0;
let pullTracking = false;
let pullRefreshing = false;
let savedDrawerCloseTimer = null;
let savedDrawerPreviousFocus = null;

const savedItems = new Map();

function ensureStylesheet(href = PHASE4_STYLESHEET) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
}

function cleanText(value, max = 360) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function hashText(value) {
  let hash = 5381;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) + hash) ^ text.charCodeAt(index);
  return (hash >>> 0).toString(36);
}

function activePrimary() {
  return document.body.dataset.primaryView || navigation?.activePrimary || "myfeed";
}

function visibleFocusable(container) {
  if (!container) return [];
  return [...container.querySelectorAll(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(node => !node.hidden && node.getAttribute("aria-hidden") !== "true" && node.getClientRects().length > 0);
}

function trapFocus(event, container) {
  if (event.key !== "Tab") return;
  const focusable = visibleFocusable(container);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function normalizeSavedItem(item, fallbackSavedAt = Date.now()) {
  if (typeof item === "string") {
    const key = item.trim();
    if (!key) return null;
    return {
      key,
      url: /^https?:/i.test(key) ? key : "",
      title: "Saved item",
      excerpt: "",
      type: "",
      savedAt: fallbackSavedAt
    };
  }

  if (!item || typeof item !== "object") return null;
  const key = cleanText(item.key || item.url, 1200);
  if (!key) return null;
  const savedAt = Number(item.savedAt) || fallbackSavedAt;
  return {
    key,
    url: cleanText(item.url, 1600),
    title: cleanText(item.title || "Saved item", 260),
    excerpt: cleanText(item.excerpt, 420),
    type: cleanText(item.type, 64),
    savedAt
  };
}

function loadSavedItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_ITEMS_KEY) || "[]");
    if (Array.isArray(parsed)) {
      parsed.forEach((item, index) => {
        const normalized = normalizeSavedItem(item, Date.now() - index);
        if (normalized) savedItems.set(normalized.key, normalized);
      });
    }
  } catch {
    // Ignore malformed storage and continue with an empty store.
  }

  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_SAVED_ITEMS_KEY) || "[]");
    if (Array.isArray(legacy)) {
      legacy.forEach((item, index) => {
        const normalized = normalizeSavedItem(item, Date.now() - index);
        if (normalized && !savedItems.has(normalized.key)) savedItems.set(normalized.key, normalized);
      });
    }
    localStorage.removeItem(LEGACY_SAVED_ITEMS_KEY);
  } catch {
    // Legacy migration is best-effort.
  }

  persistSavedItems();
}

function persistSavedItems() {
  try {
    const ordered = [...savedItems.values()].sort((a, b) => b.savedAt - a.savedAt);
    localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(ordered));
  } catch {
    // The current page can still maintain state if localStorage is unavailable.
  }
}

function savedCount() {
  return savedItems.size;
}

function ensureSavedTopbarButton() {
  let button = document.getElementById("saved-toggle");
  if (button) return button;

  const balance = document.querySelector(".app-topbar__balance");
  button = document.createElement("button");
  button.id = "saved-toggle";
  button.className = "app-topbar__saved button button--icon";
  button.type = "button";
  button.setAttribute("aria-label", "Open saved items");
  button.setAttribute("aria-controls", "saved-drawer");
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = '<i data-lucide="star" aria-hidden="true"></i><span class="saved-count" aria-hidden="true">0</span>';

  if (balance) balance.replaceWith(button);
  else document.getElementById("app-topbar")?.append(button);

  button.addEventListener("click", toggleSavedDrawer);
  window.lucide?.createIcons();
  return button;
}

function ensureSavedDrawer() {
  let drawer = document.getElementById("saved-drawer");
  if (drawer) return drawer;

  const overlay = document.createElement("div");
  overlay.id = "saved-overlay";
  overlay.className = "saved-overlay";
  overlay.hidden = true;

  drawer = document.createElement("aside");
  drawer.id = "saved-drawer";
  drawer.className = "saved-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-labelledby", "saved-drawer-title");
  drawer.hidden = true;
  drawer.innerHTML = `
    <div class="saved-drawer__header">
      <div>
        <p class="saved-drawer__kicker">Read later</p>
        <h2 id="saved-drawer-title">Saved items</h2>
      </div>
      <button class="saved-drawer__close button button--icon" type="button" aria-label="Close saved items">
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
    </div>
    <div class="saved-drawer__summary" id="saved-summary" aria-live="polite"></div>
    <div class="saved-drawer__list" id="saved-list"></div>`;

  document.body.append(overlay, drawer);
  overlay.addEventListener("click", closeSavedDrawer);
  drawer.querySelector(".saved-drawer__close")?.addEventListener("click", closeSavedDrawer);
  window.lucide?.createIcons();
  return drawer;
}

function savedDrawerIsOpen() {
  const drawer = document.getElementById("saved-drawer");
  return Boolean(drawer && !drawer.hidden && drawer.classList.contains("is-open"));
}

function renderSavedDrawer() {
  const drawer = ensureSavedDrawer();
  const list = drawer.querySelector("#saved-list");
  const summary = drawer.querySelector("#saved-summary");
  const topButton = ensureSavedTopbarButton();
  const count = savedCount();

  const countNode = topButton.querySelector(".saved-count");
  if (countNode) {
    countNode.textContent = String(count);
    countNode.hidden = count === 0;
  }
  topButton.setAttribute("aria-label", count ? `Open ${count} saved item${count === 1 ? "" : "s"}` : "Open saved items");
  if (summary) summary.textContent = count ? `${count} saved · newest first` : "Nothing saved yet";
  if (!list) return;
  list.replaceChildren();

  const items = [...savedItems.values()].sort((a, b) => b.savedAt - a.savedAt);
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "saved-drawer__empty";
    empty.innerHTML = '<i data-lucide="star" aria-hidden="true"></i><strong>No saved items yet.</strong><span>Use the star on any feed card to keep it here.</span>';
    list.append(empty);
    window.lucide?.createIcons();
    return;
  }

  items.forEach(item => {
    const row = document.createElement("article");
    row.className = "saved-item";
    row.dataset.savedKey = item.key;

    const copy = item.url ? document.createElement("a") : document.createElement("div");
    copy.className = "saved-item__copy";
    if (item.url) {
      copy.href = item.url;
      copy.target = "_blank";
      copy.rel = "noopener noreferrer";
    }

    const title = document.createElement("strong");
    title.textContent = item.title || "Saved item";
    const excerpt = document.createElement("span");
    excerpt.textContent = item.excerpt || (item.url ? "Open the original item." : "Saved from Intelligence Hub.");
    copy.append(title, excerpt);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "saved-item__remove button button--icon";
    remove.setAttribute("aria-label", `Unstar ${item.title || "saved item"}`);
    remove.title = "Unstar";
    remove.innerHTML = '<i data-lucide="star-off" aria-hidden="true"></i>';
    remove.addEventListener("click", () => setSaved(item.key, null));

    row.append(copy, remove);
    list.append(row);
  });
  window.lucide?.createIcons();
}

function openSavedDrawer() {
  const drawer = ensureSavedDrawer();
  const overlay = document.getElementById("saved-overlay");
  const topButton = ensureSavedTopbarButton();
  if (!drawer || !overlay) return;

  if (savedDrawerCloseTimer) {
    clearTimeout(savedDrawerCloseTimer);
    savedDrawerCloseTimer = null;
  }

  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle?.getAttribute("aria-expanded") === "true") menuToggle.click();

  savedDrawerPreviousFocus = document.activeElement;
  renderSavedDrawer();
  overlay.hidden = false;
  drawer.hidden = false;
  document.body.dataset.savedOpen = "true";
  document.getElementById("main-content")?.setAttribute("aria-hidden", "true");
  topButton.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => {
    drawer.classList.add("is-open");
    drawer.querySelector(".saved-drawer__close")?.focus();
  });
}

function closeSavedDrawer({ restoreFocus = true } = {}) {
  const drawer = document.getElementById("saved-drawer");
  const overlay = document.getElementById("saved-overlay");
  const topButton = document.getElementById("saved-toggle");
  if (!drawer || drawer.hidden) return;

  drawer.classList.remove("is-open");
  delete document.body.dataset.savedOpen;
  topButton?.setAttribute("aria-expanded", "false");

  const paletteOpen = document.body.dataset.paletteOpen === "true";
  const mobileDrawerOpen = document.getElementById("menu-toggle")?.getAttribute("aria-expanded") === "true";
  if (!paletteOpen && !mobileDrawerOpen) document.getElementById("main-content")?.removeAttribute("aria-hidden");

  const finish = () => {
    drawer.hidden = true;
    if (overlay) overlay.hidden = true;
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
  else savedDrawerCloseTimer = window.setTimeout(finish, 220);

  if (restoreFocus && savedDrawerPreviousFocus instanceof HTMLElement) savedDrawerPreviousFocus.focus();
  savedDrawerPreviousFocus = null;
}

function toggleSavedDrawer() {
  savedDrawerIsOpen() ? closeSavedDrawer() : openSavedDrawer();
}

function bindSavedDrawerKeyboard() {
  document.addEventListener("keydown", event => {
    if (!savedDrawerIsOpen()) return;
    const drawer = document.getElementById("saved-drawer");
    if (event.key === "Escape") {
      event.preventDefault();
      closeSavedDrawer();
      return;
    }
    trapFocus(event, drawer);
  }, true);

  const bodyObserver = new MutationObserver(() => {
    if (document.body.dataset.paletteOpen === "true" && savedDrawerIsOpen()) closeSavedDrawer({ restoreFocus: false });
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["data-palette-open"] });
}

function cardPrimaryNode(host) {
  if (host.matches?.(".interactive-card")) return host.querySelector(".card__primary-link");
  if (host.matches?.("a.card")) return host;
  return host.querySelector?.("a.card") || host;
}

function metadataForCard(host) {
  const primary = cardPrimaryNode(host);
  const anchor = primary instanceof HTMLAnchorElement ? primary : primary?.querySelector?.("a[href]");
  const url = cleanText(anchor?.href || "", 1600);
  const title = cleanText(
    primary?.querySelector?.(".card__title")?.textContent
      || primary?.querySelector?.(".feed-title")?.textContent
      || primary?.querySelector?.("blockquote")?.textContent
      || primary?.textContent,
    260
  ) || "Saved item";
  const excerpt = cleanText(
    primary?.querySelector?.(".card__excerpt")?.textContent
      || primary?.querySelector?.(".paper-abstract")?.textContent
      || primary?.querySelector?.("blockquote")?.textContent
      || "",
    420
  );
  const typeClass = [...(host.classList || [])].find(name => name.startsWith("card--"));
  const key = url || `content:${hashText(`${title}|${excerpt}`)}`;
  return { key, url, title, excerpt, type: typeClass?.replace("card--", "") || "" };
}

function updateStarButton(button, key) {
  const active = savedItems.has(key);
  button.setAttribute("aria-pressed", String(active));
  button.setAttribute("aria-label", active ? "Unstar saved item" : "Save for later");
  button.title = active ? "Unstar" : "Save for later";
  button.classList.toggle("is-saved", active);
}

function syncAllStarButtons() {
  document.querySelectorAll("[data-save-star]").forEach(button => updateStarButton(button, button.dataset.saveStar));
  renderSavedDrawer();
}

function setSaved(key, item) {
  if (!key) return;
  if (item) {
    const existing = savedItems.get(key);
    savedItems.set(key, {
      ...item,
      key,
      savedAt: existing?.savedAt || Date.now()
    });
  } else {
    savedItems.delete(key);
  }
  persistSavedItems();
  syncAllStarButtons();
  document.dispatchEvent(new CustomEvent("ih:saved-changed", { detail: { key, saved: Boolean(item), count: savedCount() } }));
}

function removeLegacyBookmarkActions(root = document) {
  root.querySelectorAll?.(".card-action").forEach(button => {
    const label = String(button.getAttribute("aria-label") || "").toLowerCase();
    const title = String(button.title || "").toLowerCase();
    if (label.includes("bookmark") || title.includes("bookmark")) button.remove();
  });
}

function wrapPlainCard(card) {
  if (!(card instanceof HTMLElement)) return card;
  if (card.matches(".interactive-card") || card.parentElement?.matches(".saved-card-shell")) return card.matches(".interactive-card") ? card : card.parentElement;
  if (card.tagName !== "A") return card;

  const wrapper = document.createElement("article");
  wrapper.className = "saved-card-shell";
  if (card.classList.contains("card--hero")) wrapper.classList.add("card--hero");
  card.replaceWith(wrapper);
  wrapper.append(card);
  return wrapper;
}

function decorateSavedCard(card) {
  if (!(card instanceof HTMLElement)) return;
  const host = wrapPlainCard(card);
  if (!(host instanceof HTMLElement) || host.dataset.phase4StarDecorated === "true") return;

  const meta = metadataForCard(host);
  if (!meta.key) return;
  host.dataset.phase4StarDecorated = "true";
  host.classList.add("phase4-star-host");
  host.dataset.savedKey = meta.key;

  const legacy = savedItems.get(meta.key);
  if (legacy && (legacy.title === "Saved item" || !legacy.excerpt)) {
    savedItems.set(meta.key, { ...legacy, ...meta, key: meta.key, savedAt: legacy.savedAt });
    persistSavedItems();
  }

  const star = document.createElement("button");
  star.type = "button";
  star.className = "card-star button button--icon";
  star.dataset.saveStar = meta.key;
  star.innerHTML = '<i data-lucide="star" aria-hidden="true"></i>';
  updateStarButton(star, meta.key);
  star.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (savedItems.has(meta.key)) setSaved(meta.key, null);
    else setSaved(meta.key, meta);
  });

  host.append(star);
  removeLegacyBookmarkActions(host);
  window.lucide?.createIcons();
}

function decorateAllFeedCards(root = document) {
  removeLegacyBookmarkActions(root);
  const selector = ".interactive-card, a.rich-feed-card, a.paper-card, a.video-card, a.highlight-card, article.highlight-card";
  if (root.matches?.(selector)) decorateSavedCard(root);
  root.querySelectorAll?.(selector).forEach(decorateSavedCard);
}

function bindSavedCardObservers() {
  const containers = [
    "myFeedAttention", "myFeedFeed", "watchlistFeed", "peopleOrganizationsFeed", "newsFeed", "socialsFeed", "academicFeed", "researchFeed", "videoFeed", "booksFeed"
  ].map(id => document.getElementById(id)).filter(Boolean);

  containers.forEach(container => {
    decorateAllFeedCards(container);
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => decorateAllFeedCards(container));
    });
    observer.observe(container, { childList: true, subtree: true });
  });
}

function ensureFilterParking() {
  let parking = document.getElementById("filter-parking");
  if (parking) return parking;
  parking = document.createElement("div");
  parking.id = "filter-parking";
  parking.hidden = true;
  document.body.append(parking);
  return parking;
}

function ensureBottomControls() {
  let bar = document.getElementById("bottom-controls");
  if (bar) return bar;

  bar = document.createElement("nav");
  bar.id = "bottom-controls";
  bar.className = "context-controls";
  bar.setAttribute("aria-label", "Context controls");
  bar.innerHTML = `
    <div class="context-controls__inner">
      <span class="context-controls__route" id="context-controls-route"></span>
      <div class="context-controls__filters" id="context-controls-filters"></div>
      <div class="context-controls__actions" id="context-controls-actions"></div>
    </div>`;
  document.body.append(bar);
  return bar;
}

function dimensionForRow(row) {
  return row.querySelector("[data-filter-dimension]")?.dataset.filterDimension || "";
}

function applyContextLabels(tab, filterContainer) {
  const labels = CONTROL_LABELS[tab] || CONTROL_LABELS.myfeed;
  filterContainer?.querySelectorAll(".feed-filter-row").forEach(row => {
    const dimension = dimensionForRow(row);
    const label = row.querySelector(".feed-filter-label");
    if (label && labels[dimension]) label.textContent = labels[dimension];
  });
}

function prioritiesButton() {
  return [...document.querySelectorAll("#panel-myfeed [data-open-settings]")]
    .find(button => /priorities/i.test(button.textContent || "")) || null;
}

function restoreV10InlineControls() {
  if (mobileShellMedia.matches) return;

  const watchlistToggle = document.getElementById("watchlistMobileToggle");
  const watchlistHeading = document.querySelector(".watchlist-controls__heading");
  if (watchlistToggle && watchlistHeading && watchlistToggle.parentElement !== watchlistHeading) {
    watchlistHeading.append(watchlistToggle);
  }

  const entityLabel = document.querySelector(".entity-lens-select-label");
  const entityControls = document.querySelector(".entity-lens-controls");
  if (entityLabel && entityControls && entityLabel.parentElement !== entityControls) {
    entityControls.append(entityLabel);
  }
}

function appendV10MobileControls(tab, filtersHost, actionsHost) {
  if (!mobileShellMedia.matches) return false;

  if (tab === "watchlist") {
    const toggle = document.getElementById("watchlistMobileToggle");
    if (toggle) actionsHost.append(toggle);
    return true;
  }

  if (tab === "people-organizations") {
    const label = document.querySelector(".entity-lens-select-label");
    if (label) filtersHost.append(label);
    return true;
  }

  return false;
}

function syncBottomControls() {
  const bar = ensureBottomControls();
  const parking = ensureFilterParking();
  const filtersHost = document.getElementById("context-controls-filters");
  const actionsHost = document.getElementById("context-controls-actions");
  const routeLabel = document.getElementById("context-controls-route");
  const tab = activePrimary();
  const routeMeta = CONTROL_LABELS[tab];

  [...filtersHost.children].forEach(child => parking.append(child));
  [...actionsHost.children].forEach(child => parking.append(child));
  restoreV10InlineControls();

  if (!routeMeta || !REFRESHABLE_TABS.has(tab)) {
    bar.hidden = true;
    return;
  }

  if ((tab === "watchlist" || tab === "people-organizations") && !mobileShellMedia.matches) {
    bar.hidden = true;
    return;
  }

  bar.hidden = false;
  if (routeLabel) routeLabel.textContent = routeMeta.route;

  const v10Handled = appendV10MobileControls(tab, filtersHost, actionsHost);
  if (!v10Handled) {
    const filters = document.getElementById(`${tab}FeedFilters`);
    if (filters) {
      applyContextLabels(tab, filters);
      filtersHost.append(filters);
    }
  }

  if (tab === "myfeed") {
    const priorities = prioritiesButton() || parking.querySelector('[data-open-settings]');
    if (priorities) {
      priorities.classList.add("context-controls__priorities");
      actionsHost.append(priorities);
    }
  }

  setControlsHidden(false);
}

function removeStaticRefreshButtons() {
  document.querySelectorAll("[data-refresh-feed]").forEach(button => button.remove());
}

function setControlsHidden(hidden) {
  const bar = document.getElementById("bottom-controls");
  if (!bar || bar.hidden || controlsHidden === hidden) return;
  controlsHidden = hidden;
  bar.classList.toggle("is-scroll-hidden", hidden);
  if ("inert" in bar) bar.inert = hidden;
}

function handleScrollDirection() {
  scrollTicking = false;
  const current = Math.max(0, window.scrollY);
  const delta = current - lastScrollY;
  lastScrollY = current;

  if (current <= 12) {
    setControlsHidden(false);
    return;
  }
  if (Math.abs(delta) < 4) return;
  if (document.getElementById("bottom-controls")?.contains(document.activeElement)) return;
  if (delta > 0 && current > 80) setControlsHidden(true);
  if (delta < 0) setControlsHidden(false);
}

function bindScrollAwareControls() {
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(handleScrollDirection);
  }, { passive: true });

  document.addEventListener("focusin", event => {
    if (event.target.closest?.("#bottom-controls")) setControlsHidden(false);
  });
}

function bindBottomControlSync() {
  syncBottomControls();
  const workspace = document.querySelector("main.workspace");
  const bodyObserver = new MutationObserver(() => syncBottomControls());
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["data-primary-view"] });

  if (workspace) {
    const filterObserver = new MutationObserver(() => {
      requestAnimationFrame(syncBottomControls);
    });
    filterObserver.observe(workspace, { childList: true, subtree: true });
  }

  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-primary-tab]")) window.setTimeout(syncBottomControls, 0);
  });

  mobileShellMedia.addEventListener?.("change", () => requestAnimationFrame(syncBottomControls));
}

function ensurePullIndicator() {
  let indicator = document.getElementById("pull-refresh-indicator");
  if (indicator) return indicator;
  indicator = document.createElement("div");
  indicator.id = "pull-refresh-indicator";
  indicator.className = "pull-refresh";
  indicator.setAttribute("role", "status");
  indicator.setAttribute("aria-live", "polite");
  indicator.innerHTML = '<i data-lucide="refresh-cw" aria-hidden="true"></i><span>Pull to refresh</span>';
  document.body.append(indicator);
  window.lucide?.createIcons();
  return indicator;
}

function setPullVisual(distance, state = "pull") {
  const indicator = ensurePullIndicator();
  const progress = Math.min(1, distance / PULL_THRESHOLD);
  indicator.style.setProperty("--pull-distance", `${distance}px`);
  indicator.style.setProperty("--pull-progress", String(progress));
  indicator.dataset.state = state;
  const label = indicator.querySelector("span");
  if (label) {
    label.textContent = state === "loading"
      ? "Refreshing…"
      : distance >= PULL_THRESHOLD ? "Release to refresh" : "Pull to refresh";
  }
}

function resetPullVisual({ updated = false } = {}) {
  const indicator = ensurePullIndicator();
  const label = indicator.querySelector("span");
  if (updated && label) label.textContent = "Updated";
  indicator.dataset.state = updated ? "updated" : "idle";
  indicator.style.setProperty("--pull-distance", "0px");
  indicator.style.setProperty("--pull-progress", "0");
  window.setTimeout(() => {
    if (!pullRefreshing) indicator.dataset.state = "idle";
  }, updated ? 650 : 0);
  pullDistance = 0;
  pullTracking = false;
}

function canStartPull(event) {
  if (pullRefreshing || window.scrollY > 0 || event.touches?.length !== 1) return false;
  if (!REFRESHABLE_TABS.has(activePrimary())) return false;
  if (document.body.dataset.paletteOpen === "true" || document.body.dataset.savedOpen === "true") return false;
  if (document.getElementById("menu-toggle")?.getAttribute("aria-expanded") === "true") return false;
  if (event.target.closest?.("input, textarea, select, [contenteditable='true']")) return false;
  return true;
}

async function triggerRefresh(tab = activePrimary()) {
  if (!REFRESHABLE_TABS.has(tab) || typeof refreshFeed !== "function" || pullRefreshing) return;
  pullRefreshing = true;
  setPullVisual(Math.max(PULL_THRESHOLD, pullDistance), "loading");
  try {
    await refreshFeed(tab);
    resetPullVisual({ updated: true });
  } catch (error) {
    const indicator = ensurePullIndicator();
    const label = indicator.querySelector("span");
    indicator.dataset.state = "error";
    if (label) label.textContent = "Refresh failed";
    window.setTimeout(() => resetPullVisual(), 900);
    console.error(`Unable to refresh ${tab}:`, error);
  } finally {
    pullRefreshing = false;
  }
}

function bindPullToRefresh() {
  ensurePullIndicator();

  document.addEventListener("touchstart", event => {
    if (!canStartPull(event)) return;
    pullStartY = event.touches[0].clientY;
    pullDistance = 0;
    pullTracking = true;
  }, { passive: true });

  document.addEventListener("touchmove", event => {
    if (!pullTracking || pullRefreshing || !event.touches?.length) return;
    if (window.scrollY > 0) {
      resetPullVisual();
      return;
    }
    const raw = event.touches[0].clientY - pullStartY;
    if (raw <= 0) {
      setPullVisual(0);
      return;
    }
    pullDistance = Math.min(MAX_PULL_DISTANCE, raw * 0.52);
    if (raw > 8) event.preventDefault();
    setPullVisual(pullDistance);
  }, { passive: false });

  document.addEventListener("touchend", () => {
    if (!pullTracking || pullRefreshing) return;
    const shouldRefresh = pullDistance >= PULL_THRESHOLD;
    const tab = activePrimary();
    if (shouldRefresh) triggerRefresh(tab);
    else resetPullVisual();
  }, { passive: true });

  document.addEventListener("touchcancel", () => {
    if (!pullRefreshing) resetPullVisual();
  }, { passive: true });

  document.addEventListener("click", event => {
    const retry = event.target.closest?.(".state-message__retry");
    if (!retry) return;
    const feed = retry.closest?.("[id$='Feed'], #myFeedAttention, #myFeedFeed");
    const tab = ({
      watchlistFeed: "watchlist",
      peopleOrganizationsFeed: "people-organizations",
      newsFeed: "news",
      socialsFeed: "socials",
      academicFeed: "academic",
      researchFeed: "research",
      videoFeed: "video",
      booksFeed: "books",
      myFeedAttention: "myfeed",
      myFeedFeed: "myfeed"
    })[feed?.id];
    if (tab) triggerRefresh(tab);
  });
}

function ensureSocialAccordion() {
  const socials = document.querySelector('[data-primary-tab="socials"]');
  if (!socials || socials.closest(".drawer-accordion")) return;

  const group = document.createElement("div");
  group.className = "drawer-accordion";
  group.dataset.drawerAccordion = "socials";
  const row = document.createElement("div");
  row.className = "drawer-accordion__row";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "drawer-accordion__toggle";
  toggle.setAttribute("aria-label", "Toggle Socials quick links");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = '<i data-lucide="chevron-down" aria-hidden="true"></i>';
  const submenu = document.createElement("div");
  submenu.className = "drawer-accordion__submenu";
  submenu.hidden = true;
  submenu.setAttribute("role", "group");
  submenu.setAttribute("aria-label", "Socials quick links");

  COMMUNITY_LINKS.forEach(item => {
    const anchor = document.createElement("a");
    anchor.className = "drawer-subitem";
    anchor.href = item.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.innerHTML = `<span>${item.label}</span><i data-lucide="external-link" aria-hidden="true"></i>`;
    submenu.append(anchor);
  });

  socials.replaceWith(group);
  row.append(socials, toggle);
  group.append(row, submenu);

  const setOpen = open => {
    group.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    submenu.hidden = !open;
  };

  toggle.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  submenu.addEventListener("click", event => {
    if (!event.target.closest?.("a")) return;
    if (window.matchMedia("(max-width: 767px)").matches) {
      const menuToggle = document.getElementById("menu-toggle");
      if (menuToggle?.getAttribute("aria-expanded") === "true") menuToggle.click();
    }
  });

  window.lucide?.createIcons();
}

function bindSocialAccordionEscape() {
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const group = document.querySelector('[data-drawer-accordion="socials"].is-open');
    if (!group) return;
    const toggle = group.querySelector(".drawer-accordion__toggle");
    const submenu = group.querySelector(".drawer-accordion__submenu");
    group.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    if (submenu) submenu.hidden = true;
  });
}

function initSavedSystem() {
  loadSavedItems();
  ensureSavedTopbarButton();
  ensureSavedDrawer();
  renderSavedDrawer();
  bindSavedDrawerKeyboard();
  bindSavedCardObservers();
}

export function initPhase4UX({ refresh, navigation: navigationApi } = {}) {
  refreshFeed = refresh || null;
  navigation = navigationApi || null;
  ensureStylesheet();
  removeStaticRefreshButtons();
  ensureBottomControls();
  ensureFilterParking();
  bindBottomControlSync();
  bindScrollAwareControls();
  bindPullToRefresh();
  ensureSocialAccordion();
  bindSocialAccordionEscape();
  initSavedSystem();
  syncBottomControls();
  window.lucide?.createIcons();
}
