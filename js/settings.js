const SETTINGS_KEY = "intelligenceHub.privateSettings.v1";

const DEFAULTS = Object.freeze({
  socialFeedUrl: "",
  socialFeedPrivate: true,
  readwiseToken: "",
  readwiseDays: 30,
  rss2jsonApiKey: ""
});

export function getSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(next) {
  const clean = {
    socialFeedUrl: String(next.socialFeedUrl || "").trim(),
    socialFeedPrivate: Boolean(next.socialFeedPrivate),
    readwiseToken: String(next.readwiseToken || "").trim(),
    readwiseDays: Number(next.readwiseDays || 30),
    rss2jsonApiKey: String(next.rss2jsonApiKey || "").trim()
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean));
  return clean;
}

export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}

export function initSettings({ onSaved } = {}) {
  const dialog = document.getElementById("settingsDialog");
  const form = document.getElementById("settingsForm");
  if (!dialog || !form) return;

  const fields = {
    socialFeedUrl: document.getElementById("socialFeedUrl"),
    socialFeedPrivate: document.getElementById("socialFeedPrivate"),
    readwiseToken: document.getElementById("readwiseToken"),
    readwiseDays: document.getElementById("readwiseDays"),
    rss2jsonApiKey: document.getElementById("rss2jsonApiKey")
  };

  function populate() {
    const settings = getSettings();
    fields.socialFeedUrl.value = settings.socialFeedUrl;
    fields.socialFeedPrivate.checked = settings.socialFeedPrivate;
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
      socialFeedUrl: fields.socialFeedUrl.value,
      socialFeedPrivate: fields.socialFeedPrivate.checked,
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
