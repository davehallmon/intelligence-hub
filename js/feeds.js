import {
  FEED_CONFIG,
  googleNewsRss,
  substackFeedUrl,
  youtubeFeedUrl,
  arxivQueryUrl
} from "./feed-config.js";

import {
  fetchPublicFeed,
  fetchPrivateFeed,
  fetchReadwiseExport
} from "./feed-client.js";

import { getSettings } from "./settings.js";

import {
  setStatus,
  renderLoading,
  renderEmpty,
  renderError,
  renderNews,
  renderSocials,
  renderAcademic,
  renderPapers,
  renderVideos,
  renderHighlights
} from "./renderers.js";

const CACHE = new Map();

function validDate(item) {
  const value = new Date(item.date || 0).valueOf();
  return Number.isNaN(value) ? 0 : value;
}

function sortNewest(items) {
  return [...items].sort((a, b) => validDate(b) - validDate(a));
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = String(item.link || item.id || item.title || "")
      .toLowerCase()
      .replace(/[#?].*$/, "")
      .trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function collectPublicFeeds(sources) {
  const settled = await Promise.allSettled(
    sources.map(async source => {
      const feed = await fetchPublicFeed(source.url);
      return feed.items.map(item => ({
        ...item,
        source: item.source || source.name,
        feedTitle: feed.title || source.name,
        sourceName: source.name,
        transport: feed.transport
      }));
    })
  );

  const items = [];
  const failures = [];
  settled.forEach((result, index) => {
    if (result.status === "fulfilled") items.push(...result.value);
    else failures.push({ source: sources[index]?.name, error: result.reason });
  });

  return { items, failures };
}

async function loadNews() {
  const { queries, freshness, maxItems } = FEED_CONFIG.news;
  renderLoading("newsFeed", "Loading the last 24 hours…");
  setStatus("newsStatus", "Loading Google News query feeds…", "loading");

  try {
    const sources = queries.map(query => ({ name: query, url: googleNewsRss(query, freshness) }));
    const { items, failures } = await collectPublicFeeds(sources);

    const cutoff = Date.now() - 36 * 60 * 60 * 1000;
    const merged = dedupe(sortNewest(items))
      .filter(item => !item.date || validDate(item) >= cutoff)
      .slice(0, maxItems);

    if (!merged.length) renderEmpty("newsFeed", "No recent items were returned by the configured Google News queries.");
    else renderNews(merged);

    setStatus(
      "newsStatus",
      failures.length
        ? `${merged.length} stories · ${failures.length} query feed${failures.length === 1 ? "" : "s"} unavailable`
        : `${merged.length} stories · updated now`,
      failures.length ? "partial" : "ok"
    );
  } catch (error) {
    renderError("newsFeed", error);
    setStatus("newsStatus", error.message, "error");
  }
}

async function loadSocials() {
  renderLoading("socialsFeed", "Loading social and newsletter feeds…");
  setStatus("socialsStatus", "Loading configured feeds…", "loading");
  const settings = getSettings();
  const jobs = [];

  if (settings.socialFeedUrl) {
    jobs.push((async () => {
      const feed = settings.socialFeedPrivate
        ? await fetchPrivateFeed(settings.socialFeedUrl)
        : await fetchPublicFeed(settings.socialFeedUrl);
      return feed.items.map(item => ({
        ...item,
        source: item.source || feed.title || "Unified Social Feed",
        feedTitle: feed.title || "Unified Social Feed"
      }));
    })());
  }

  FEED_CONFIG.socials.substackSources.forEach(source => {
    jobs.push((async () => {
      const feed = await fetchPublicFeed(substackFeedUrl(source.url));
      return feed.items.map(item => ({ ...item, source: source.name, feedTitle: source.name }));
    })());
  });

  if (!jobs.length) {
    renderEmpty("socialsFeed", "Add a unified Social RSS URL in Settings or public Substack sources in js/feed-config.js.");
    setStatus("socialsStatus", "No Social feed sources configured.", "partial");
    return;
  }

  const settled = await Promise.allSettled(jobs);
  const items = [];
  const failures = [];
  settled.forEach(result => {
    if (result.status === "fulfilled") items.push(...result.value);
    else failures.push(result.reason);
  });

  const merged = dedupe(sortNewest(items)).slice(0, FEED_CONFIG.socials.maxItems);
  if (merged.length) renderSocials(merged);
  else renderEmpty("socialsFeed", "Configured Social feeds returned no items.");

  const state = failures.length && merged.length ? "partial" : failures.length ? "error" : "ok";
  setStatus(
    "socialsStatus",
    failures.length
      ? `${merged.length} posts · ${failures.length} source${failures.length === 1 ? "" : "s"} unavailable`
      : `${merged.length} posts · updated now`,
    state
  );
}

async function fetchAcademicSource(source) {
  if (source.feedUrl) {
    try {
      const feed = await fetchPublicFeed(source.feedUrl);
      return feed.items.map(item => ({ ...item, publication: source.name, fallback: false }));
    } catch {
      // Fall through to the scoped Google News query.
    }
  }

  const fallback = await fetchPublicFeed(googleNewsRss(source.fallbackQuery, "7d"));
  return fallback.items.map(item => ({ ...item, publication: source.name, fallback: true }));
}

async function loadAcademic() {
  renderLoading("academicFeed", "Loading institutional publication feeds…");
  setStatus("academicStatus", "Loading publication metadata…", "loading");

  const settled = await Promise.allSettled(FEED_CONFIG.academic.sources.map(fetchAcademicSource));
  const items = [];
  const failures = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") items.push(...result.value);
    else failures.push(FEED_CONFIG.academic.sources[index].name);
  });

  const merged = dedupe(sortNewest(items)).slice(0, FEED_CONFIG.academic.maxItems);
  if (merged.length) renderAcademic(merged);
  else renderEmpty("academicFeed", "No academic publication items are currently available.");

  setStatus(
    "academicStatus",
    failures.length
      ? `${merged.length} articles · unavailable: ${failures.join(", ")}`
      : `${merged.length} articles · updated now`,
    failures.length ? "partial" : "ok"
  );
}

async function loadResearch() {
  renderLoading("researchFeed", "Querying arXiv…");
  setStatus("researchStatus", "Loading recent arXiv papers…", "loading");

  try {
    const feed = await fetchPublicFeed(arxivQueryUrl());
    const keywords = FEED_CONFIG.research.pinKeywords;

    const papers = feed.items.map(item => {
      const haystack = `${item.title} ${item.description}`.toLowerCase();
      const matches = keywords.filter(keyword => haystack.includes(keyword.toLowerCase()));
      return { ...item, matches, pinned: matches.length > 0 };
    }).sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return validDate(b) - validDate(a);
    }).slice(0, FEED_CONFIG.research.maxItems);

    if (papers.length) renderPapers(papers);
    else renderEmpty("researchFeed", "arXiv returned no papers for the configured query.");

    const pinned = papers.filter(item => item.pinned).length;
    setStatus("researchStatus", `${papers.length} papers · ${pinned} keyword match${pinned === 1 ? "" : "es"} · ${feed.transport}`, "ok");
  } catch (error) {
    renderError("researchFeed", error);
    setStatus("researchStatus", error.message, "error");
  }
}

async function loadVideo() {
  const channels = FEED_CONFIG.video.channels;
  if (!channels.length) {
    renderEmpty("videoFeed", "No YouTube channel IDs are configured yet. Add public UC… channel IDs to js/feed-config.js.");
    setStatus("videoStatus", "Add channel IDs to js/feed-config.js.", "partial");
    return;
  }

  renderLoading("videoFeed", "Loading recent creator uploads…");
  setStatus("videoStatus", "Loading YouTube channel feeds…", "loading");

  const sources = channels.map(channel => ({ name: channel.name, url: youtubeFeedUrl(channel.channelId) }));
  const { items, failures } = await collectPublicFeeds(sources);

  const merged = dedupe(sortNewest(items))
    .map(item => ({
      ...item,
      channelName: item.sourceName || item.author,
      thumbnail: item.thumbnail || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : "")
    }))
    .slice(0, FEED_CONFIG.video.maxItems);

  if (merged.length) renderVideos(merged);
  else renderEmpty("videoFeed", "No recent uploads were returned by the configured channel feeds.");

  setStatus(
    "videoStatus",
    failures.length
      ? `${merged.length} videos · ${failures.length} channel feed${failures.length === 1 ? "" : "s"} unavailable`
      : `${merged.length} videos · updated now`,
    failures.length ? "partial" : "ok"
  );
}

async function loadBooks() {
  const settings = getSettings();
  if (!settings.readwiseToken) {
    renderEmpty("booksFeed", "Open Settings and add your Readwise API token to load recent highlights.");
    setStatus("booksStatus", "Readwise token not configured.", "partial");
    return;
  }

  renderLoading("booksFeed", "Loading recent Readwise highlights…");
  setStatus("booksStatus", "Connecting directly to Readwise…", "loading");

  try {
    const days = Number(settings.readwiseDays || 30);
    const updatedAfter = new Date(Date.now() - days * 86400000).toISOString();
    const books = await fetchReadwiseExport(settings.readwiseToken, { updatedAfter });

    const highlights = [];
    books.forEach(book => {
      (book.highlights || []).forEach(highlight => {
        if (!highlight.text) return;
        highlights.push({
          text: highlight.text,
          note: highlight.note || "",
          date: highlight.highlighted_at || highlight.updated || book.updated,
          title: book.title || "Untitled",
          author: book.author || "",
          category: book.category || book.source_type || "",
          link: highlight.highlight_url || book.highlights_url || book.source_url || ""
        });
      });
    });

    const recent = sortNewest(highlights).slice(0, 80);
    if (recent.length) renderHighlights(recent);
    else renderEmpty("booksFeed", `No highlights were returned for the last ${days} days.`);

    setStatus("booksStatus", `${recent.length} highlights · direct Readwise API · last ${days} days`, "ok");
  } catch (error) {
    renderError("booksFeed", error);
    setStatus("booksStatus", error.message, "error");
  }
}

const LOADERS = { news: loadNews, socials: loadSocials, academic: loadAcademic, research: loadResearch, video: loadVideo, books: loadBooks };

export function createFeedDashboard() {
  async function load(tab, { force = false } = {}) {
    if (!LOADERS[tab]) return;
    if (!force && CACHE.get(tab) === "loaded") return;

    CACHE.set(tab, "loading");
    try {
      await LOADERS[tab]();
      CACHE.set(tab, "loaded");
    } catch (error) {
      CACHE.delete(tab);
      throw error;
    }
  }

  function invalidate(tab) {
    if (tab) CACHE.delete(tab);
    else CACHE.clear();
  }

  document.querySelectorAll("[data-refresh-feed]").forEach(button => {
    button.addEventListener("click", () => {
      const tab = button.dataset.refreshFeed;
      invalidate(tab);
      load(tab, { force: true });
    });
  });

  document.addEventListener("ih:settings-saved", () => {
    invalidate("socials");
    invalidate("books");
  });

  return { load, invalidate };
}
