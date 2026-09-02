// Intelligence Hub v10 — Watchlist mobile refinement.
// Progressive enhancement only: the underlying Watchlist lens and topic controls stay authoritative.

const MOBILE_WATCHLIST_QUERY = "(max-width: 767px)";

function ensureStylesheet() {
  if (document.querySelector('link[href="css/lenses/watchlist-mobile.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/lenses/watchlist-mobile.css";
  document.head.append(link);
}

function createToggle(heading) {
  let button = document.getElementById("watchlistMobileToggle");
  if (button) return button;

  button = document.createElement("button");
  button.id = "watchlistMobileToggle";
  button.className = "watchlist-mobile-toggle";
  button.type = "button";
  button.setAttribute("aria-controls", "watchlistTopicControls");
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = '<span>Topics</span><span class="watchlist-mobile-toggle__chevron" aria-hidden="true">⌄</span>';
  heading.append(button);
  return button;
}

function setCollapsed(controls, button, collapsed) {
  controls.classList.toggle("is-mobile-collapsed", collapsed);
  button.setAttribute("aria-expanded", String(!collapsed));
}

export function initWatchlistMobileRefinement() {
  ensureStylesheet();

  const controls = document.querySelector(".watchlist-controls");
  const heading = controls?.querySelector(".watchlist-controls__heading");
  if (!controls || !heading) return Object.freeze({ destroy() {} });

  const media = window.matchMedia(MOBILE_WATCHLIST_QUERY);
  const button = createToggle(heading);

  function applyViewport() {
    if (media.matches) {
      button.hidden = false;
      setCollapsed(controls, button, true);
    } else {
      button.hidden = true;
      setCollapsed(controls, button, false);
    }
  }

  function onToggle() {
    if (!media.matches) return;
    setCollapsed(controls, button, !controls.classList.contains("is-mobile-collapsed"));
  }

  function onTopicSelection(event) {
    if (!media.matches) return;
    const topic = event.target.closest?.("[data-watchlist-topic]");
    if (!topic) return;
    // Return attention to the intelligence stream immediately after choosing a filter.
    setCollapsed(controls, button, true);
  }

  function syncRoute() {
    if (media.matches && document.body.dataset.primaryView !== "watchlist") {
      setCollapsed(controls, button, true);
    }
  }

  const routeObserver = new MutationObserver(syncRoute);
  routeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-primary-view"] });

  button.addEventListener("click", onToggle);
  controls.addEventListener("click", onTopicSelection);
  media.addEventListener?.("change", applyViewport);
  applyViewport();
  syncRoute();

  return Object.freeze({
    destroy() {
      routeObserver.disconnect();
      button.removeEventListener("click", onToggle);
      controls.removeEventListener("click", onTopicSelection);
      media.removeEventListener?.("change", applyViewport);
    }
  });
}
