// Intelligence Hub v8.5 — Social source policy.
// Profiles are identities. Social source state describes how authored Social content may enter the hub.

import { PROFILE_REGISTRY, PROFILE_TIERS } from "./profiles.js";
import { publicSourcesFor } from "./source-registry.js";

export const SOCIAL_SOURCE_STATE = Object.freeze({
  DIRECT: "direct",
  BRIDGE_ELIGIBLE: "bridge-eligible",
  COVERAGE_ONLY: "coverage-only",
  WATCHLIST: "watchlist"
});

const directProfileIds = new Set(
  publicSourcesFor("socials").flatMap(source => source.profileIds || [])
);

function deriveState(profile) {
  if (profile.tier === PROFILE_TIERS.WATCHLIST) return SOCIAL_SOURCE_STATE.WATCHLIST;
  if (directProfileIds.has(profile.id)) return SOCIAL_SOURCE_STATE.DIRECT;
  if (String(profile.ingestion || "").includes("social-bridge")) return SOCIAL_SOURCE_STATE.BRIDGE_ELIGIBLE;
  return SOCIAL_SOURCE_STATE.COVERAGE_ONLY;
}

export const SOCIAL_PROFILE_POLICY = Object.freeze(
  PROFILE_REGISTRY.map(profile => Object.freeze({
    profileId: profile.id,
    name: profile.name,
    entityType: profile.type,
    tier: profile.tier,
    canonicalUrl: profile.canonicalUrl,
    mainOutlet: profile.mainOutlet,
    state: deriveState(profile)
  }))
);

export function socialPolicyFor(profileId) {
  return SOCIAL_PROFILE_POLICY.find(entry => entry.profileId === profileId) || null;
}

export function socialProfilesByState(state) {
  return SOCIAL_PROFILE_POLICY.filter(entry => entry.state === state);
}

export function bridgeEligibleProfiles() {
  return socialProfilesByState(SOCIAL_SOURCE_STATE.BRIDGE_ELIGIBLE);
}
