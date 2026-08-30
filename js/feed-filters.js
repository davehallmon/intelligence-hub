const FILTER_STATE = new Map();

function containerFor(tab) {
  const status = document.getElementById(`${tab}Status`);
  if (!status) return null;

  let container = document.getElementById(`${tab}TopicFilters`);
  if (container) return container;

  container = document.createElement("div");
  container.id = `${tab}TopicFilters`;
  container.className = "topic-filter-bar";
  container.setAttribute("aria-label", `${tab} topic filters`);
  status.insertAdjacentElement("afterend", container);
  return container;
}

function countsFor(items) {
  const counts = new Map();
  items.forEach(item => {
    (item.topics || []).forEach(topic => counts.set(topic, (counts.get(topic) || 0) + 1));
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function filterItems(items, topic) {
  if (!topic || topic === "all") return items;
  return items.filter(item => item.topics?.includes(topic));
}

export function renderTopicFiltered(tab, items, renderer, { maxTopics = 8 } = {}) {
  const container = containerFor(tab);
  if (!container) {
    renderer(items);
    return;
  }

  const topicCounts = countsFor(items);
  const state = FILTER_STATE.get(tab) || { selected: "all" };
  if (state.selected !== "all" && !topicCounts.some(([topic]) => topic === state.selected)) {
    state.selected = "all";
  }
  state.items = items;
  state.renderer = renderer;
  FILTER_STATE.set(tab, state);

  container.replaceChildren();
  if (!topicCounts.length) {
    container.hidden = true;
    renderer(items);
    return;
  }

  container.hidden = false;
  const topics = topicCounts.slice(0, maxTopics);
  const choices = [["all", items.length], ...topics];

  choices.forEach(([topic, count]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "topic-filter-chip";
    button.dataset.topic = topic;
    button.setAttribute("aria-pressed", String(state.selected === topic));
    button.textContent = topic === "all" ? `All ${count}` : `${topic} ${count}`;
    button.addEventListener("click", () => {
      state.selected = topic;
      FILTER_STATE.set(tab, state);
      renderTopicFiltered(tab, state.items, state.renderer, { maxTopics });
    });
    container.append(button);
  });

  renderer(filterItems(items, state.selected));
}

export function resetTopicFilter(tab) {
  const state = FILTER_STATE.get(tab);
  if (state) state.selected = "all";
}
