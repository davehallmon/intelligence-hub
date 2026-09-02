// Intelligence Hub v10 — Phase 7 visible Watchlist lens.
// This is a view over the runtime lens service, not a separate ingestion path.

import { MONITORING_STATES } from "../config/entity-types.js";
import { WATCHLIST_TOPICS, getWatchlistTopic } from "../config/topic-taxonomy.js";
import { createRichCard, renderEmpty, renderLoading, setStatus } from "../renderers.js";

const CONTINUOUS_STATES = new Set([
  MONITORING_STATES.PRIORITY,
  MONITORING_STATES.ACTIVE
]);

function ensureStylesheet() {
  if (document.querySelector('link[href="css/lenses/watchlist.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/lenses/watchlist.css";
  document.head.append(link);
}

function createPrimaryTab() {
  if (document.querySelector('[data-primary-tab="watchlist"]')) return;
  const nav = document.getElementById("primaryTabs");
  const myFeed = nav?.querySelector('[data-primary-tab="myfeed"]');
  if (!nav) return;

  const button = document.createElement("button");
  button.className = "drawer-item primary-tab";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.dataset.primaryTab = "watchlist";
  button.setAttribute("aria-selected", "false");
  button.tabIndex = -1;
  button.innerHTML = '<i data-lucide="radar" aria-hidden="true"></i><span class="label">Watchlist</span>';

  if (myFeed?.nextSibling) nav.insertBefore(button, myFeed.nextSibling);
  else nav.append(button);
}

function createPanel() {
  if (document.getElementById("panel-watchlist")) return;
  const workspace = document.querySelector("main.workspace");
  const launchpad = document.getElementById("panel-launchpad");
  if (!workspace || !launchpad) return;

  const panel = document.createElement("section");
  panel.className = "primary-panel feed-panel watchlist-panel";
  panel.id = "panel-watchlist";
  panel.dataset.primaryPanel = "watchlist";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="feed-panel-header watchlist-header">
      <div>
        <p class="panel-kicker">Priority + Active monitoring</p>
        <h2>Watchlist</h2>
        <p>Broad discovery across the topics you continuously monitor. Parked topics remain outside this live view and available for search, Questions, and Research.</p>
      </div>
      <div class="feed-actions">
        <button class="btn button button--primary" id="watchlistRefresh" type="button">Refresh</button>
      </div>
    </div>
    <section class="watchlist-controls" aria-labelledby="watchlistControlsTitle">
      <div class="watchlist-controls__heading">
        <div>
          <h3 id="watchlistControlsTitle">Monitored topics</h3>
          <p>Select a topic to narrow the live lens without changing what is monitored.</p>
        </div>
      </div>
      <div id="watchlistTopicControls" class="watchlist-topic-groups" aria-label="Watchlist topic filters"></div>
    </section>
    <div class="feed-health" id="watchlistStatus" aria-live="polite">Open this tab to load monitored intelligence.</div>
    <div class="feed-list feed-grid" id="watchlistFeed" aria-live="polite"></div>`;

  workspace.insertBefore(panel, launchpad);
}

export function continuousWatchlistTopics() {
  return WATCHLIST_TOPICS.filter(topic => CONTINUOUS_STATES.has(topic.state));
}

function dateValue(entry) {
  const value = entry?.item?.publishedAt || entry?.item?.date || 0;
  const parsed = new Date(value).valueOf();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortWatchlistEntries(entries = []) {
  return [...entries].sort((a, b) => dateValue(b) - dateValue(a));
}

export function watchlistTopicCounts(entries = []) {
  const counts = Object.fromEntries(continuousWatchlistTopics().map(topic => [topic.id, 0]));
  (entries || []).forEach(entry => {
    [...new Set(entry.matchedTopicIds || [])].forEach(topicId => {
      if (Object.hasOwn(counts, topicId)) counts[topicId] += 1;
    });
  });
  return Object.freeze(counts);
}

function stateLabel(state) {
  return state === MONITORING_STATES.PRIORITY ? "Priority" : "Active";
}

function topicButton(topic, count, active) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "watchlist-topic-button";
  button.dataset.watchlistTopic = topic?.id || "";
  button.dataset.monitoringState = topic?.state || "all";
  button.setAttribute("aria-pressed", String(active));

  const label = document.createElement("span");
  label.className = "watchlist-topic-button__label";
  label.textContent = topic?.name || "All monitored";

  const countNode = document.createElement("span");
  countNode.className = "watchlist-topic-count";
  countNode.textContent = String(count);
  countNode.setAttribute("aria-label", `${count} matching item${count === 1 ? "" : "s"}`);

  button.append(label, countNode);
  return button;
}

function renderTopicControls(entries, activeTopicId = "") {
  const container = document.getElementById("watchlistTopicControls");
  if (!container) return;
  container.replaceChildren();

  const counts = watchlistTopicCounts(entries);
  const allGroup = document.createElement("div");
  allGroup.className = "watchlist-topic-group watchlist-topic-group--all";
  allGroup.append(topicButton(null, entries.length, !activeTopicId));
  container.append(allGroup);

  [MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE].forEach(state => {
    const group = document.createElement("section");
    group.className = "watchlist-topic-group";
    group.dataset.monitoringState = state;

    const heading = document.createElement("div");
    heading.className = "watchlist-topic-group__label";
    heading.textContent = stateLabel(state);

    const row = document.createElement("div");
    row.className = "watchlist-topic-row";
    continuousWatchlistTopics()
      .filter(topic => topic.state === state)
      .forEach(topic => row.append(topicButton(topic, counts[topic.id] || 0, activeTopicId === topic.id)));

    group.append(heading, row);
    container.append(group);
  });
}

function contentLabel(type) {
  return ({
    news: "News",
    social: "Social",
    academic: "Publication",
    research: "Research",
    video: "Video",
    highlight: "Library"
  })[type] || "Intelligence";
}

function appendMatchReasons(card, reasons = []) {
  const body = card.querySelector(".rich-feed-body") || card;
  const values = [...new Set(reasons || [])].slice(0, 4);
  if (!values.length) return;

  const row = document.createElement("div");
  row.className = "watchlist-match-row";

  const label = document.createElement("span");
  label.className = "watchlist-match-label";
  label.textContent = "Matches";
  row.append(label);

  values.forEach(reason => {
    const chip = document.createElement("span");
    chip.className = "watchlist-match-chip";
    chip.textContent = reason;
    row.append(chip);
  });

  body.append(row);
}

function renderResult(allResult, filteredResult, activeTopicId = "") {
  renderTopicControls(allResult.entries, activeTopicId);
  const entries = sortWatchlistEntries(filteredResult.entries);

  if (!entries.length) {
    const topic = activeTopicId ? getWatchlistTopic(activeTopicId) : null;
    renderEmpty(
      "watchlistFeed",
      topic
        ? `No currently loaded items match ${topic.name}. The topic remains monitored and will appear here when matching intelligence is ingested.`
        : "No currently loaded items match your Priority or Active Watchlists."
    );
    setStatus(
      "watchlistStatus",
      topic ? `0 live matches · ${topic.name}` : "0 live matches · Priority + Active Watchlists",
      "partial"
    );
    return filteredResult;
  }

  const container = document.getElementById("watchlistFeed");
  container?.replaceChildren();
  entries.forEach(entry => {
    const card = createRichCard(entry.item, {
      className: "feed-card watchlist-card",
      label: contentLabel(entry.item.type),
      snippetLength: 340
    });
    appendMatchReasons(card, entry.reasons);
    container?.append(card);
  });

  const matchedTopicIds = new Set(entries.flatMap(entry => entry.matchedTopicIds || []));
  const topic = activeTopicId ? getWatchlistTopic(activeTopicId) : null;
  setStatus(
    "watchlistStatus",
    topic
      ? `${entries.length} live match${entries.length === 1 ? "" : "es"} · ${topic.name} · newest first`
      : `${entries.length} live matches · ${matchedTopicIds.size} monitored topic${matchedTopicIds.size === 1 ? "" : "s"} represented · newest first`,
    "ok"
  );
  window.lucide?.createIcons();
  return filteredResult;
}

export function initWatchlistUI({ queryLens, loadSources } = {}) {
  if (typeof queryLens !== "function") throw new TypeError("initWatchlistUI requires queryLens.");
  if (typeof loadSources !== "function") throw new TypeError("initWatchlistUI requires loadSources.");

  ensureStylesheet();
  createPrimaryTab();
  createPanel();

  let activeTopicId = "";
  let loadPromise = null;

  function renderCurrent() {
    const allResult = queryLens("watchlist");
    const filteredResult = activeTopicId
      ? queryLens("watchlist", { topicIds: [activeTopicId] })
      : allResult;
    return renderResult(allResult, filteredResult, activeTopicId);
  }

  async function load({ force = false } = {}) {
    if (loadPromise && !force) return loadPromise;
    renderLoading("watchlistFeed", "Loading monitored intelligence…");
    setStatus("watchlistStatus", "Loading live sources into the shared intelligence store…", "loading");

    const task = (async () => {
      try {
        await loadSources({ force });
        return renderCurrent();
      } catch (error) {
        renderEmpty("watchlistFeed", error?.message || "Unable to load Watchlist intelligence.");
        setStatus("watchlistStatus", error?.message || "Unable to load Watchlist intelligence.", "error");
        throw error;
      }
    })();

    loadPromise = task;
    try {
      return await task;
    } finally {
      if (loadPromise === task) loadPromise = null;
    }
  }

  document.getElementById("watchlistRefresh")?.addEventListener("click", () => {
    load({ force: true }).catch(error => console.error("Unable to refresh Watchlist:", error));
  });

  document.getElementById("watchlistTopicControls")?.addEventListener("click", event => {
    const button = event.target.closest?.("[data-watchlist-topic]");
    if (!button) return;
    activeTopicId = button.dataset.watchlistTopic || "";
    renderCurrent();
  });

  renderTopicControls([], activeTopicId);
  window.lucide?.createIcons();

  return Object.freeze({
    load,
    render: renderCurrent,
    get activeTopicId() { return activeTopicId; }
  });
}
