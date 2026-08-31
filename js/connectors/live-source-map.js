// Intelligence Hub v10 — Phase 3 compatibility map for the current live feed configuration.
// This module proves that today's v9.x intake paths have stable v10 endpoint identities
// without rerouting fetch behavior yet.

import { FEED_CONFIG } from "../feed-config.js";
import {
  endpointForLegacySourceId,
  getSourceEndpoint
} from "./catalog.js";

const NEWS_QUERY_ENDPOINT_BY_LABEL = Object.freeze({
  "OpenAI coverage": "endpoint-google-news-openai-coverage",
  "Anthropic coverage": "endpoint-google-news-anthropic-coverage",
  "Google DeepMind coverage": "endpoint-google-news-deepmind-coverage",
  "AI Agents": "endpoint-google-news-ai-agents",
  "AI Regulation": "endpoint-google-news-ai-regulation",
  "AI Safety": "endpoint-google-news-ai-safety",
  "AI Coding": "endpoint-google-news-ai-coding",
  "Generative AI": "endpoint-google-news-generative-ai"
});

const ACADEMIC_ENDPOINTS_BY_NAME = Object.freeze({
  "Harvard Business Review": Object.freeze({
    direct: "endpoint-hbr-rss",
    fallback: "endpoint-google-news-hbr-fallback"
  }),
  "MIT Technology Review": Object.freeze({
    direct: "endpoint-mit-technology-review-rss",
    fallback: "endpoint-google-news-mit-tech-review-fallback"
  }),
  "Stanford HAI": Object.freeze({
    direct: "endpoint-stanford-hai-rss",
    fallback: "endpoint-google-news-stanford-hai-fallback"
  }),
  "Knowledge at Wharton": Object.freeze({
    direct: null,
    fallback: "endpoint-google-news-wharton-fallback"
  })
});

export const LIVE_SPECIAL_ENDPOINT_IDS = Object.freeze({
  research: "endpoint-arxiv-current",
  readwise: "endpoint-readwise-local"
});

export function endpointIdForLegacySource(source) {
  return source?.id ? endpointForLegacySourceId(source.id)?.id || null : null;
}

export function endpointIdForNewsQuery(entry) {
  return NEWS_QUERY_ENDPOINT_BY_LABEL[entry?.label] || null;
}

export function endpointIdsForAcademicSource(source) {
  const mapping = ACADEMIC_ENDPOINTS_BY_NAME[source?.name] || {};
  return Object.freeze({
    direct: mapping.direct || null,
    fallback: mapping.fallback || null
  });
}

// Browser-local bridge URLs must remain in localStorage. This descriptor carries
// identity/capability only and intentionally omits the private URL itself.
export function privateSocialBridgeDescriptor(source = {}) {
  return Object.freeze({
    id: source.id ? `runtime-endpoint-${source.id}` : "runtime-endpoint-social-bridge",
    name: source.name || "Private social bridge",
    connectorId: "social-bridge",
    entityIds: Object.freeze([...(source.profileIds || [])]),
    privacy: "private",
    status: "runtime-browser-local",
    hasRuntimeLocator: Boolean(source.url),
    url: null
  });
}

function compare(label, actual, expected, errors) {
  if (actual !== expected) errors.push(`${label}: expected ${expected || "null"}, found ${actual || "null"}`);
}

export function auditCurrentFeedEndpointCoverage() {
  const errors = [];
  const mapped = [];

  [
    ...(FEED_CONFIG.news.directSources || []),
    ...(FEED_CONFIG.socials.publicSources || []),
    ...(FEED_CONFIG.video.channels || [])
  ].forEach(source => {
    const endpointId = endpointIdForLegacySource(source);
    if (!endpointId) errors.push(`No endpoint mapping for legacy source ${source.id || source.name}`);
    else mapped.push(endpointId);
  });

  (FEED_CONFIG.news.queries || []).forEach(entry => {
    const endpointId = endpointIdForNewsQuery(entry);
    const endpoint = endpointId ? getSourceEndpoint(endpointId) : null;
    if (!endpoint) {
      errors.push(`No endpoint mapping for news query ${entry.label}`);
      return;
    }
    compare(`News query ${entry.label}`, endpoint.query, entry.query, errors);
    compare(`News freshness ${entry.label}`, endpoint.freshness, FEED_CONFIG.news.freshness, errors);
    mapped.push(endpointId);
  });

  (FEED_CONFIG.academic.sources || []).forEach(source => {
    const ids = endpointIdsForAcademicSource(source);
    if (source.feedUrl) {
      const direct = ids.direct ? getSourceEndpoint(ids.direct) : null;
      if (!direct) errors.push(`No direct endpoint mapping for academic source ${source.name}`);
      else {
        compare(`Academic feed ${source.name}`, direct.url, source.feedUrl, errors);
        mapped.push(direct.id);
      }
    }

    const fallback = ids.fallback ? getSourceEndpoint(ids.fallback) : null;
    if (!fallback) errors.push(`No fallback endpoint mapping for academic source ${source.name}`);
    else {
      compare(`Academic fallback ${source.name}`, fallback.query, source.fallbackQuery, errors);
      mapped.push(fallback.id);
    }
  });

  const research = getSourceEndpoint(LIVE_SPECIAL_ENDPOINT_IDS.research);
  if (!research) errors.push("Missing arXiv research endpoint");
  else {
    compare("Research endpoint", research.url, FEED_CONFIG.research.endpoint, errors);
    compare("Research query", research.query, FEED_CONFIG.research.searchQuery, errors);
    mapped.push(research.id);
  }

  const readwise = getSourceEndpoint(LIVE_SPECIAL_ENDPOINT_IDS.readwise);
  if (!readwise) errors.push("Missing Readwise endpoint");
  else mapped.push(readwise.id);

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    mappedEndpointIds: Object.freeze([...new Set(mapped)])
  });
}
