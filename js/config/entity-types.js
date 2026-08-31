// Intelligence Hub v10 — canonical entity and monitoring-state vocabulary.
// Phase 1 foundation only: this module is not imported by the live v9.x UI yet.

export const ENTITY_TYPES = Object.freeze({
  PERSON: "person",
  ORGANIZATION: "organization",
  PRODUCT: "product",
  PUBLICATION: "publication",
  MEDIA: "media",
  COMMUNITY: "community",
  RESEARCH_SOURCE: "research-source"
});

export const MONITORING_STATES = Object.freeze({
  PRIORITY: "priority",
  ACTIVE: "active",
  PARKED: "parked",
  KNOWN: "known",
  CHILD: "child"
});

export const RELATION_TYPES = Object.freeze({
  PARENT: "parent",
  OWNED_BY: "owned-by",
  HOSTED_BY: "hosted-by",
  AFFILIATED_WITH: "affiliated-with"
});

export const ENTITY_STATE_ORDER = Object.freeze([
  MONITORING_STATES.PRIORITY,
  MONITORING_STATES.ACTIVE,
  MONITORING_STATES.PARKED,
  MONITORING_STATES.KNOWN,
  MONITORING_STATES.CHILD
]);

export function isMonitoredState(state) {
  return state === MONITORING_STATES.PRIORITY || state === MONITORING_STATES.ACTIVE;
}
