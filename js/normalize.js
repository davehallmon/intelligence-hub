import { classifyTopics } from "./topics.js";
import { detectProfileIds, getProfiles, resolveProfileId } from "./profiles.js";
import { enrichIntelligenceObject } from "./intelligence-object.js";

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set((values || []).map(clean).filter(Boolean))];
}

function domain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

function sourceFavicon(sourceUrl, itemUrl) {
  const target = sourceUrl || itemUrl;
  if (!target) return "";
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(target)}&sz=128`;
}

export function normalizeFeedItem(item = {}, context = {}) {
  const url = clean(item.link || item.url || context.url);
  const source = clean(context.source || item.source || item.feedTitle || context.feedTitle);
  const sourceUrl = clean(context.sourceUrl || item.sourceUrl || "");
  const authors = unique([...(item.authors || []), item.author].filter(Boolean));
  const title = clean(item.title) || "Untitled";
  const summary = clean(item.description || item.summary || item.text);

  const rawProfileRefs = unique([
    ...(context.profileIds || []),
    ...(context.profiles || []),
    ...(item.profileIds || []),
    ...(item.profiles || [])
  ]);

  // Seed explicit source→profile mappings, then conservatively identify canonical
  // profiles that are actually named in the item title/summary/source/author fields.
  const profileIds = detectProfileIds(
    [title, summary, source, authors.join(" ")],
    rawProfileRefs
  );
  const canonicalProfiles = getProfiles(profileIds).map(profile => profile.name);
  const unresolvedProfiles = rawProfileRefs.filter(ref => !resolveProfileId(ref));
  const profiles = unique([...canonicalProfiles, ...unresolvedProfiles]);

  const seededTopics = unique([...(context.topics || []), ...(item.topics || [])]);
  const topics = classifyTopics(
    [title, summary, source, authors.join(" "), profiles.join(" ")],
    seededTopics
  );

  const legacyObject = {
    id: clean(item.id) || url || `${context.type || "item"}:${title}`,
    type: context.type || item.type || "article",
    title,
    url,
    source,
    sourceUrl,
    author: authors[0] || "",
    authors,
    profiles,
    profileIds,
    publishedAt: clean(item.date || item.publishedAt),
    summary,
    imageUrl: clean(item.imageUrl || item.thumbnail || context.imageUrl),
    faviconUrl: clean(item.faviconUrl) || sourceFavicon(sourceUrl, url),
    topics,
    badges: unique([...(context.badges || []), ...(item.badges || [])]),
    videoId: clean(item.videoId),
    transport: clean(item.transport || context.transport),
    raw: item
  };

  // Phase 2 is additive. The live v9.x UI/ranking still consumes the legacy fields
  // above while v10 relationships, provenance, evidence, and dedupe hooks are added.
  return enrichIntelligenceObject(legacyObject, item, context);
}

export function normalizeFeedItems(items, context = {}) {
  return (items || []).map(item => normalizeFeedItem(item, context));
}

export function normalizeHighlight(highlight = {}, book = {}) {
  return normalizeFeedItem({
    id: highlight.id,
    title: book.title || "Untitled",
    link: highlight.highlight_url || book.highlights_url || book.source_url || "",
    date: highlight.highlighted_at || highlight.updated || book.updated,
    description: highlight.text || "",
    author: book.author || "",
    imageUrl: book.cover_image_url || book.cover_image || "",
    topics: highlight.tags?.map?.(tag => tag.name || tag) || []
  }, {
    type: "highlight",
    source: book.title || "Readwise",
    sourceUrl: book.source_url || "",
    profiles: book.author ? [book.author] : [],
    badges: [book.category || book.source_type || ""].filter(Boolean),
    sourceEndpointId: "endpoint-readwise-local"
  });
}

export function normalizedDomain(item) {
  return domain(item?.sourceUrl || item?.url || "");
}
