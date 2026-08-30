// Intelligence Hub v9.1 — UI foundation compatibility entry.
// The existing dashboard modules remain intact while the new design system is layered in.

function ensureStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
}

function ensureLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
    return;
  }
  if (document.querySelector('script[data-intelligence-hub-lucide]')) return;
  const script = document.createElement("script");
  script.src = "https://unpkg.com/lucide@latest";
  script.defer = true;
  script.dataset.intelligenceHubLucide = "true";
  script.addEventListener("load", () => window.lucide?.createIcons());
  document.head.append(script);
}

let drawerCloseTimer = null;

function drawerElements() {
  return {
    toggle: document.getElementById("menu-toggle"),
    overlay: document.getElementById("drawer-overlay"),
    drawer: document.getElementById("flyout-drawer"),
    main: document.getElementById("main-content")
  };
}

function setDrawerState(open) {
  const { toggle, overlay, drawer, main } = drawerElements();
  if (!toggle || !overlay || !drawer) return;

  if (drawerCloseTimer) {
    clearTimeout(drawerCloseTimer);
    drawerCloseTimer = null;
  }

  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");

  if (open) {
    document.body.dataset.drawerOpen = "true";
    overlay.hidden = false;
    drawer.hidden = false;
    main?.setAttribute("aria-hidden", "true");
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    return;
  }

  drawer.classList.remove("is-open");
  main?.removeAttribute("aria-hidden");
  delete document.body.dataset.drawerOpen;

  const finishClose = () => {
    drawer.hidden = true;
    overlay.hidden = true;
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishClose();
  } else {
    drawerCloseTimer = window.setTimeout(finishClose, 260);
  }
}

export function toggleDrawer() {
  const { toggle } = drawerElements();
  const isOpen = toggle?.getAttribute("aria-expanded") === "true";
  setDrawerState(!isOpen);
}

export function closeDrawer() {
  setDrawerState(false);
}

function bindDrawerControls() {
  const { toggle, overlay, drawer } = drawerElements();
  if (!toggle || !overlay || !drawer || toggle.dataset.drawerBound === "true") return;

  // The active navigation state is governed by aria-selected in navigation.js.
  document.querySelectorAll(".drawer-item.active").forEach(item => item.classList.remove("active"));

  toggle.dataset.drawerBound = "true";
  toggle.addEventListener("click", toggleDrawer);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeDrawer();
  });

  drawer.addEventListener("click", event => {
    if (event.target.closest?.("[data-primary-tab]")) closeDrawer();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      closeDrawer();
      toggle.focus();
    }
  });
}

export function initUIFoundation() {
  document.documentElement.dataset.uiVersion = "9.1";

  // variables.css is loaded after the legacy linked styles so its token values
  // are authoritative at runtime. The component override layer is appended after
  // v8/v9 compatibility styles by decorateUIFoundation().
  ensureStylesheet("css/variables.css");
  ensureLucide();
  bindDrawerControls();
}

export function decorateUIFoundation() {
  // This is intentionally added after my-feed.css / feed-intelligence.css so the
  // v9.1 component and breakpoint rules are the final cascade layer.
  ensureStylesheet("css/style.css");

  const feedContainers = [
    "myFeedAttention",
    "myFeedFeed",
    "newsFeed",
    "socialsFeed",
    "academicFeed",
    "researchFeed",
    "videoFeed",
    "booksFeed"
  ];

  feedContainers.forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;
    container.classList.add("feed-grid");
    container.setAttribute("aria-live", "polite");
  });

  document.querySelector("#app-topbar")?.classList.add("zone-primary");
  document.querySelector("#flyout-drawer")?.classList.add("zone-secondary");
  document.querySelector("#panel-myfeed")?.classList.add("zone-secondary");
  document.querySelector("#panel-launchpad")?.classList.add("zone-tertiary");

  document.querySelectorAll(".bookmark-card").forEach(card => {
    card.classList.add("card", "card--bookmark");
  });

  window.lucide?.createIcons();
}
