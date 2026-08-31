// Intelligence Hub v10 — evidence and verification vocabulary.
// This foundation encodes epistemic distinctions; it does not yet change rendering.

export const EVIDENCE_TYPES = Object.freeze({
  PRIMARY_SOURCE: "primary-source",
  RESEARCH: "research",
  INDEPENDENT_REPORTING: "independent-reporting",
  ANALYSIS: "analysis",
  OPINION: "opinion",
  PRACTITIONER_REPORT: "practitioner-report",
  COMMUNITY_UNVERIFIED: "community-report-unverified",
  AI_SYNTHESIS: "ai-synthesis"
});

export const VERIFICATION_STATUS = Object.freeze({
  VERIFIED: "verified",
  PARTIALLY_VERIFIED: "partially-verified",
  UNVERIFIED: "unverified",
  DISPUTED: "disputed"
});

export const QUESTION_EVIDENCE_HIERARCHY = Object.freeze([
  "primary-research-original-study",
  "official-primary-source-original-document",
  "high-quality-independent-reporting",
  "practitioner-community-experience",
  "expert-analysis-commentary",
  "ai-generated-summary-synthesis"
]);

export const RESEARCH_STANDARDS = Object.freeze([
  "cite-material-factual-claims",
  "prefer-primary-sources",
  "separate-fact-evidence-inference-opinion",
  "surface-conflicting-evidence",
  "state-uncertainty",
  "show-methodological-limitations",
  "distinguish-peer-reviewed-from-preprint",
  "distinguish-official-claims-from-independent-validation",
  "preserve-private-provenance",
  "state-insufficient-evidence"
]);
