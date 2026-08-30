import {
  FEED_CONFIG,
  googleNewsRss,
  substackFeedUrl,
  youtubeFeedUrl,
  arxivQueryUrl
} from "./feed-config.js";

import { fetchPublicFeed, fetchPrivateFeed, fetchReadwiseExport } from "./feed-client.js";
import { getSettings } from "./settings.js";
import { normalizeFeedItem, normalizeHighlight } from "./normalize.js";
import { renderTopicFiltered, resetTopicFilter } from "./feed-filters.js";
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
  const value = new Date(item.publishedAt || item.date || 0).valueOf();
  return Number.isNaN(value) ? 0 : value;
}

function sortNewest(items) {
  return [...items].sort((a, b) => validDate(b) - validDate(a));
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = String(item.url || item.link || item.id || item.title || "")
      .toLowerCase().replace(/[#?].*$/, "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function collectPublicFeeds(sources, type) {
  const settled = await Promise.allSettled(sources.map(async source => {
    const feed = await fetchPublicFeed(source.url);
    return feed.items.map(item => normalizeFeedItem({ ...item, transport: feed.transport }, {
      type,
      source: item.source || source.name || feed.title,
      sourceUrl: item.sourceUrl || source.sourceUrl || feed.link || "",
      feedTitle: feed.title || source.name,
      profileIds: source.profileIds || [],
      profiles: source.profiles || [],
      topics: source.topics || [],
      badges: source.badges || []
    }));
  }));

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
    const sources = queries.map(entry => ({
      name: entry.label,
      url: googleNewsRss(entry.query, freshness),
      profileIds: entry.profileIds || [],
      profiles: entry.profiles || [],
      topics: entry.topics || []
    }));
    const { items, failures } = await collectPublicFeeds(sources, "news");
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const merged = dedupe(sortNewest(items)).filter(item => !item.publishedAt || validDate(item) >= cutoff).slice(0, maxItems);

    if (!merged.length) renderEmpty("newsFeed", "No recent items were returned by the configured Google News queries.");
    else renderTopicFiltered("news", merged, renderNews);

    const withImages = merged.filter(item => item.imageUrl).length;
    setStatus("newsStatus", failures.length
      ? `${merged.length} stories · ${withImages} with media · ${failures.length} query feed${failures.length === 1 ? "" : "s"} unavailable`
      : `${merged.length} stories · ${withImages} with media · topic + profile tagged`, failures.length ? "partial" : "ok");
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
      const feed = settings.socialFeedPrivate ? await fetchPrivateFeed(settings.socialFeedUrl) : await fetchPublicFeed(settings.socialFeedUrl);
      return feed.items.map(item => normalizeFeedItem({ ...item, transport: feed.transport }, {
        type: "social",
        source: item.source || feed.title || "Unified Social Feed",
        sourceUrl: item.sourceUrl || feed.link || ""
      }));
    })());
  }

  FEED_CONFIG.socials.substackSources.forEach(source => {
    jobs.push((async () => {
      const feed = await fetchPublicFeed(substackFeedUrl(source.url));
      return feed.items.map(item => normalizeFeedItem({ ...item, transport: feed.transport }, {
        type: "social",
        source: source.name,
        sourceUrl: source.url,
        profileIds: source.profileIds || [],
        profiles: source.profiles || []
      }));
    })());
  });

  if (!jobs.length) {
    renderEmpty("socialsFeed", "Add a unified Social RSS URL in Settings or public Substack sources in js/feed-config.js.");
    setStatus("socialsStatus", "No Social feed sources configured.", "partial");
    return;
  }

  const settled = await Promise.allSettled(jobs);
  const items = [], failures = [];
  settled.forEach(result => result.status === "fulfilled" ? items.push(...result.value) : failures.push(result.reason));
  const merged = dedupe(sortNewest(items)).slice(0, FEED_CONFIG.socials.maxItems);

  if (merged.length) renderTopicFiltered("socials", merged, renderSocials);
  else renderEmpty("socialsFeed", "Configured Social feeds returned no items.");

  const withImages = merged.filter(item => item.imageUrl).length;
  const state = failures.length && merged.length ? "partial" : failures.length ? "error" : "ok";
  setStatus("socialsStatus", failures.length
    ? `${merged.length} posts · ${withImages} with media · ${failures.length} source${failures.length === 1 ? "" : "s"} unavailable`
    : `${merged.length} posts · ${withImages} with media · topic + profile tagged`, state);
}

async function fetchAcademicSource(source) {
  if (source.feedUrl) {
    try {
      const feed = await fetchPublicFeed(source.feedUrl);
      return feed.items.map(item => normalizeFeedItem({ ...item, transport: feed.transport }, {
        type: "academic",
        source: source.name,
        sourceUrl: source.feedUrl,
        profileIds: source.profileIds || [],
        profiles: source.profiles || []
      }));
    } catch { /* use Google News fallback */ }
  }

  const fallback = await fetchPublicFeed(googleNewsRss(source.fallbackQuery, "7d"));
  return fallback.items.map(item => normalizeFeedItem({ ...item, transport: fallback.transport }, {
    type: "academic",
    source: source.name,
    sourceUrl: item.sourceUrl || "",
    profileIds: source.profileIds || [],
    profiles: source.profiles || [],
    badges: ["Google News fallback"]
  }));
}

async function loadAcademic() {
  renderLoading("academicFeed", "Loading institutional publication feeds…");
  setStatus("academicStatus", "Loading publication metadata…", "loading");
  const settled = await Promise.allSettled(FEED_CONFIG.academic.sources.map(fetchAcademicSource));
  const items = [], failures = [];
  settled.forEach((result, index) => result.status === "fulfilled" ? items.push(...result.value) : failures.push(FEED_CONFIG.academic.sources[index].name));
  const merged = dedupe(sortNewest(items)).slice(0, FEED_CONFIG.academic.maxItems);

  if (merged.length) renderTopicFiltered("academic", merged, renderAcademic);
  else renderEmpty("academicFeed", "No academic publication items are currently available.");

  const withImages = merged.filter(item => item.imageUrl).length;
  setStatus("academicStatus", failures.length
    ? `${merged.length} articles · ${withImages} with media · unavailable: ${failures.join(", ")}`
    : `${merged.length} articles · ${withImages} with media · topic + profile tagged`, failures.length ? "partial" : "ok");
}

async function loadResearch() {
  renderLoading("researchFeed", "Querying arXiv…");
  setStatus("researchStatus", "Loading recent arXiv papers…", "loading");

  try {
    const feed = await fetchPublicFeed(arxivQueryUrl());
    const pinTopics = FEED_CONFIG.research.pinTopics || [];
    const papers = feed.items.map(item => {
      const normalized = normalizeFeedItem({ ...item, transport: feed.transport }, {
        type: "research", source: "arXiv", sourceUrl: "https://arxiv.org/"
      });
      normalized.pinned = normalized.topics.some(topic => pinTopics.includes(topic));
      return normalized;
    }).sort((a, b) => a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : validDate(b) - validDate(a)).slice(0, FEED_CONFIG.research.maxItems);

    if (papers.length) renderTopicFiltered("research", papers, renderPapers);
    else renderEmpty("researchFeed", "arXiv returned no papers for the configured query.");

    const pinned = papers.filter(item => item.pinned).length;
    setStatus("researchStatus", `${papers.length} papers · ${pinned} priority-topic match${pinned === 1 ? "" : "es"} · topic + profile tagged`, "ok");
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
  const sources = channels.map(channel => ({
    name: channel.name,
    url: youtubeFeedUrl(channel.channelId),
    profileIds: channel.profileIds || [],
    profiles: channel.profiles || (channel.profileIds?.length ? [] : [channel.name])
  }));
  const { items, failures } = await collectPublicFeeds(sources, "video");
  const merged = dedupe(sortNewest(items)).map(item => ({
    ...item,
    imageUrl: item.imageUrl || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : "")
  })).slice(0, FEED_CONFIG.video.maxItems);

  if (merged.length) renderTopicFiltered("video", merged, renderVideos, { maxTopics: 6 });
  else renderEmpty("videoFeed", "No recent uploads were returned by the configured channel feeds.");

  setStatus("videoStatus", failures.length
    ? `${merged.length} videos · ${failures.length} channel feed${failures.length === 1 ? "" : "s"} unavailable`
    : `${merged.length} videos · topic + profile tagged`, failures.length ? "partial" : "ok");
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
    books.forEach(book => (book.highlights || []).forEach(highlight => {
      if (highlight.text) highlights.push(normalizeHighlight(highlight, book));
    }));
    const recent = sortNewest(highlights).slice(0, 80);

    if (recent.length) renderTopicFiltered("books", recent, renderHighlights, { maxTopics: 6 });
    else renderEmpty("booksFeed", `No highlights were returned for the last ${days} days.`);

    setStatus("booksStatus", `${recent.length} highlights · direct Readwise API · topic + profile tagged · last ${days} days`, "ok");
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
    try { await LOADERS[tab](); CACHE.set(tab, "loaded"); }
    catch (error) { CACHE.delete(tab); throw error; }
  }

  function invalidate(tab) {
    if (tab) { CACHE.delete(tab); resetTopicFilter(tab); }
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
