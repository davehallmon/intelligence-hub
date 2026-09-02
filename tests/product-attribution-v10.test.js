// PierView.io v10 — production-path Product attribution acceptance fixtures.

import assert from "node:assert/strict";

import { CanonicalItemStore } from "../js/item-store.js";
import { queryLens } from "../js/lenses/lens-read-model.js";
import { classifyProductChange } from "../js/lenses/product-change-classifier.js";
import { normalizeFeedItem } from "../js/normalize.js";

function liveItem(title, source, profileId, summary = "") {
  return normalizeFeedItem({
    title,
    description: summary,
    link: `https://example.com/${encodeURIComponent(title.toLowerCase())}`
  }, {
    type: "news",
    source,
    profileIds: profileId ? [profileId] : [],
    badges: ["Official"]
  });
}

const gemini = liveItem(
  "Introducing Gemini 2.5: our most intelligent AI model",
  "Google DeepMind",
  "org-google-deepmind"
);
assert.deepEqual(gemini.productEntityIds, ["product-gemini"]);
assert.equal(gemini.productAttributions[0].method, "content-name");
assert.equal(gemini.productAttributions[0].matchedAlias, "gemini");
assert.equal(gemini.productAttributions[0].matchedField, "title");
assert.equal(
  gemini.productAttributions[0].reason,
  'Product name "Gemini" matched "gemini" in title'
);
const geminiLens = queryLens([gemini], "products-platforms");
assert.strictEqual(geminiLens.items[0], gemini, "Production-shaped Gemini item must enter the Product lens unchanged.");
assert.equal(geminiLens.entries[0].reasons[0], gemini.productAttributions[0].reason);

const ownerOnlyCases = [
  ["OpenAI publishes its updated preparedness framework", "OpenAI", "org-openai"],
  ["Microsoft Research shares a quantum-computing dataset", "Microsoft Research", "org-microsoft"],
  ["Google DeepMind maps proteins linked to disease", "Google DeepMind", "org-google-deepmind"],
  ["Anthropic publishes its responsible scaling policy", "Anthropic", "org-anthropic"],
  ["Instructure announces a new chief financial officer", "Instructure", "org-instructure"]
];
ownerOnlyCases.forEach(([title, source, profileId]) => {
  const item = liveItem(title, source, profileId);
  assert.deepEqual(
    item.productEntityIds,
    [],
    `${source} ownership alone must not assign its Products.`
  );
});

const constellation = liveItem(
  "The Gemini constellation is easiest to see this winter",
  "Astronomy Weekly",
  null
);
assert.deepEqual(constellation.productEntityIds, [], "Common-language Gemini must be rejected without Product context.");

const artCanvas = liveItem(
  "Artists prepare a large canvas for the community mural",
  "City Arts Journal",
  null
);
assert.deepEqual(artCanvas.productEntityIds, [], "Common-language canvas must not resolve to the Instructure Product.");

const genericAiMode = liveItem(
  "A new AI mode changes how the local editor searches files",
  "Developer Tools Weekly",
  null
);
assert.deepEqual(genericAiMode.productEntityIds, [], "Generic AI mode language must not resolve to Google AI Mode.");

const perplexityConcept = liveItem(
  "Researchers measure the perplexity of search results",
  "Statistics Review",
  null
);
assert.deepEqual(perplexityConcept.productEntityIds, [], "The technical term perplexity must not imply the Product.");

const canvas = liveItem(
  "Canvas adds a new course analytics workflow",
  "Instructure",
  "org-instructure"
);
assert.deepEqual(canvas.productEntityIds, ["product-canvas"]);

const claudeCode = liveItem(
  "Claude Code adds a new terminal workflow",
  "Anthropic",
  "org-anthropic"
);
assert.deepEqual(
  claudeCode.productEntityIds,
  ["product-claude-code"],
  "A specific Claude Code match must not broaden into generic Claude attribution."
);

const claudeSkill = liveItem(
  "Claude Skills add reusable writing workflows",
  "Anthropic",
  "org-anthropic"
);
assert.deepEqual(claudeSkill.productEntityIds, ["product-claude-skills"]);
const inherited = queryLens([claudeSkill], "products-platforms", { entityIds: ["product-claude"] });
assert.strictEqual(inherited.items[0], claudeSkill);
assert.equal(inherited.entries[0].matches[0].monitoringAnchorId, "product-claude");
assert.match(inherited.entries[0].reasons[0], /monitored through Priority Claude$/);

const parkedCodex = liveItem(
  "OpenAI Codex adds a repository review command",
  "OpenAI",
  "org-openai"
);
assert.deepEqual(parkedCodex.productEntityIds, ["product-openai-codex"]);
assert.equal(queryLens([parkedCodex], "products-platforms").items.length, 0);
assert.strictEqual(
  queryLens([parkedCodex], "products-platforms", { includeParked: true }).items[0],
  parkedCodex,
  "A named Parked Product must remain explicitly queryable without becoming continuous."
);

const genericChatGpt = liveItem(
  "New research compares ChatGPT and students on writing tasks",
  "Independent Research News",
  null
);
assert.deepEqual(genericChatGpt.productEntityIds, ["product-chatgpt"]);
assert.equal(classifyProductChange(genericChatGpt).meaningful, false);
assert.strictEqual(
  queryLens([genericChatGpt], "products-platforms").items[0],
  genericChatGpt,
  "Product attribution must remain separate from meaningful-change presentation filtering."
);

const explicit = normalizeFeedItem({
  title: "A capability announcement",
  link: "https://example.com/explicit-product"
}, {
  type: "news",
  source: "Verified integration",
  productEntityIds: ["product-notebooklm"]
});
assert.deepEqual(explicit.productEntityIds, ["product-notebooklm"]);
assert.equal(explicit.productAttributions[0].method, "explicit");

const shared = liveItem(
  "Claude adds a new assistant workflow",
  "Anthropic",
  "org-anthropic"
);
const store = new CanonicalItemStore();
store.replaceSource("news", [shared]);
const canonical = store.getItems()[0];
const people = queryLens(store.getItems(), "people-organizations");
const products = queryLens(store.getItems(), "products-platforms");
assert.strictEqual(people.items[0], canonical);
assert.strictEqual(products.items[0], canonical);
assert.strictEqual(people.items[0], products.items[0], "Cross-lens Product attribution must reuse one store object.");

console.log("Product attribution production-path fixtures passed.");
