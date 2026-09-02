import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ENTITY_TYPES, MONITORING_STATES } from "../js/config/entity-types.js";
import { entitiesByType } from "../js/config/entities.js";
import { queryLens } from "../js/lenses/lens-read-model.js";
import { normalizeFeedItem } from "../js/normalize.js";
import {
  PRODUCT_CHANGE_TYPES,
  classifyProductChange
} from "../js/lenses/product-change-classifier.js";
import {
  filterProductEntries,
  monitoredProducts,
  sortProductLensEntries,
  sortedMonitoredProducts
} from "../js/lenses/products-platforms-ui.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function expect(source, snippet, label) {
  assert.ok(source.includes(snippet), `Missing ${label}: ${snippet}`);
}

const followed = monitoredProducts();
assert.equal(followed.length, 16, "Products & Platforms must expose exactly 6 Priority + 10 Active products.");
assert.equal(
  followed.filter(entity => entity.monitoringState === MONITORING_STATES.PRIORITY).length,
  6,
  "Priority Product count must match the ratified configuration."
);
assert.equal(
  followed.filter(entity => entity.monitoringState === MONITORING_STATES.ACTIVE).length,
  10,
  "Active Product count must match the ratified configuration."
);
assert.equal(
  followed.some(entity => ![MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE].includes(entity.monitoringState)),
  false,
  "Parked/Known/Child products must not consume continuous selector slots."
);
assert.equal(
  followed.every(entity => entity.type === ENTITY_TYPES.PRODUCT),
  true,
  "Products & Platforms selector must contain Product entities only."
);

const allProducts = entitiesByType(ENTITY_TYPES.PRODUCT);
assert.equal(allProducts.find(entity => entity.id === "product-claude-skills")?.parentId, "product-claude");
assert.equal(allProducts.find(entity => entity.id === "product-custom-gpts")?.parentId, "product-chatgpt");
assert.equal(allProducts.find(entity => entity.id === "product-storm")?.metadata?.continuousProductMonitoring, false);

const claudeSkill = normalizeFeedItem({
  title: "Anthropic adds a new Claude Skill for writing workflows",
  link: "https://example.com/claude-skill"
}, {
  type: "news",
  source: "Anthropic",
  productEntityIds: ["product-claude-skills"]
});
const customGpt = normalizeFeedItem({
  title: "OpenAI updates Custom GPTs with a new workflow control",
  link: "https://example.com/custom-gpt"
}, {
  type: "news",
  source: "OpenAI",
  productEntityIds: ["product-custom-gpts"]
});
const parkedCodex = normalizeFeedItem({
  title: "OpenAI Codex receives a feature update",
  link: "https://example.com/codex"
}, {
  type: "news",
  source: "OpenAI",
  productEntityIds: ["product-openai-codex"]
});

const claudeResult = queryLens([claudeSkill], "products-platforms", { entityIds: ["product-claude"] });
assert.equal(claudeResult.items.includes(claudeSkill), true, "Claude Skills must inherit selection through monitored parent Claude.");
assert.equal(claudeResult.entries[0].matches[0].monitoringAnchorId, "product-claude");

const chatgptResult = queryLens([customGpt], "products-platforms", { entityIds: ["product-chatgpt"] });
assert.equal(chatgptResult.items.includes(customGpt), true, "Custom GPTs must inherit selection through monitored parent ChatGPT.");
assert.equal(chatgptResult.entries[0].matches[0].monitoringAnchorId, "product-chatgpt");

assert.equal(
  queryLens([parkedCodex], "products-platforms").items.includes(parkedCodex),
  false,
  "Parked OpenAI Codex must not enter continuous Product monitoring by default."
);
assert.equal(
  queryLens([parkedCodex], "products-platforms", { includeParked: true }).items.includes(parkedCodex),
  true,
  "Parked products must remain explicitly queryable."
);

const workflowChange = classifyProductChange({ title: "ChatGPT adds a new Projects workflow for team handoffs" });
assert.equal(workflowChange.meaningful, true);
assert.equal(workflowChange.types.includes(PRODUCT_CHANGE_TYPES.WORKFLOW), true);

const modelChange = classifyProductChange({ title: "Claude releases an updated reasoning model with a larger context window" });
assert.equal(modelChange.meaningful, true);
assert.equal(modelChange.types.includes(PRODUCT_CHANGE_TYPES.MODEL), true);

const integrationChange = classifyProductChange({ title: "NotebookLM adds a Google Drive connector and export integration" });
assert.equal(integrationChange.meaningful, true);
assert.equal(integrationChange.types.includes(PRODUCT_CHANGE_TYPES.INTEGRATION), true);

const documentationChange = classifyProductChange({ title: "Claude Code release notes: updated API migration guide" });
assert.equal(documentationChange.meaningful, true);
assert.equal(documentationChange.types.includes(PRODUCT_CHANGE_TYPES.DOCUMENTATION), true);

const genericMention = classifyProductChange({ title: "New research compares ChatGPT and students on writing tasks" });
assert.equal(genericMention.meaningful, false, "Generic Product mentions must not be promoted as meaningful Product changes.");

const meaningfulEntry = Object.freeze({ item: Object.freeze({ id: "meaningful", title: "Gemini adds a new workflow mode" }) });
const genericEntry = Object.freeze({ item: Object.freeze({ id: "generic", title: "Researchers discuss Gemini in education" }) });
assert.deepEqual(
  filterProductEntries([meaningfulEntry, genericEntry], "meaningful").map(entry => entry.item.id),
  ["meaningful"],
  "Default Product presentation must filter generic mentions."
);
assert.deepEqual(
  filterProductEntries([meaningfulEntry, genericEntry], "all").map(entry => entry.item.id),
  ["meaningful", "generic"],
  "All matched items mode must preserve generic canonical Product matches."
);

const older = Object.freeze({ item: Object.freeze({ id: "older", publishedAt: "2026-08-28T12:00:00Z" }) });
const newer = Object.freeze({ item: Object.freeze({ id: "newer", publishedAt: "2026-08-30T12:00:00Z" }) });
const undated = Object.freeze({ item: Object.freeze({ id: "undated" }) });
const sorted = sortProductLensEntries([older, undated, newer]);
assert.deepEqual(sorted.map(entry => entry.item.id), ["newer", "older", "undated"]);
assert.deepEqual(
  [older, undated, newer].map(entry => entry.item.id),
  ["older", "undated", "newer"],
  "Product presentation sorting must not mutate the lens result array."
);
assert.equal(sortedMonitoredProducts()[0].monitoringState, MONITORING_STATES.PRIORITY);

const dashboard = read("js/dashboard.js");
const navigation = read("js/navigation.js");
const phase4 = read("js/phase4.js");
const productCss = read("css/lenses/products-platforms.css");
const productUi = read("js/lenses/products-platforms-ui.js");

expect(navigation, '"people-organizations", "products-platforms", "launchpad"', "Products primary route order");
expect(dashboard, 'initProductsPlatformsUI', "Products runtime initialization");
expect(dashboard, 'if (tab === "products-platforms")', "Products navigation/refresh routing");
expect(dashboard, 'milestone: "V10-M09"', "stable runtime milestone identifier");
expect(phase4, '"people-organizations", "products-platforms", "news"', "Products refreshable shared-shell route");
expect(phase4, '"peopleOrganizationsFeed", "productsPlatformsFeed", "newsFeed"', "Products Saved observer container");
expect(phase4, 'productsPlatformsFeed: "products-platforms"', "Products retry routing");
expect(phase4, 'tab === "products-platforms"', "Products mobile shell handoff");
expect(phase4, '.product-lens-controls__inputs', "Products shared bottom-control handoff");
expect(productCss, '#productsPlatformsRefresh', "mobile Products refresh removal");
expect(productCss, '.context-controls .product-lens-controls__inputs', "Products bottom-control styling");
expect(productUi, 'queryLens("products-platforms"', "Products shared lens-service query");
expect(productUi, 'Meaningful changes', "meaningful-change default control");

console.log("Products & Platforms V10-M09 fixtures passed.");
