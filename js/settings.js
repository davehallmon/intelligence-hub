import { bridgeEligibleProfiles, socialPolicyFor } from "./social-source-policy.js";

const SETTINGS_KEY = "intelligenceHub.privateSettings.v1";

const DEFAULTS = Object.freeze({
  socialProfileFeeds: Object.freeze({}),
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

export function getSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      ...DEFAULTS,
      ...parsed,
      socialProfileFeeds: normalizeSocialProfileFeeds(parsed.socialProfileFeeds),
      legacySocialFeedUrl: String(parsed.socialFeedUrl || "").trim()
    };
  } catch {
    return { ...DEFAULTS, socialProfileFeeds: {}, legacySocialFeedUrl: "" };
  }
}

export function saveSettings(next) {
  const clean = {
    socialProfileFeeds: normalizeSocialProfileFeeds(next.socialProfileFeeds),
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
    socialProfileMappings: document.getElementById("socialProfileMappings"),
    legacySocialFeedNotice: document.getElementById("legacySocialFeedNotice"),
    readwiseToken: document.getElementById("readwiseToken"),
    readwiseDays: document.getElementById("readwiseDays"),
    rss2jsonApiKey: document.getElementById("rss2jsonApiKey")
  };

  function populate() {
    const settings = getSettings();
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
