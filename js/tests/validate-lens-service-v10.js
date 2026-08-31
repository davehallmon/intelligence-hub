import assert from "node:assert/strict";

import { CanonicalItemStore } from "../item-store.js";
import { RuntimeLensService } from "../lens-service.js";

function object(overrides = {}) {
  return {
    id: "fixture",
    type: "news",
    objectType: "article",
    title: "Fixture",
    url: "https://example.com/fixture",
    canonicalUrl: "https://example.com/fixture",
    canonicalObjectKey: "https://example.com/fixture",
    dedupeKey: "https://example.com/fixture",
    entityIds: [],
    sourceEntityIds: [],
    authorEntityIds: [],
    publisherEntityIds: [],
    featuredEntityIds: [],
    mentionedEntityIds: [],
    organizationEntityIds: [],
    productEntityIds: [],
    publicationEntityIds: [],
    mediaEntityIds: [],
    communityEntityIds: [],
    researchSourceEntityIds: [],
    topics: [],
    evidenceType: null,
    ...overrides
  };
}

const store = new CanonicalItemStore();
const service = new RuntimeLensService(store);

// 1. Empty store produces empty runtime read models.
assert.equal(service.getCanonicalItems().length, 0);
assert.equal(service.query("watchlist").items.length, 0);
assert.equal(service.snapshot().store.canonicalItems, 0);

// 2. Runtime queries see newly ingested canonical objects immediately.
const overlap = object({
  id: "overlap",
  canonicalObjectKey: "fixture:overlap",
  dedupeKey: "fixture:overlap",
  canonicalUrl: "https://example.com/overlap",
  url: "https://example.com/overlap",
  entityIds: ["person-ethan-mollick", "product-chatgpt"],
  authorEntityIds: ["person-ethan-mollick"],
  productEntityIds: ["product-chatgpt"],
  topics: ["AI Adoption & Future of Work"]
});
store.replaceSource("news", [overlap]);

const watchlist = service.query("watchlist");
const people = service.query("people-organizations");
const products = service.query("products-platforms");
assert.equal(watchlist.items.length, 1);
assert.equal(people.items.length, 1);
assert.equal(products.items.length, 1);
assert.strictEqual(watchlist.items[0], overlap);
assert.strictEqual(people.items[0], overlap);
assert.strictEqual(products.items[0], overlap);

// 3. A built snapshot reflects the current store but is not used as a hidden cache.
const firstSnapshot = service.snapshot();
assert.equal(firstSnapshot.lensCounts.watchlist, 1);
assert.equal(firstSnapshot.store.canonicalItems, 1);

const research = object({
  id: "research",
  type: "research",
  objectType: "research",
  canonicalObjectKey: "fixture:research",
  dedupeKey: "fixture:research",
  canonicalUrl: "https://example.com/research",
  url: "https://example.com/research",
  evidenceType: "Research",
  researchSourceEntityIds: ["research-source-arxiv"],
  entityIds: ["research-source-arxiv"],
  topics: ["RAG"]
});
store.replaceSource("research", [research]);

assert.equal(firstSnapshot.store.canonicalItems, 1, "Existing snapshot remains an immutable point-in-time result.");
const secondSnapshot = service.snapshot();
assert.equal(secondSnapshot.store.canonicalItems, 2);
assert.equal(secondSnapshot.lensCounts.research, 1);
assert.equal(secondSnapshot.lensCounts.watchlist, 2);

// 4. Source invalidation is visible on the very next lens query.
store.clearSource("news");
assert.equal(service.query("people-organizations").items.length, 0);
assert.equal(service.query("products-platforms").items.length, 0);
assert.equal(service.query("watchlist").items.length, 1);

// 5. Canonical cross-source dedupe remains one lens object.
const sharedA = object({
  id: "shared-a",
  canonicalObjectKey: "fixture:shared",
  dedupeKey: "fixture:shared",
  canonicalUrl: "https://example.com/shared",
  url: "https://example.com/shared",
  entityIds: ["person-simon-willison"],
  authorEntityIds: ["person-simon-willison"]
});
const sharedB = { ...sharedA, id: "shared-b", source: "Second source" };
store.replaceSource("socials", [sharedA]);
store.replaceSource("academic", [sharedB]);
assert.equal(store.stats().canonicalItems, 2); // research + shared
assert.equal(store.stats().sourceMemberships, 3); // research + two variants of shared
assert.equal(service.query("people-organizations").items.length, 1);

// 6. Membership lookup works by canonical key and preserves semantic reasons.
const membership = service.membership("fixture:shared");
assert.equal(membership.length, 1);
assert.equal(membership[0].lensId, "people-organizations");
assert.ok(membership[0].reasons.some(reason => reason.includes("Simon Willison")));

// 7. Parked entities remain excluded by default and available explicitly.
const parked = object({
  id: "parked",
  canonicalObjectKey: "fixture:parked",
  dedupeKey: "fixture:parked",
  canonicalUrl: "https://example.com/parked",
  url: "https://example.com/parked",
  entityIds: ["person-sam-altman"],
  authorEntityIds: ["person-sam-altman"]
});
store.replaceSource("video", [parked]);
assert.equal(service.query("people-organizations").items.includes(parked), false);
assert.equal(service.query("people-organizations", { includeParked: true }).items.includes(parked), true);

// 8. Service is read-only with respect to store membership.
const before = store.stats();
service.build();
service.snapshot();
service.membership(research);
assert.deepEqual(store.stats(), before);

console.log("Phase 6 runtime lens service validation passed.");
