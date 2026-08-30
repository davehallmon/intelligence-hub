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

function appendMeta(card, { source, date, label } = {}) {
  const meta = document.createElement("div");
  meta.className = "feed-meta";

  if (source) {
    const sourceNode = document.createElement("span");
    sourceNode.className = "feed-source";
    sourceNode.textContent = source;
    meta.append(sourceNode);
  }

  if (date) {
    const dateNode = document.createElement("span");
    dateNode.textContent = ageLabel(date);
    meta.append(dateNode);
  }

  if (label) {
    const labelNode = document.createElement("span");
    labelNode.textContent = label;
    meta.append(labelNode);
  }

  card.append(meta);
}

export function renderNews(items) {
  const container = document.getElementById("newsFeed");
  clear(container);

  items.forEach(item => {
    const card = externalCard();
    card.className = "feed-card";
    card.href = item.link;
    appendMeta(card, { source: item.source || item.query || "Google News", date: item.date });

    const title = document.createElement("div");
    title.className = "feed-title";
    title.textContent = text(item.title);
    card.append(title);

    if (item.description) {
      const snippet = document.createElement("p");
      snippet.className = "feed-snippet";
      snippet.textContent = text(item.description).slice(0, 340);
      card.append(snippet);
    }
    container.append(card);
  });
}

export function renderSocials(items) {
  const container = document.getElementById("socialsFeed");
  clear(container);

  items.forEach(item => {
    const card = externalCard();
    card.className = "timeline-card";
    card.href = item.link;
    appendMeta(card, { source: item.source || item.feedTitle || item.author, date: item.date });

    const title = document.createElement("div");
    title.className = "feed-title";
    title.textContent = text(item.title);
    card.append(title);

    if (item.description) {
      const snippet = document.createElement("p");
      snippet.className = "feed-snippet";
      snippet.textContent = text(item.description).slice(0, 420);
      card.append(snippet);
    }
    container.append(card);
  });
}

export function renderAcademic(items) {
  const container = document.getElementById("academicFeed");
  clear(container);

  items.forEach(item => {
    const card = externalCard();
    card.className = "feed-card";
    card.href = item.link;
    appendMeta(card, { source: item.publication, date: item.date, label: item.fallback ? "Google News fallback" : "" });

    const title = document.createElement("div");
    title.className = "feed-title";
    title.textContent = text(item.title);
    card.append(title);

    if (item.description) {
      const snippet = document.createElement("p");
      snippet.className = "feed-snippet";
      snippet.textContent = text(item.description).slice(0, 380);
      card.append(snippet);
    }
    container.append(card);
  });
}

export function renderPapers(items) {
  const container = document.getElementById("researchFeed");
  clear(container);

  items.forEach(item => {
    const card = externalCard();
    card.className = `paper-card${item.pinned ? " is-pinned" : ""}`;
    card.href = item.link;

    if (item.matches?.length) {
      const badges = document.createElement("div");
      badges.className = "paper-badges";
      item.matches.forEach(match => {
        const badge = document.createElement("span");
        badge.className = "paper-badge";
        badge.textContent = match;
        badges.append(badge);
      });
      card.append(badges);
    }

    appendMeta(card, { source: "arXiv", date: item.date });

    const title = document.createElement("div");
    title.className = "feed-title";
    title.textContent = text(item.title);
    card.append(title);

    if (item.authors?.length || item.author) {
      const authors = document.createElement("div");
      authors.className = "paper-authors";
      authors.textContent = item.authors?.join(", ") || item.author;
      card.append(authors);
    }

    if (item.description) {
      const abstract = document.createElement("p");
      abstract.className = "paper-abstract";
      abstract.textContent = text(item.description);
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
    card.href = item.link;

    const img = document.createElement("img");
    img.className = "video-thumb";
    img.alt = "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    if (item.thumbnail) img.src = item.thumbnail;
    card.append(img);

    const copy = document.createElement("div");
    copy.className = "video-copy";

    const title = document.createElement("div");
    title.className = "video-title";
    title.textContent = text(item.title);
    copy.append(title);

    const meta = document.createElement("div");
    meta.className = "video-meta";
    meta.textContent = [item.channelName || item.author, ageLabel(item.date)].filter(Boolean).join(" · ");
    copy.append(meta);

    card.append(copy);
    container.append(card);
  });
}

export function renderHighlights(items) {
  const container = document.getElementById("booksFeed");
  clear(container);

  items.forEach(item => {
    const card = item.link ? externalCard() : externalCard("article");
    card.className = "highlight-card";
    if (item.link) card.href = item.link;

    appendMeta(card, {
      source: [item.title, item.author].filter(Boolean).join(" — "),
      date: item.date,
      label: item.category || ""
    });

    const quote = document.createElement("blockquote");
    quote.textContent = text(item.text);
    card.append(quote);

    if (item.note) {
      const note = document.createElement("p");
      note.className = "highlight-note";
      note.textContent = text(item.note);
      card.append(note);
    }

    container.append(card);
  });
}
