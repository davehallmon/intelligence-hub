// Intelligence Hub v10 — ratified Watchlist taxonomy.
// Source of truth: docs/configuration/RATIFIED_CONFIGURATION.md §1.

import { MONITORING_STATES } from "./entity-types.js";

function facet(name, state = "secondary") {
  return Object.freeze({ name, state });
}

function topic(id, name, state, facets = []) {
  return Object.freeze({
    id,
    name,
    state,
    facets: Object.freeze(facets)
  });
}

export const WATCHLIST_TOPICS = Object.freeze([
  topic("ai-adoption-future-work", "AI Adoption & Future of Work", MONITORING_STATES.PRIORITY, [
    facet("Enterprise AI adoption", "core"),
    facet("AI productivity evidence", "core"),
    facet("Workflow/job redesign", "core"),
    facet("Organizational change & adoption", "core"),
    facet("Workforce transformation / future of work"),
    facet("Leadership & executive AI strategy"),
    facet("AI skills / workforce readiness"),
    facet("Professional services / consulting"),
    facet("Employment, displacement & labor economics"),
    facet("Human judgment / human-AI collaboration")
  ]),
  topic("ai-education-learning", "AI in Education & Learning", MONITORING_STATES.PRIORITY, [
    facet("AI in teaching & learning", "core"),
    facet("Learning design / instructional design", "core"),
    facet("Assessment & grading", "core"),
    facet("Formative feedback", "core"),
    facet("AI literacy for students/faculty"),
    facet("Faculty adoption & institutional change"),
    facet("Academic integrity"),
    facet("LMS / education-platform integration"),
    facet("Research on learning outcomes"),
    facet("AI tutors / personalized learning", "parked")
  ]),
  topic("creative-ai-writing", "Creative AI & AI-Assisted Writing", MONITORING_STATES.PRIORITY, [
    facet("AI-assisted writing & editing", "core"),
    facet("Writing quality / voice preservation", "core"),
    facet("Long-form / narrative workflows", "core"),
    facet("Character / visual consistency", "core"),
    facet("AI image generation"),
    facet("Visual storytelling"),
    facet("Satire / comics / illustrated storytelling"),
    facet("New creative tools & experimental platforms"),
    facet("AI video / generative media", "parked"),
    facet("Copyright / ethics specifically affecting creators", "parked")
  ]),
  topic("prompt-harness-workflow", "Prompt / Harness / Workflow Engineering", MONITORING_STATES.PRIORITY, [
    facet("Prompt design / prompting techniques", "core"),
    facet("System prompts & instruction architecture", "core"),
    facet("Context management", "core"),
    facet("Human-in-the-loop workflows", "core"),
    facet("Agent harnesses / orchestration"),
    facet("Agent skills / reusable capabilities"),
    facet("Tool use / function calling"),
    facet("Workflow automation"),
    facet("Prompt libraries / templates"),
    facet("Multi-agent workflows", "parked")
  ]),
  topic("rag-retrieval-knowledge", "RAG, Retrieval & Knowledge Systems", MONITORING_STATES.PRIORITY, [
    facet("Grounding / source attribution", "core"),
    facet("Personal knowledge systems", "core"),
    facet("Research synthesis / evidence workflows", "core"),
    facet("Agent memory / persistent knowledge", "core"),
    facet("Retrieval-augmented generation"),
    facet("Enterprise search / knowledge retrieval"),
    facet("Knowledge management"),
    facet("Document ingestion & chunking"),
    facet("AI over SharePoint / enterprise content"),
    facet("Semantic / vector search", "parked")
  ]),

  topic("ai-literacy-fluency", "AI Literacy & Fluency", MONITORING_STATES.ACTIVE),
  topic("ai-productivity-workflow-redesign", "AI Productivity & Workflow Redesign", MONITORING_STATES.ACTIVE),
  topic("ai-agents-agentic-workflows", "AI Agents & Agentic Workflows", MONITORING_STATES.ACTIVE),
  topic("context-engineering-memory", "Context Engineering & AI Memory", MONITORING_STATES.ACTIVE),
  topic("multimodal-ai", "Multimodal AI", MONITORING_STATES.ACTIVE),
  topic("open-models-open-vs-closed", "Open Models & Open vs. Closed AI", MONITORING_STATES.ACTIVE),
  topic("ai-regulation-policy-governance", "AI Regulation, Policy & Governance", MONITORING_STATES.ACTIVE),

  topic("ai-powered-coding", "AI-Powered Coding & Software Development", MONITORING_STATES.PARKED),
  topic("ai-evaluation-benchmarking", "AI Evaluation, Benchmarking & LLM-as-a-Judge", MONITORING_STATES.PARKED),
  topic("model-optimization-infrastructure", "Model Optimization & Infrastructure", MONITORING_STATES.PARKED),
  topic("ai-science-research", "AI in Science & Research", MONITORING_STATES.PARKED),
  topic("ai-safety-reliability-alignment", "AI Safety, Reliability & Alignment", MONITORING_STATES.PARKED),
  topic("ai-ethics-bias-responsible-use", "AI Ethics, Bias & Responsible Use", MONITORING_STATES.PARKED),
  topic("ai-copyright-training-data-ip", "AI Copyright, Training Data & IP", MONITORING_STATES.PARKED),
  topic("ai-security-prompt-injection-risk", "AI Security, Prompt Injection & Model/Data Risk", MONITORING_STATES.PARKED)
]);

export const WATCHLIST_DISCOVERY_MODE = "broad-discovery-strict-focus";

export const CROSS_CUTTING_FACETS = Object.freeze([
  Object.freeze({ name: "Experimental Media & Generative Creative Tools", parentTopicIds: Object.freeze(["creative-ai-writing", "multimodal-ai"]) }),
  Object.freeze({ name: "Learning Design, Assessment & Formative Feedback Systems", parentTopicIds: Object.freeze(["ai-education-learning"]) }),
  Object.freeze({ name: "Visual Storytelling & Satirical Media Pipelines", parentTopicIds: Object.freeze(["creative-ai-writing", "multimodal-ai"]) })
]);

// Legacy v8/v9 classification tags remain recognized even when they are not
// v10 top-level Watchlists. This prevents migration from discarding existing
// normalized topic labels.
export const LEGACY_TOPIC_TAGS = Object.freeze([
  "AI Agents",
  "AI Adoption & Future of Work",
  "AI as Normal Technology",
  "AI Copyright & Training Data",
  "AI Ethics & Bias",
  "AI Evaluation & Benchmarking",
  "AI in Science",
  "AI Literacy",
  "AI Regulation & Policy",
  "AI Safety & Alignment",
  "AI-powered Coding",
  "Context Engineering",
  "Cost & Latency Optimization",
  "Creative AI Workflows",
  "Data & Model Poisoning",
  "DPO",
  "Edge AI",
  "Fine-tuning",
  "LLM-as-a-Judge",
  "Multimodal AI",
  "Open Source vs. Closed Source",
  "Prompt Engineering",
  "Quantization",
  "RAG",
  "RLHF",
  "Synthetic Data Generation"
]);

const TOPIC_BY_ID = new Map(WATCHLIST_TOPICS.map(entry => [entry.id, entry]));

export function getWatchlistTopic(id) {
  return TOPIC_BY_ID.get(id) || null;
}

export function topicsForState(state) {
  return WATCHLIST_TOPICS.filter(entry => entry.state === state);
}
