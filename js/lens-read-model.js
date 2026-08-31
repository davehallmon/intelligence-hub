// Intelligence Hub v10 — Phase 4 lens query/read-model layer.
// Pure, read-only selectors over canonical intelligence objects. No ranking,
// rendering, ingestion, storage, or navigation behavior lives here.

import { getEntity } from "./config/entities.js";
import { ENTITY_TYPES, MONITORING_STATES } from "./config/entity-types.js";
import { getLens } from "./config/lenses.js";
import { WATCHLIST_TOPICS } from "./config/topic-taxonomy.js";
import { legacyTopicToWatchlistId } from "./config/legacy-map.js";
import { EVIDENCE_TYPES } from "./config/evidence-types.js";

export const QUERYABLE_LENS_IDS = Object.freeze([
  "watchlist",
  "people-organizations",
  "products-platforms",
  "publications",
  "research",
  "media",
  "communities"
]);

const DEFAULT_MONITORING_STATES = Object.freeze([
  MONITORING_STATES.PRIORITY,
  MONITORING_STATES.ACTIVE
]);

const TOPIC_BY_ID = new Map(WATCHLIST_TOPICS.map(topic => [topic.id, topic]));
const TOPIC_ID_BY_NAME = new Map(
  WATCHLIST_TOPICS.map(topic => [normalizeLabel(topic.name), topic.id])
);

function normalizeLabel(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function unique(values = []) {
  return [...new Set((values || []).filter(Boolean))];
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function stateLabel(state) {
  return ({
    [MONITORING_STATES.PRIORITY]: "Priority",
    [MONITORING_STATES.ACTIVE]: "Active",
    [MONITORING_STATES.PARKED]: "Parked",
    [MONITORING_STATES.KNOWN]: "Known",
    [MONITORING_STATES.CHILD]: "Child"
  })[state] || state || "Unknown";
}

function allowedMonitoringStates(options = {}) {
  if (options.monitoringStates?.length) return new Set(options.monitoringStates);
  const states = [...DEFAULT_MONITORING_STATES];
  if (options.includeParked) states.push(MONITORING_STATES.PARKED);
  if (options.includeKnown) states.push(MONITORING_STATES.KNOWN);
  return new Set(states);
}

function entityLineage(entityId) {
  const lineage = [];
  const seen = new Set();
  let current = getEntity(entityId);
  while (current && !seen.has(current.id)) {
    lineage.push(current);
    seen.add(current.id);
    current = current.parentId ? getEntity(current.parentId) : null;
  }
  return lineage;
}

function monitoredAnchor(entityId, allowedStates, includeChildren = false) {
  const lineage = entityLineage(entityId);
  if (!lineage.length) return null;
  const direct = lineage[0];
  if (allowedStates.has(direct.monitoringState)) return direct;
  if (!includeChildren || direct.monitoringState !== MONITORING_STATES.CHILD) return null;
  return lineage.slice(1).find(entity => allowedStates.has(entity.monitoringState)) || null;
}

function selectedEntityMatches(entityId, selectedIds, includeChildren = false) {
  if (!selectedIds.size) return true;
  if (selectedIds.has(entityId)) return true;
  if (!includeChildren) return false;
  return entityLineage(entityId).slice(1).some(entity => selectedIds.has(entity.id));
}

function itemEntityIdsForTypes(item, types) {
  const typeSet = new Set(types);
  return unique(item.entityIds || []).filter(id => typeSet.has(getEntity(id)?.type));
}

function rolesForEntity(item, entityId) {
  const roles = [];
  if ((item.sourceEntityIds || []).includes(entityId)) roles.push("source");
  if ((item.authorEntityIds || []).includes(entityId)) roles.push("authored-by");
  if ((item.publisherEntityIds || []).includes(entityId)) roles.push("published-by");
  if ((item.featuredEntityIds || []).includes(entityId)) roles.push("featuring");
  if ((item.mentionedEntityIds || []).includes(entityId)) roles.push("about");
  return roles;
}

export function watchlistTopicIdsForItem(item = {}) {
  const explicit = unique([
    ...asArray(item.watchlistTopicIds),
    ...asArray(item.topicIds)
  ]).filter(id => TOPIC_BY_ID.has(id));

  const derived = unique(asArray(item.topics).map(label => {
    if (TOPIC_BY_ID.has(label)) return label;
    return legacyTopicToWatchlistId(label) || TOPIC_ID_BY_NAME.get(normalizeLabel(label)) || null;
  }));

  return Object.freeze(unique([...explicit, ...derived]));
}

function entityLensMatch(item, lensId, entityTypes, options = {}, { includeChildren = false } = {}) {
  const allowedStates = allowedMonitoringStates(options);
  const selectedIds = new Set(asArray(options.entityIds));
  const candidates = itemEntityIdsForTypes(item, entityTypes);
  const matches = [];

  candidates.forEach(entityId => {
    const anchor = monitoredAnchor(entityId, allowedStates, includeChildren);
    if (!anchor) return;
    if (!selectedEntityMatches(entityId, selectedIds, includeChildren)) return;
    const entity = getEntity(entityId);
    matches.push(Object.freeze({
      entityId,
      monitoringAnchorId: anchor.id,
      roles: Object.freeze(rolesForEntity(item, entityId)),
      reason: anchor.id === entityId
        ? `${stateLabel(anchor.monitoringState)} ${entity?.type || "entity"}: ${entity?.name || entityId}`
        : `${entity?.name || entityId} belongs to ${stateLabel(anchor.monitoringState)} ${anchor.name}`
    }));
  });

  if (!matches.length) return null;
  return Object.freeze({
    lensId,
    item,
    matchedEntityIds: Object.freeze(unique(matches.map(match => match.entityId))),
    matchedTopicIds: Object.freeze([]),
    matches: Object.freeze(matches),
    reasons: Object.freeze(matches.map(match => match.reason))
  });
}

function watchlistMatch(item, options = {}) {
  const knowledgeOnly = item.objectType === "highlight"
    || item.type === "highlight"
    || item.sourceEndpointId === "endpoint-readwise-local";
  if (knowledgeOnly && options.includeKnowledge !== true) return null;

  const allowedStates = allowedMonitoringStates(options);
  const selectedTopicIds = new Set(asArray(options.topicIds));
  const topicIds = watchlistTopicIdsForItem(item);
  const matched = topicIds.filter(topicId => {
    const topic = TOPIC_BY_ID.get(topicId);
    if (!topic || !allowedStates.has(topic.state)) return false;
    return !selectedTopicIds.size || selectedTopicIds.has(topicId);
  });

  if (!matched.length) return null;
  const reasons = matched.map(topicId => {
    const topic = TOPIC_BY_ID.get(topicId);
    return `${stateLabel(topic.state)} Watchlist: ${topic.name}`;
  });
  return Object.freeze({
    lensId: "watchlist",
    item,
    matchedEntityIds: Object.freeze([]),
    matchedTopicIds: Object.freeze(matched),
    matches: Object.freeze([]),
    reasons: Object.freeze(reasons)
  });
}

function researchMatch(item) {
  const sourceIds = unique(item.researchSourceEntityIds || []);
  const isResearch = item.objectType === "research"
    || item.type === "research"
    || item.evidenceType === EVIDENCE_TYPES.RESEARCH
    || sourceIds.length > 0;
  if (!isResearch) return null;
  return Object.freeze({
    lensId: "research",
    item,
    matchedEntityIds: Object.freeze(sourceIds),
    matchedTopicIds: watchlistTopicIdsForItem(item),
    matches: Object.freeze([]),
    reasons: Object.freeze([
      sourceIds.length ? "Research-source relationship" : "Research intelligence object"
    ])
  });
}

function matcherFor(lensId, item, options = {}) {
  if (lensId === "watchlist") return watchlistMatch(item, options);
  if (lensId === "people-organizations") {
    return entityLensMatch(item, lensId, [ENTITY_TYPES.PERSON, ENTITY_TYPES.ORGANIZATION], options);
  }
  if (lensId === "products-platforms") {
    return entityLensMatch(item, lensId, [ENTITY_TYPES.PRODUCT], options, { includeChildren: true });
  }
  if (lensId === "publications") {
    return entityLensMatch(item, lensId, [ENTITY_TYPES.PUBLICATION], options);
  }
  if (lensId === "media") {
    return entityLensMatch(item, lensId, [ENTITY_TYPES.MEDIA], options);
  }
  if (lensId === "communities") {
    return entityLensMatch(item, lensId, [ENTITY_TYPES.COMMUNITY], options);
  }
  if (lensId === "research") return researchMatch(item, options);
  return null;
}

export function queryLens(items = [], lensId, options = {}) {
  if (!QUERYABLE_LENS_IDS.includes(lensId)) {
    throw new RangeError(`Lens is not queryable in Phase 4: ${lensId}`);
  }
  const lens = getLens(lensId);
  if (!lens) throw new RangeError(`Unknown lens: ${lensId}`);

  const entries = [];
  (items || []).forEach(item => {
    const match = matcherFor(lensId, item, options);
    if (match) entries.push(match);
  });

  return Object.freeze({
    lensId,
    lens,
    entries: Object.freeze(entries),
    items: Object.freeze(entries.map(entry => entry.item))
  });
}

export function buildLensReadModels(items = [], optionsByLens = {}) {
  return Object.freeze(Object.fromEntries(
    QUERYABLE_LENS_IDS.map(lensId => [lensId, queryLens(items, lensId, optionsByLens[lensId] || {})])
  ));
}

export function lensMembershipForItem(item, optionsByLens = {}) {
  return Object.freeze(QUERYABLE_LENS_IDS.flatMap(lensId => {
    const result = queryLens([item], lensId, optionsByLens[lensId] || {});
    if (!result.entries.length) return [];
    const entry = result.entries[0];
    return [Object.freeze({
      lensId,
      matchedEntityIds: entry.matchedEntityIds,
      matchedTopicIds: entry.matchedTopicIds,
      reasons: entry.reasons
    })];
  }));
}
