import assert from "node:assert/strict";
import { MONITORING_STATES } from "../config/entity-types.js";
import { queryLens } from "../lens-read-model.js";
import {
  continuousWatchlistTopics,
  sortWatchlistEntries,
  watchlistTopicCounts
} from "../watchlist-ui.js";

const monitored = continuousWatchlistTopics();
assert.equal(monitored.length, 12, "Watchlist continuous controls must expose exactly 12 ratified topics.");
assert.equal(
  monitored.filter(topic => topic.state === MONITORING_STATES.PRIORITY).length,
  5,
  "Watchlist must expose exactly five Priority topics."
);
assert.equal(
  monitored.filter(topic => topic.state === MONITORING_STATES.ACTIVE).length,
  7,
  "Watchlist must expose exactly seven Active topics."
);
assert.equal(
  monitored.some(topic => topic.state === MONITORING_STATES.PARKED),
  false,
  "Parked topics must not enter continuous Watchlist controls."
);

const older = Object.freeze({
  item: Object.freeze({ id: "older", publishedAt: "2026-08-28T12:00:00Z" }),
  matchedTopicIds: Object.freeze(["ai-adoption-future-work"])
});
const newer = Object.freeze({
  item: Object.freeze({ id: "newer", publishedAt: "2026-08-30T12:00:00Z" }),
  matchedTopicIds: Object.freeze(["prompt-harness-workflow", "rag-retrieval-knowledge"])
});
const undated = Object.freeze({
  item: Object.freeze({ id: "undated" }),
  matchedTopicIds: Object.freeze(["ai-literacy-fluency", "ai-literacy-fluency"])
});

const sorted = sortWatchlistEntries([older, undated, newer]);
assert.deepEqual(
  sorted.map(entry => entry.item.id),
  ["newer", "older", "undated"],
  "Visible Watchlist items should be presented newest-first without changing lens selection."
);
assert.deepEqual(
  [older, undated, newer].map(entry => entry.item.id),
  ["older", "undated", "newer"],
  "Visible sorting must not mutate the lens result array."
);

const counts = watchlistTopicCounts([older, newer, undated]);
assert.equal(counts["ai-adoption-future-work"], 1);
assert.equal(counts["prompt-harness-workflow"], 1);
assert.equal(counts["rag-retrieval-knowledge"], 1);
assert.equal(counts["ai-literacy-fluency"], 1, "Duplicate topic IDs within one entry count once.");
assert.equal(counts["ai-education-learning"], 0, "Monitored topics with no current items remain visible with a zero count.");

const liveArticle = Object.freeze({
  id: "live-article",
  type: "news",
  objectType: "article",
  topics: Object.freeze(["AI Adoption & Future of Work"]),
  entityIds: Object.freeze([])
});
const libraryHighlight = Object.freeze({
  id: "library-highlight",
  type: "highlight",
  objectType: "highlight",
  sourceEndpointId: "endpoint-readwise-local",
  topics: Object.freeze(["AI Adoption & Future of Work"]),
  entityIds: Object.freeze([])
});

const continuousResult = queryLens([liveArticle, libraryHighlight], "watchlist");
assert.deepEqual(
  continuousResult.items.map(item => item.id),
  ["live-article"],
  "Library/Readwise highlights must not leak into continuous Watchlist monitoring."
);
const investigationResult = queryLens([liveArticle, libraryHighlight], "watchlist", { includeKnowledge: true });
assert.deepEqual(
  investigationResult.items.map(item => item.id),
  ["live-article", "library-highlight"],
  "Knowledge objects remain explicitly queryable when a future investigation opts in."
);

console.log("Watchlist visible migration fixtures passed.");
