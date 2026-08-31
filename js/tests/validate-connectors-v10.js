// Intelligence Hub v10 — Phase 3 connector/endpoint acceptance fixtures.
// Pure development-time assertions; this file is not imported by the live UI.

import {
  getConnector,
  getSourceEndpoint,
  validateEndpointReferences,
  SOURCE_ENDPOINTS
} from "../connectors/catalog.js";
import {
  auditCurrentFeedEndpointCoverage,
  privateSocialBridgeDescriptor
} from "../connectors/live-source-map.js";
import { getWatchlistTopic } from "../config/topic-taxonomy.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateConnectorsV10() {
  const results = [];

  const references = validateEndpointReferences();
  assert(references.ok, `Endpoint reference validation failed: ${references.errors.join("; ")}`);
  SOURCE_ENDPOINTS.forEach(endpoint => {
    (endpoint.selectorTopicIds || []).forEach(topicId => {
      assert(getWatchlistTopic(topicId), `Unknown topic selector ${topicId} on ${endpoint.id}`);
    });
  });
  results.push("referential-integrity");

  const coverage = auditCurrentFeedEndpointCoverage();
  assert(coverage.ok, `Current feed endpoint coverage failed: ${coverage.errors.join("; ")}`);
  assert(coverage.mappedEndpointIds.length > 0, "Current feed coverage should map live endpoints");
  results.push("current-feed-coverage");

  const openAiCoverage = getSourceEndpoint("endpoint-google-news-openai-coverage");
  assert(openAiCoverage.connectorId === "google-news", "OpenAI coverage must use discovery connector");
  assert(openAiCoverage.selectorEntityIds.includes("org-openai"), "OpenAI must be the search selector target");
  assert(!openAiCoverage.entityIds.includes("org-openai"), "OpenAI must not be modeled as publisher/source of coverage");
  results.push("selector-not-source");

  const openAiDirect = getSourceEndpoint("endpoint-openai-news");
  assert(openAiDirect.entityIds.includes("org-openai"), "Official OpenAI feed must retain source entity");
  results.push("official-source-entity");

  const aiDailyBriefVideo = getSourceEndpoint("endpoint-ai-daily-brief-youtube");
  assert(aiDailyBriefVideo.entityIds.includes("media-ai-daily-brief"), "AI Daily Brief YouTube must attach to Core Media entity");
  assert(aiDailyBriefVideo.entityIds.includes("person-nathaniel-whittemore"), "Existing Nathaniel Whittemore attribution must be preserved");
  results.push("media-endpoint-augmentation");

  const googleNews = getConnector("google-news");
  assert(googleNews.evidenceRole === "discovery", "Google News connector must remain discovery, not evidence authority");
  const arxiv = getConnector("arxiv");
  assert(arxiv.evidenceRole === "evidence-source", "arXiv connector should identify evidence-bearing corpus role");
  results.push("connector-role-distinction");

  const readwise = getSourceEndpoint("endpoint-readwise-local");
  assert(readwise.privacy === "private", "Readwise endpoint must remain private");
  assert(readwise.url === null, "Readwise endpoint must not persist credential-bearing locator");
  assert(getConnector("readwise").requiresCredential, "Readwise connector must declare credential requirement");
  results.push("readwise-privacy");

  const bridge = privateSocialBridgeDescriptor({
    id: "local-social-person-example",
    name: "Example private bridge",
    url: "https://private.example/feed?token=secret",
    profileIds: ["person-ethan-mollick"]
  });
  assert(bridge.privacy === "private", "Private social bridge descriptor must remain private");
  assert(bridge.hasRuntimeLocator === true, "Private social bridge should know a runtime locator exists");
  assert(bridge.url === null, "Private social bridge descriptor must not expose the private URL");
  assert(!JSON.stringify(bridge).includes("secret"), "Private locator must never leak into descriptor serialization");
  results.push("browser-local-privacy-contract");

  return Object.freeze({ ok: true, fixtures: Object.freeze(results) });
}
