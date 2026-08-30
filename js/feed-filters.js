import { getProfile } from "./profiles.js";

const FILTER_STATE = new Map();

function containerFor(tab) {
  const status = document.getElementById(`${tab}Status`);
  if (!status) return null;

  let container = document.getElementById(`${tab}FeedFilters`);
  if (container) return container;

  container = document.createElement("div");
  container.id = `${tab}FeedFilters`;
  container.className = "feed-filter-stack";
  container.setAttribute("aria-label", `${tab} feed filters`);
  status.insertAdjacentElement("afterend", container);
  return container;
}

function topicCountsFor(items) {
  const counts = new Map();
  items.forEach(item => {
    (item.topics || []).forEach(topic => counts.set(topic, (counts.get(topic) || 0) + 1));
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function profileCountsFor(items, type) {
  const counts = new Map();
  items.forEach(item => {
    (item.profileIds || []).forEach(id => {
      const profile = getProfile(id);
      if (profile?.type === type) counts.set(id, (counts.get(id) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([id, count]) => ({ id, count, profile: getProfile(id) }))
    .filter(entry => entry.profile)
    .sort((a, b) => b.count - a.count || a.profile.name.localeCompare(b.profile.name));
}

function filteredItems(items, state) {
  return items.filter(item => {
    if (state.topic !== "all" && !item.topics?.includes(state.topic)) return false;
    if (state.person !== "all" && !item.profileIds?.includes(state.person)) return false;
    if (state.organization !== "all" && !item.profileIds?.includes(state.organization)) return false;
    return true;
  });
}

function createRow(labelText, dimension, choices, state, onChange) {
  const row = document.createElement("div");
  row.className = "feed-filter-row";

  const label = document.createElement("span");
  label.className = "feed-filter-label";
  label.textContent = labelText;
  row.append(label);

  const chips = document.createElement("div");
  chips.className = "feed-filter-chips";

  choices.forEach(choice => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `feed-filter-chip ${dimension}-filter-chip`;
    button.dataset.filterDimension = dimension;
    button.dataset.filterValue = choice.value;
    button.setAttribute("aria-pressed", String(state[dimension] === choice.value));
    button.textContent = `${choice.label} ${choice.count}`;
    button.addEventListener("click", () => onChange(dimension, choice.value));
    chips.append(button);
  });

  row.append(chips);
  return row;
}

export function renderFeedFiltered(
  tab,
  items,
  renderer,
  { maxTopics = 8, maxPeople = 6, maxOrganizations = 6 } = {}
) {
  const container = containerFor(tab);
  if (!container) {
    renderer(items);
    return;
  }

  const topicCounts = topicCountsFor(items);
  const peopleCounts = profileCountsFor(items, "person");
  const organizationCounts = profileCountsFor(items, "organization");

  const state = FILTER_STATE.get(tab) || {
    topic: "all",
    person: "all",
    organization: "all"
  };

  if (state.topic !== "all" && !topicCounts.some(([topic]) => topic === state.topic)) state.topic = "all";
  if (state.person !== "all" && !peopleCounts.some(entry => entry.id === state.person)) state.person = "all";
  if (state.organization !== "all" && !organizationCounts.some(entry => entry.id === state.organization)) state.organization = "all";

  state.items = items;
  state.renderer = renderer;
  state.options = { maxTopics, maxPeople, maxOrganizations };
  FILTER_STATE.set(tab, state);

  container.replaceChildren();
  const hasFilters = topicCounts.length || peopleCounts.length || organizationCounts.length;
  container.hidden = !hasFilters;

  if (!hasFilters) {
    renderer(items);
    return;
  }

  const rerender = (dimension, value) => {
    state[dimension] = value;
    FILTER_STATE.set(tab, state);
    renderFeedFiltered(tab, state.items, state.renderer, state.options);
  };

  if (topicCounts.length) {
    const choices = [
      { value: "all", label: "All", count: items.length },
      ...topicCounts.slice(0, maxTopics).map(([topic, count]) => ({ value: topic, label: topic, count }))
    ];
    container.append(createRow("Topics", "topic", choices, state, rerender));
  }

  if (peopleCounts.length) {
    const choices = [
      { value: "all", label: "All", count: items.length },
      ...peopleCounts.slice(0, maxPeople).map(entry => ({
        value: entry.id,
        label: entry.profile.name,
        count: entry.count
      }))
    ];
    container.append(createRow("People", "person", choices, state, rerender));
  }

  if (organizationCounts.length) {
    const choices = [
      { value: "all", label: "All", count: items.length },
      ...organizationCounts.slice(0, maxOrganizations).map(entry => ({
        value: entry.id,
        label: entry.profile.name,
        count: entry.count
      }))
    ];
    container.append(createRow("Organizations", "organization", choices, state, rerender));
  }

  renderer(filteredItems(items, state));
}

// Backward-compatible name used by the current feed loaders. v8.2 extends it
// beyond topics so existing tabs gain entity filters without six loader rewrites.
export const renderTopicFiltered = renderFeedFiltered;

export function resetFeedFilters(tab) {
  const state = FILTER_STATE.get(tab);
  if (!state) return;
  state.topic = "all";
  state.person = "all";
  state.organization = "all";
}

export const resetTopicFilter = resetFeedFilters;
