// Intelligence Hub v10 — declarative lens registry.
// The live v9.x navigation remains unchanged until later migration phases.

import { ENTITY_TYPES, MONITORING_STATES } from "./entity-types.js";
import {
  RESEARCH_CONFIGURATION,
  EVENT_CONFIGURATION,
  LIBRARY_CONFIGURATION,
  SAVED_CONFIGURATION,
  BOOKMARK_CONFIGURATION,
  PERSONAL_CONFIGURATION,
  QUESTION_CONFIGURATION,
  FOCUS_CONFIGURATION
} from "./preferences.js";

function lens(id, label, group, kind, config = {}) {
  return Object.freeze({ id, label, group, kind, config: Object.freeze({ ...config }) });
}

export const LENS_GROUPS = Object.freeze({
  INTELLIGENCE: "intelligence",
  WORKSPACE: "workspace",
  SYSTEM: "system"
});

export const LENS_REGISTRY = Object.freeze([
  lens("focus", "Focus", LENS_GROUPS.INTELLIGENCE, "decision", {
    ...FOCUS_CONFIGURATION
  }),
  lens("watchlist", "Watchlist", LENS_GROUPS.INTELLIGENCE, "monitor", {
    selectorTypes: Object.freeze(["topic", "facet", "search"]),
    continuousStates: Object.freeze([MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE]),
    parkedSearchable: true,
    discoveryMode: "broad-discovery-strict-focus"
  }),
  lens("people-organizations", "People & Organizations", LENS_GROUPS.INTELLIGENCE, "monitor", {
    entityTypes: Object.freeze([ENTITY_TYPES.PERSON, ENTITY_TYPES.ORGANIZATION]),
    continuousStates: Object.freeze([MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE]),
    parkedSearchable: true,
    relationshipRoles: Object.freeze(["authored-by", "published-by", "featuring", "about"])
  }),
  lens("products-platforms", "Products & Platforms", LENS_GROUPS.INTELLIGENCE, "monitor", {
    entityTypes: Object.freeze([ENTITY_TYPES.PRODUCT]),
    continuousStates: Object.freeze([MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE]),
    parkedSearchable: true,
    includeChildEntities: true
  }),
  lens("publications", "Publications", LENS_GROUPS.INTELLIGENCE, "monitor", {
    entityTypes: Object.freeze([ENTITY_TYPES.PUBLICATION]),
    continuousStates: Object.freeze([MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE]),
    parkedSearchable: true
  }),
  lens("research", "Research", LENS_GROUPS.INTELLIGENCE, "evidence", {
    ...RESEARCH_CONFIGURATION
  }),
  lens("media", "Media", LENS_GROUPS.INTELLIGENCE, "monitor", {
    entityTypes: Object.freeze([ENTITY_TYPES.MEDIA]),
    continuousStates: Object.freeze([MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE]),
    transcriptEnrichment: true,
    youtubeIsConnectorNotLens: true,
    parkedSearchable: true
  }),
  lens("communities", "Communities", LENS_GROUPS.INTELLIGENCE, "monitor", {
    entityTypes: Object.freeze([ENTITY_TYPES.COMMUNITY]),
    continuousStates: Object.freeze([MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE]),
    parkedSearchable: true,
    popularityAlonePromotes: false
  }),
  lens("events-learning", "Events & Learning", LENS_GROUPS.INTELLIGENCE, "opportunity", {
    ...EVENT_CONFIGURATION
  }),
  lens("library", "Library", LENS_GROUPS.INTELLIGENCE, "knowledge", {
    ...LIBRARY_CONFIGURATION
  }),

  lens("questions", "Questions", LENS_GROUPS.WORKSPACE, "investigation", {
    ...QUESTION_CONFIGURATION
  }),
  lens("bookmarks", "Bookmarks", LENS_GROUPS.WORKSPACE, "directory", {
    ...BOOKMARK_CONFIGURATION
  }),
  lens("personal", "Personal", LENS_GROUPS.WORKSPACE, "input", {
    ...PERSONAL_CONFIGURATION
  }),

  lens("settings", "Settings", LENS_GROUPS.SYSTEM, "system")
]);

export const SAVED_ACTION = Object.freeze({
  id: "saved",
  label: "Saved",
  placement: "top-right",
  isLens: false,
  ...SAVED_CONFIGURATION
});

const LENS_BY_ID = new Map(LENS_REGISTRY.map(item => [item.id, item]));

export function getLens(id) {
  return LENS_BY_ID.get(id) || null;
}
