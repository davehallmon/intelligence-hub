const PALETTE_MAX_RESULTS = 12;
const SAVED_ITEMS_KEY = "intelligenceHub.savedItems.v1";
const DISMISSED_ITEMS_KEY = "intelligenceHub.dismissedItems.session.v1";
const mobileDrawerMedia = window.matchMedia("(max-width: 767px)");

let paletteItems = [];
let paletteMatches = [];
let paletteIndex = 0;
let palettePreviousFocus = null;

function safeParseSet(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) || "[]");
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch {
    return new Set();
  }
}

function safeWriteSet(storage, key, values) {
  try {
    storage.setItem(key, JSON.stringify([...values]));
  } catch {
    // Storage can be unavailable in privacy-restricted contexts. The UI still works for the current render.
  }
}

const savedItems = safeParseSet(localStorage, SAVED_ITEMS_KEY);
const dismissedItems = safeParseSet(sessionStorage, DISMISSED_ITEMS_KEY);

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

function bindMobileDrawerFocusTrap() {
  const toggle = document.getElementById("menu-toggle");
  const drawer = document.getElementById("flyout-drawer");
  const overlay = document.getElementById("drawer-overlay");
  if (!toggle || !drawer || toggle.dataset.phase3FocusBound === "true") return;
  toggle.dataset.phase3FocusBound = "true";

  toggle.addEventListener("click", () => {
    if (!mobileDrawerMedia.matches || toggle.getAttribute("aria-expanded") !== "true") return;
    requestAnimationFrame(() => {
      const selected = drawer.querySelector('[aria-selected="true"]');
      (selected || visibleFocusable(drawer)[0])?.focus();
    });
  });

  overlay?.addEventListener("click", event => {
    if (mobileDrawerMedia.matches && event.target === overlay) {
      window.setTimeout(() => toggle.focus(), 0);
    }
  });

  document.addEventListener("keydown", event => {
    if (!mobileDrawerMedia.matches || toggle.getAttribute("aria-expanded") !== "true") return;
    trapFocus(event, drawer);
  }, true);
}

function syncWatchlistView() {
  const main = document.getElementById("main-content");
  const chips = document.getElementById("navChips");
  if (!main || !chips) return;

  chips.classList.add("pill-group");
  chips.querySelectorAll(".nav-chip").forEach(chip => chip.classList.add("pill"));

  const watchlistSelected = document.querySelector('#viewTabs [data-view="watchlists"][aria-selected="true"]');
  const active = document.body.dataset.primaryView === "launchpad" && Boolean(watchlistSelected);
  main.dataset.view = active ? "watchlist" : "feed";
}

function bindWatchlistViewSync() {
  const viewTabs = document.getElementById("viewTabs");
  syncWatchlistView();

  const observer = new MutationObserver(syncWatchlistView);
  observer.observe(document.body, { attributes: true, attributeFilter: ["data-primary-view"] });
  if (viewTabs) observer.observe(viewTabs, { subtree: true, attributes: true, attributeFilter: ["aria-selected"] });
  window.addEventListener("hashchange", syncWatchlistView);
  document.addEventListener("click", event => {
    if (event.target.closest?.("[data-primary-tab], [data-view]")) window.setTimeout(syncWatchlistView, 0);
  });
}

function ensurePaletteMarkup() {
  let palette = document.getElementById("palette");
  if (palette) return palette;

  palette = document.createElement("div");
  palette.id = "palette";
  palette.className = "palette-overlay";
  palette.setAttribute("role", "dialog");
  palette.setAttribute("aria-modal", "true");
  palette.setAttribute("aria-labelledby", "palette-title");
  palette.hidden = true;

  const panel = document.createElement("div");
  panel.className = "command-palette";

  const title = document.createElement("h2");
  title.id = "palette-title";
  title.className = "sr-only";
  title.textContent = "Command palette";

  const searchRow = document.createElement("div");
  searchRow.className = "command-palette__search";
  const searchIcon = document.createElement("i");
  searchIcon.dataset.lucide = "search";
  searchIcon.setAttribute("aria-hidden", "true");
  const input = document.createElement("input");
  input.id = "palette-input";
  input.type = "search";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.placeholder = "Search bookmarks, feeds, or actions…";
  input.setAttribute("aria-controls", "palette-results");
  input.setAttribute("aria-autocomplete", "list");
  searchRow.append(searchIcon, input);

  const results = document.createElement("div");
  results.id = "palette-results";
  results.className = "command-palette__results";
  results.setAttribute("role", "listbox");
  results.setAttribute("aria-label", "Command results");

  const footer = document.createElement("div");
  footer.className = "command-palette__footer";
  footer.innerHTML = "<span>↑↓ navigate</span><span>Enter select</span><span>Esc close</span>";

  panel.append(title, searchRow, results, footer);
  palette.append(panel);

  const drawerOverlay = document.getElementById("drawer-overlay");
  if (drawerOverlay) drawerOverlay.insertAdjacentElement("afterend", palette);
  else document.body.prepend(palette);

  input.addEventListener("input", () => renderPaletteResults(input.value));
  results.addEventListener("click", event => {
    const button = event.target.closest?.("[data-palette-index]");
    if (!button) return;
    activatePaletteItem(Number(button.dataset.paletteIndex));
  });
  palette.addEventListener("click", event => {
    if (event.target === palette) closePalette();
  });

  window.lucide?.createIcons();
  return palette;
}

function paletteItem({ label, meta, keywords = "", action, priority = 5 }) {
  return { label, meta, keywords: `${label} ${meta} ${keywords}`.toLowerCase(), action, priority };
}

function buildPaletteItems() {
  const items = [];
  const seen = new Set();
  const add = item => {
    const key = `${item.meta}|${item.label}|${item.keywords}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  document.querySelectorAll("[data-primary-tab]").forEach(button => {
    const label = button.querySelector(".label")?.textContent?.trim() || button.textContent.trim();
    add(paletteItem({
      label,
      meta: "View",
      keywords: button.dataset.primaryTab,
      priority: 1,
      action: () => button.click()
    }));
  });

  document.querySelectorAll("#viewTabs [data-view]").forEach(tab => {
    const label = tab.querySelector("span")?.textContent?.trim() || tab.textContent.trim();
    add(paletteItem({
      label,
      meta: "Bookmark view",
      keywords: tab.dataset.view,
      priority: 2,
      action: () => {
        document.querySelector('[data-primary-tab="launchpad"]')?.click();
        tab.click();
      }
    }));
  });

  document.querySelectorAll('.category[data-group-name="TRACKING & WATCHLISTS"]').forEach(category => {
    const label = category.querySelector(".category-title")?.textContent?.trim() || category.dataset.category || "Watchlist";
    add(paletteItem({
      label,
      meta: "Watchlist",
      keywords: category.dataset.category || "",
      priority: 3,
      action: () => {
        document.querySelector('[data-primary-tab="launchpad"]')?.click();
        document.querySelector('#viewTabs [data-view="watchlists"]')?.click();
        const button = category.querySelector(".category-button");
        if (button?.getAttribute("aria-expanded") !== "true") button?.click();
        category.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }));
  });

  document.querySelectorAll("a.bookmark-card").forEach(card => {
    const label = card.querySelector(".card-title")?.textContent?.trim() || card.textContent.trim();
    const category = card.closest(".category")?.dataset.category || "Bookmark";
    const url = card.href;
    add(paletteItem({
      label,
      meta: `${category} · Bookmark`,
      keywords: `${card.dataset.search || ""} ${url}`,
      priority: 4,
      action: () => window.open(url, "_blank", "noopener,noreferrer")
    }));
  });

  const settings = document.getElementById("settingsOpen");
  if (settings) {
    add(paletteItem({ label: "Settings", meta: "Action", priority: 2, action: () => settings.click() }));
  }

  paletteItems = items;
}

function scorePaletteItem(item, query) {
  if (!query) return 100 - item.priority;
  const label = item.label.toLowerCase();
  const meta = item.meta.toLowerCase();
  if (label === query) return 1000;
  if (label.startsWith(query)) return 800 - item.priority;
  if (label.includes(query)) return 650 - item.priority;
  if (meta.includes(query)) return 450 - item.priority;
  if (item.keywords.includes(query)) return 300 - item.priority;
  return -1;
}

function renderPaletteResults(rawQuery = "") {
  const results = document.getElementById("palette-results");
  const input = document.getElementById("palette-input");
  if (!results || !input) return;

  const query = String(rawQuery || "").trim().toLowerCase();
  paletteMatches = paletteItems
    .map(item => ({ item, score: scorePaletteItem(item, query) }))
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .slice(0, PALETTE_MAX_RESULTS)
    .map(entry => entry.item);

  paletteIndex = Math.min(paletteIndex, Math.max(0, paletteMatches.length - 1));
  results.replaceChildren();

  if (!paletteMatches.length) {
    const empty = document.createElement("div");
    empty.className = "command-palette__empty";
    empty.textContent = "No matching bookmarks, feeds, or actions.";
    results.append(empty);
    input.removeAttribute("aria-activedescendant");
    return;
  }

  paletteMatches.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command-palette__result";
    button.id = `palette-result-${index}`;
    button.dataset.paletteIndex = String(index);
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === paletteIndex));

    const copy = document.createElement("span");
    copy.className = "command-palette__result-copy";
    const label = document.createElement("strong");
    label.textContent = item.label;
    const meta = document.createElement("span");
    meta.textContent = item.meta;
    copy.append(label, meta);

    const enter = document.createElement("span");
    enter.className = "command-palette__enter";
    enter.textContent = "↵";
    enter.setAttribute("aria-hidden", "true");
    button.append(copy, enter);
    results.append(button);
  });

  setPaletteIndex(paletteIndex, { scroll: false });
}

function setPaletteIndex(next, { scroll = true } = {}) {
  if (!paletteMatches.length) return;
  paletteIndex = (next + paletteMatches.length) % paletteMatches.length;
  const input = document.getElementById("palette-input");
  document.querySelectorAll("[data-palette-index]").forEach((button, index) => {
    const selected = index === paletteIndex;
    button.setAttribute("aria-selected", String(selected));
    if (selected && scroll) button.scrollIntoView({ block: "nearest" });
  });
  input?.setAttribute("aria-activedescendant", `palette-result-${paletteIndex}`);
}

function activatePaletteItem(index = paletteIndex) {
  const item = paletteMatches[index];
  if (!item) return;
  closePalette({ restoreFocus: false });
  item.action();
}

function paletteIsOpen() {
  const palette = document.getElementById("palette");
  return Boolean(palette && !palette.hidden);
}

export function openPalette() {
  const palette = ensurePaletteMarkup();
  const input = document.getElementById("palette-input");
  const main = document.getElementById("main-content");
  if (!palette || !input) return;

  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle?.getAttribute("aria-expanded") === "true") menuToggle.click();

  palettePreviousFocus = document.activeElement;
  buildPaletteItems();
  paletteIndex = 0;
  palette.hidden = false;
  document.body.dataset.paletteOpen = "true";
  main?.setAttribute("aria-hidden", "true");
  input.value = "";
  renderPaletteResults("");
  requestAnimationFrame(() => input.focus());
}

export function closePalette({ restoreFocus = true } = {}) {
  const palette = document.getElementById("palette");
  const main = document.getElementById("main-content");
  if (!palette || palette.hidden) return;
  palette.hidden = true;
  delete document.body.dataset.paletteOpen;
  const drawerOpen = document.getElementById("menu-toggle")?.getAttribute("aria-expanded") === "true";
  if (!drawerOpen) main?.removeAttribute("aria-hidden");
  if (restoreFocus && palettePreviousFocus instanceof HTMLElement) palettePreviousFocus.focus();
  palettePreviousFocus = null;
}

export function togglePalette() {
  paletteIsOpen() ? closePalette() : openPalette();
}

function bindPaletteKeyboard() {
  ensurePaletteMarkup();
  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      event.stopImmediatePropagation();
      togglePalette();
      return;
    }

    if (!paletteIsOpen()) return;
    const palette = document.getElementById("palette");

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      closePalette();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setPaletteIndex(paletteIndex + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setPaletteIndex(paletteIndex - 1);
      return;
    }
    if (event.key === "Enter" && document.activeElement === document.getElementById("palette-input")) {
      event.preventDefault();
      activatePaletteItem();
      return;
    }
    trapFocus(event, palette);
  }, true);
}

function cardKey(anchor) {
  return String(anchor.href || anchor.dataset.url || anchor.textContent || "").trim();
}

function iconButton(iconName, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-action";
  button.setAttribute("aria-label", label);
  button.title = label;
  const icon = document.createElement("i");
  icon.dataset.lucide = iconName;
  icon.setAttribute("aria-hidden", "true");
  button.append(icon);
  return button;
}

function setBookmarkState(button, key) {
  const active = savedItems.has(key);
  button.setAttribute("aria-pressed", String(active));
  button.setAttribute("aria-label", active ? "Remove bookmark" : "Bookmark");
  button.title = active ? "Remove bookmark" : "Bookmark";
}

async function shareCard(anchor, button) {
  const url = anchor.href;
  const title = anchor.querySelector(".card__title")?.textContent?.trim() || document.title;
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    const original = button.title;
    button.title = "Link copied";
    button.setAttribute("aria-label", "Link copied");
    window.setTimeout(() => {
      button.title = original;
      button.setAttribute("aria-label", "Share");
    }, 1400);
  } catch {
    // Share/copy cancellation is non-fatal and should not interrupt card navigation.
  }
}

function createCardPreview(anchor) {
  const preview = document.createElement("div");
  preview.className = "card-preview";
  preview.setAttribute("aria-hidden", "true");
  const label = document.createElement("strong");
  label.textContent = "Preview";
  const text = document.createElement("span");
  const excerpt = anchor.querySelector(".card__excerpt")?.textContent?.trim();
  const title = anchor.querySelector(".card__title")?.textContent?.trim();
  text.textContent = (excerpt || title || "Open this item to read more.").slice(0, 230);
  preview.append(label, text);
  return preview;
}

function positionPreview(wrapper) {
  const preview = wrapper.querySelector(".card-preview");
  if (!preview) return;
  preview.classList.remove("card-preview--above", "card-preview--right");
  const rect = wrapper.getBoundingClientRect();
  const height = preview.offsetHeight || 120;
  const width = preview.offsetWidth || 320;
  if (rect.bottom + 14 + height > window.innerHeight) preview.classList.add("card-preview--above");
  if (rect.left + width > window.innerWidth - 12) preview.classList.add("card-preview--right");
}

function decorateRichCard(anchor) {
  if (!(anchor instanceof HTMLAnchorElement) || anchor.dataset.phase3Decorated === "true") return;
  anchor.dataset.phase3Decorated = "true";

  const key = cardKey(anchor);
  const wrapper = document.createElement("article");
  wrapper.className = `${anchor.className} interactive-card`;
  wrapper.dataset.cardKey = key;
  wrapper.hidden = dismissedItems.has(key);

  anchor.replaceWith(wrapper);
  anchor.className = "card__primary-link";
  wrapper.append(anchor);

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.setAttribute("aria-label", "Card actions");

  const bookmark = iconButton("bookmark", "Bookmark");
  setBookmarkState(bookmark, key);
  bookmark.addEventListener("click", event => {
    event.stopPropagation();
    if (savedItems.has(key)) savedItems.delete(key);
    else savedItems.add(key);
    safeWriteSet(localStorage, SAVED_ITEMS_KEY, savedItems);
    setBookmarkState(bookmark, key);
  });

  const share = iconButton("share-2", "Share");
  share.addEventListener("click", event => {
    event.stopPropagation();
    shareCard(anchor, share);
  });

  const dismiss = iconButton("x", "Dismiss for this session");
  dismiss.addEventListener("click", event => {
    event.stopPropagation();
    dismissedItems.add(key);
    safeWriteSet(sessionStorage, DISMISSED_ITEMS_KEY, dismissedItems);
    wrapper.hidden = true;
  });

  actions.append(bookmark, share, dismiss);
  wrapper.append(actions, createCardPreview(anchor));
  wrapper.addEventListener("mouseenter", () => positionPreview(wrapper));
  wrapper.addEventListener("focusin", () => positionPreview(wrapper));
  window.lucide?.createIcons();
}

function decorateCardsWithin(root) {
  if (!root) return;
  if (root.matches?.("a.rich-feed-card")) decorateRichCard(root);
  root.querySelectorAll?.("a.rich-feed-card").forEach(decorateRichCard);
}

function bindCardDecorators() {
  const containers = [
    "myFeedAttention", "myFeedFeed", "newsFeed", "socialsFeed", "academicFeed", "researchFeed", "videoFeed", "booksFeed"
  ].map(id => document.getElementById(id)).filter(Boolean);

  containers.forEach(container => {
    decorateCardsWithin(container);
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) decorateCardsWithin(node);
      }));
    });
    observer.observe(container, { childList: true, subtree: true });
  });
}

function enhanceEmptyAndSkeletonStates() {
  const observer = new MutationObserver(() => {
    const attentionEmpty = document.querySelector('#myFeedAttention[data-state="empty"] .state-message--empty');
    if (attentionEmpty) {
      const title = attentionEmpty.querySelector(".state-message__title");
      if (title) title.textContent = "No items yet.";
    }
  });
  document.querySelectorAll(".feed-grid").forEach(container => observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] }));
}

export function initPhase3Interactions() {
  bindMobileDrawerFocusTrap();
  bindWatchlistViewSync();
  bindPaletteKeyboard();
  bindCardDecorators();
  enhanceEmptyAndSkeletonStates();
  syncWatchlistView();
  window.lucide?.createIcons();
}
