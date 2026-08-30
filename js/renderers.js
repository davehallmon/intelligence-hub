function text(value) {
  return String(value || "").trim();
}

function clear(container) {
  if (container) container.replaceChildren();
}

function externalCard(tag = "a") {
  const node = document.createElement(tag);
  if (tag === "a") {
    node.target = "_blank";
    node.rel = "noopener noreferrer";
    node.referrerPolicy = "no-referrer";
  }
  return node;
}

function safeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.valueOf()) ? date : null;
}

export function ageLabel(value) {
  const date = safeDate(value);
  if (!date) return "Date unavailable";
  const diff = Math.max(0, Date.now() - date.valueOf());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function setStatus(id, message, state = "") {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = message;
  node.dataset.state = state;
}

export function renderLoading(containerId, message = "Loading…") {
  const container = document.getElementById(containerId);
  clear(container);
  const node = document.createElement("div");
  node.className = "feed-empty";
  node.textContent = message;
  container?.append(node);
}

export function renderEmpty(containerId, message) {
  const container = document.getElementById(containerId);
  clear(container);
  const node = document.createElement("div");
  node.className = "feed-empty";
  node.textContent = message;
  container?.append(node);
}

export function renderError(containerId, error) {
  const container = document.getElementById(containerId);
  clear(container);
  const node = document.createElement("div");
  node.className = "feed-error";
  node.textContent = error?.message || String(error || "Unable to load this feed.");
  container?.append(node);
}

function appendMeta(container, item, label = "") {
  const meta = document.createElement("div");
  meta.className = "feed-meta";

  const profile = item.profiles?.[0];
  const sourceText = profile && profile !== item.source
    ? `${profile} · ${item.source || ""}`.replace(/ · $/, "")
    : item.source || profile || "";

  if (sourceText) {
    const source = document.createElement("span");
    source.className = "feed-source";
    source.textContent = sourceText;
    meta.append(source);
  }

  if (item.publishedAt) {
    const date = document.createElement("span");
    date.textContent = ageLabel(item.publishedAt);
    meta.append(date);
  }

  if (label) {
    const badge = document.createElement("span");
    badge.textContent = label;
    meta.append(badge);
  }

  container.append(meta);
}

function appendTopics(container, item, max = 3) {
  const topics = (item.topics || []).slice(0, max);
  if (!topics.length) return;
  const row = document.createElement("div");
  row.className = "card-topic-row";
  topics.forEach(topic => {
    const chip = document.createElement("span");
    chip.className = "card-topic-chip";
    chip.textContent = topic;
    row.append(chip);
  });
  container.append(row);
}

function appendReasons(container, item) {
  const reasons = (item.myFeedReasons || []).slice(0, 4);
  if (!reasons.length) return;
  const row = document.createElement("div");
  row.className = "my-feed-reason-row";
  const label = document.createElement("span");
  label.className = "my-feed-reason-label";
  label.textContent = "Why";
  row.append(label);
  reasons.forEach(reason => {
    const chip = document.createElement("span");
    chip.className = "my-feed-reason-chip";
    chip.textContent = reason;
    row.append(chip);
  });
  container.append(row);
}

function mediaPlaceholder(item) {
  const placeholder = document.createElement("div");
  placeholder.className = "feed-media feed-media-placeholder";
  const icon = document.createElement("img");
  icon.className = "feed-source-icon";
  icon.alt = "";
  icon.loading = "lazy";
  icon.referrerPolicy = "no-referrer";
  if (item.faviconUrl) icon.src = item.faviconUrl;
  icon.addEventListener("error", () => icon.remove());
  const label = document.createElement("span");
  label.textContent = (item.source || item.profiles?.[0] || "Feed").slice(0, 32);
  placeholder.append(icon, label);
  return placeholder;
}

function appendMedia(card, item) {
  if (!item.imageUrl) {
    card.append(mediaPlaceholder(item));
    return;
  }

  const media = document.createElement("div");
  media.className = "feed-media";
  const image = document.createElement("img");
  image.className = "feed-image";
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.referrerPolicy = "no-referrer";
  image.src = item.imageUrl;
  image.addEventListener("error", () => media.replaceWith(mediaPlaceholder(item)), { once: true });
  media.append(image);
  card.append(media);
}

export function createRichCard(item, { className = "feed-card", label = "", snippetLength = 360, showReasons = false } = {}) {
  const card = externalCard();
  card.className = `${className} rich-feed-card`;
  card.href = item.url;
  appendMedia(card, item);

  const body = document.createElement("div");
  body.className = "rich-feed-body";
  appendMeta(body, item, label);

  const title = document.createElement("div");
  title.className = "feed-title";
  title.textContent = text(item.title);
  body.append(title);

  if (item.summary) {
    const snippet = document.createElement("p");
    snippet.className = "feed-snippet";
    snippet.textContent = text(item.summary).slice(0, snippetLength);
    body.append(snippet);
  }

  if (showReasons) appendReasons(body, item);
  appendTopics(body, item);
  card.append(body);
  return card;
}

export function renderNews(items) {
  const container = document.getElementById("newsFeed");
  clear(container);
  items.forEach(item => container.append(createRichCard(item)));
}

export function renderSocials(items) {
  const container = document.getElementById("socialsFeed");
  clear(container);
  items.forEach(item => container.append(createRichCard(item, { className: "timeline-card", snippetLength: 440 })));
}

export function renderAcademic(items) {
  const container = document.getElementById("academicFeed");
  clear(container);
  items.forEach(item => container.append(createRichCard(item, {
    label: item.badges?.includes("Google News fallback") ? "Google News fallback" : "",
    snippetLength: 390
  })));
}

export function renderPapers(items) {
  const container = document.getElementById("researchFeed");
  clear(container);

  items.forEach(item => {
    const card = externalCard();
    card.className = `paper-card${item.pinned ? " is-pinned" : ""}`;
    card.href = item.url;

    appendTopics(card, item, 5);
    appendMeta(card, item);

    const title = document.createElement("div");
    title.className = "feed-title";
    title.textContent = text(item.title);
    card.append(title);

    if (item.authors?.length) {
      const authors = document.createElement("div");
      authors.className = "paper-authors";
      authors.textContent = item.authors.join(", ");
      card.append(authors);
    }

    if (item.summary) {
      const abstract = document.createElement("p");
      abstract.className = "paper-abstract";
      abstract.textContent = text(item.summary);
      card.append(abstract);
    }
    container.append(card);
  });
}

export function renderVideos(items) {
  const container = document.getElementById("videoFeed");
  clear(container);

  items.forEach(item => {
    const card = externalCard();
    card.className = "video-card";
    card.href = item.url;

    const img = document.createElement("img");
    img.className = "video-thumb";
    img.alt = "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    if (item.imageUrl) img.src = item.imageUrl;
    card.append(img);

    const copy = document.createElement("div");
    copy.className = "video-copy";
    const title = document.createElement("div");
    title.className = "video-title";
    title.textContent = text(item.title);
    copy.append(title);

    const meta = document.createElement("div");
    meta.className = "video-meta";
    meta.textContent = [item.profiles?.[0] || item.source || item.author, ageLabel(item.publishedAt)].filter(Boolean).join(" · ");
    copy.append(meta);
    appendTopics(copy, item, 2);
    card.append(copy);
    container.append(card);
  });
}

export function renderHighlights(items) {
  const container = document.getElementById("booksFeed");
  clear(container);

  items.forEach(item => {
    const card = item.url ? externalCard() : externalCard("article");
    card.className = `highlight-card${item.imageUrl ? " has-cover" : ""}`;
    if (item.url) card.href = item.url;

    if (item.imageUrl) {
      const cover = document.createElement("img");
      cover.className = "highlight-cover";
      cover.alt = "";
      cover.loading = "lazy";
      cover.referrerPolicy = "no-referrer";
      cover.src = item.imageUrl;
      cover.addEventListener("error", () => cover.remove(), { once: true });
      card.append(cover);
    }

    const body = document.createElement("div");
    body.className = "highlight-body";
    appendMeta(body, item, item.badges?.[0] || "");
    const quote = document.createElement("blockquote");
    quote.textContent = text(item.summary);
    body.append(quote);
    appendTopics(body, item);
    card.append(body);
    container.append(card);
  });
}
