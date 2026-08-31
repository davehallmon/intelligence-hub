// Intelligence Hub v10 — deterministic compatibility bridge.
// Existing profile IDs remain stable canonical entity IDs during Phase 1.

import { PROFILE_REGISTRY } from "../profiles.js";
import { getEntity } from "./entities.js";

export const LEGACY_PROFILE_TO_ENTITY = Object.freeze(
  Object.fromEntries(PROFILE_REGISTRY.map(profile => [profile.id, profile.id]))
);

export function legacyProfileIdToEntityId(profileId) {
  const entityId = LEGACY_PROFILE_TO_ENTITY[profileId] || null;
  return entityId && getEntity(entityId) ? entityId : null;
}

export function legacyProfileIdsToEntityIds(profileIds = []) {
  return [...new Set(profileIds.map(legacyProfileIdToEntityId).filter(Boolean))];
}

export const LEGACY_TOPIC_ALIASES = Object.freeze({
  "AI Agents": "ai-agents-agentic-workflows",
  "AI Adoption & Future of Work": "ai-adoption-future-work",
  "AI Literacy": "ai-literacy-fluency",
  "AI-powered Coding": "ai-powered-coding",
  "Context Engineering": "context-engineering-memory",
  "Prompt Engineering": "prompt-harness-workflow",
  "RAG": "rag-retrieval-knowledge",
  "Multimodal AI": "multimodal-ai",
  "Open Source vs. Closed Source": "open-models-open-vs-closed",
  "AI Regulation & Policy": "ai-regulation-policy-governance",
  "AI Evaluation & Benchmarking": "ai-evaluation-benchmarking",
  "LLM-as-a-Judge": "ai-evaluation-benchmarking",
  "AI Safety & Alignment": "ai-safety-reliability-alignment",
  "AI in Science": "ai-science-research",
  "Creative AI Workflows": "creative-ai-writing",
  "AI Copyright & Training Data": "ai-copyright-training-data-ip",
  "AI Ethics & Bias": "ai-ethics-bias-responsible-use",
  "Cost & Latency Optimization": "model-optimization-infrastructure",
  "Data & Model Poisoning": "ai-security-prompt-injection-risk"
});

export function legacyTopicToWatchlistId(topic) {
  return LEGACY_TOPIC_ALIASES[topic] || null;
}
