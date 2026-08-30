// Intelligence Hub v8.2 — canonical profile registry.
// A profile is an identity. A feed/source is an outlet attached to that identity.
// Private/social bridge feed URLs remain browser-local and are never stored here.

const TIER = Object.freeze({
  CORE: "core-active",
  SELECTIVE: "selective-active",
  WATCHLIST: "watchlist-only"
});

function person(id, name, tier, canonicalUrl, mainOutlet, ingestion, topics = [], aliases = []) {
  return Object.freeze({
    id: `person-${id}`,
    name,
    type: "person",
    tier,
    canonicalUrl,
    mainOutlet,
    ingestion,
    topics: Object.freeze(topics),
    aliases: Object.freeze([name, ...aliases])
  });
}

function org(id, name, tier, canonicalUrl, mainOutlet, ingestion, topics = [], aliases = []) {
  return Object.freeze({
    id: `org-${id}`,
    name,
    type: "organization",
    tier,
    canonicalUrl,
    mainOutlet,
    ingestion,
    topics: Object.freeze(topics),
    aliases: Object.freeze([name, ...aliases])
  });
}

export const PROFILE_TIERS = TIER;

export const PROFILE_REGISTRY = Object.freeze([
  // Figures — Core Active
  person("sam-altman", "Sam Altman", TIER.CORE, "https://blog.samaltman.com/", "Personal blog + social", "direct-feed-or-social-bridge",
    ["AI Agents", "AI Regulation & Policy", "AI Safety & Alignment", "AI Adoption & Future of Work"]),
  person("dario-amodei", "Dario Amodei", TIER.CORE, "https://darioamodei.com/", "Essays + Anthropic", "official-site-and-news",
    ["AI Safety & Alignment", "AI Agents", "AI Evaluation & Benchmarking", "AI Regulation & Policy"]),
  person("kamil-banc", "Kamil Banc", TIER.CORE, "https://aiadopters.club/", "AI Adopters Club", "direct-feed-if-available",
    ["AI Adoption & Future of Work", "AI Literacy", "AI Agents"]),
  person("jack-clark", "Jack Clark", TIER.CORE, "https://jack-clark.net/", "Import AI", "direct-feed-if-available",
    ["AI Safety & Alignment", "AI Regulation & Policy", "AI Evaluation & Benchmarking", "AI in Science"]),
  person("demis-hassabis", "Demis Hassabis", TIER.CORE, "https://blog.google/authors/demis-hassabis/", "Google DeepMind", "official-site-and-news",
    ["AI in Science", "Multimodal AI", "AI Agents", "AI Safety & Alignment"]),
  person("jensen-huang", "Jensen Huang", TIER.CORE, "https://nvidianews.nvidia.com/bios/jensen-huang", "NVIDIA Newsroom", "official-feed-and-news",
    ["Cost & Latency Optimization", "Edge AI", "AI Agents", "Multimodal AI"]),
  person("sayash-kapoor", "Sayash Kapoor", TIER.CORE, "https://www.cs.princeton.edu/~sayashk/", "AI as Normal Technology", "direct-feed-if-available",
    ["AI as Normal Technology", "AI Evaluation & Benchmarking", "AI Adoption & Future of Work", "AI Regulation & Policy"]),
  person("andrej-karpathy", "Andrej Karpathy", TIER.CORE, "https://karpathy.ai/", "Personal site + social", "direct-feed-or-social-bridge",
    ["AI-powered Coding", "AI Agents", "Context Engineering", "Prompt Engineering"]),
  person("fei-fei-li", "Fei-Fei Li", TIER.CORE, "https://profiles.stanford.edu/fei-fei-li", "Stanford / HAI", "institutional-and-news",
    ["Multimodal AI", "AI Ethics & Bias", "AI in Science"]),
  person("ethan-mollick", "Ethan Mollick", TIER.CORE, "https://www.oneusefulthing.org/", "One Useful Thing", "direct-feed",
    ["AI Adoption & Future of Work", "AI Literacy", "AI Agents", "Creative AI Workflows"]),
  person("arvind-narayanan", "Arvind Narayanan", TIER.CORE, "https://www.cs.princeton.edu/~arvindn/", "AI as Normal Technology", "direct-feed-if-available",
    ["AI as Normal Technology", "AI Evaluation & Benchmarking", "AI Regulation & Policy", "AI Adoption & Future of Work"]),
  person("andrew-ng", "Andrew Ng", TIER.CORE, "https://www.andrewng.org/", "The Batch / Andrew's Letters", "newsletter-or-feed",
    ["AI Adoption & Future of Work", "AI Literacy", "AI Agents", "AI-powered Coding", "Open Source vs. Closed Source"]),
  person("aravind-srinivas", "Aravind Srinivas", TIER.CORE, "https://www.linkedin.com/in/aravind-srinivas-16051987", "LinkedIn + social", "social-bridge",
    ["AI Agents", "RAG", "AI Evaluation & Benchmarking"]),
  person("mustafa-suleyman", "Mustafa Suleyman", TIER.CORE, "https://mustafa-suleyman.ai/", "Personal site + Microsoft", "official-site-and-news",
    ["AI Adoption & Future of Work", "AI Regulation & Policy", "AI Agents", "AI Safety & Alignment"]),
  person("ilya-sutskever", "Ilya Sutskever", TIER.CORE, "https://ssi.inc/", "Safe Superintelligence", "official-site-and-news",
    ["AI Safety & Alignment", "AI Evaluation & Benchmarking", "Open Source vs. Closed Source"]),
  person("nathaniel-whittemore", "Nathaniel Whittemore", TIER.CORE, "https://aidailybrief.beehiiv.com/", "AI Daily Brief", "newsletter-or-feed",
    ["AI Adoption & Future of Work", "AI Regulation & Policy", "AI Agents"]),
  person("simon-willison", "Simon Willison", TIER.CORE, "https://simonwillison.net/", "Personal site / Atom", "direct-feed",
    ["AI-powered Coding", "Context Engineering", "AI Agents", "Prompt Engineering", "Open Source vs. Closed Source"]),
  person("rachel-woods", "Rachel Woods", TIER.CORE, "https://rachelwoods.substack.com/", "Substack", "direct-feed",
    ["AI Adoption & Future of Work", "AI Literacy", "AI Agents"]),

  // Figures — Selective Active
  person("azeem-azhar", "Azeem Azhar", TIER.SELECTIVE, "https://www.azeemazhar.com/", "Exponential View / personal site", "topic-gated-feed-or-news"),
  person("paul-christiano", "Paul Christiano", TIER.SELECTIVE, "https://paulfchristiano.com/ai/", "Personal site", "topic-gated-feed-or-news"),
  person("clem-delangue", "Clem Delangue", TIER.SELECTIVE, "https://www.linkedin.com/in/clementdelangue", "LinkedIn", "social-bridge"),
  person("benedict-evans", "Benedict Evans", TIER.SELECTIVE, "https://www.ben-evans.com/newsletter", "Newsletter", "topic-gated-newsletter-or-feed"),
  person("jim-fan", "Jim Fan", TIER.SELECTIVE, "https://jimfan.me/", "Personal site + social", "topic-gated-feed-or-social-bridge"),
  person("nufar-gaspar", "Nufar Gaspar", TIER.SELECTIVE, "https://www.nufargaspar.com/", "Personal site", "topic-gated-feed-or-news"),
  person("bill-gates", "Bill Gates", TIER.SELECTIVE, "https://www.gatesnotes.com/", "Gates Notes", "topic-gated-feed-or-news"),
  person("cat-goetze", "Cat Goetze", TIER.SELECTIVE, "https://www.linkedin.com/in/askcatgpt", "LinkedIn", "social-bridge"),
  person("sara-hooker", "Sara Hooker", TIER.SELECTIVE, "https://www.sarahooker.me/", "Personal site + institutional", "topic-gated-feed-or-news"),
  person("ben-horowitz", "Ben Horowitz", TIER.SELECTIVE, "https://a16z.com/author/ben-horowitz/", "Andreessen Horowitz", "topic-gated-official-feed"),
  person("kevin-kelly", "Kevin Kelly", TIER.SELECTIVE, "https://kk.org/", "Personal site", "topic-gated-feed-or-news"),
  person("yann-lecun", "Yann LeCun", TIER.SELECTIVE, "https://yann.lecun.com/", "Personal site + social", "topic-gated-feed-or-social-bridge"),
  person("steven-levy", "Steven Levy", TIER.SELECTIVE, "https://www.wired.com/author/steven-levy/", "WIRED", "topic-gated-publication-feed"),
  person("satya-nadella", "Satya Nadella", TIER.SELECTIVE, "https://www.linkedin.com/in/satyanadella", "LinkedIn + Microsoft", "social-bridge"),
  person("noam-shazeer", "Noam Shazeer", TIER.SELECTIVE, "https://www.noamshazeer.com/", "Personal site + social", "topic-gated-feed-or-social-bridge"),
  person("eliezer-yudkowsky", "Eliezer Yudkowsky", TIER.SELECTIVE, "https://www.lesswrong.com/w/eliezer-yudkowsky", "LessWrong", "topic-gated-feed-or-news"),

  // Figures — Watchlist Only
  person("paul-ford", "Paul Ford", TIER.WATCHLIST, "https://www.ftrain.com/", "Personal site", "watchlist-only"),
  person("ezra-klein", "Ezra Klein", TIER.WATCHLIST, "https://www.nytimes.com/by/ezra-klein", "The New York Times", "watchlist-only"),
  person("brian-mccullough", "Brian McCullough", TIER.WATCHLIST, "https://www.ridehome.info/show/techmeme-ride-home/people/brian-mccullough/", "Techmeme Ride Home", "watchlist-only"),
  person("barack-obama", "Barack Obama", TIER.WATCHLIST, "https://barackobama.com/", "Official site", "watchlist-only"),
  person("bernie-sanders", "Bernie Sanders", TIER.WATCHLIST, "https://berniesanders.com/", "Official site", "watchlist-only"),

  // Organizations — Core Active
  org("openai", "OpenAI", TIER.CORE, "https://openai.com/about/", "Official news / releases", "official-feed-and-news",
    ["AI Agents", "AI Evaluation & Benchmarking", "AI Safety & Alignment"]),
  org("anthropic", "Anthropic", TIER.CORE, "https://www.anthropic.com/company", "Official newsroom / research", "official-feed-and-news",
    ["AI Agents", "AI Safety & Alignment", "AI Evaluation & Benchmarking"]),
  org("google-deepmind", "Google DeepMind", TIER.CORE, "https://deepmind.google/", "Official news / research", "official-feed-and-news",
    ["AI in Science", "Multimodal AI", "AI Agents"], ["DeepMind"]),
  org("microsoft", "Microsoft", TIER.CORE, "https://www.microsoft.com/en-us/ai", "Microsoft AI / official blogs", "official-feed-and-news",
    ["AI Adoption & Future of Work", "AI Agents", "AI-powered Coding"]),
  org("nvidia", "NVIDIA", TIER.CORE, "https://www.nvidia.com/en-us/", "NVIDIA Newsroom / Developer", "official-feed-and-news",
    ["Cost & Latency Optimization", "Edge AI", "Multimodal AI"]),
  org("hugging-face", "Hugging Face", TIER.CORE, "https://huggingface.co/huggingface", "Official blog / research", "official-feed-and-news",
    ["Open Source vs. Closed Source", "Fine-tuning", "Multimodal AI"], ["HuggingFace"]),
  org("meta-ai", "Meta AI", TIER.CORE, "https://ai.meta.com/", "Meta AI / research", "official-feed-and-news",
    ["Open Source vs. Closed Source", "Multimodal AI", "AI Agents"]),
  org("mistral-ai", "Mistral AI", TIER.CORE, "https://mistral.ai/", "Official news / research", "official-feed-and-news",
    ["Open Source vs. Closed Source", "AI Agents", "Cost & Latency Optimization"], ["Mistral"]),
  org("cohere", "Cohere", TIER.CORE, "https://cohere.com/about", "Official blog / research", "official-feed-and-news",
    ["RAG", "AI Agents", "Fine-tuning"]),
  org("perplexity-ai", "Perplexity AI", TIER.CORE, "https://www.perplexity.ai/hub", "Official product / company", "official-feed-and-news",
    ["AI Agents", "RAG", "AI Evaluation & Benchmarking"], ["Perplexity"]),
  org("amazon-web-services", "Amazon Web Services", TIER.CORE, "https://aws.amazon.com/about-aws/", "AWS Machine Learning / AI blogs", "official-feed-and-news",
    ["AI Adoption & Future of Work", "Cost & Latency Optimization", "AI Agents"], ["AWS"]),
  org("ai2", "Ai2", TIER.CORE, "https://allenai.org/", "Allen Institute for AI", "official-feed-and-news",
    ["Open Source vs. Closed Source", "AI Evaluation & Benchmarking", "AI in Science"], ["Allen Institute for AI"]),

  // Organizations — Selective Active
  org("adobe", "Adobe", TIER.SELECTIVE, "https://www.adobe.com/about-adobe.html", "Official blog / newsroom", "topic-gated-official-feed"),
  org("andreessen-horowitz", "Andreessen Horowitz", TIER.SELECTIVE, "https://a16z.com/about/", "a16z", "topic-gated-official-feed", [], ["a16z"]),
  org("apple", "Apple", TIER.SELECTIVE, "https://www.apple.com/", "Apple Newsroom / ML research", "topic-gated-official-feed"),
  org("deepseek", "DeepSeek", TIER.SELECTIVE, "https://www.deepseek.com/", "Official site / research", "topic-gated-official-feed-or-news"),
  org("eleutherai", "EleutherAI", TIER.SELECTIVE, "https://www.eleuther.ai/", "Official research / blog", "topic-gated-official-feed"),
  org("ibm", "IBM", TIER.SELECTIVE, "https://www.ibm.com/", "IBM Research / Think", "topic-gated-official-feed"),
  org("midjourney", "Midjourney", TIER.SELECTIVE, "https://www.midjourney.com/", "Official site / social", "topic-gated-social-bridge-or-news"),
  org("runway", "Runway", TIER.SELECTIVE, "https://runway.com/about", "Official site / research", "topic-gated-official-feed-or-news"),
  org("scale-ai", "Scale AI", TIER.SELECTIVE, "https://scale.com/", "Official blog / newsroom", "topic-gated-official-feed"),
  org("stability-ai", "Stability AI", TIER.SELECTIVE, "https://stability.ai/", "Official news / research", "topic-gated-official-feed"),
  org("together-ai", "Together AI", TIER.SELECTIVE, "https://www.together.ai/", "Official blog / research", "topic-gated-official-feed"),
  org("xai-spacexai", "xAI / SpaceXAI", TIER.SELECTIVE, "https://x.ai/", "xAI official / social", "topic-gated-social-bridge-or-news", [], ["xAI", "SpaceXAI"]),
  org("z-ai", "Z.ai (formerly Zhipu AI)", TIER.SELECTIVE, "https://z.ai/company", "Official site / research", "topic-gated-official-feed-or-news", [], ["Z.ai", "Zhipu AI"]),
  org("tesla", "Tesla", TIER.SELECTIVE, "https://www.tesla.com/", "Official site / social", "topic-gated-social-bridge-or-news")
]);

const BY_ID = new Map(PROFILE_REGISTRY.map(profile => [profile.id, profile]));

function normalized(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIAS_TO_ID = new Map();
PROFILE_REGISTRY.forEach(profile => {
  [profile.id, profile.name, ...(profile.aliases || [])].forEach(alias => {
    const key = normalized(alias);
    if (key) ALIAS_TO_ID.set(key, profile.id);
  });
});

export function getProfile(id) {
  return BY_ID.get(id) || null;
}

export function getProfiles(ids = []) {
  return [...new Set(ids)].map(getProfile).filter(Boolean);
}

export function resolveProfileId(ref) {
  if (!ref) return null;
  if (BY_ID.has(ref)) return ref;
  return ALIAS_TO_ID.get(normalized(ref)) || null;
}

export function resolveProfileIds(refs = []) {
  return [...new Set((refs || []).map(resolveProfileId).filter(Boolean))];
}

function containsAlias(haystack, alias) {
  const needle = normalized(alias);
  if (!needle) return false;
  return (` ${haystack} `).includes(` ${needle} `);
}

export function detectProfileIds(values = [], seededRefs = []) {
  const found = new Set(resolveProfileIds(seededRefs));
  const haystack = normalized((Array.isArray(values) ? values : [values]).filter(Boolean).join(" "));
  if (!haystack) return [...found];

  PROFILE_REGISTRY.forEach(profile => {
    if (found.has(profile.id)) return;
    if ((profile.aliases || [profile.name]).some(alias => containsAlias(haystack, alias))) {
      found.add(profile.id);
    }
  });

  return [...found];
}

export function profilesForType(type, { includeWatchlist = true } = {}) {
  return PROFILE_REGISTRY.filter(profile =>
    profile.type === type && (includeWatchlist || profile.tier !== TIER.WATCHLIST)
  );
}

export function profileLabel(id) {
  return getProfile(id)?.name || id || "";
}
