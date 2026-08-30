import { bridgeEligibleProfiles, socialPolicyFor } from "./social-source-policy.js";
import { profilesForType } from "./profiles.js";
import { TOPIC_LABELS } from "./topics.js";
import { MY_FEED_DEFAULT_HIGH_TOPICS, PRIORITY_LEVELS } from "./my-feed-config.js";

const SETTINGS_KEY = "intelligenceHub.privateSettings.v1";

const ACTIVE_PEOPLE = Object.freeze(profilesForType("person", { includeWatchlist: false }));
const ACTIVE_ORGANIZATIONS = Object.freeze(profilesForType("organization", { includeWatchlist: false }));
const highTopicSet = new Set(MY_FEED_DEFAULT_HIGH_TOPICS);

function defaultTopicPriorities() {
  return Object.fromEntries(TOPIC_LABELS.map(topic => [topic, highTopicSet.has(topic) ? "high" : "normal"]));
}

function defaultProfilePriorities(profiles) {
  return Object.fromEntries(profiles.map(profile => [profile.id, "normal"]));
}

const DEFAULTS = Object.freeze({
  socialProfileFeeds: Object.freeze({}),
  myFeedPriorities: Object.freeze({
    topics: Object.freeze(defaultTopicPriorities()),
    people: Object.freeze(defaultProfilePriorities(ACTIVE_PEOPLE)),
    organizations: Object.freeze(defaultProfilePriorities(ACTIVE_ORGANIZATIONS))
  }),
  readwiseToken: "",
  readwiseDays: 30,
  rss2jsonApiKey: ""
});

const bridgeProfileIds = new Set(bridgeEligibleProfiles().map(profile => profile.profileId));

function normalizeSocialProfileFeeds(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const clean = {};
  Object.entries(value).forEach(([profileId, config]) => {
    if (!bridgeProfileIds.has(profileId)) return;
    const url = String(config?.url || "").trim();
    if (!url) return;
    clean[profileId] = { url, private: config?.private !== false };
  });
  return clean;
}

function normalizePriority(value, fallback = "normal") {
  return PRIORITY_LEVELS.includes(value) ? value : fallback;
}

function normalizePriorityMap(value, keys, defaults) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return Object.fromEntries(keys.map(key => [key, normalizePriority(raw[key], defaults[key] || "normal")]));
}

function normalizeMyFeedPriorities(value) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const topicDefaults = defaultTopicPriorities();
  const peopleDefaults = defaultProfilePriorities(ACTIVE_PEOPLE);
  const organizationDefaults = defaultProfilePriorities(ACTIVE_ORGANIZATIONS);
  return {
    topics: normalizePriorityMap(raw.topics, TOPIC_LABELS, topicDefaults),
    people: normalizePriorityMap(raw.people, ACTIVE_PEOPLE.map(profile => profile.id), peopleDefaults),
    organizations: normalizePriorityMap(raw.organizations, ACTIVE_ORGANIZATIONS.map(profile => profile.id), organizationDefaults)
  };
}

export function getSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      ...DEFAULTS,
      ...parsed,
      socialProfileFeeds: normalizeSocialProfileFeeds(parsed.socialProfileFeeds),
      myFeedPriorities: normalizeMyFeedPriorities(parsed.myFeedPriorities),
      legacySocialFeedUrl: String(parsed.socialFeedUrl || "").trim()
    };
  } catch {
    return {
      ...DEFAULTS,
      socialProfileFeeds: {},
      myFeedPriorities: normalizeMyFeedPriorities({}),
      legacySocialFeedUrl: ""
    };
  }
}

export function saveSettings(next) {
  const clean = {
    socialProfileFeeds: normalizeSocialProfileFeeds(next.socialProfileFeeds),
    myFeedPriorities: normalizeMyFeedPriorities(next.myFeedPriorities),
    readwiseToken: String(next.readwiseToken || "").trim(),
    readwiseDays: Number(next.readwiseDays || 30),
    rss2jsonApiKey: String(next.rss2jsonApiKey || "").trim()
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean));
  return { ...clean, legacySocialFeedUrl: "" };
}

export function getSocialBridgeSources(settings = getSettings()) {
  return Object.entries(settings.socialProfileFeeds || {}).map(([profileId, config]) => {
    const policy = socialPolicyFor(profileId);
    return {
      id: `local-social-${profileId}`,
      name: policy?.name || profileId,
      url: String(config?.url || "").trim(),
      private: config?.private !== false,
      profileIds: [profileId],
      badges: ["Social bridge"]
    };
  }).filter(source => source.url);
}

export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}

function prioritySelect(dimension, key, value) {
  const select = document.createElement("select");
  select.dataset.myFeedPriority = dimension;
  select.dataset.priorityKey = key;
  [
    ["high", "High priority"],
    ["normal", "Normal"],
    ["lower", "Lower priority"]
  ].forEach(([optionValue, label]) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = label;
    option.selected = value === optionValue;
    select.append(option);
  });
  return select;
}

function createPriorityRow({ key, label, meta = "", dimension, value }) {
  const row = document.createElement("label");
  row.className = "priority-row";
  const copy = document.createElement("span");
  copy.className = "priority-row-copy";
  const name = document.createElement("strong");
  name.textContent = label;
  copy.append(name);
  if (meta) {
    const detail = document.createElement("small");
    detail.textContent = meta;
    copy.append(detail);
  }
  row.append(copy, prioritySelect(dimension, key, value));
  return row;
}

function populatePriorities(fields, settings) {
  if (fields.myFeedTopicPriorities) {
    fields.myFeedTopicPriorities.replaceChildren(...TOPIC_LABELS.map(topic => createPriorityRow({
      key: topic,
      label: topic,
      meta: highTopicSet.has(topic) ? "Approved v9.0 default: High" : "Default: Normal",
      dimension: "topics",
      value: settings.myFeedPriorities.topics[topic]
    })));
  }

  if (fields.myFeedPeoplePriorities) {
    fields.myFeedPeoplePriorities.replaceChildren(...ACTIVE_PEOPLE.map(profile => createPriorityRow({
      key: profile.id,
      label: profile.name,
      meta: profile.tier === "core-active" ? "Core Active" : "Selective Active",
      dimension: "people",
      value: settings.myFeedPriorities.people[profile.id]
    })));
  }

  if (fields.myFeedOrganizationPriorities) {
    fields.myFeedOrganizationPriorities.replaceChildren(...ACTIVE_ORGANIZATIONS.map(profile => createPriorityRow({
      key: profile.id,
      label: profile.name,
      meta: profile.tier === "core-active" ? "Core Active" : "Selective Active",
      dimension: "organizations",
      value: settings.myFeedPriorities.organizations[profile.id]
    })));
  }
}

function collectPriorityMap(form, dimension) {
  const values = {};
  form.querySelectorAll(`[data-my-feed-priority="${dimension}"]`).forEach(select => {
    values[select.dataset.priorityKey] = normalizePriority(select.value);
  });
  return values;
}

function collectMyFeedPriorities(form) {
  return {
    topics: collectPriorityMap(form, "topics"),
    people: collectPriorityMap(form, "people"),
    organizations: collectPriorityMap(form, "organizations")
  };
}

function createBridgeRow(profile, settings) {
  const mapping = settings.socialProfileFeeds?.[profile.profileId] || {};
  const row = document.createElement("div");
  row.className = "bridge-mapping";
  row.dataset.profileId = profile.profileId;

  const heading = document.createElement("div");
  heading.className = "bridge-mapping-heading";
  const name = document.createElement("strong");
  name.textContent = profile.name;
  const meta = document.createElement("span");
  meta.textContent = `${profile.mainOutlet || "Social outlet"} · Bridge-eligible`;
  heading.append(name, meta);

  const label = document.createElement("label");
  label.className = "field bridge-url-field";
  const labelText = document.createElement("span");
  labelText.textContent = "Profile-specific RSS URL";
  const input = document.createElement("input");
  input.type = "url";
  input.autocomplete = "off";
  input.placeholder = "https://…/private-or-public-feed.xml";
  input.value = mapping.url || "";
  input.dataset.socialProfileUrl = profile.profileId;
  label.append(labelText, input);

  const privacy = document.createElement("label");
  privacy.className = "check-field bridge-private-field";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = mapping.private !== false;
  checkbox.dataset.socialProfilePrivate = profile.profileId;
  const privacyCopy = document.createElement("span");
  privacyCopy.textContent = "Treat this feed as private";
  const privacyNote = document.createElement("small");
  privacyNote.textContent = "Private feeds are fetched directly and never sent through a public RSS proxy.";
  privacyCopy.append(privacyNote);
  privacy.append(checkbox, privacyCopy);

  row.append(heading, label, privacy);
  return row;
}

function collectSocialProfileFeeds(form) {
  const mappings = {};
  form.querySelectorAll("[data-social-profile-url]").forEach(input => {
    const profileId = input.dataset.socialProfileUrl;
    const url = String(input.value || "").trim();
    if (!url || !bridgeProfileIds.has(profileId)) return;
    const privacy = form.querySelector(`[data-social-profile-private="${profileId}"]`);
    mappings[profileId] = { url, private: privacy?.checked !== false };
  });
  return mappings;
}

export function initSettings({ onSaved } = {}) {
  const dialog = document.getElementById("settingsDialog");
  const form = document.getElementById("settingsForm");
  if (!dialog || !form) return;

  const fields = {
    myFeedTopicPriorities: document.getElementById("myFeedTopicPriorities"),
    myFeedPeoplePriorities: document.getElementById("myFeedPeoplePriorities"),
    myFeedOrganizationPriorities: document.getElementById("myFeedOrganizationPriorities"),
    socialProfileMappings: document.getElementById("socialProfileMappings"),
    legacySocialFeedNotice: document.getElementById("legacySocialFeedNotice"),
    readwiseToken: document.getElementById("readwiseToken"),
    readwiseDays: document.getElementById("readwiseDays"),
    rss2jsonApiKey: document.getElementById("rss2jsonApiKey")
  };

  function populate() {
    const settings = getSettings();
    populatePriorities(fields, settings);
    if (fields.socialProfileMappings) {
      fields.socialProfileMappings.replaceChildren(
        ...bridgeEligibleProfiles().map(profile => createBridgeRow(profile, settings))
      );
    }
    if (fields.legacySocialFeedNotice) {
      fields.legacySocialFeedNotice.hidden = !settings.legacySocialFeedUrl;
    }
    fields.readwiseToken.value = settings.readwiseToken;
    fields.readwiseDays.value = String(settings.readwiseDays);
    fields.rss2jsonApiKey.value = settings.rss2jsonApiKey;
  }

  function open() {
    populate();
    dialog.showModal();
  }

  document.getElementById("settingsOpen")?.addEventListener("click", open);
  document.querySelectorAll("[data-open-settings]").forEach(button => {
    button.addEventListener("click", open);
  });
  document.querySelectorAll("[data-settings-close]").forEach(button => {
    button.addEventListener("click", () => dialog.close());
  });

  document.querySelectorAll("[data-toggle-secret]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.toggleSecret);
      if (!target) return;
      const show = target.type === "password";
      target.type = show ? "text" : "password";
      button.textContent = show ? "Hide" : "Show";
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const saved = saveSettings({
      myFeedPriorities: collectMyFeedPriorities(form),
      socialProfileFeeds: collectSocialProfileFeeds(form),
      readwiseToken: fields.readwiseToken.value,
      readwiseDays: fields.readwiseDays.value,
      rss2jsonApiKey: fields.rss2jsonApiKey.value
    });
    dialog.close();
    onSaved?.(saved);
    document.dispatchEvent(new CustomEvent("ih:settings-saved", { detail: saved }));
  });

  document.getElementById("settingsClear")?.addEventListener("click", () => {
    if (!confirm("Clear all locally stored Intelligence Hub settings from this browser?")) return;
    clearSettings();
    populate();
    onSaved?.(getSettings());
    document.dispatchEvent(new CustomEvent("ih:settings-saved", { detail: getSettings() }));
  });

  return { open, populate };
}
