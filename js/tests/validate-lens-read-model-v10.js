// Intelligence Hub v10 — Phase 4 lens read-model acceptance fixtures.
// Pure development-time assertions; not imported by the live UI.

import { normalizeFeedItem } from "../normalize.js";
import {
  QUERYABLE_LENS_IDS,
  buildLensReadModels,
  lensMembershipForItem,
  queryLens,
  watchlistTopicIdsForItem
} from "../lens-read-model.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function containsItem(result, item) {
  return result.items.includes(item);
}

export function validateLensReadModelV10() {
  const results = [];

  const claudeWorkflow = normalizeFeedItem({
    title: "Anthropic adds a new Claude workflow capability",
    link: "https://anthropic.com/news/workflow",
    topics: ["Prompt Engineering"]
  }, {
    type: "news",
    source: "Anthropic",
    profileIds: ["org-anthropic"],
    productEntityIds: ["product-claude"],
    badges: ["Official"]
  });

  const hbrMollick = normalizeFeedItem({
    title: "Ethan Mollick on AI adoption at work",
    link: "https://hbr.org/example-ai-adoption",
    author: "Ethan Mollick",
    topics: ["AI Adoption & Future of Work"]
  }, {
    type: "academic",
    source: "Harvard Business Review",
    publicationEntityIds: ["publication-hbr"]
  });

  const ragResearch = normalizeFeedItem({
    title: "Retrieval-augmented generation in knowledge work",
    link: "https://arxiv.org/abs/2608.12345",
    topics: ["RAG"]
  }, {
    type: "research",
    source: "arXiv",
    researchSourceEntityIds: ["research-source-arxiv"]
  });

  const mediaEpisode = normalizeFeedItem({
    title: "The AI Daily Brief on enterprise adoption",
    link: "https://youtube.com/watch?v=example"
  }, {
    type: "video",
    source: "The AI Daily Brief",
    mediaEntityIds: ["media-ai-daily-brief"],
    featuredEntityIds: ["person-nathaniel-whittemore"]
  });

  const communitySignal = normalizeFeedItem({
    title: "NotebookLM users report a repeatable workflow",
    link: "https://reddit.com/r/notebooklm/example"
  }, {
    type: "community",
    source: "r/notebooklm",
    communityEntityIds: ["community-reddit-notebooklm"]
  });

  const claudeSkill = normalizeFeedItem({
    title: "A new Claude Skill for structured writing workflows",
    link: "https://example.com/claude-skill"
  }, {
    type: "news",
    source: "Anthropic",
    productEntityIds: ["product-claude-skills"]
  });

  const parkedPerson = normalizeFeedItem({
    title: "Sam Altman publishes a new blog post",
    link: "https://blog.samaltman.com/example",
    author: "Sam Altman"
  }, {
    type: "social",
    source: "Sam Altman",
    profileIds: ["person-sam-altman"]
  });

  const items = [claudeWorkflow, hbrMollick, ragResearch, mediaEpisode, communitySignal, claudeSkill, parkedPerson];
  const models = buildLensReadModels(items);

  assert(QUERYABLE_LENS_IDS.length === 7, "Phase 4 must expose the seven approved read-model lenses");
  assert(containsItem(models.watchlist, claudeWorkflow), "Prompt Engineering must bridge to the Priority workflow Watchlist");
  assert(containsItem(models["people-organizations"], claudeWorkflow), "Anthropic item must appear in People & Organizations");
  assert(containsItem(models["products-platforms"], claudeWorkflow), "Claude item must appear in Products & Platforms");
  assert(models.watchlist.items.find(item => item === claudeWorkflow) === claudeWorkflow, "Lens selection must retain object identity");
  assert(models["people-organizations"].items.find(item => item === claudeWorkflow) === claudeWorkflow, "Cross-lens reuse must not clone the intelligence object");
  results.push("same-object-multi-lens");

  assert(containsItem(models.publications, hbrMollick), "HBR article must appear in Publications");
  assert(containsItem(models["people-organizations"], hbrMollick), "Priority author must also place the same article in People & Organizations");
  assert(containsItem(models.watchlist, hbrMollick), "AI Adoption topic must place the article in Watchlist");
  results.push("publication-person-watchlist-overlap");

  assert(containsItem(models.research, ragResearch), "Research object must appear in Research");
  assert(containsItem(models.watchlist, ragResearch), "RAG research must also appear in Watchlist");
  assert(watchlistTopicIdsForItem(ragResearch).includes("rag-retrieval-knowledge"), "Legacy RAG tag must resolve to v10 Watchlist ID");
  results.push("research-watchlist-overlap");

  assert(containsItem(models.media, mediaEpisode), "Canonical Media entity must place episode in Media");
  assert(containsItem(models["people-organizations"], mediaEpisode), "Featured Active person must independently make the same episode People-relevant");
  results.push("media-person-overlap");

  assert(containsItem(models.communities, communitySignal), "Core community relationship must place item in Communities");
  results.push("community-selection");

  const claudeOnly = queryLens([claudeSkill], "products-platforms", { entityIds: ["product-claude"] });
  assert(containsItem(claudeOnly, claudeSkill), "Child Claude Skills item must inherit selection through Priority parent Claude");
  assert(claudeOnly.entries[0].matches[0].monitoringAnchorId === "product-claude", "Child product must identify its monitored parent anchor");
  results.push("child-product-inheritance");

  assert(!containsItem(models["people-organizations"], parkedPerson), "Parked person must not enter default continuous People & Organizations read model");
  const withParked = queryLens([parkedPerson], "people-organizations", { includeParked: true });
  assert(containsItem(withParked, parkedPerson), "Parked person must remain searchable when explicitly included");
  results.push("parked-searchable-not-continuous");

  const memberships = lensMembershipForItem(claudeWorkflow);
  const membershipIds = memberships.map(entry => entry.lensId);
  assert(membershipIds.includes("watchlist"), "Membership API must report Watchlist");
  assert(membershipIds.includes("people-organizations"), "Membership API must report People & Organizations");
  assert(membershipIds.includes("products-platforms"), "Membership API must report Products & Platforms");
  results.push("membership-introspection");

  const ids = models["products-platforms"].items.map(item => item.id);
  assert(new Set(ids).size === ids.length, "A lens read model must not duplicate one object because it has multiple matching relationships");
  results.push("no-intra-lens-duplication");

  return Object.freeze({ ok: true, fixtures: Object.freeze(results) });
}
