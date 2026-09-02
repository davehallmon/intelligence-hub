// Intelligence Hub v10 — V10-M09 deterministic Product change classifier.
// This is a presentation/read-model aid only. It does not mutate canonical items,
// change ingestion, alter provenance, or promote items into Focus.

export const PRODUCT_CHANGE_TYPES = Object.freeze({
  MODEL: "model",
  FEATURE: "feature",
  WORKFLOW: "workflow",
  INTEGRATION: "integration",
  DOCUMENTATION: "documentation"
});

const CHANGE_TYPE_LABELS = Object.freeze({
  [PRODUCT_CHANGE_TYPES.MODEL]: "Model change",
  [PRODUCT_CHANGE_TYPES.FEATURE]: "Feature change",
  [PRODUCT_CHANGE_TYPES.WORKFLOW]: "Workflow / UI",
  [PRODUCT_CHANGE_TYPES.INTEGRATION]: "Integration",
  [PRODUCT_CHANGE_TYPES.DOCUMENTATION]: "Documentation"
});

const CHANGE_VERB = /\b(adds?|added|introduces?|introduced|launches?|launched|releases?|released|rolls? out|rolled out|ships?|shipped|updates?|updated|upgrades?|upgraded|expands?|expanded|supports?|supported|enables?|enabled|integrates?|integrated|redesigns?|redesigned|deprecates?|deprecated|retires?|retired|sunsets?|sunset)\b/i;
const RELEASE_NOTE = /\b(release notes?|changelog|what(?:'|’)s new|version\s+\d+(?:\.\d+)*)\b/i;

const TYPE_PATTERNS = Object.freeze([
  Object.freeze({
    type: PRODUCT_CHANGE_TYPES.MODEL,
    pattern: /\b(model|reasoning model|context window|gpt[-\s]?\d|claude\s+(?:opus|sonnet|haiku|\d)|gemini\s+\d)\b/i
  }),
  Object.freeze({
    type: PRODUCT_CHANGE_TYPES.FEATURE,
    pattern: /\b(feature|capabilit(?:y|ies)|mode|tooling|tool use|functionality)\b/i
  }),
  Object.freeze({
    type: PRODUCT_CHANGE_TYPES.WORKFLOW,
    pattern: /\b(workflow|user interface|\bui\b|sidebar|workspace|project|projects|memory|custom instructions|agent mode|voice mode|desktop app|mobile app|canvas view)\b/i
  }),
  Object.freeze({
    type: PRODUCT_CHANGE_TYPES.INTEGRATION,
    pattern: /\b(integration|integrates?|connector|plugin|extension|sync|import|export|\bmcp\b|\bapi\b)\b/i
  }),
  Object.freeze({
    type: PRODUCT_CHANGE_TYPES.DOCUMENTATION,
    pattern: /\b(documentation|\bdocs\b|developer guide|migration guide|release notes?|changelog|deprecat(?:e|ed|ion))\b/i
  })
]);

const NEW_TYPE_PATTERNS = Object.freeze([
  [PRODUCT_CHANGE_TYPES.MODEL, /\bnew\b.{0,36}\b(model|reasoning model|context window|gpt[-\s]?\d|claude|gemini)\b/i],
  [PRODUCT_CHANGE_TYPES.FEATURE, /\bnew\b.{0,36}\b(feature|capabilit(?:y|ies)|mode|tool)\b/i],
  [PRODUCT_CHANGE_TYPES.WORKFLOW, /\bnew\b.{0,36}\b(workflow|interface|sidebar|workspace|project|memory|agent mode|voice mode|desktop app|mobile app)\b/i],
  [PRODUCT_CHANGE_TYPES.INTEGRATION, /\bnew\b.{0,36}\b(integration|connector|plugin|extension|sync|import|export|mcp|api)\b/i]
]);

function itemText(item = {}) {
  return [
    item.title,
    item.summary,
    item.snippet,
    item.description,
    item.content
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function changeTypeLabel(type) {
  return CHANGE_TYPE_LABELS[type] || "Product change";
}

export function classifyProductChange(item = {}) {
  const text = itemText(item);
  if (!text) {
    return Object.freeze({ meaningful: false, types: Object.freeze([]), labels: Object.freeze([]) });
  }

  const hasChangeVerb = CHANGE_VERB.test(text);
  const hasReleaseNote = RELEASE_NOTE.test(text);
  const types = [];

  TYPE_PATTERNS.forEach(({ type, pattern }) => {
    if (pattern.test(text) && (hasChangeVerb || type === PRODUCT_CHANGE_TYPES.DOCUMENTATION || hasReleaseNote)) {
      types.push(type);
    }
  });

  NEW_TYPE_PATTERNS.forEach(([type, pattern]) => {
    if (pattern.test(text)) types.push(type);
  });

  // A clear product-change verb with no narrower category is treated as a
  // feature change. This catches titles such as "Canvas introduces X" without
  // making bare "new research about ChatGPT" meaningful by default.
  if (hasChangeVerb && !types.length) types.push(PRODUCT_CHANGE_TYPES.FEATURE);
  if (hasReleaseNote && !types.includes(PRODUCT_CHANGE_TYPES.DOCUMENTATION)) {
    types.push(PRODUCT_CHANGE_TYPES.DOCUMENTATION);
  }

  const normalizedTypes = unique(types);
  return Object.freeze({
    meaningful: normalizedTypes.length > 0,
    types: Object.freeze(normalizedTypes),
    labels: Object.freeze(normalizedTypes.map(changeTypeLabel))
  });
}

export function filterMeaningfulProductEntries(entries = []) {
  return Object.freeze((entries || []).filter(entry => classifyProductChange(entry?.item).meaningful));
}
