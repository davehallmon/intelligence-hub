// Intelligence Hub v10 — Phase 8 monitored People & Organizations source coverage.
// Coverage describes available intake paths; it does not change monitoring state,
// add sources, or imply that discovery coverage was authored by the target entity.

import { ENTITY_TYPES, MONITORING_STATES } from "./config/entity-types.js";
import { entitiesByType, getEntity } from "./config/entities.js";
import { SOURCE_ENDPOINTS } from "./connectors/catalog.js";

export const SOURCE_COVERAGE_LEVELS = Object.freeze({
  DIRECT: "direct",
  SHARED: "shared",
  DISCOVERY: "discovery",
  RELATED: "related",
  GAP: "gap"
});

const MONITORED_STATES = new Set([
  MONITORING_STATES.PRIORITY,
  MONITORING_STATES.ACTIVE
]);

function freezeArray(values = []) {
  return Object.freeze([...values]);
}

function isLiveEndpoint(endpoint) {
  return String(endpoint?.status || "").startsWith("legacy-live");
}

function endpointSummary(endpoint, role) {
  return Object.freeze({
    id: endpoint.id,
    name: endpoint.name,
    connectorId: endpoint.connectorId,
    role,
    status: endpoint.status,
    privacy: endpoint.privacy,
    legacyTab: endpoint.legacyTab,
    url: endpoint.url || null
  });
}

function childEntityIds(entityId) {
  return new Set([
    ...entitiesByType(ENTITY_TYPES.PERSON),
    ...entitiesByType(ENTITY_TYPES.ORGANIZATION)
  ].filter(entity => entity.parentId === entityId).map(entity => entity.id));
}

export function monitoredPeopleOrganizations() {
  return Object.freeze([
    ...entitiesByType(ENTITY_TYPES.PERSON),
    ...entitiesByType(ENTITY_TYPES.ORGANIZATION)
  ].filter(entity => MONITORED_STATES.has(entity.monitoringState)));
}

export function sourceCoverageForEntity(entityId) {
  const entity = getEntity(entityId);
  if (!entity || ![ENTITY_TYPES.PERSON, ENTITY_TYPES.ORGANIZATION].includes(entity.type)) return null;

  const live = SOURCE_ENDPOINTS.filter(isLiveEndpoint);
  const children = childEntityIds(entityId);
  const direct = live.filter(endpoint => endpoint.entityIds.includes(entityId));
  const shared = live.filter(endpoint => endpoint.candidateEntityIds.includes(entityId));
  const discovery = live.filter(endpoint => endpoint.selectorEntityIds.includes(entityId));
  const related = children.size
    ? live.filter(endpoint => endpoint.entityIds.some(id => children.has(id)))
    : [];

  const level = direct.length ? SOURCE_COVERAGE_LEVELS.DIRECT
    : shared.length ? SOURCE_COVERAGE_LEVELS.SHARED
    : discovery.length ? SOURCE_COVERAGE_LEVELS.DISCOVERY
    : related.length ? SOURCE_COVERAGE_LEVELS.RELATED
    : SOURCE_COVERAGE_LEVELS.GAP;

  return Object.freeze({
    entityId,
    entity,
    level,
    direct: freezeArray(direct.map(endpoint => endpointSummary(endpoint, "direct"))),
    shared: freezeArray(shared.map(endpoint => endpointSummary(endpoint, "shared"))),
    discovery: freezeArray(discovery.map(endpoint => endpointSummary(endpoint, "discovery"))),
    related: freezeArray(related.map(endpoint => endpointSummary(endpoint, "related")))
  });
}

export function monitoredEntitySourceCoverage() {
  return Object.freeze(monitoredPeopleOrganizations().map(entity => sourceCoverageForEntity(entity.id)));
}

export function summarizeMonitoredEntitySourceCoverage() {
  const records = monitoredEntitySourceCoverage();
  const byLevel = Object.fromEntries(Object.values(SOURCE_COVERAGE_LEVELS).map(level => [level, 0]));
  records.forEach(record => { byLevel[record.level] += 1; });
  return Object.freeze({
    total: records.length,
    people: records.filter(record => record.entity.type === ENTITY_TYPES.PERSON).length,
    organizations: records.filter(record => record.entity.type === ENTITY_TYPES.ORGANIZATION).length,
    priority: records.filter(record => record.entity.monitoringState === MONITORING_STATES.PRIORITY).length,
    active: records.filter(record => record.entity.monitoringState === MONITORING_STATES.ACTIVE).length,
    byLevel: Object.freeze(byLevel)
  });
}

export function coverageLabel(level) {
  return ({
    [SOURCE_COVERAGE_LEVELS.DIRECT]: "Direct live source",
    [SOURCE_COVERAGE_LEVELS.SHARED]: "Shared source",
    [SOURCE_COVERAGE_LEVELS.DISCOVERY]: "Discovery only",
    [SOURCE_COVERAGE_LEVELS.RELATED]: "Related source only",
    [SOURCE_COVERAGE_LEVELS.GAP]: "No dedicated live source"
  })[level] || "Unknown coverage";
}
