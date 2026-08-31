// Intelligence Hub v10 — normalized intelligence-object enrichment.
// Phase 2 is additive: legacy normalized fields remain authoritative for the live v9.x UI.

import { getEntity, resolveEntityAlias } from "./config/entities.js";
import { ENTITY_TYPES } from "./config/entity-types.js";
import { EVIDENCE_TYPES, VERIFICATION_STATUS } from "./config/evidence-types.js";
import { legacyProfileIdsToEntityIds } from "./config/legacy-map.js";
import { SOURCE_ENDPOINTS } from "./connectors/catalog.js";

const TRACKING_PARAMS = new Set([
  "fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid", "mkt_tok",
  "igshid", "vero_conv", "vero_id"
]);

const EVIDENCE_VALUES = new Set(Object.values(EVIDENCE_TYPES));
const VERIFICATION_VALUES = new Set(Object.values(VERIFICATION_STATUS));

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function refValue(ref) {
  if (typeof ref === "string") return clean(ref);
  if (!ref || typeof ref !== "object") return "";
  return clean(ref.id || ref.entityId || ref.name || "");
}

function resolveEntityRefs(refs = []) {
  return unique(asArray(refs).flatMap(ref => {
    const value = refValue(ref);
    if (!value) return [];
    if (getEntity(value)) return [value];
    const resolved = resolveEntityAlias(value);
    return resolved ? [resolved] : [];
  }));
}

function entityIdsForType(ids, type) {
  return unique(ids.filter(id => getEntity(id)?.type === type));
}

function normalizeEndpointName(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function legacyTabForType(type) {
  return ({ social: "socials", highlight: "books" })[type] || type || "";
}

function resolveSourceEndpoint(base, item = {}, context = {}) {
  const explicitId = clean(
    context.sourceEndpointId || item.sourceEndpointId || context.endpointId || item.endpointId
  );
  if (explicitId) return SOURCE_ENDPOINTS.find(endpoint => endpoint.id === explicitId) || null;

  if (base.type === "highlight") {
    return SOURCE_ENDPOINTS.find(endpoint => endpoint.id === "endpoint-readwise-local") || null;
  }

  const candidateUrls = unique([
    clean(context.feedUrl),
    clean(item.feedUrl),
    clean(base.sourceUrl)
  ]);
  for (const url of candidateUrls) {
    const exact = SOURCE_ENDPOINTS.find(endpoint => clean(endpoint.url) === url);
    if (exact) return exact;
  }

  const sourceName = normalizeEndpointName(base.source);
  const legacyTab = legacyTabForType(base.type);
  if (!sourceName) return null;

  const matches = SOURCE_ENDPOINTS.filter(endpoint =>
    normalizeEndpointName(endpoint.name) === sourceName &&
    (!legacyTab || !endpoint.legacyTab || endpoint.legacyTab === legacyTab)
  );
  return matches.length === 1 ? matches[0] : null;
}

export function canonicalizeUrl(value) {
  const raw = clean(value);
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    [...parsed.searchParams.keys()].forEach(key => {
      const lower = key.toLowerCase();
      if (lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)) parsed.searchParams.delete(key);
    });
    parsed.searchParams.sort();
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    return parsed.toString();
  } catch {
    return raw.replace(/#.*$/, "");
  }
}

function objectTypeFor(legacyType) {
  return ({
    news: "article",
    social: "article",
    academic: "article",
    research: "research",
    video: "video",
    highlight: "highlight"
  })[legacyType] || legacyType || "article";
}

function badgeSet(base) {
  return new Set((base.badges || []).map(value => clean(value).toLowerCase()));
}

function isCoverage(base) {
  const badges = badgeSet(base);
  return badges.has("coverage") || badges.has("google news fallback");
}

function deriveEvidenceType(base, item = {}, context = {}) {
  const explicit = clean(context.evidenceType || item.evidenceType);
  if (EVIDENCE_VALUES.has(explicit)) return explicit;

  const badges = badgeSet(base);
  if (base.type === "research") return EVIDENCE_TYPES.RESEARCH;
  if (badges.has("coverage") || badges.has("google news fallback")) {
    return EVIDENCE_TYPES.INDEPENDENT_REPORTING;
  }
  if (badges.has("official") || badges.has("direct")) return EVIDENCE_TYPES.PRIMARY_SOURCE;
  if (base.type === "academic") return EVIDENCE_TYPES.INDEPENDENT_REPORTING;
  if (base.type === "community") return EVIDENCE_TYPES.COMMUNITY_UNVERIFIED;
  return null;
}

function deriveVerificationStatus(item = {}, context = {}, evidenceType) {
  const explicit = clean(context.verificationStatus || item.verificationStatus);
  if (VERIFICATION_VALUES.has(explicit)) return explicit;
  if (evidenceType === EVIDENCE_TYPES.COMMUNITY_UNVERIFIED) return VERIFICATION_STATUS.UNVERIFIED;
  return VERIFICATION_STATUS.UNVERIFIED;
}

function explicitRefs(item, context, names) {
  return names.flatMap(name => [
    ...asArray(context?.[name]),
    ...asArray(item?.[name])
  ]);
}

function buildRelationships(base, item = {}, context = {}, endpoint = null) {
  const rawSeedRefs = [
    ...asArray(context.profileIds),
    ...asArray(context.profiles),
    ...asArray(item.profileIds),
    ...asArray(item.profiles)
  ];
  const seededEntityIds = resolveEntityRefs(rawSeedRefs);
  const legacyDetectedEntityIds = legacyProfileIdsToEntityIds(base.profileIds || []);

  const authoredBy = entityIdsForType(resolveEntityRefs([
    ...explicitRefs(item, context, ["authorEntityIds", "authoredBy"]),
    ...(base.authors || [])
  ]), ENTITY_TYPES.PERSON);

  const explicitPublishers = resolveEntityRefs(explicitRefs(item, context, [
    "publisherEntityIds", "publishedBy"
  ]));

  const endpointPublishers = !isCoverage(base) ? (endpoint?.entityIds || []) : [];
  const sourcePublisher = !isCoverage(base) ? resolveEntityRefs([base.source]) : [];
  const seededPublishers = !isCoverage(base) ? seededEntityIds : [];
  const publishedBy = unique([
    ...explicitPublishers,
    ...endpointPublishers,
    ...sourcePublisher,
    ...seededPublishers
  ]);

  const featuring = resolveEntityRefs(explicitRefs(item, context, [
    "featuredEntityIds", "featuring"
  ]));

  const explicitMentions = resolveEntityRefs(explicitRefs(item, context, [
    "mentionedEntityIds", "mentioned", "aboutEntityIds", "about"
  ]));
  const roleAssigned = new Set([...authoredBy, ...publishedBy, ...featuring]);
  const autoMentions = unique([
    ...(isCoverage(base) ? seededEntityIds : []),
    ...legacyDetectedEntityIds
  ]).filter(id => !roleAssigned.has(id));
  const mentioned = unique([...explicitMentions, ...autoMentions]);

  const explicitlyRelated = resolveEntityRefs(explicitRefs(item, context, [
    "entityIds", "relatedEntityIds",
    "organizationEntityIds", "productEntityIds", "publicationEntityIds",
    "mediaEntityIds", "communityEntityIds", "researchSourceEntityIds"
  ]));

  const all = unique([
    ...legacyDetectedEntityIds,
    ...seededEntityIds,
    ...authoredBy,
    ...publishedBy,
    ...featuring,
    ...mentioned,
    ...explicitlyRelated
  ]);

  return Object.freeze({
    authoredBy: Object.freeze(authoredBy),
    publishedBy: Object.freeze(publishedBy),
    featuring: Object.freeze(featuring),
    mentioned: Object.freeze(mentioned),
    all: Object.freeze(all),
    organizations: Object.freeze(entityIdsForType(all, ENTITY_TYPES.ORGANIZATION)),
    products: Object.freeze(entityIdsForType(all, ENTITY_TYPES.PRODUCT)),
    publications: Object.freeze(entityIdsForType(all, ENTITY_TYPES.PUBLICATION)),
    media: Object.freeze(entityIdsForType(all, ENTITY_TYPES.MEDIA)),
    communities: Object.freeze(entityIdsForType(all, ENTITY_TYPES.COMMUNITY)),
    researchSources: Object.freeze(entityIdsForType(all, ENTITY_TYPES.RESEARCH_SOURCE))
  });
}

export function enrichIntelligenceObject(base, item = {}, context = {}) {
  const canonicalUrl = canonicalizeUrl(item.canonicalUrl || context.canonicalUrl || base.url);
  const endpoint = resolveSourceEndpoint(base, item, context);
  const relationships = buildRelationships(base, item, context, endpoint);
  const evidenceType = deriveEvidenceType(base, item, context);
  const verificationStatus = deriveVerificationStatus(item, context, evidenceType);
  const explicitCanonicalKey = clean(
    item.canonicalObjectKey || context.canonicalObjectKey || item.canonicalKey || context.canonicalKey
  );
  const canonicalObjectKey = explicitCanonicalKey || canonicalUrl || clean(base.id);
  const privateSource = Boolean(
    context.private || item.private || String(base.transport || "").includes("private")
  );

  return {
    ...base,
    objectType: objectTypeFor(base.type),
    canonicalUrl,
    canonicalObjectKey,
    dedupeKey: canonicalObjectKey,
    sourceEndpointId: endpoint?.id || clean(context.sourceEndpointId || item.sourceEndpointId),
    entityIds: relationships.all,
    authorEntityIds: relationships.authoredBy,
    publisherEntityIds: relationships.publishedBy,
    featuredEntityIds: relationships.featuring,
    mentionedEntityIds: relationships.mentioned,
    organizationEntityIds: relationships.organizations,
    productEntityIds: relationships.products,
    publicationEntityIds: relationships.publications,
    mediaEntityIds: relationships.media,
    communityEntityIds: relationships.communities,
    researchSourceEntityIds: relationships.researchSources,
    relationships,
    evidenceType,
    verificationStatus,
    provenance: Object.freeze({
      sourceEndpointId: endpoint?.id || null,
      sourceLabel: base.source || "",
      sourceUrl: base.sourceUrl || "",
      transport: base.transport || "",
      privacy: privateSource ? "private" : "public",
      badges: Object.freeze([...(base.badges || [])])
    })
  };
}
