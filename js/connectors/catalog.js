// Intelligence Hub v10 — connector capability catalog and legacy endpoint bridge.
// Existing source-registry.js remains the live v9.x source authority during Phase 1.

import { PUBLIC_SOURCE_REGISTRY } from "../source-registry.js";

export const CONNECTOR_TYPES = Object.freeze({
  RSS: Object.freeze({ id: "rss", selectorTypes: Object.freeze(["person", "organization", "product", "publication", "media", "community", "topic"]) }),
  ATOM: Object.freeze({ id: "atom", selectorTypes: Object.freeze(["person", "organization", "product", "publication", "media", "community", "topic"]) }),
  YOUTUBE: Object.freeze({ id: "youtube", selectorTypes: Object.freeze(["person", "organization", "product", "media"]) }),
  GOOGLE_NEWS: Object.freeze({ id: "google-news", selectorTypes: Object.freeze(["person", "organization", "product", "publication", "topic", "search"]) }),
  ARXIV: Object.freeze({ id: "arxiv", selectorTypes: Object.freeze(["topic", "research-source", "search"]) }),
  NEWSLETTER_EMAIL: Object.freeze({ id: "newsletter-email", selectorTypes: Object.freeze(["person", "organization", "publication", "media"]) }),
  SOCIAL_BRIDGE: Object.freeze({ id: "social-bridge", selectorTypes: Object.freeze(["person", "organization"]) }),
  WEB: Object.freeze({ id: "web", selectorTypes: Object.freeze(["person", "organization", "product", "publication", "media", "community", "research-source"]) }),
  SEARCH: Object.freeze({ id: "search", selectorTypes: Object.freeze(["topic", "person", "organization", "product", "publication", "community", "search"]) }),
  READWISE: Object.freeze({ id: "readwise", selectorTypes: Object.freeze(["library"]) }),
  PRIVATE_LOCAL: Object.freeze({ id: "private-local", selectorTypes: Object.freeze(["personal", "person", "organization", "publication"]) })
});

const KIND_TO_CONNECTOR = Object.freeze({
  rss: "rss",
  atom: "atom",
  youtube: "youtube"
});

function freezeArray(values = []) {
  return Object.freeze([...(values || [])]);
}

function endpointFromLegacySource(source) {
  return Object.freeze({
    id: `endpoint-${source.id}`,
    legacySourceId: source.id,
    name: source.name,
    connectorId: KIND_TO_CONNECTOR[source.kind] || "web",
    url: source.url || null,
    channelId: source.channelId || null,
    entityIds: freezeArray(source.profileIds),
    candidateEntityIds: freezeArray(source.candidateProfileIds),
    topicLabels: freezeArray(source.topics),
    legacyTab: source.tab || null,
    verifiedAt: source.verifiedAt || null,
    status: "legacy-live",
    note: source.note || ""
  });
}

export const LEGACY_PUBLIC_ENDPOINTS = Object.freeze(
  PUBLIC_SOURCE_REGISTRY.map(endpointFromLegacySource)
);

// Declarations for live sources that currently sit outside source-registry.js.
// They are compatibility metadata only; Phase 1 does not reroute ingestion.
export const LEGACY_DECLARED_ENDPOINTS = Object.freeze([
  Object.freeze({
    id: "endpoint-hbr-rss",
    name: "Harvard Business Review",
    connectorId: "rss",
    url: "https://feeds.hbr.org/harvardbusiness",
    entityIds: Object.freeze(["publication-hbr"]),
    status: "legacy-live",
    legacyTab: "academic"
  }),
  Object.freeze({
    id: "endpoint-mit-technology-review-rss",
    name: "MIT Technology Review",
    connectorId: "rss",
    url: "https://www.technologyreview.com/feed/",
    entityIds: Object.freeze(["publication-mit-technology-review"]),
    status: "legacy-live",
    legacyTab: "academic"
  }),
  Object.freeze({
    id: "endpoint-stanford-hai-rss",
    name: "Stanford HAI",
    connectorId: "rss",
    url: "https://hai.stanford.edu/rss.xml",
    entityIds: Object.freeze(["org-stanford-hai"]),
    status: "legacy-live",
    legacyTab: "academic"
  }),
  Object.freeze({
    id: "endpoint-arxiv-current",
    name: "arXiv current research feed",
    connectorId: "arxiv",
    url: "https://export.arxiv.org/api/query",
    entityIds: Object.freeze(["research-source-arxiv"]),
    status: "legacy-live",
    legacyTab: "research"
  }),
  Object.freeze({
    id: "endpoint-readwise-local",
    name: "Readwise browser-local export",
    connectorId: "readwise",
    url: null,
    entityIds: Object.freeze([]),
    status: "legacy-live-browser-local",
    legacyTab: "books",
    note: "Credentials remain browser-local; this declaration does not move or expose them."
  })
]);

export const SOURCE_ENDPOINTS = Object.freeze([
  ...LEGACY_PUBLIC_ENDPOINTS,
  ...LEGACY_DECLARED_ENDPOINTS
]);

export const SOURCE_ENDPOINT_SHAPE = Object.freeze({
  required: Object.freeze(["id", "name", "connectorId", "status"]),
  optional: Object.freeze([
    "url",
    "channelId",
    "entityIds",
    "candidateEntityIds",
    "topicLabels",
    "legacyTab",
    "verifiedAt",
    "note"
  ])
});

export function endpointsForEntity(entityId) {
  return SOURCE_ENDPOINTS.filter(endpoint =>
    (endpoint.entityIds || []).includes(entityId) ||
    (endpoint.candidateEntityIds || []).includes(entityId)
  );
}
