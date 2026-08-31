// Intelligence Hub v10 — canonical entity registry.
// Phase 1 preserves every legacy v8/v9 profile identity, overlays ratified v10
// monitoring state, and adds ratified non-profile entities.
// No live v9.x module imports this registry yet.

import { PROFILE_REGISTRY } from "../profiles.js";
import { ENTITY_TYPES, MONITORING_STATES as S } from "./entity-types.js";

const LEGACY_STATE = Object.freeze({
  // Priority people
  "person-ethan-mollick": S.PRIORITY, "person-arvind-narayanan": S.PRIORITY,
  "person-simon-willison": S.PRIORITY, "person-andrej-karpathy": S.PRIORITY,
  "person-paul-ford": S.PRIORITY, "person-benedict-evans": S.PRIORITY,
  "person-dario-amodei": S.PRIORITY,
  // Active people
  "person-andrew-ng": S.ACTIVE, "person-rachel-woods": S.ACTIVE,
  "person-azeem-azhar": S.ACTIVE, "person-sayash-kapoor": S.ACTIVE,
  "person-kevin-kelly": S.ACTIVE, "person-nathaniel-whittemore": S.ACTIVE,
  "person-fei-fei-li": S.ACTIVE,
  // Parked people
  "person-kamil-banc": S.PARKED, "person-nufar-gaspar": S.PARKED,
  "person-cat-goetze": S.PARKED, "person-satya-nadella": S.PARKED,
  "person-jensen-huang": S.PARKED, "person-mustafa-suleyman": S.PARKED,
  "person-sam-altman": S.PARKED, "person-demis-hassabis": S.PARKED,
  "person-steven-levy": S.PARKED,
  // Organizations
  "org-anthropic": S.PRIORITY, "org-openai": S.PRIORITY,
  "org-microsoft": S.ACTIVE, "org-hugging-face": S.ACTIVE,
  "org-meta-ai": S.ACTIVE, "org-perplexity-ai": S.ACTIVE,
  "org-google-deepmind": S.PARKED, "org-ai2": S.PARKED,
  "org-mistral-ai": S.PARKED, "org-nvidia": S.PARKED
});

function freezeArray(values = []) {
  return Object.freeze([...new Set(values.filter(Boolean))]);
}

function makeEntity({ id, name, type, state = S.KNOWN, canonicalUrl = null, aliases = [],
  parentId = null, relations = [], verificationStatus = "verified", metadata = {} }) {
  return Object.freeze({
    id, name, type, monitoringState: state, canonicalUrl,
    aliases: freezeArray([name, ...aliases]), parentId,
    relations: Object.freeze(relations.map(r => Object.freeze({ ...r }))),
    verificationStatus, metadata: Object.freeze({ ...metadata })
  });
}

const LEGACY_ENTITIES = PROFILE_REGISTRY.map(profile => makeEntity({
  id: profile.id,
  name: profile.name,
  type: profile.type === "organization" ? ENTITY_TYPES.ORGANIZATION : ENTITY_TYPES.PERSON,
  state: LEGACY_STATE[profile.id] || S.KNOWN,
  canonicalUrl: profile.canonicalUrl || null,
  aliases: profile.aliases || [],
  parentId: profile.id === "org-google-deepmind" ? "org-google" : null,
  metadata: {
    legacyProfile: true,
    legacyTier: profile.tier,
    legacyMainOutlet: profile.mainOutlet || "",
    legacyIngestion: profile.ingestion || "",
    legacyTopics: Object.freeze([...(profile.topics || [])])
  }
}));

// Compact spec shape: [id, name, state, optional extras].
const PEOPLE = [
  ["person-chip-huyen", "Chip Huyen", S.ACTIVE],
  ["person-jerry-liu", "Jerry Liu", S.ACTIVE],
  ["person-dan-shipper", "Dan Shipper", S.ACTIVE],
  ["person-lance-eaton", "Lance Eaton", S.ACTIVE],
  ["person-lilian-weng", "Lilian Weng", S.ACTIVE],
  ["person-hamish-ogilvy", "Hamish Ogilvy", S.PARKED],
  ["person-harrison-chase", "Harrison Chase", S.PARKED]
];

const ORGANIZATIONS = [
  ["org-google", "Google", S.PRIORITY, { aliases: ["Google AI", "Google Workspace", "Google Labs"] }],
  ["org-educause", "EDUCAUSE", S.PRIORITY],
  ["org-stanford-hai", "Stanford HAI", S.PRIORITY, { aliases: ["Stanford Institute for Human-Centered Artificial Intelligence"] }],
  ["org-nist", "NIST", S.ACTIVE],
  ["org-oecd-ai", "OECD.AI", S.ACTIVE, { aliases: ["OECD AI"] }],
  ["org-us-department-education", "U.S. Department of Education", S.ACTIVE],
  ["org-instructure", "Instructure", S.ACTIVE, { aliases: ["Canvas", "Instructure Canvas"] }],
  ["org-princeton-citp", "Princeton CITP", S.PARKED],
  ["org-unesco-ai-education", "UNESCO — AI & Education", S.PARKED],
  ["org-wharton-interactive", "Wharton Interactive", S.PARKED],
  ["org-kpmg", "KPMG", S.KNOWN],
  ["org-outskill", "Outskill", S.KNOWN],
  ["org-section", "Section", S.KNOWN]
];

const PRODUCTS = [
  ["product-chatgpt", "ChatGPT", S.PRIORITY, { owner: "org-openai" }],
  ["product-claude", "Claude", S.PRIORITY, { owner: "org-anthropic" }],
  ["product-gemini", "Gemini", S.PRIORITY, { owner: "org-google" }],
  ["product-notebooklm", "NotebookLM", S.PRIORITY, { owner: "org-google" }],
  ["product-google-labs", "Google Labs / experimental AI tools", S.PRIORITY, { owner: "org-google" }],
  ["product-canvas", "Canvas / Instructure", S.PRIORITY, { owner: "org-instructure", aliases: ["Canvas"] }],

  ["product-m365-copilot", "Microsoft 365 Copilot", S.ACTIVE, { owner: "org-microsoft" }],
  ["product-perplexity", "Perplexity", S.ACTIVE, { owner: "org-perplexity-ai" }],
  ["product-google-ai-mode", "Google AI Mode / AI Search", S.ACTIVE, { owner: "org-google" }],
  ["product-claude-code", "Claude Code", S.ACTIVE, { owner: "org-anthropic" }],
  ["product-google-ai-studio", "Google AI Studio", S.ACTIVE, { owner: "org-google" }],
  ["product-openrouter", "OpenRouter", S.ACTIVE],
  ["product-ollama", "Ollama", S.ACTIVE],
  ["product-lm-studio", "LM Studio", S.ACTIVE],
  ["product-midjourney", "Midjourney", S.ACTIVE, { owner: "org-midjourney" }],
  ["product-google-workspace-ai", "Google Workspace AI", S.ACTIVE, { owner: "org-google" }],

  ["product-openai-codex", "OpenAI Codex", S.PARKED, { owner: "org-openai" }],
  ["product-microsoft-copilot-studio", "Microsoft Copilot Studio", S.PARKED, { owner: "org-microsoft" }],
  ["product-github-copilot", "GitHub Copilot", S.PARKED, { owner: "org-microsoft" }],
  ["product-hugging-face", "Hugging Face product/platform", S.PARKED, { owner: "org-hugging-face" }],
  ["product-n8n", "n8n", S.PARKED],
  ["product-google-flow", "Google Flow", S.PARKED, { owner: "org-google" }],
  ["product-ideogram", "Ideogram", S.PARKED],
  ["product-adobe-firefly", "Adobe Firefly", S.PARKED, { owner: "org-adobe" }],
  ["product-runway", "Runway", S.PARKED, { owner: "org-runway" }],
  ["product-canva-ai", "Canva AI / Magic Studio", S.PARKED],
  ["product-sharepoint-copilot", "Microsoft SharePoint + Copilot", S.PARKED, { owner: "org-microsoft" }],
  ["product-teams-m365-ai", "Microsoft Teams / M365 AI integrations", S.PARKED, { owner: "org-microsoft" }],

  ["product-claude-skills", "Claude Skills", S.CHILD, { owner: "org-anthropic", parentId: "product-claude" }],
  ["product-custom-gpts", "Custom GPTs", S.CHILD, { owner: "org-openai", parentId: "product-chatgpt" }],
  ["product-storm", "STORM", S.KNOWN, { metadata: { preferredLens: "research", continuousProductMonitoring: false } }]
];

const LEGACY_KNOWN_PRODUCTS = [
  ["product-bentoml", "BentoML"], ["product-chroma", "Chroma"], ["product-cohere-command", "Cohere Command"],
  ["product-crewai", "CrewAI"], ["product-duck-ai", "Duck.ai"], ["product-falcon", "Falcon"],
  ["product-fireworks-ai", "Fireworks AI"], ["product-github", "GitHub"], ["product-gradio", "Gradio"],
  ["product-grok", "Grok"], ["product-groq", "Groq"], ["product-haystack", "Haystack"],
  ["product-huggingchat", "HuggingChat"], ["product-kimi", "Kimi"], ["product-langchain", "LangChain"],
  ["product-lightning-ai", "Lightning AI"], ["product-llamaindex", "LlamaIndex"], ["product-lmsys", "LMSYS"],
  ["product-microsoft-fabric", "Microsoft Fabric"], ["product-microsoft-foundry", "Microsoft Foundry"],
  ["product-milvus", "Milvus"], ["product-modal", "Modal"], ["product-notion-ai", "Notion AI"],
  ["product-pika", "Pika"], ["product-pinecone", "Pinecone"], ["product-poe", "Poe"],
  ["product-qdrant", "Qdrant"], ["product-qwen", "Qwen"], ["product-replicate", "Replicate"],
  ["product-transformers", "Transformers"], ["product-v0", "v0"], ["product-vercel", "Vercel"],
  ["product-vllm", "vLLM"], ["product-weaviate", "Weaviate"], ["product-weights-biases", "Weights & Biases"]
];

const PUBLICATIONS = [
  ["publication-hbr", "Harvard Business Review", S.PRIORITY, { aliases: ["HBR"] }],
  ["publication-mit-technology-review", "MIT Technology Review", S.PRIORITY],
  ["publication-every", "Every", S.PRIORITY],
  ["publication-stratechery", "Stratechery", S.PRIORITY],
  ["publication-chronicle-higher-education", "The Chronicle of Higher Education", S.PRIORITY],
  ["publication-write-with-ai", "Write With AI", S.PRIORITY],
  ["publication-wired", "WIRED", S.ACTIVE], ["publication-the-information", "The Information", S.ACTIVE],
  ["publication-ars-technica", "Ars Technica", S.ACTIVE], ["publication-the-neuron", "The Neuron", S.ACTIVE],
  ["publication-faculty-focus", "Faculty Focus", S.ACTIVE], ["publication-platformer", "Platformer", S.ACTIVE],
  ["publication-edsurge", "EdSurge", S.ACTIVE],
  ["publication-the-verge", "The Verge", S.PARKED], ["publication-inside-higher-ed", "Inside Higher Ed", S.PARKED],
  ["publication-educause-review", "EDUCAUSE Review", S.PARKED, { owner: "org-educause" }],
  ["publication-daily-dose-data-science", "Daily Dose of Data Science", S.PARKED],
  ["publication-ai-rabbit-hole", "The AI Rabbit Hole", S.PARKED],
  ["publication-knowledge-at-wharton", "Knowledge at Wharton", S.KNOWN]
];

const MEDIA = [
  ["media-ai-daily-brief", "The AI Daily Brief", S.PRIORITY, { host: "person-nathaniel-whittemore" }],
  ["media-ai-and-i", "AI & I", S.PRIORITY, { owner: "publication-every", host: "person-dan-shipper" }],
  ["media-cognitive-revolution", "The Cognitive Revolution", S.PRIORITY],
  ["media-hard-fork", "Hard Fork", S.PRIORITY], ["media-practical-ai", "Practical AI", S.PRIORITY],
  ["media-how-i-ai", "How I AI", S.ACTIVE], ["media-latent-space", "Latent Space", S.ACTIVE],
  ["media-decoder", "Decoder", S.ACTIVE], ["media-ted-ai-show", "TED AI Show", S.ACTIVE],
  ["media-lennys-podcast", "Lenny's Podcast", S.ACTIVE], ["media-marketplace-tech", "Marketplace Tech", S.ACTIVE],
  ["media-designed-for-learning", "Designed for Learning", S.ACTIVE],
  ["media-you-can-with-ai", "You can with AI", S.ACTIVE, { owner: "org-kpmg", host: "person-nathaniel-whittemore" }],
  ["media-no-priors", "No Priors", S.PARKED], ["media-dwarkesh", "Dwarkesh Podcast", S.PARKED],
  ["media-ezra-klein-show", "The Ezra Klein Show", S.PARKED], ["media-possible", "Possible", S.PARKED],
  ["media-gradient-podcast", "The Gradient Podcast", S.PARKED], ["media-tech-brew-ride-home", "Tech Brew Ride Home", S.PARKED],

  ["media-youtube-ai-explained", "AI Explained", S.PRIORITY, { metadata: { primaryFormat: "youtube" } }],
  ["media-youtube-jeff-su", "Jeff Su", S.PRIORITY, { metadata: { primaryFormat: "youtube" } }],
  ["media-youtube-curious-refuge", "Curious Refuge", S.PRIORITY, { metadata: { primaryFormat: "youtube" } }],
  ["media-youtube-matt-wolfe", "Matt Wolfe", S.ACTIVE, { metadata: { primaryFormat: "youtube" } }],
  ["media-youtube-skill-leap-ai", "Skill Leap AI", S.ACTIVE, { metadata: { primaryFormat: "youtube" } }],
  ["media-youtube-writing-secrets", "Writing Secrets", S.ACTIVE, { verificationStatus: "pending", metadata: { primaryFormat: "youtube" } }],
  ["media-youtube-sharbel-a", "Sharbel A.", S.ACTIVE, { verificationStatus: "pending", metadata: { primaryFormat: "youtube" } }]
];

const COMMUNITIES = [
  ["community-reddit-promptengineering", "r/PromptEngineering", S.PRIORITY],
  ["community-reddit-notebooklm", "r/notebooklm", S.PRIORITY],
  ["community-reddit-writingwithai", "r/WritingWithAI", S.PRIORITY, { metadata: { ingestionRuleStatus: "unresolved" } }],
  ["community-canvas", "Instructure / Canvas Community", S.PRIORITY, { affiliate: "org-instructure" }],
  ["community-reddit-claudeai", "r/ClaudeAI", S.ACTIVE], ["community-reddit-aieducation", "r/AIEducation", S.ACTIVE],
  ["community-reddit-chatgptpromptgenius", "r/ChatGPTPromptGenius", S.ACTIVE, { verificationStatus: "pending" }],
  ["community-reddit-hermesagent", "r/hermesagent", S.ACTIVE, { verificationStatus: "pending" }],
  ["community-reddit-bookwritingai", "r/BookWritingAI", S.ACTIVE, { verificationStatus: "pending" }],
  ["community-reddit-linguisticsprograming", "r/LinguisticsPrograming", S.ACTIVE, { verificationStatus: "pending" }],
  ["community-reddit-chatgpt", "r/ChatGPT", S.PARKED], ["community-reddit-localllama", "r/LocalLLaMA", S.PARKED],
  ["community-hacker-news", "Hacker News", S.PARKED], ["community-dev", "DEV Community", S.PARKED],
  ["community-ai-education-google-group", "AI in Education Google Group", S.PARKED],
  ["community-educause", "EDUCAUSE community discussions", S.PARKED, { affiliate: "org-educause" }],
  ["community-reddit-indiecomics", "r/indiecomics", S.PARKED], ["community-reddit-webtoons", "r/webtoons", S.PARKED],
  ["community-generic-writing-author", "Selected writing / author communities", S.PARKED]
];

const RESEARCH_SOURCES = [
  ["research-source-arxiv", "arXiv", S.ACTIVE], ["research-source-ssrn", "SSRN", S.ACTIVE],
  ["research-source-nber", "NBER", S.ACTIVE], ["research-source-semantic-scholar", "Semantic Scholar", S.ACTIVE],
  ["research-source-google-scholar", "Google Scholar", S.ACTIVE], ["research-source-eric", "ERIC / Institute of Education Sciences", S.ACTIVE],
  ["research-source-wharton", "Wharton / academic business research", S.ACTIVE],
  ["research-source-consensus", "Consensus", S.KNOWN, { metadata: { role: "discovery-connector", evidenceSource: false } }],
  ["research-source-elicit", "Elicit", S.KNOWN, { metadata: { role: "discovery-connector", evidenceSource: false } }]
];

function fromSpec(type, [id, name, state = S.KNOWN, extras = {}]) {
  const relations = [];
  if (extras.owner) relations.push({ type: "owned-by", targetId: extras.owner });
  if (extras.host) relations.push({ type: "hosted-by", targetId: extras.host });
  if (extras.affiliate) relations.push({ type: "affiliated-with", targetId: extras.affiliate });
  return makeEntity({
    id, name, type, state,
    aliases: extras.aliases || [],
    parentId: extras.parentId || null,
    relations,
    verificationStatus: extras.verificationStatus || "verified",
    metadata: extras.metadata || {}
  });
}

const NEW_ENTITIES = [
  ...PEOPLE.map(spec => fromSpec(ENTITY_TYPES.PERSON, spec)),
  ...ORGANIZATIONS.map(spec => fromSpec(ENTITY_TYPES.ORGANIZATION, spec)),
  ...PRODUCTS.map(spec => fromSpec(ENTITY_TYPES.PRODUCT, spec)),
  ...LEGACY_KNOWN_PRODUCTS.map(([id, name]) => makeEntity({
    id, name, type: ENTITY_TYPES.PRODUCT, state: S.KNOWN,
    metadata: { legacyWatchlistIdentity: true }
  })),
  ...PUBLICATIONS.map(spec => fromSpec(ENTITY_TYPES.PUBLICATION, spec)),
  ...MEDIA.map(spec => fromSpec(ENTITY_TYPES.MEDIA, spec)),
  ...COMMUNITIES.map(spec => fromSpec(ENTITY_TYPES.COMMUNITY, spec)),
  ...RESEARCH_SOURCES.map(spec => fromSpec(ENTITY_TYPES.RESEARCH_SOURCE, spec))
];

export const ENTITY_REGISTRY = Object.freeze([...LEGACY_ENTITIES, ...NEW_ENTITIES]);
export const ENTITY_BY_ID = new Map(ENTITY_REGISTRY.map(item => [item.id, item]));

export function getEntity(id) { return ENTITY_BY_ID.get(id) || null; }
export function entitiesByType(type) { return ENTITY_REGISTRY.filter(item => item.type === type); }
export function entitiesByMonitoringState(state) { return ENTITY_REGISTRY.filter(item => item.monitoringState === state); }

export function resolveEntityAlias(value) {
  const key = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!key) return null;
  for (const item of ENTITY_REGISTRY) {
    if (item.id === value) return item.id;
    if (item.aliases.some(alias => String(alias).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() === key)) return item.id;
  }
  return null;
}
