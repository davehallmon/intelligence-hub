// Intelligence Hub v10 — Phase 8 visible People & Organizations lens.
// This is a read model over the shared canonical item store, not a new feed silo.

import { ENTITY_TYPES, MONITORING_STATES } from "../config/entity-types.js";
import { getEntity } from "../config/entities.js";
import { createRichCard, renderEmpty, renderLoading, setStatus } from "../renderers.js";
import {
  coverageLabel,
  monitoredEntitySourceCoverage,
  monitoredPeopleOrganizations,
  sourceCoverageForEntity,
  summarizeMonitoredEntitySourceCoverage
} from "./entity-source-coverage.js";

function ensureStylesheet() {
  if (document.querySelector('link[href="css/lenses/people-organizations.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/lenses/people-organizations.css";
  document.head.append(link);
}

function createPrimaryTab() {
  if (document.querySelector('[data-primary-tab="people-organizations"]')) return;
  const nav = document.getElementById("primaryTabs");
  const watchlist = nav?.querySelector('[data-primary-tab="watchlist"]');
  if (!nav) return;

  const button = document.createElement("button");
  button.className = "drawer-item primary-tab";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.dataset.primaryTab = "people-organizations";
  button.setAttribute("aria-selected", "false");
  button.tabIndex = -1;
  button.innerHTML = '<i data-lucide="users-round" aria-hidden="true"></i><span class="label">People & Organizations</span>';

  if (watchlist?.nextSibling) nav.insertBefore(button, watchlist.nextSibling);
  else nav.append(button);
}

function createPanel() {
  if (document.getElementById("panel-people-organizations")) return;
  const workspace = document.querySelector("main.workspace");
  const launchpad = document.getElementById("panel-launchpad");
  if (!workspace || !launchpad) return;

  const panel = document.createElement("section");
  panel.className = "primary-panel feed-panel entity-lens-panel";
  panel.id = "panel-people-organizations";
  panel.dataset.primaryPanel = "people-organizations";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="feed-panel-header entity-lens-header">
      <div>
        <p class="panel-kicker">Priority + Active entities</p>
        <h2>People & Organizations</h2>
        <p>Follow canonical people and organizations across direct publishing, shared sources, appearances, and independent coverage without collapsing those relationships into one source type.</p>
      </div>
      <div class="feed-actions">
        <button class="btn button button--primary" id="peopleOrganizationsRefresh" type="button">Refresh</button>
      </div>
    </div>
    <section class="entity-lens-controls" aria-labelledby="entityLensControlsTitle">
      <div class="entity-lens-controls__copy">
        <h3 id="entityLensControlsTitle">Following</h3>
        <p>Priority and Active entities only. Parked entities remain available to Search and Questions.</p>
      </div>
      <label class="entity-lens-select-label" for="peopleOrganizationsFilter">
        <span>Show</span>
        <select id="peopleOrganizationsFilter" class="entity-lens-select"></select>
      </label>
    </section>
    <details class="entity-coverage" id="peopleOrganizationsCoverage">
      <summary>
        <span>Source coverage</span>
        <span class="entity-coverage__summary" id="peopleOrganizationsCoverageSummary"></span>
      </summary>
      <p class="entity-coverage__note">Coverage describes current intake paths. Discovery about an entity is never presented as content authored or published by that entity.</p>
      <div class="entity-coverage__list" id="peopleOrganizationsCoverageList"></div>
    </details>
    <div class="feed-health" id="peopleOrganizationsStatus" aria-live="polite">Open this tab to load followed entities.</div>
    <div class="feed-list feed-grid" id="peopleOrganizationsFeed" aria-live="polite"></div>`;

  workspace.insertBefore(panel, launchpad);
}

function stateRank(state) {
  return state === MONITORING_STATES.PRIORITY ? 0 : 1;
}

function entityTypeRank(type) {
  return type === ENTITY_TYPES.PERSON ? 0 : 1;
}

export function sortedMonitoredEntities() {
  return [...monitoredPeopleOrganizations()].sort((a, b) =>
    entityTypeRank(a.type) - entityTypeRank(b.type)
    || stateRank(a.monitoringState) - stateRank(b.monitoringState)
    || a.name.localeCompare(b.name)
  );
}

function stateLabel(state) {
  return state === MONITORING_STATES.PRIORITY ? "Priority" : "Active";
}

function typeLabel(type, plural = false) {
  if (type === ENTITY_TYPES.PERSON) return plural ? "People" : "Person";
  return plural ? "Organizations" : "Organization";
}

function buildEntitySelector() {
  const select = document.getElementById("peopleOrganizationsFilter");
  if (!select) return;
  select.replaceChildren();

  const baseOptions = [
    ["", "All followed entities"],
    ["type:person", "All people"],
    ["type:organization", "All organizations"]
  ];
  baseOptions.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });

  [ENTITY_TYPES.PERSON, ENTITY_TYPES.ORGANIZATION].forEach(type => {
    [MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE].forEach(state => {
      const group = document.createElement("optgroup");
      group.label = `${stateLabel(state)} ${typeLabel(type, true)}`;
      sortedMonitoredEntities()
        .filter(entity => entity.type === type && entity.monitoringState === state)
        .forEach(entity => {
          const option = document.createElement("option");
          option.value = entity.id;
          option.textContent = `${entity.name} — ${coverageLabel(sourceCoverageForEntity(entity.id)?.level)}`;
          group.append(option);
        });
      select.append(group);
    });
  });
}

function renderCoverageInventory() {
  const summary = summarizeMonitoredEntitySourceCoverage();
  const summaryNode = document.getElementById("peopleOrganizationsCoverageSummary");
  const list = document.getElementById("peopleOrganizationsCoverageList");
  if (summaryNode) {
    summaryNode.textContent = `${summary.byLevel.direct} direct · ${summary.byLevel.shared} shared · ${summary.byLevel.discovery} discovery · ${summary.byLevel.related} related · ${summary.byLevel.gap} gaps`;
  }
  if (!list) return;
  list.replaceChildren();

  [...monitoredEntitySourceCoverage()]
    .sort((a, b) => stateRank(a.entity.monitoringState) - stateRank(b.entity.monitoringState)
      || entityTypeRank(a.entity.type) - entityTypeRank(b.entity.type)
      || a.entity.name.localeCompare(b.entity.name))
    .forEach(record => {
      const row = document.createElement("div");
      row.className = "entity-coverage-row";
      row.dataset.coverageLevel = record.level;

      const copy = document.createElement("div");
      copy.className = "entity-coverage-row__copy";
      const name = document.createElement("strong");
      name.textContent = record.entity.name;
      const meta = document.createElement("span");
      meta.textContent = `${stateLabel(record.entity.monitoringState)} ${typeLabel(record.entity.type)} · ${coverageLabel(record.level)}`;
      copy.append(name, meta);

      const endpointNames = [
        ...record.direct,
        ...record.shared,
        ...record.discovery,
        ...record.related
      ].map(endpoint => endpoint.name);
      const detail = document.createElement("span");
      detail.className = "entity-coverage-row__detail";
      detail.textContent = endpointNames.length
        ? [...new Set(endpointNames)].slice(0, 3).join(" · ")
        : "No current live endpoint in the connector catalog.";

      row.append(copy, detail);
      list.append(row);
    });
}

function dateValue(entry) {
  const value = entry?.item?.publishedAt || entry?.item?.date || 0;
  const parsed = new Date(value).valueOf();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortEntityLensEntries(entries = []) {
  return [...entries].sort((a, b) => dateValue(b) - dateValue(a));
}

function entriesForFilter(allResult, filterValue) {
  if (!filterValue) return allResult.entries;
  if (filterValue.startsWith("type:")) {
    const type = filterValue.slice(5);
    return allResult.entries.filter(entry =>
      (entry.matchedEntityIds || []).some(entityId => getEntity(entityId)?.type === type)
    );
  }
  return null;
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
  row.className = "entity-match-row";
  const label = document.createElement("span");
  label.className = "entity-match-label";
  label.textContent = "Matches";
  row.append(label);
  values.forEach(reason => {
    const chip = document.createElement("span");
    chip.className = "entity-match-chip";
    chip.textContent = reason;
    row.append(chip);
  });
  body.append(row);
}

function selectedLabel(filterValue) {
  if (!filterValue) return "Priority + Active People & Organizations";
  if (filterValue === "type:person") return "People";
  if (filterValue === "type:organization") return "Organizations";
  return getEntity(filterValue)?.name || "Followed entity";
}

function renderResult(allResult, filteredResult, filterValue = "") {
  const entries = sortEntityLensEntries(filteredResult.entries);
  const label = selectedLabel(filterValue);
  if (!entries.length) {
    let suffix = "";
    if (filterValue && !filterValue.startsWith("type:")) {
      const coverage = sourceCoverageForEntity(filterValue);
      suffix = coverage ? ` Current source coverage: ${coverageLabel(coverage.level)}.` : "";
    }
    renderEmpty(
      "peopleOrganizationsFeed",
      `No currently loaded items match ${label}.${suffix}`
    );
    setStatus("peopleOrganizationsStatus", `0 live matches · ${label}`, "partial");
    return filteredResult;
  }

  const container = document.getElementById("peopleOrganizationsFeed");
  container?.replaceChildren();
  entries.forEach(entry => {
    const card = createRichCard(entry.item, {
      className: "feed-card entity-lens-card",
      label: contentLabel(entry.item.type),
      snippetLength: 340
    });
    appendMatchReasons(card, entry.reasons);
    container?.append(card);
  });

  const represented = new Set(entries.flatMap(entry => entry.matchedEntityIds || []));
  setStatus(
    "peopleOrganizationsStatus",
    `${entries.length} live item${entries.length === 1 ? "" : "s"} · ${represented.size} followed entit${represented.size === 1 ? "y" : "ies"} represented · newest first`,
    "ok"
  );
  window.lucide?.createIcons();
  return filteredResult;
}

export function initPeopleOrganizationsUI({ queryLens, loadSources } = {}) {
  if (typeof queryLens !== "function") throw new TypeError("initPeopleOrganizationsUI requires queryLens.");
  if (typeof loadSources !== "function") throw new TypeError("initPeopleOrganizationsUI requires loadSources.");

  ensureStylesheet();
  createPrimaryTab();
  createPanel();
  buildEntitySelector();
  renderCoverageInventory();

  let activeFilter = "";
  let loadPromise = null;

  function renderCurrent() {
    const allResult = queryLens("people-organizations");
    let filteredResult = allResult;
    const localEntries = entriesForFilter(allResult, activeFilter);
    if (localEntries) {
      filteredResult = Object.freeze({ ...allResult, entries: Object.freeze(localEntries), items: Object.freeze(localEntries.map(entry => entry.item)) });
    } else if (activeFilter) {
      filteredResult = queryLens("people-organizations", { entityIds: [activeFilter] });
    }
    return renderResult(allResult, filteredResult, activeFilter);
  }

  async function load({ force = false } = {}) {
    if (loadPromise && !force) return loadPromise;
    renderLoading("peopleOrganizationsFeed", "Loading followed people and organizations…");
    setStatus("peopleOrganizationsStatus", "Loading live sources into the shared intelligence store…", "loading");

    const task = (async () => {
      try {
        await loadSources({ force });
        return renderCurrent();
      } catch (error) {
        renderEmpty("peopleOrganizationsFeed", error?.message || "Unable to load People & Organizations intelligence.");
        setStatus("peopleOrganizationsStatus", error?.message || "Unable to load People & Organizations intelligence.", "error");
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

  document.getElementById("peopleOrganizationsRefresh")?.addEventListener("click", () => {
    load({ force: true }).catch(error => console.error("Unable to refresh People & Organizations:", error));
  });

  document.getElementById("peopleOrganizationsFilter")?.addEventListener("change", event => {
    activeFilter = event.target.value || "";
    renderCurrent();
  });

  window.lucide?.createIcons();
  return Object.freeze({
    load,
    render: renderCurrent,
    get activeFilter() { return activeFilter; }
  });
}
