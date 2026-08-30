function text(value) {
  return String(value || "").trim();
}

function clear(container, state = "ready") {
  if (!container) return;
  container.replaceChildren();
  container.dataset.state = state;
  container.removeAttribute("aria-label");
  if (state === "loading") container.setAttribute("aria-busy", "true");
  else container.removeAttribute("aria-busy");
}

function refreshIcons() {
  window.lucide?.createIcons();
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

function skeletonCard() {
  const card = document.createElement("div");
  card.className = "skeleton-card";
  card.setAttribute("aria-hidden", "true");
  card.innerHTML = `
    <div class="skeleton-card__media"></div>
    <div class="skeleton-line skeleton-line--meta"></div>
    <div class="skeleton-line skeleton-line--title"></div>
    <div class="skeleton-line skeleton-line--title-short"></div>
    <div class="skeleton-line skeleton-line--body"></div>
    <div class="skeleton-line skeleton-line--body-short"></div>`;
  return card;
}

export function renderLoading(containerId, message = "Loading…") {
  const container = document.getElementById(containerId);
  if (!container) return;
  clear(container, "loading");
  container.setAttribute("aria-label", message);
  const grid = document.createElement("div");
  grid.className = "skeleton-grid";
  const count = containerId === "myFeedFeed" ? 6 : 4;
  for (let index = 0; index < count; index += 1) grid.append(skeletonCard());
  container.append(grid);
}

function createStateMessage({ kind = "empty", title, message, icon = "inbox", retryTab = "" }) {
  const node = document.createElement("div");
  node.className = `state-message state-message--${kind}`;

  const iconNode = document.createElement("i");
  iconNode.className = "state-message__icon";
  iconNode.dataset.lucide = icon;
  iconNode.setAttribute("aria-hidden", "true");

  const heading = document.createElement("p");
  heading.className = "state-message__title";
  heading.textContent = title;

  const copy = document.createElement("p");
  copy.className = "state-message__copy";
  copy.textContent = message;

  node.append(iconNode, heading, copy);

  if (retryTab) {
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "btn button button--primary state-message__retry";
    retry.textContent = "Retry";
    retry.addEventListener("click", () => {
      document.querySelector(`[data-refresh-feed="${retryTab}"]`)?.click();
    });
    node.append(retry);
  }

  return node;
}

export function renderEmpty(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clear(container, "empty");
  container.append(createStateMessage({
    kind: "empty",
    title: "Nothing to show here yet",
    message,
    icon: "inbox"
  }));
  refreshIcons();
}

function retryTabFor(containerId) {
  return ({
    newsFeed: "news",
    socialsFeed: "socials",
    academicFeed: "academic",
    researchFeed: "research",
    videoFeed: "video",
    booksFeed: "books",
    myFeedAttention: "myfeed",
    myFeedFeed: "myfeed"
  })[containerId] || "";
}

export function renderError(containerId, error) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clear(container, "error");
  container.append(createStateMessage({
    kind: "error",
    title: "Unable to load this feed",
    message: error?.message || String(error || "Unable to load this feed."),
    icon: "circle-alert",
    retryTab: retryTabFor(containerId)
  }));
  refreshIcons();
}

function contentBadgeClass(item) {
  return ({
    news: "badge--news",
    social: "badge--social",
    academic: "badge--academic",
    research: "badge--research",
    video: "badge--video",
    highlight: "badge--books"
  })[item.type] || "";
}

function appendMeta(container, item, label = "") {
  const meta = document.createElement("div");
  meta.className = "feed-meta card__meta";

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
    badge.className = `badge ${contentBadgeClass(item)}`.trim();
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
    chip.className = "card-topic-chip badge badge--topic";
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
  placeholder.className = "feed-media feed-media-placeholder card__thumbnail";
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
  media.className = "feed-media card__thumbnail";
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
  card.className = `${className} rich-feed-card card card--${item.type || "article"}`;
  card.href = item.url;
  appendMedia(card, item);

  const body = document.createElement("div");
  body.className = "rich-feed-body card__body";
  appendMeta(body, item, label);

  const title = document.createElement("div");
  title.className = "feed-title card__title";
  title.textContent = text(item.title);
  body.append(title);

  if (item.summary) {
    const snippet = document.createElement("p");
    snippet.className = "feed-snippet card__excerpt";
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
    card.className = `paper-card card card--research${item.pinned ? " is-pinned" : ""}`;
    card.href = item.url;

    appendTopics(card, item, 5);
    appendMeta(card, item);

    const title = document.createElement("div");
    title.className = "feed-title card__title";
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
      abstract.className = "paper-abstract card__excerpt";
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
    card.className = "video-card card card--video";
    card.href = item.url;

    const img = document.createElement("img");
    img.className = "video-thumb card__thumbnail";
    img.alt = "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    if (item.imageUrl) img.src = item.imageUrl;
    card.append(img);

    const copy = document.createElement("div");
    copy.className = "video-copy card__body";
    const title = document.createElement("div");
    title.className = "video-title card__title";
    title.textContent = text(item.title);
    copy.append(title);

    const meta = document.createElement("div");
    meta.className = "video-meta card__meta";
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
    card.className = `highlight-card card card--books${item.imageUrl ? " has-cover" : ""}`;
    if (item.url) card.href = item.url;

    if (item.imageUrl) {
      const cover = document.createElement("img");
      cover.className = "highlight-cover card__thumbnail";
      cover.alt = "";
      cover.loading = "lazy";
      cover.referrerPolicy = "no-referrer";
      cover.src = item.imageUrl;
      cover.addEventListener("error", () => cover.remove(), { once: true });
      card.append(cover);
    }

    const body = document.createElement("div");
    body.className = "highlight-body card__body";
    appendMeta(body, item, item.badges?.[0] || "");
    const quote = document.createElement("blockquote");
    quote.textContent = text(item.summary);
    body.append(quote);
    appendTopics(body, item);
    card.append(body);
    container.append(card);
  });
}
