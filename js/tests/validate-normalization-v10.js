// Intelligence Hub v10 — Phase 2 normalization fixtures.
// Pure development-time assertions; this file is not imported by the live UI.

import { normalizeFeedItem } from "../normalize.js";
import { EVIDENCE_TYPES } from "../config/evidence-types.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasOnly(values, expected) {
  return values.length === expected.length && expected.every(value => values.includes(value));
}

export function validateNormalizationV10() {
  const results = [];

  const roleItem = normalizeFeedItem({
    title: "Ethan Mollick interviews Simon Willison about evidence from Arvind Narayanan",
    link: "https://example.com/roles?utm_source=test",
    author: "Ethan Mollick"
  }, {
    type: "article",
    source: "Harvard Business Review",
    featuredEntityIds: ["person-simon-willison"],
    mentionedEntityIds: ["person-arvind-narayanan"]
  });
  assert(roleItem.type === "article" && Array.isArray(roleItem.profileIds), "legacy normalized fields must remain available");
  assert(hasOnly(roleItem.authorEntityIds, ["person-ethan-mollick"]), "authoredBy must remain distinct");
  assert(roleItem.sourceEntityIds.includes("publication-hbr"), "source entity must resolve independently");
  assert(roleItem.publisherEntityIds.includes("publication-hbr"), "publisher must resolve independently");
  assert(hasOnly(roleItem.featuredEntityIds, ["person-simon-willison"]), "featuring must remain distinct");
  assert(roleItem.mentionedEntityIds.includes("person-arvind-narayanan"), "mentioned/about must remain distinct");
  results.push("role-distinction");

  const articleA = normalizeFeedItem({
    title: "Same article",
    link: "https://www.example.com/story/?utm_source=email&b=2&a=1#section"
  }, { type: "news", source: "Example" });
  const articleB = normalizeFeedItem({
    title: "Same article",
    link: "https://example.com/story?a=1&b=2"
  }, { type: "news", source: "Example" });
  assert(articleA.canonicalUrl === articleB.canonicalUrl, "tracking/hash variants must canonicalize together");
  assert(articleA.dedupeKey === articleB.dedupeKey, "canonical article variants must share dedupe key");
  results.push("canonical-url-dedupe");

  const episodeKey = "episode:ai-and-i:example-001";
  const podcast = normalizeFeedItem({ title: "Episode", link: "https://podcasts.example/001" }, {
    type: "audio", source: "AI & I", canonicalObjectKey: episodeKey
  });
  const youtube = normalizeFeedItem({ title: "Episode", link: "https://youtube.com/watch?v=abc" }, {
    type: "video", source: "AI & I", canonicalObjectKey: episodeKey
  });
  assert(podcast.canonicalObjectKey === youtube.canonicalObjectKey, "multi-format episode hook must support one canonical object");
  results.push("multi-format-canonical-key");

  const productAnnouncement = normalizeFeedItem({
    title: "Claude gains a workflow capability",
    link: "https://anthropic.com/news/example"
  }, {
    type: "news",
    source: "Anthropic",
    badges: ["Official"],
    productEntityIds: ["product-claude"]
  });
  assert(productAnnouncement.sourceEntityIds.includes("org-anthropic"), "organization announcement must retain source entity");
  assert(productAnnouncement.publisherEntityIds.includes("org-anthropic"), "organization announcement must retain publisher");
  assert(productAnnouncement.productEntityIds.includes("product-claude"), "organization announcement must relate to product");
  assert(!productAnnouncement.publisherEntityIds.includes("product-claude"), "product relationship must not collapse into publisher");
  assert(productAnnouncement.evidenceType === EVIDENCE_TYPES.PRIMARY_SOURCE, "official announcement should classify as primary source");
  results.push("organization-product-link");

  const guestAppearance = normalizeFeedItem({
    title: "A university keynote with Ethan Mollick",
    link: "https://video.example/keynote"
  }, {
    type: "video",
    source: "Unmonitored University Channel",
    featuredEntityIds: ["person-ethan-mollick"]
  });
  assert(guestAppearance.featuredEntityIds.includes("person-ethan-mollick"), "guest appearance must survive unmonitored source");
  results.push("priority-guest-appearance");

  const privateItem = normalizeFeedItem({
    title: "Private source item",
    link: "https://private.example/item",
    transport: "direct-private"
  }, {
    type: "social",
    source: "Private bridge"
  });
  assert(privateItem.provenance.privacy === "private", "private provenance must remain explicit");
  results.push("private-provenance");

  const coverage = normalizeFeedItem({
    title: "Coverage about OpenAI",
    link: "https://news.example/openai"
  }, {
    type: "news",
    source: "OpenAI coverage",
    profileIds: ["org-openai"],
    badges: ["Coverage"]
  });
  assert(!coverage.publisherEntityIds.includes("org-openai"), "coverage subject must not become publisher");
  assert(coverage.mentionedEntityIds.includes("org-openai"), "coverage subject should remain an about/mentioned relationship");
  assert(coverage.evidenceType === EVIDENCE_TYPES.INDEPENDENT_REPORTING, "coverage should classify as independent reporting");
  results.push("coverage-not-publisher");

  const arxiv = normalizeFeedItem({
    title: "Research paper",
    link: "https://arxiv.org/abs/2608.12345"
  }, {
    type: "research",
    source: "arXiv",
    sourceUrl: "https://arxiv.org/"
  });
  assert(arxiv.sourceEndpointId === "endpoint-arxiv-current", "research source should resolve through canonical entity to endpoint");
  assert(arxiv.researchSourceEntityIds.includes("research-source-arxiv"), "research source entity must be preserved");
  assert(arxiv.evidenceType === EVIDENCE_TYPES.RESEARCH, "research item should retain research evidence class");
  results.push("research-source-endpoint");

  return Object.freeze({ ok: true, fixtures: Object.freeze(results) });
}
