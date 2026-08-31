// Intelligence Hub v10 — connector capability catalog and source-endpoint registry.
// Phase 3 makes current intake paths addressable as reusable endpoints without
// rerouting the live v9.x fetch pipeline yet.

import { PUBLIC_SOURCE_REGISTRY } from "../source-registry.js";
import { getEntity } from "../config/entities.js";

function connector({ id, selectorTypes = [], transport = "web", browserSafe = true,
  requiresCredential = false, privacy = "public", evidenceRole = "source-or-discovery" }) {
  return Object.freeze({
    id,
    selectorTypes: Object.freeze(selectorTypes),
    transport,
    browserSafe,
    requiresCredential,
    privacy,
    evidenceRole
  });
}

export const CONNECTOR_TYPES = Object.freeze({
  RSS: connector({
    id: "rss",
    selectorTypes: ["person", "organization", "product", "publication", "media", "community", "topic"],
    transport: "rss"
  }),
  ATOM: connector({
    id: "atom",
    selectorTypes: ["person", "organization", "product", "publication", "media", "community", "topic"],
    transport: "atom"
  }),
  YOUTUBE: connector({
    id: "youtube",
    selectorTypes: ["person", "organization", "product", "media"],
    transport: "youtube-atom"
  }),
  GOOGLE_NEWS: connector({
    id: "google-news",
    selectorTypes: ["person", "organization", "product", "publication", "topic", "search"],
    transport: "rss",
    evidenceRole: "discovery"
  }),
  ARXIV: connector({
    id: "arxiv",
    selectorTypes: ["topic", "research-source", "search"],
    transport: "atom-api",
    evidenceRole: "evidence-source"
  }),
  NEWSLETTER_EMAIL: connector({
    id: "newsletter-email",
    selectorTypes: ["person", "organization", "publication", "media"],
    transport: "email"
  }),
  SOCIAL_BRIDGE: connector({
    id: "social-bridge",
    selectorTypes: ["person", "organization"],
    transport: "rss-bridge",
    privacy: "private"
  }),
  WEB: connector({
    id: "web",
    selectorTypes: ["person", "organization", "product", "publication", "media", "community", "research-source"],
    transport: "web"
  }),
  SEARCH: connector({
    id: "search",
    selectorTypes: ["topic", "person", "organization", "product", "publication", "community", "search"],
    transport: "search",
    evidenceRole: "discovery"
  }),
  READWISE: connector({
    id: "readwise",
    selectorTypes: ["library"],
    transport: "api",
    requiresCredential: true,
    privacy: "private"
  }),
  PRIVATE_LOCAL: connector({
    id: "private-local",
    selectorTypes: ["personal", "person", "organization", "publication"],
    transport: "browser-local",
    privacy: "private"
  })
});

export const CONNECTOR_BY_ID = new Map(
  Object.values(CONNECTOR_TYPES).map(item => [item.id, item])
);

const KIND_TO_CONNECTOR = Object.freeze({
  rss: "rss",
  atom: "atom",
  youtube: "youtube"
});

const LEGACY_ENTITY_AUGMENTS = Object.freeze({
  // The channel is a format endpoint of the Core Media property, not a second subscription.
  "ai-daily-brief-youtube": Object.freeze(["media-ai-daily-brief"])
});

function freezeArray(values = []) {
  return Object.freeze([...new Set((values || []).filter(Boolean))]);
}

function endpoint({ id, name, connectorId, url = null, channelId = null,
  entityIds = [], candidateEntityIds = [], selectorEntityIds = [], selectorTopicIds = [],
  selectorTopicLabels = [], query = null, freshness = null, legacySourceId = null,
  legacyTab = null, verifiedAt = null, status = "declared", privacy = "public",
  evidenceBearing = null, note = "" }) {
  return Object.freeze({
    id,
    name,
    connectorId,
    url,
    channelId,
    entityIds: freezeArray(entityIds),
    candidateEntityIds: freezeArray(candidateEntityIds),
    selectorEntityIds: freezeArray(selectorEntityIds),
    selectorTopicIds: freezeArray(selectorTopicIds),
    selectorTopicLabels: freezeArray(selectorTopicLabels),
    query,
    freshness,
    legacySourceId,
    legacyTab,
    verifiedAt,
    status,
    privacy,
    evidenceBearing,
    note
  });
}

function endpointFromLegacySource(source) {
  return endpoint({
    id: `endpoint-${source.id}`,
    legacySourceId: source.id,
    name: source.name,
    connectorId: KIND_TO_CONNECTOR[source.kind] || "web",
    url: source.url || null,
    channelId: source.channelId || null,
    entityIds: [...(source.profileIds || []), ...(LEGACY_ENTITY_AUGMENTS[source.id] || [])],
    candidateEntityIds: source.candidateProfileIds || [],
    selectorTopicLabels: source.topics || [],
    legacyTab: source.tab || null,
    verifiedAt: source.verifiedAt || null,
    status: "legacy-live",
    note: source.note || ""
  });
}

export const LEGACY_PUBLIC_ENDPOINTS = Object.freeze(
  PUBLIC_SOURCE_REGISTRY.map(endpointFromLegacySource)
);

export const LEGACY_DECLARED_ENDPOINTS = Object.freeze([
  endpoint({
    id: "endpoint-hbr-rss",
    name: "Harvard Business Review",
    connectorId: "rss",
    url: "https://feeds.hbr.org/harvardbusiness",
    entityIds: ["publication-hbr"],
    status: "legacy-live",
    legacyTab: "academic",
    evidenceBearing: true
  }),
  endpoint({
    id: "endpoint-mit-technology-review-rss",
    name: "MIT Technology Review",
    connectorId: "rss",
    url: "https://www.technologyreview.com/feed/",
    entityIds: ["publication-mit-technology-review"],
    status: "legacy-live",
    legacyTab: "academic",
    evidenceBearing: true
  }),
  endpoint({
    id: "endpoint-stanford-hai-rss",
    name: "Stanford HAI",
    connectorId: "rss",
    url: "https://hai.stanford.edu/rss.xml",
    entityIds: ["org-stanford-hai"],
    status: "legacy-live",
    legacyTab: "academic",
    evidenceBearing: true
  }),
  endpoint({
    id: "endpoint-arxiv-current",
    name: "arXiv current research feed",
    connectorId: "arxiv",
    url: "https://export.arxiv.org/api/query",
    entityIds: ["research-source-arxiv"],
    selectorTopicIds: [
      "ai-agents-agentic-workflows",
      "rag-retrieval-knowledge",
      "multimodal-ai",
      "ai-safety-reliability-alignment",
      "ai-evaluation-benchmarking"
    ],
    query: "cat:cs.AI OR cat:cs.CL OR cat:cs.LG",
    status: "legacy-live",
    legacyTab: "research",
    evidenceBearing: true
  }),
  endpoint({
    id: "endpoint-readwise-local",
    name: "Readwise browser-local export",
    connectorId: "readwise",
    status: "legacy-live-browser-local",
    legacyTab: "books",
    privacy: "private",
    note: "Credentials remain browser-local; this declaration does not move or expose them."
  })
]);

// Discovery endpoints describe what the connector searches for. Their selector
// targets are subjects, not publishers/source entities.
export const DISCOVERY_ENDPOINTS = Object.freeze([
  endpoint({
    id: "endpoint-google-news-openai-coverage",
    name: "OpenAI coverage",
    connectorId: "google-news",
    selectorEntityIds: ["org-openai"],
    query: "OpenAI",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-anthropic-coverage",
    name: "Anthropic coverage",
    connectorId: "google-news",
    selectorEntityIds: ["org-anthropic"],
    query: "Anthropic",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-deepmind-coverage",
    name: "Google DeepMind coverage",
    connectorId: "google-news",
    selectorEntityIds: ["org-google-deepmind"],
    query: "\"Google DeepMind\"",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-ai-agents",
    name: "AI Agents",
    connectorId: "google-news",
    selectorTopicIds: ["ai-agents-agentic-workflows"],
    selectorTopicLabels: ["AI Agents"],
    query: "\"AI agents\"",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-ai-regulation",
    name: "AI Regulation",
    connectorId: "google-news",
    selectorTopicIds: ["ai-regulation-policy-governance"],
    selectorTopicLabels: ["AI Regulation & Policy"],
    query: "\"AI regulation\"",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-ai-safety",
    name: "AI Safety",
    connectorId: "google-news",
    selectorTopicIds: ["ai-safety-reliability-alignment"],
    selectorTopicLabels: ["AI Safety & Alignment"],
    query: "\"AI safety\"",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-ai-coding",
    name: "AI Coding",
    connectorId: "google-news",
    selectorTopicIds: ["ai-powered-coding"],
    selectorTopicLabels: ["AI-powered Coding"],
    query: "\"AI coding\"",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-generative-ai",
    name: "Generative AI",
    connectorId: "google-news",
    query: "\"generative AI\"",
    freshness: "1d",
    legacyTab: "news",
    status: "legacy-live-generated"
  }),
  endpoint({
    id: "endpoint-google-news-hbr-fallback",
    name: "Harvard Business Review fallback",
    connectorId: "google-news",
    selectorEntityIds: ["publication-hbr"],
    query: "site:hbr.org artificial intelligence OR technology OR leadership",
    freshness: "7d",
    legacyTab: "academic",
    status: "legacy-live-fallback"
  }),
  endpoint({
    id: "endpoint-google-news-mit-tech-review-fallback",
    name: "MIT Technology Review fallback",
    connectorId: "google-news",
    selectorEntityIds: ["publication-mit-technology-review"],
    query: "site:technologyreview.com artificial intelligence",
    freshness: "7d",
    legacyTab: "academic",
    status: "legacy-live-fallback"
  }),
  endpoint({
    id: "endpoint-google-news-stanford-hai-fallback",
    name: "Stanford HAI fallback",
    connectorId: "google-news",
    selectorEntityIds: ["org-stanford-hai"],
    query: "site:hai.stanford.edu AI",
    freshness: "7d",
    legacyTab: "academic",
    status: "legacy-live-fallback"
  }),
  endpoint({
    id: "endpoint-google-news-wharton-fallback",
    name: "Knowledge at Wharton fallback",
    connectorId: "google-news",
    selectorEntityIds: ["publication-knowledge-at-wharton"],
    query: "site:knowledge.wharton.upenn.edu AI OR technology OR management",
    freshness: "7d",
    legacyTab: "academic",
    status: "legacy-live-fallback"
  })
]);

export const SOURCE_ENDPOINTS = Object.freeze([
  ...LEGACY_PUBLIC_ENDPOINTS,
  ...LEGACY_DECLARED_ENDPOINTS,
  ...DISCOVERY_ENDPOINTS
]);

export const SOURCE_ENDPOINT_BY_ID = new Map(
  SOURCE_ENDPOINTS.map(item => [item.id, item])
);

export const SOURCE_ENDPOINT_SHAPE = Object.freeze({
  required: Object.freeze(["id", "name", "connectorId", "status"]),
  optional: Object.freeze([
    "url",
    "channelId",
    "entityIds",
    "candidateEntityIds",
    "selectorEntityIds",
    "selectorTopicIds",
    "selectorTopicLabels",
    "query",
    "freshness",
    "legacySourceId",
    "legacyTab",
    "verifiedAt",
    "privacy",
    "evidenceBearing",
    "note"
  ])
});

export function getConnector(connectorId) {
  return CONNECTOR_BY_ID.get(connectorId) || null;
}

export function getSourceEndpoint(endpointId) {
  return SOURCE_ENDPOINT_BY_ID.get(endpointId) || null;
}

export function endpointForLegacySourceId(sourceId) {
  return getSourceEndpoint(`endpoint-${sourceId}`);
}

export function endpointsForEntity(entityId) {
  return SOURCE_ENDPOINTS.filter(item =>
    item.entityIds.includes(entityId) || item.candidateEntityIds.includes(entityId)
  );
}

export function discoveryEndpointsForEntity(entityId) {
  return SOURCE_ENDPOINTS.filter(item => item.selectorEntityIds.includes(entityId));
}

export function endpointsForTopic(topicId) {
  return SOURCE_ENDPOINTS.filter(item => item.selectorTopicIds.includes(topicId));
}

export function endpointsForConnector(connectorId) {
  return SOURCE_ENDPOINTS.filter(item => item.connectorId === connectorId);
}

export function validateEndpointReferences() {
  const errors = [];
  const duplicateIds = SOURCE_ENDPOINTS
    .map(item => item.id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`Duplicate endpoint IDs: ${[...new Set(duplicateIds)].join(", ")}`);

  SOURCE_ENDPOINTS.forEach(item => {
    if (!getConnector(item.connectorId)) errors.push(`Unknown connector ${item.connectorId} on ${item.id}`);
    [...item.entityIds, ...item.candidateEntityIds, ...item.selectorEntityIds].forEach(entityId => {
      if (!getEntity(entityId)) errors.push(`Unknown entity ${entityId} on ${item.id}`);
    });
  });

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
