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

export function initUIFoundation() {
  document.documentElement.dataset.uiVersion = "9.1";

  // Loaded after legacy styles so variables.css is authoritative at runtime and
  // css/style.css can progressively migrate components without a destructive rewrite.
  ensureStylesheet("css/variables.css");
  ensureStylesheet("css/style.css");
  ensureLucide();
}

export function decorateUIFoundation() {
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

  document.querySelector(".topbar")?.classList.add("zone-primary");
  document.querySelector(".primary-nav-wrap")?.classList.add("zone-secondary");
  document.querySelector("#panel-myfeed")?.classList.add("zone-secondary");
  document.querySelector("#panel-launchpad")?.classList.add("zone-tertiary");

  document.querySelectorAll(".bookmark-card").forEach(card => {
    card.classList.add("card", "card--bookmark");
  });

  window.lucide?.createIcons();
}
