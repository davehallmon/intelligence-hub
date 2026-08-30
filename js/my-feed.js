import { getProfile } from "./profiles.js";
import { createRichCard } from "./renderers.js";
import { MY_FEED_LIMITS, MY_FEED_WEIGHTS } from "./my-feed-config.js";

function validDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.valueOf()) ? date : null;
}

function recencyScore(value) {
  const date = validDate(value);
  if (!date) return 0;
  const hours = Math.max(0, (Date.now() - date.valueOf()) / 3600000);
  if (hours <= 2) return 26;
  if (hours <= 6) return 22;
  if (hours <= 12) return 18;
  if (hours <= 24) return 14;
  if (hours <= 72) return 9;
  if (hours <= 168) return 4;
  return 0;
}

function priorityWeight(level) {
  return MY_FEED_WEIGHTS.preference[level] ?? 0;
}

function profileTierScore(profileIds = []) {
  return profileIds.reduce((best, id) => {
    const profile = getProfile(id);
    const score = MY_FEED_WEIGHTS.profileTier[profile?.tier] ?? 0;
    return Math.max(best, score);
  }, 0);
}

function profilePreference(item, priorities) {
  let score = 0;
  const reasons = [];
  (item.profileIds || []).forEach(id => {
    const profile = getProfile(id);
    if (!profile) return;
    const map = profile.type === "organization" ? priorities.organizations : priorities.people;
    const level = map?.[id] || "normal";
    score += priorityWeight(level);
    if (level === "high") reasons.push(`High priority: ${profile.name}`);
  });
  return { score: Math.max(-20, Math.min(24, score)), reasons };
}

function topicPreference(item, priorities) {
  const weighted = (item.topics || []).map(topic => ({
    topic,
    level: priorities.topics?.[topic] || "normal"
  }));
  const high = weighted.filter(entry => entry.level === "high").slice(0, 2);
  const lower = weighted.filter(entry => entry.level === "lower").slice(0, 2);
  const score = high.length * priorityWeight("high") + lower.length * priorityWeight("lower");
  return {
    score,
    reasons: high.map(entry => `High-priority topic: ${entry.topic}`)
  };
}

function provenance(item) {
  const badges = new Set((item.badges || []).map(value => String(value).toLowerCase()));
  const p = MY_FEED_WEIGHTS.provenance;
  if (badges.has("official")) return { score: p.official, reason: "Official source" };
  if (badges.has("direct")) return { score: p.direct, reason: "Direct authored source" };
  if (badges.has("social bridge")) return { score: p.socialBridge, reason: "Profile-attributed bridge" };
  if (badges.has("google news fallback")) return { score: p.googleNewsFallback, reason: "Institutional coverage fallback" };
  if (badges.has("coverage")) return { score: p.coverage, reason: "Coverage source" };
  if (item.type === "research") return { score: p.research, reason: "Primary research" };
  if (item.type === "academic") return { score: p.academicDirect, reason: "Institutional publication" };
  return { score: 0, reason: "" };
}

function tierReason(profileIds = []) {
  const profiles = profileIds.map(getProfile).filter(Boolean);
  if (profiles.some(profile => profile.tier === "core-active")) return "Core Active profile";
  if (profiles.some(profile => profile.tier === "selective-active")) return "Selective Active profile";
  return "";
}

function freshnessReason(value) {
  const date = validDate(value);
  if (!date) return "";
  const hours = Math.max(0, (Date.now() - date.valueOf()) / 3600000);
  if (hours <= 6) return "Very recent";
  if (hours <= 24) return "Recent";
  return "";
}

function scoreItem(item, priorities) {
  const topic = topicPreference(item, priorities);
  const profile = profilePreference(item, priorities);
  const provenanceResult = provenance(item);
  const recency = recencyScore(item.publishedAt);
  const tier = profileTierScore(item.profileIds);
  const reasons = [
    ...topic.reasons,
    ...profile.reasons,
    tierReason(item.profileIds),
    provenanceResult.reason,
    freshnessReason(item.publishedAt)
  ].filter(Boolean);

  return {
    ...item,
    myFeedScore: topic.score + profile.score + provenanceResult.score + recency + tier,
    myFeedReasons: [...new Set(reasons)].slice(0, 4)
  };
}

function primaryKey(item, dimension) {
  if (dimension === "source") return item.sourceKey || item.source || item.url || item.id;
  if (dimension === "profile") return item.profileIds?.[0] || item.sourceKey || item.source || "unprofiled";
  if (dimension === "topic") return item.topics?.[0] || "untagged";
  if (dimension === "type") return item.type || "article";
  return "unknown";
}

function selectDiverse(ranked, limit, caps) {
  const counts = {
    source: new Map(), profile: new Map(), topic: new Map(), type: new Map()
  };
  const selected = [];

  for (const item of ranked) {
    if (selected.length >= limit) break;
    const blocked = Object.entries(caps).some(([dimension, cap]) => {
      const key = primaryKey(item, dimension);
      return (counts[dimension].get(key) || 0) >= cap;
    });
    if (blocked) continue;

    selected.push(item);
    Object.keys(caps).forEach(dimension => {
      const key = primaryKey(item, dimension);
      counts[dimension].set(key, (counts[dimension].get(key) || 0) + 1);
    });
  }

  return selected;
}

export function rankMyFeed(items, settings) {
  const priorities = settings?.myFeedPriorities || { topics: {}, people: {}, organizations: {} };
  const ranked = items
    .map(item => scoreItem(item, priorities))
    .sort((a, b) => b.myFeedScore - a.myFeedScore || new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  const attention = selectDiverse(ranked, MY_FEED_LIMITS.attention, MY_FEED_LIMITS.attentionCaps);
  const attentionIds = new Set(attention.map(item => item.id || item.url));
  const remaining = ranked.filter(item => !attentionIds.has(item.id || item.url));
  const broader = selectDiverse(remaining, MY_FEED_LIMITS.broader, MY_FEED_LIMITS.broaderCaps);

  return { attention, broader, ranked };
}

function contentLabel(type) {
  return ({
    news: "News",
    social: "Social",
    academic: "Academic",
    research: "Research",
    video: "Video"
  })[type] || "For you";
}

function renderSection(containerId, items, { attention = false } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.replaceChildren();
  items.forEach(item => {
    const card = createRichCard(item, {
      className: `feed-card my-feed-card${attention ? " is-attention" : ""}`,
      label: contentLabel(item.type),
      snippetLength: attention ? 300 : 360,
      showReasons: true
    });
    container.append(card);
  });
}

export function renderMyFeed({ attention, broader }) {
  renderSection("myFeedAttention", attention, { attention: true });
  renderSection("myFeedFeed", broader);
}
