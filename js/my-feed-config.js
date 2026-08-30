// Intelligence Hub v9.0 — deterministic My Feed ranking configuration.
// These values are explicit and inspectable. No click tracking or hidden learning is used.

export const MY_FEED_DEFAULT_HIGH_TOPICS = Object.freeze([
  "AI Agents",
  "AI Adoption & Future of Work",
  "AI Literacy",
  "AI-powered Coding",
  "Context Engineering",
  "Prompt Engineering",
  "LLM-as-a-Judge",
  "AI Evaluation & Benchmarking"
]);

export const MY_FEED_SOURCE_TABS = Object.freeze([
  "news",
  "socials",
  "academic",
  "research",
  "video"
]);

export const MY_FEED_LIMITS = Object.freeze({
  attention: 8,
  broader: 40,
  attentionCaps: Object.freeze({ source: 2, profile: 2, topic: 3, type: 3 }),
  broaderCaps: Object.freeze({ source: 5, profile: 5, topic: 10, type: 14 })
});

export const MY_FEED_WEIGHTS = Object.freeze({
  preference: Object.freeze({ high: 16, normal: 0, lower: -10 }),
  profileTier: Object.freeze({
    "core-active": 12,
    "selective-active": 5,
    "watchlist-only": 0
  }),
  provenance: Object.freeze({
    official: 12,
    direct: 10,
    socialBridge: 7,
    academicDirect: 6,
    research: 7,
    coverage: 3,
    googleNewsFallback: 2
  })
});

export const PRIORITY_LEVELS = Object.freeze(["high", "normal", "lower"]);
