// Intelligence Hub v10 — Phase 1 foundation validator.
// Pure ES module: intended for development/manual verification, not live UI execution.

import { PROFILE_REGISTRY } from "../profiles.js";
import { ENTITY_REGISTRY, getEntity } from "./entities.js";
import { WATCHLIST_TOPICS } from "./topic-taxonomy.js";
import { LEGACY_PROFILE_TO_ENTITY } from "./legacy-map.js";
import { LENS_REGISTRY } from "./lenses.js";
import {
  PERSON_INGESTION_PREFERENCES,
  ORGANIZATION_ACTIVITY_PREFERENCES,
  PRODUCT_SIGNAL_PREFERENCES,
  RESEARCH_CONFIGURATION,
  EVENT_CONFIGURATION
} from "./preferences.js";
import { SOURCE_ENDPOINTS } from "../connectors/catalog.js";

function duplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  values.forEach(value => {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  });
  return [...dupes];
}

function missingEntityRefs(ids = []) {
  return ids.filter(id => !getEntity(id));
}

export function validateFoundation() {
  const errors = [];
  const warnings = [];

  const duplicateEntityIds = duplicates(ENTITY_REGISTRY.map(item => item.id));
  if (duplicateEntityIds.length) errors.push(`Duplicate entity IDs: ${duplicateEntityIds.join(", ")}`);

  const duplicateLensIds = duplicates(LENS_REGISTRY.map(item => item.id));
  if (duplicateLensIds.length) errors.push(`Duplicate lens IDs: ${duplicateLensIds.join(", ")}`);

  const duplicateEndpointIds = duplicates(SOURCE_ENDPOINTS.map(item => item.id));
  if (duplicateEndpointIds.length) errors.push(`Duplicate endpoint IDs: ${duplicateEndpointIds.join(", ")}`);

  PROFILE_REGISTRY.forEach(profile => {
    const mapped = LEGACY_PROFILE_TO_ENTITY[profile.id];
    if (mapped !== profile.id || !getEntity(mapped)) {
      errors.push(`Legacy profile mapping failed: ${profile.id}`);
    }
  });

  ENTITY_REGISTRY.forEach(item => {
    if (item.parentId && !getEntity(item.parentId)) {
      errors.push(`Missing parent ${item.parentId} for ${item.id}`);
    }
    (item.relations || []).forEach(relation => {
      if (!getEntity(relation.targetId)) {
        errors.push(`Missing relation target ${relation.targetId} for ${item.id}`);
      }
    });
  });

  const priorityTopics = WATCHLIST_TOPICS.filter(item => item.state === "priority");
  const activeTopics = WATCHLIST_TOPICS.filter(item => item.state === "active");
  if (priorityTopics.length !== 5) errors.push(`Expected 5 Priority Watchlist topics, found ${priorityTopics.length}`);
  if (activeTopics.length !== 7) errors.push(`Expected 7 Active Watchlist topics, found ${activeTopics.length}`);

  const priorityPeople = ENTITY_REGISTRY.filter(item => item.type === "person" && item.monitoringState === "priority");
  const activePeople = ENTITY_REGISTRY.filter(item => item.type === "person" && item.monitoringState === "active");
  if (priorityPeople.length !== 7) errors.push(`Expected 7 Priority people, found ${priorityPeople.length}`);
  if (activePeople.length !== 12) errors.push(`Expected 12 Active people, found ${activePeople.length}`);

  const priorityOrgs = ENTITY_REGISTRY.filter(item => item.type === "organization" && item.monitoringState === "priority");
  const activeOrgs = ENTITY_REGISTRY.filter(item => item.type === "organization" && item.monitoringState === "active");
  if (priorityOrgs.length !== 5) errors.push(`Expected 5 Priority organizations, found ${priorityOrgs.length}`);
  if (activeOrgs.length !== 8) errors.push(`Expected 8 Active organizations, found ${activeOrgs.length}`);

  const priorityProducts = ENTITY_REGISTRY.filter(item => item.type === "product" && item.monitoringState === "priority");
  const activeProducts = ENTITY_REGISTRY.filter(item => item.type === "product" && item.monitoringState === "active");
  if (priorityProducts.length !== 6) errors.push(`Expected 6 Priority products, found ${priorityProducts.length}`);
  if (activeProducts.length !== 10) errors.push(`Expected 10 Active products, found ${activeProducts.length}`);

  [
    ...Object.keys(PERSON_INGESTION_PREFERENCES),
    ...Object.keys(ORGANIZATION_ACTIVITY_PREFERENCES),
    ...Object.keys(PRODUCT_SIGNAL_PREFERENCES),
    ...RESEARCH_CONFIGURATION.sourceIds.use,
    ...RESEARCH_CONFIGURATION.sourceIds.park,
    ...RESEARCH_CONFIGURATION.sourceIds.discoveryOnly,
    ...EVENT_CONFIGURATION.providerIds.priority,
    ...EVENT_CONFIGURATION.providerIds.active,
    ...EVENT_CONFIGURATION.providerIds.parked,
    ...EVENT_CONFIGURATION.attachedEventEndpointEntityIds
  ].forEach(id => {
    if (!getEntity(id)) errors.push(`Configuration references missing entity: ${id}`);
  });

  SOURCE_ENDPOINTS.forEach(endpoint => {
    const missing = missingEntityRefs([...(endpoint.entityIds || []), ...(endpoint.candidateEntityIds || [])]);
    if (missing.length) warnings.push(`Endpoint ${endpoint.id} references legacy/unknown entities: ${missing.join(", ")}`);
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    counts: Object.freeze({
      entities: ENTITY_REGISTRY.length,
      lenses: LENS_REGISTRY.length,
      endpoints: SOURCE_ENDPOINTS.length,
      legacyProfiles: PROFILE_REGISTRY.length
    })
  });
}
