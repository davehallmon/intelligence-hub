// Intelligence Hub v10 — canonical shared in-memory item store.
// Phase 5 introduces a shared deduplicated collection beneath legacy feed caches.
// It is intentionally session-only and does not persist content to localStorage.

function clean(value) {
  return String(value || "").trim();
}

export function canonicalStoreKey(item = {}) {
  const explicit = clean(
    item.dedupeKey || item.canonicalObjectKey || item.canonicalUrl || item.url
  );
  if (explicit) return explicit;

  const id = clean(item.id);
  if (id) return `id:${id}`;

  return "";
}

function publicEntry(entry) {
  return Object.freeze({
    key: entry.key,
    item: entry.item,
    sourceIds: Object.freeze([...entry.variants.keys()]),
    variantCount: entry.variants.size
  });
}

export class CanonicalItemStore {
  constructor() {
    this.entries = new Map();
    this.sourceKeys = new Map();
  }

  replaceSource(sourceId, items = []) {
    const source = clean(sourceId);
    if (!source) throw new Error("CanonicalItemStore.replaceSource requires a sourceId.");

    const nextByKey = new Map();
    (items || []).forEach(item => {
      const key = canonicalStoreKey(item);
      if (!key || nextByKey.has(key)) return;
      nextByKey.set(key, item);
    });

    const previousKeys = this.sourceKeys.get(source) || new Set();

    previousKeys.forEach(key => {
      if (nextByKey.has(key)) return;
      const entry = this.entries.get(key);
      if (!entry) return;

      const removedRepresentative = entry.representativeSourceId === source;
      entry.variants.delete(source);

      if (!entry.variants.size) {
        this.entries.delete(key);
        return;
      }

      if (removedRepresentative) {
        const [nextSourceId, nextItem] = entry.variants.entries().next().value;
        entry.representativeSourceId = nextSourceId;
        entry.item = nextItem;
      }
    });

    nextByKey.forEach((item, key) => {
      let entry = this.entries.get(key);
      if (!entry) {
        entry = {
          key,
          item,
          representativeSourceId: source,
          variants: new Map()
        };
        this.entries.set(key, entry);
      }

      entry.variants.set(source, item);
      if (entry.representativeSourceId === source) entry.item = item;
    });

    if (nextByKey.size) this.sourceKeys.set(source, new Set(nextByKey.keys()));
    else this.sourceKeys.delete(source);

    return Object.freeze({
      sourceId: source,
      inputCount: (items || []).length,
      canonicalCount: nextByKey.size,
      storeSize: this.entries.size
    });
  }

  clearSource(sourceId) {
    return this.replaceSource(sourceId, []);
  }

  clear() {
    this.entries.clear();
    this.sourceKeys.clear();
  }

  getItems() {
    return [...this.entries.values()].map(entry => entry.item);
  }

  getEntries() {
    return [...this.entries.values()].map(publicEntry);
  }

  getEntry(keyOrItem) {
    const key = typeof keyOrItem === "string"
      ? clean(keyOrItem)
      : canonicalStoreKey(keyOrItem || {});
    const entry = this.entries.get(key);
    return entry ? publicEntry(entry) : null;
  }

  getItemsForSource(sourceId) {
    const source = clean(sourceId);
    const keys = this.sourceKeys.get(source) || new Set();
    return [...keys]
      .map(key => this.entries.get(key)?.item)
      .filter(Boolean);
  }

  stats() {
    const variants = [...this.entries.values()]
      .reduce((sum, entry) => sum + entry.variants.size, 0);
    return Object.freeze({
      canonicalItems: this.entries.size,
      sourceMemberships: variants,
      sources: this.sourceKeys.size
    });
  }
}

export const SHARED_ITEM_STORE = new CanonicalItemStore();
