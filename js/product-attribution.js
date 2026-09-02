// PierView.io v10 — deterministic Product relationship attribution.
// Product names must be present in item content. Source ownership may disambiguate
// a name, but it never assigns every Product owned by a source organization.

import { ENTITY_TYPES } from "./config/entity-types.js";
import { getEntity } from "./config/entities.js";

const RULE_DEFINITIONS = Object.freeze([
  ["product-chatgpt", ["chatgpt"]],
  ["product-claude", ["claude"], { context: ["anthropic", "claude ai", "ai assistant", "ai model", "claude api"], exclude: ["claude code", "claude skills"] }],
  ["product-gemini", ["gemini"], { context: ["google", "deepmind", "gemini ai", "ai assistant", "ai model", "multimodal model", "gemini api"] }],
  ["product-notebooklm", ["notebooklm", "notebook lm"]],
  ["product-google-labs", ["google labs"]],
  ["product-canvas", ["instructure canvas", "canvas lms", "canvas"], { context: ["instructure", "lms", "learning management"] }],
  ["product-m365-copilot", ["microsoft 365 copilot", "m365 copilot"]],
  ["product-perplexity", ["perplexity ai", "perplexity"], { context: ["perplexity ai", "ai search", "answer engine", "ai assistant"] }],
  ["product-google-ai-mode", ["google ai mode", "ai mode"], { context: ["google"] }],
  ["product-claude-code", ["claude code"]],
  ["product-google-ai-studio", ["google ai studio", "ai studio"], { context: ["google", "gemini"] }],
  ["product-openrouter", ["openrouter"]],
  ["product-ollama", ["ollama"]],
  ["product-lm-studio", ["lm studio"]],
  ["product-midjourney", ["midjourney"]],
  ["product-google-workspace-ai", ["google workspace ai", "gemini for google workspace", "gemini in google workspace", "workspace ai"]],
  ["product-openai-codex", ["openai codex", "codex cli"]],
  ["product-microsoft-copilot-studio", ["microsoft copilot studio", "copilot studio"]],
  ["product-github-copilot", ["github copilot"]],
  ["product-hugging-face", ["hugging face hub", "hugging face platform"]],
  ["product-n8n", ["n8n"]],
  ["product-google-flow", ["google flow"]],
  ["product-ideogram", ["ideogram ai", "ideogram"], { context: ["ideogram ai", "image model", "text to image"] }],
  ["product-adobe-firefly", ["adobe firefly"]],
  ["product-runway", ["runway ai", "runway gen 4", "runway gen4"]],
  ["product-canva-ai", ["canva ai", "canva magic studio", "magic studio"]],
  ["product-sharepoint-copilot", ["sharepoint copilot", "sharepoint and copilot"]],
  ["product-teams-m365-ai", ["microsoft teams ai", "teams copilot", "teams and copilot"]],
  ["product-claude-skills", ["claude skills", "claude skill"]],
  ["product-custom-gpts", ["custom gpts", "custom gpt"]],
  ["product-storm", ["stanford storm", "storm research tool"], { context: ["stanford", "research", "writing tool"] }]
]);

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalized(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function includesPhrase(text, phrase) {
  const haystack = ` ${normalized(text)} `;
  const needle = normalized(phrase);
  return Boolean(needle) && haystack.includes(` ${needle} `);
}

function entityAndAncestorIds(entityId) {
  const ids = [];
  const seen = new Set();
  let entity = getEntity(entityId);
  while (entity && !seen.has(entity.id)) {
    ids.push(entity.id);
    seen.add(entity.id);
    entity = entity.parentId ? getEntity(entity.parentId) : null;
  }
  return ids;
}

function ownerIds(product) {
  return (product?.relations || [])
    .filter(relation => relation.type === "owned-by")
    .map(relation => relation.targetId);
}

function hasOwnerContext(product, sourceEntityIds) {
  const owners = new Set(ownerIds(product));
  if (!owners.size) return false;
  return (sourceEntityIds || []).some(sourceId =>
    entityAndAncestorIds(sourceId).some(entityId => owners.has(entityId))
  );
}

function rule(entityId, aliases, options = {}) {
  return Object.freeze({
    entityId,
    aliases: Object.freeze(unique(aliases.map(normalized))),
    context: Object.freeze(unique((options.context || []).map(normalized))),
    exclude: Object.freeze(unique((options.exclude || []).map(normalized)))
  });
}

export const PRODUCT_ATTRIBUTION_RULES = Object.freeze(
  RULE_DEFINITIONS.map(([entityId, aliases, options]) => rule(entityId, aliases, options))
);

function explicitAttribution(entityId) {
  const entity = getEntity(entityId);
  return Object.freeze({
    entityId,
    method: "explicit",
    matchedAlias: null,
    matchedField: null,
    reason: `Explicit Product relationship: ${entity?.name || entityId}`
  });
}

function derivedAttribution(ruleDefinition, matchedAlias, matchedField) {
  const entity = getEntity(ruleDefinition.entityId);
  return Object.freeze({
    entityId: ruleDefinition.entityId,
    method: "content-name",
    matchedAlias,
    matchedField,
    reason: `Product name "${entity?.name || ruleDefinition.entityId}" matched "${matchedAlias}" in ${matchedField}`
  });
}

function matchingAlias(ruleDefinition, fieldValue) {
  return [...ruleDefinition.aliases]
    .sort((a, b) => b.length - a.length)
    .find(alias => includesPhrase(fieldValue, alias)) || null;
}

function ruleHasRequiredContext(ruleDefinition, product, candidateText, sourceEntityIds) {
  if (!ruleDefinition.context.length) return true;
  if (hasOwnerContext(product, sourceEntityIds)) return true;
  return ruleDefinition.context.some(term => includesPhrase(candidateText, term));
}

export function resolveProductAttributions({
  title = "",
  summary = "",
  sourceEntityIds = [],
  explicitProductEntityIds = []
} = {}) {
  const explicitIds = unique(explicitProductEntityIds)
    .filter(entityId => getEntity(entityId)?.type === ENTITY_TYPES.PRODUCT);
  const attributed = explicitIds.map(explicitAttribution);
  const seen = new Set(explicitIds);
  const candidateText = `${title} ${summary}`;

  PRODUCT_ATTRIBUTION_RULES.forEach(ruleDefinition => {
    if (seen.has(ruleDefinition.entityId)) return;
    const product = getEntity(ruleDefinition.entityId);
    if (!product || product.type !== ENTITY_TYPES.PRODUCT) return;
    if (ruleDefinition.exclude.some(phrase => includesPhrase(candidateText, phrase))) return;

    const titleAlias = matchingAlias(ruleDefinition, title);
    const summaryAlias = titleAlias ? null : matchingAlias(ruleDefinition, summary);
    const matchedAlias = titleAlias || summaryAlias;
    if (!matchedAlias) return;
    if (!ruleHasRequiredContext(ruleDefinition, product, candidateText, sourceEntityIds)) return;

    attributed.push(derivedAttribution(
      ruleDefinition,
      matchedAlias,
      titleAlias ? "title" : "summary"
    ));
    seen.add(ruleDefinition.entityId);
  });

  return Object.freeze(attributed);
}
