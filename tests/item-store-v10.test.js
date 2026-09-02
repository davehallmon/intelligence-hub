// Intelligence Hub v10 — Phase 5 shared-item-store acceptance fixtures.
// Development-time assertions only; not imported by the live UI.

import { CanonicalItemStore } from "../js/item-store.js";
import { queryLens } from "../js/lenses/lens-read-model.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function item(id, overrides = {}) {
  return {
    id,
    type: "news",
    objectType: "article",
    title: id,
    dedupeKey: `https://example.com/${id}`,
    canonicalObjectKey: `https://example.com/${id}`,
    canonicalUrl: `https://example.com/${id}`,
    topics: [],
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
    ...overrides
  };
}

export function validateItemStoreV10() {
  const results = [];

  const store = new CanonicalItemStore();
  const newsVariant = item("shared");
  const socialVariant = item("shared", { type: "social", source: "Direct outlet" });

  store.replaceSource("news", [newsVariant]);
  store.replaceSource("socials", [socialVariant]);
  assert(store.getItems().length === 1, "cross-source duplicates must collapse to one canonical item");
  assert(store.getItems()[0] === newsVariant, "first representative should remain stable while still present");
  assert(store.getEntry(newsVariant).variantCount === 2, "canonical entry must retain source-variant membership");
  results.push("cross-source-dedupe");

  store.clearSource("news");
  assert(store.getItems().length === 1, "removing one source must retain objects still present in another source");
  assert(store.getItems()[0] === socialVariant, "representative must transfer when its source disappears");
  results.push("representative-transfer");

  store.clearSource("socials");
  assert(store.getItems().length === 0, "orphaned canonical objects must leave the store");
  results.push("orphan-removal");

  const sameA = item("same-source");
  const sameB = item("same-source", { title: "duplicate variant" });
  store.replaceSource("news", [sameA, sameB]);
  assert(store.getItems().length === 1, "duplicates within one source must not duplicate the canonical store");
  assert(store.getItemsForSource("news").length === 1, "source membership must be canonicalized");
  results.push("same-source-dedupe");

  const oldItem = item("old");
  const newItem = item("new");
  store.replaceSource("news", [oldItem]);
  store.replaceSource("news", [newItem]);
  assert(!store.getEntry(oldItem), "source replacement must remove stale orphaned objects");
  assert(store.getEntry(newItem)?.item === newItem, "source replacement must add the new canonical object");
  results.push("source-replacement");

  const multiLens = item("multi-lens", {
    topics: ["AI Adoption & Future of Work"],
    entityIds: ["person-ethan-mollick", "product-chatgpt"],
    authorEntityIds: ["person-ethan-mollick"],
    productEntityIds: ["product-chatgpt"]
  });
  store.replaceSource("news", [multiLens]);
  const canonical = store.getItems()[0];
  const watchlist = queryLens(store.getItems(), "watchlist");
  const people = queryLens(store.getItems(), "people-organizations");
  const products = queryLens(store.getItems(), "products-platforms");
  assert(watchlist.items.length === 1 && people.items.length === 1 && products.items.length === 1,
    "one canonical store object must be selectable into multiple lenses");
  assert(watchlist.items[0] === canonical && people.items[0] === canonical && products.items[0] === canonical,
    "lens read models must retain the exact shared canonical object reference");
  results.push("shared-object-multi-lens");

  const stats = store.stats();
  assert(stats.canonicalItems === 1 && stats.sourceMemberships === 1 && stats.sources >= 1,
    "store stats must report canonical and source-membership counts separately");
  results.push("stats-boundary");

  return Object.freeze({ ok: true, fixtures: Object.freeze(results) });
}
