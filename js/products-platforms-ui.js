// Intelligence Hub v10 — V10-M09 visible Products & Platforms lens.
// This is a read model over the shared canonical item store, not a new feed silo.

import { ENTITY_TYPES, MONITORING_STATES } from "./config/entity-types.js";
import { entitiesByType, getEntity } from "./config/entities.js";
import { classifyProductChange } from "./product-change-classifier.js";
import { createRichCard, renderEmpty, renderLoading, setStatus } from "./renderers.js";

const MONITORED_STATES = new Set([
  MONITORING_STATES.PRIORITY,
  MONITORING_STATES.ACTIVE
]);

function ensureStylesheet() {
  if (document.querySelector('link[href="products-platforms.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "products-platforms.css";
  document.head.append(link);
}

function createPrimaryTab() {
  if (document.querySelector('[data-primary-tab="products-platforms"]')) return;
  const nav = document.getElementById("primaryTabs");
  const peopleOrganizations = nav?.querySelector('[data-primary-tab="people-organizations"]');
  if (!nav) return;

  const button = document.createElement("button");
  button.className = "drawer-item primary-tab";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.dataset.primaryTab = "products-platforms";
  button.setAttribute("aria-selected", "false");
  button.tabIndex = -1;
  button.innerHTML = '<i data-lucide="boxes" aria-hidden="true"></i><span class="label">Products & Platforms</span>';

  if (peopleOrganizations?.nextSibling) nav.insertBefore(button, peopleOrganizations.nextSibling);
  else nav.append(button);
}

function createPanel() {
  if (document.getElementById("panel-products-platforms")) return;
  const workspace = document.querySelector("main.workspace");
  const launchpad = document.getElementById("panel-launchpad");
  if (!workspace || !launchpad) return;

  const panel = document.createElement("section");
  panel.className = "primary-panel feed-panel product-lens-panel";
  panel.id = "panel-products-platforms";
  panel.dataset.primaryPanel = "products-platforms";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="feed-panel-header product-lens-header">
      <div>
        <p class="panel-kicker">Priority + Active products</p>
        <h2>Products & Platforms</h2>
        <p>Track workflow-affecting feature, model, integration, interface, and documentation changes across monitored products while keeping one canonical intelligence object beneath every lens.</p>
      </div>
      <div class="feed-actions">
        <button class="btn button button--primary" id="productsPlatformsRefresh" type="button">Refresh</button>
      </div>
    </div>
    <section class="product-lens-controls" aria-labelledby="productLensControlsTitle">
      <div class="product-lens-controls__copy">
        <h3 id="productLensControlsTitle">Following</h3>
        <p>6 Priority + 10 Active products. Child capabilities inherit monitored parents. Meaningful changes are shown by default; generic mentions remain available on demand.</p>
      </div>
      <div class="product-lens-controls__inputs">
        <label class="product-lens-select-label" for="productsPlatformsFilter">
          <span>Product</span>
          <select id="productsPlatformsFilter" class="product-lens-select"></select>
        </label>
        <label class="product-lens-select-label" for="productsPlatformsSignalFilter">
          <span>Signal</span>
          <select id="productsPlatformsSignalFilter" class="product-lens-select">
            <option value="meaningful">Meaningful changes</option>
            <option value="all">All matched items</option>
          </select>
        </label>
      </div>
    </section>
    <div class="product-lens-rule" role="note">
      <strong>Product-change rule</strong>
      <span>Default view favors explicit launches, updates, releases, model changes, workflow/UI changes, integrations, and documentation/release-note changes. This filter does not promote anything into Focus.</span>
    </div>
    <div class="feed-health" id="productsPlatformsStatus" aria-live="polite">Open this tab to load monitored product changes.</div>
    <div class="feed-list feed-grid" id="productsPlatformsFeed" aria-live="polite"></div>`;

  workspace.insertBefore(panel, launchpad);
}

function stateRank(state) {
  return state === MONITORING_STATES.PRIORITY ? 0 : 1;
}

function stateLabel(state) {
  return state === MONITORING_STATES.PRIORITY ? "Priority" : "Active";
}

export function monitoredProducts() {
  return Object.freeze(
    entitiesByType(ENTITY_TYPES.PRODUCT)
      .filter(entity => MONITORED_STATES.has(entity.monitoringState))
  );
}

export function sortedMonitoredProducts() {
  return [...monitoredProducts()].sort((a, b) =>
    stateRank(a.monitoringState) - stateRank(b.monitoringState)
    || a.name.localeCompare(b.name)
  );
}

function childProducts(parentId) {
  return entitiesByType(ENTITY_TYPES.PRODUCT)
    .filter(entity => entity.monitoringState === MONITORING_STATES.CHILD && entity.parentId === parentId);
}

function buildProductSelector() {
  const select = document.getElementById("productsPlatformsFilter");
  if (!select) return;
  select.replaceChildren();

  const baseOptions = [
    ["", "All followed products"],
    ["state:priority", "Priority products"],
    ["state:active", "Active products"]
  ];
  baseOptions.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });

  [MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE].forEach(state => {
    const group = document.createElement("optgroup");
    group.label = `${stateLabel(state)} products`;
    sortedMonitoredProducts()
      .filter(entity => entity.monitoringState === state)
      .forEach(entity => {
        const option = document.createElement("option");
        option.value = entity.id;
        const children = childProducts(entity.id);
        option.textContent = children.length
          ? `${entity.name} · includes ${children.map(child => child.name).join(", ")}`
          : entity.name;
        group.append(option);
      });
    select.append(group);
  });
}

function dateValue(entry) {
  const value = entry?.item?.publishedAt || entry?.item?.date || 0;
  const parsed = new Date(value).valueOf();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortProductLensEntries(entries = []) {
  return [...entries].sort((a, b) => dateValue(b) - dateValue(a));
}

function stateFilteredEntries(allResult, state) {
  return allResult.entries.filter(entry =>
    (entry.matches || []).some(match => getEntity(match.monitoringAnchorId)?.monitoringState === state)
  );
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

function appendChips(card, labelText, values = [], className = "product-match-chip") {
  const body = card.querySelector(".rich-feed-body") || card;
  const uniqueValues = [...new Set(values.filter(Boolean))].slice(0, 5);
  if (!uniqueValues.length) return;

  const row = document.createElement("div");
  row.className = "product-match-row";
  const label = document.createElement("span");
  label.className = "product-match-label";
  label.textContent = labelText;
  row.append(label);

  uniqueValues.forEach(value => {
    const chip = document.createElement("span");
    chip.className = className;
    chip.textContent = value;
    row.append(chip);
  });
  body.append(row);
}

function selectedLabel(filterValue) {
  if (!filterValue) return "Priority + Active products";
  if (filterValue === "state:priority") return "Priority products";
  if (filterValue === "state:active") return "Active products";
  return getEntity(filterValue)?.name || "Followed product";
}

export function filterProductEntries(entries = [], signalMode = "meaningful") {
  if (signalMode === "all") return Object.freeze([...(entries || [])]);
  return Object.freeze((entries || []).filter(entry => classifyProductChange(entry?.item).meaningful));
}

function renderResult(allResult, productFilteredResult, filterValue = "", signalMode = "meaningful") {
  const allProductEntries = productFilteredResult.entries || [];
  const visibleEntries = sortProductLensEntries(filterProductEntries(allProductEntries, signalMode));
  const label = selectedLabel(filterValue);
  const meaningfulCount = allProductEntries.filter(entry => classifyProductChange(entry.item).meaningful).length;

  if (!visibleEntries.length) {
    const fallback = signalMode === "meaningful" && allProductEntries.length
      ? ` ${allProductEntries.length} general product match${allProductEntries.length === 1 ? " is" : "es are"} available under “All matched items.”`
      : "";
    renderEmpty(
      "productsPlatformsFeed",
      `No ${signalMode === "meaningful" ? "meaningful product changes" : "currently loaded items"} match ${label}.${fallback}`
    );
    setStatus(
      "productsPlatformsStatus",
      `${meaningfulCount} meaningful change${meaningfulCount === 1 ? "" : "s"} · ${allProductEntries.length} total product match${allProductEntries.length === 1 ? "" : "es"} · ${label}`,
      "partial"
    );
    return productFilteredResult;
  }

  const container = document.getElementById("productsPlatformsFeed");
  container?.replaceChildren();
  visibleEntries.forEach(entry => {
    const card = createRichCard(entry.item, {
      className: "feed-card product-lens-card",
      label: contentLabel(entry.item.type),
      snippetLength: 340
    });
    appendChips(card, "Matches", entry.reasons || []);
    const classification = classifyProductChange(entry.item);
    appendChips(
      card,
      classification.meaningful ? "Change" : "Signal",
      classification.meaningful ? classification.labels : ["General product match"],
      classification.meaningful ? "product-change-chip" : "product-general-chip"
    );
    container?.append(card);
  });

  const represented = new Set(
    visibleEntries.flatMap(entry => (entry.matches || []).map(match => match.monitoringAnchorId || match.entityId))
  );
  setStatus(
    "productsPlatformsStatus",
    `${visibleEntries.length} ${signalMode === "meaningful" ? "meaningful change" : "product item"}${visibleEntries.length === 1 ? "" : "s"} · ${represented.size} followed product${represented.size === 1 ? "" : "s"} represented · ${allProductEntries.length} total matches · newest first`,
    "ok"
  );
  window.lucide?.createIcons();
  return productFilteredResult;
}

export function initProductsPlatformsUI({ queryLens, loadSources } = {}) {
  if (typeof queryLens !== "function") throw new TypeError("initProductsPlatformsUI requires queryLens.");
  if (typeof loadSources !== "function") throw new TypeError("initProductsPlatformsUI requires loadSources.");

  ensureStylesheet();
  createPrimaryTab();
  createPanel();
  buildProductSelector();

  let activeFilter = "";
  let signalMode = "meaningful";
  let loadPromise = null;

  function productFilteredResult() {
    const allResult = queryLens("products-platforms");
    if (!activeFilter) return { allResult, filteredResult: allResult };

    if (activeFilter === "state:priority" || activeFilter === "state:active") {
      const state = activeFilter.endsWith("priority") ? MONITORING_STATES.PRIORITY : MONITORING_STATES.ACTIVE;
      const entries = stateFilteredEntries(allResult, state);
      return {
        allResult,
        filteredResult: Object.freeze({
          ...allResult,
          entries: Object.freeze(entries),
          items: Object.freeze(entries.map(entry => entry.item))
        })
      };
    }

    return {
      allResult,
      filteredResult: queryLens("products-platforms", { entityIds: [activeFilter] })
    };
  }

  function renderCurrent() {
    const { allResult, filteredResult } = productFilteredResult();
    return renderResult(allResult, filteredResult, activeFilter, signalMode);
  }

  async function load({ force = false } = {}) {
    if (loadPromise && !force) return loadPromise;
    renderLoading("productsPlatformsFeed", "Loading monitored product changes…");
    setStatus("productsPlatformsStatus", "Loading live sources into the shared intelligence store…", "loading");

    const task = (async () => {
      try {
        await loadSources({ force });
        return renderCurrent();
      } catch (error) {
        renderEmpty("productsPlatformsFeed", error?.message || "Unable to load Products & Platforms intelligence.");
        setStatus("productsPlatformsStatus", error?.message || "Unable to load Products & Platforms intelligence.", "error");
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

  document.getElementById("productsPlatformsRefresh")?.addEventListener("click", () => {
    load({ force: true }).catch(error => console.error("Unable to refresh Products & Platforms:", error));
  });

  document.getElementById("productsPlatformsFilter")?.addEventListener("change", event => {
    activeFilter = event.target.value || "";
    renderCurrent();
  });

  document.getElementById("productsPlatformsSignalFilter")?.addEventListener("change", event => {
    signalMode = event.target.value === "all" ? "all" : "meaningful";
    renderCurrent();
  });

  window.lucide?.createIcons();
  return Object.freeze({
    load,
    render: renderCurrent,
    get activeFilter() { return activeFilter; },
    get signalMode() { return signalMode; }
  });
}
