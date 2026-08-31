import assert from "node:assert/strict";
import { MONITORING_STATES } from "../config/entity-types.js";
import {
  SOURCE_COVERAGE_LEVELS,
  monitoredPeopleOrganizations,
  sourceCoverageForEntity,
  summarizeMonitoredEntitySourceCoverage
} from "../entity-source-coverage.js";
import { sortEntityLensEntries, sortedMonitoredEntities } from "../people-organizations-ui.js";

const followed = monitoredPeopleOrganizations();
const summary = summarizeMonitoredEntitySourceCoverage();

assert.equal(followed.length, 32, "People & Organizations must expose exactly 32 monitored entities.");
assert.equal(summary.people, 19, "People count must match the ratified 7 Priority + 12 Active set.");
assert.equal(summary.organizations, 13, "Organization count must match the ratified 5 Priority + 8 Active set.");
assert.equal(summary.priority, 12, "Priority entity count must be 7 people + 5 organizations.");
assert.equal(summary.active, 20, "Active entity count must be 12 people + 8 organizations.");
assert.equal(
  followed.some(entity => ![MONITORING_STATES.PRIORITY, MONITORING_STATES.ACTIVE].includes(entity.monitoringState)),
  false,
  "Parked/Known entities must not enter the continuously followed selector."
);

assert.equal(sourceCoverageForEntity("org-openai").level, SOURCE_COVERAGE_LEVELS.DIRECT);
assert.equal(sourceCoverageForEntity("org-anthropic").level, SOURCE_COVERAGE_LEVELS.DIRECT);
assert.equal(sourceCoverageForEntity("org-stanford-hai").level, SOURCE_COVERAGE_LEVELS.DIRECT);
assert.equal(sourceCoverageForEntity("person-ethan-mollick").level, SOURCE_COVERAGE_LEVELS.DIRECT);
assert.equal(sourceCoverageForEntity("person-arvind-narayanan").level, SOURCE_COVERAGE_LEVELS.SHARED);
assert.equal(sourceCoverageForEntity("person-sayash-kapoor").level, SOURCE_COVERAGE_LEVELS.SHARED);
assert.equal(sourceCoverageForEntity("org-google").level, SOURCE_COVERAGE_LEVELS.RELATED);
assert.equal(sourceCoverageForEntity("person-paul-ford").level, SOURCE_COVERAGE_LEVELS.GAP);
assert.equal(sourceCoverageForEntity("org-educause").level, SOURCE_COVERAGE_LEVELS.GAP);

assert.deepEqual(summary.byLevel, {
  direct: 10,
  shared: 2,
  discovery: 0,
  related: 1,
  gap: 19
}, "Coverage inventory must remain explicit and deterministic until endpoints change.");

const ordered = sortedMonitoredEntities();
assert.equal(ordered[0].monitoringState, MONITORING_STATES.PRIORITY);
assert.equal(ordered.some(entity => entity.id === "person-sam-altman"), false, "Parked people must stay out of continuous selection.");

const older = Object.freeze({ item: Object.freeze({ id: "older", publishedAt: "2026-08-28T12:00:00Z" }) });
const newer = Object.freeze({ item: Object.freeze({ id: "newer", publishedAt: "2026-08-30T12:00:00Z" }) });
const undated = Object.freeze({ item: Object.freeze({ id: "undated" }) });
const sorted = sortEntityLensEntries([older, undated, newer]);
assert.deepEqual(sorted.map(entry => entry.item.id), ["newer", "older", "undated"]);
assert.deepEqual([older, undated, newer].map(entry => entry.item.id), ["older", "undated", "newer"], "Presentation sorting must not mutate the lens result array.");

console.log("People & Organizations Phase 8 fixtures passed.");
