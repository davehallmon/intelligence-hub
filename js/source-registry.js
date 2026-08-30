// Intelligence Hub v8.5 — public source registry.
// Profiles are identities; sources are publishing outlets attached to those identities.
// Only public, repository-safe URLs belong here. Private social bridge URLs remain in localStorage.

const VERIFIED_AT = "2026-08-30";

function source({ id, name, tab, kind, url, channelId = "", profileIds = [], candidateProfileIds = [], topics = [], note = "" }) {
  return Object.freeze({ id, name, tab, kind, url, channelId, profileIds: Object.freeze(profileIds), candidateProfileIds: Object.freeze(candidateProfileIds), topics: Object.freeze(topics), note, verifiedAt: VERIFIED_AT });
}

export const PUBLIC_SOURCE_REGISTRY = Object.freeze([
  // People — direct public publishing outlets.
  source({ id: "sam-altman-blog", name: "Sam Altman", tab: "socials", kind: "atom", url: "https://blog.samaltman.com/posts.atom", profileIds: ["person-sam-altman"] }),
  source({ id: "ai-adopters-club", name: "AI Adopters Club", tab: "socials", kind: "rss", url: "https://aiadopters.club/feed", profileIds: ["person-kamil-banc"] }),
  source({ id: "import-ai", name: "Import AI", tab: "socials", kind: "rss", url: "https://importai.substack.com/feed", profileIds: ["person-jack-clark"] }),
  source({ id: "normal-technology", name: "AI as Normal Technology", tab: "socials", kind: "rss", url: "https://www.normaltech.ai/feed", candidateProfileIds: ["person-arvind-narayanan", "person-sayash-kapoor"], note: "Shared publication; resolve authors per item rather than tagging every item to both people." }),
  source({ id: "one-useful-thing", name: "One Useful Thing", tab: "socials", kind: "rss", url: "https://www.oneusefulthing.org/feed", profileIds: ["person-ethan-mollick"] }),
  source({ id: "simon-willison", name: "Simon Willison", tab: "socials", kind: "atom", url: "https://simonwillison.net/atom/everything-but-beats/", profileIds: ["person-simon-willison"] }),
  source({ id: "rachel-woods", name: "Rachel Woods", tab: "socials", kind: "rss", url: "https://rachelwoods.substack.com/feed", profileIds: ["person-rachel-woods"] }),

  // Organizations — direct official/public feeds.
  source({ id: "openai-news", name: "OpenAI", tab: "news", kind: "rss", url: "https://openai.com/news/rss.xml", profileIds: ["org-openai"] }),
  source({ id: "deepmind-blog", name: "Google DeepMind", tab: "news", kind: "rss", url: "https://deepmind.google/blog/rss.xml", profileIds: ["org-google-deepmind"] }),
  source({ id: "nvidia-generative-ai", name: "NVIDIA · Generative AI", tab: "news", kind: "rss", url: "https://nvidianews.nvidia.com/cats/generative_al.xml", profileIds: ["org-nvidia"], topics: ["Multimodal AI", "Cost & Latency Optimization"] }),
  source({ id: "aws-ai", name: "AWS Artificial Intelligence", tab: "news", kind: "rss", url: "https://aws.amazon.com/blogs/machine-learning/feed/", profileIds: ["org-amazon-web-services"] }),
  source({ id: "hugging-face-blog", name: "Hugging Face", tab: "news", kind: "rss", url: "https://huggingface.co/blog/feed.xml", profileIds: ["org-hugging-face"] }),
  source({ id: "microsoft-research-ai", name: "Microsoft Research · AI", tab: "news", kind: "rss", url: "https://www.microsoft.com/en-us/research/blog/category/artificial-intelligence/feed/", profileIds: ["org-microsoft"] }),
  source({ id: "ai2", name: "Ai2", tab: "news", kind: "rss", url: "https://allenai.org/rss.xml", profileIds: ["org-ai2"] }),

  // Video — official YouTube channels exposed through YouTube's public Atom feeds.
  source({ id: "openai-youtube", name: "OpenAI", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCXZCJLdBC09xxGZ6gcdrc6A", channelId: "UCXZCJLdBC09xxGZ6gcdrc6A", profileIds: ["org-openai"] }),
  source({ id: "anthropic-youtube", name: "Anthropic", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCrDwWp7EBBv4NwvScIpBDOA", channelId: "UCrDwWp7EBBv4NwvScIpBDOA", profileIds: ["org-anthropic"] }),
  source({ id: "deepmind-youtube", name: "Google DeepMind", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCP7jMXSY2xbc3KCAE0MHQ-A", channelId: "UCP7jMXSY2xbc3KCAE0MHQ-A", profileIds: ["org-google-deepmind"] }),
  source({ id: "nvidia-youtube", name: "NVIDIA", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCHuiy8bXnmK5nisYHUd1J5g", channelId: "UCHuiy8bXnmK5nisYHUd1J5g", profileIds: ["org-nvidia"] }),
  source({ id: "hugging-face-youtube", name: "Hugging Face", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCHlNU7kIZhRgSbhHvFoy72w", channelId: "UCHlNU7kIZhRgSbhHvFoy72w", profileIds: ["org-hugging-face"] }),
  source({ id: "mistral-youtube", name: "Mistral AI", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UC5-pBdfdA3KUo-vq72l-umA", channelId: "UC5-pBdfdA3KUo-vq72l-umA", profileIds: ["org-mistral-ai"] }),
  source({ id: "cohere-youtube", name: "Cohere", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCAKTUy0tz47ZY02DFpxMqoQ", channelId: "UCAKTUy0tz47ZY02DFpxMqoQ", profileIds: ["org-cohere"] }),
  source({ id: "perplexity-youtube", name: "Perplexity AI", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCYqxnCFtaC4-iC_bwt2bRLg", channelId: "UCYqxnCFtaC4-iC_bwt2bRLg", profileIds: ["org-perplexity-ai"] }),
  source({ id: "microsoft-research-youtube", name: "Microsoft Research", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCCb9_Kn8F_Opb3UCGm-lILQ", channelId: "UCCb9_Kn8F_Opb3UCGm-lILQ", profileIds: ["org-microsoft"], note: "Official Microsoft Research channel; intentionally narrower than the broader Microsoft profile." }),
  source({ id: "ai2-youtube", name: "Ai2", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCEqgmyWChwvt6MFGGlmUQCQ", channelId: "UCEqgmyWChwvt6MFGGlmUQCQ", profileIds: ["org-ai2"] }),
  source({ id: "ai-daily-brief-youtube", name: "The AI Daily Brief", tab: "video", kind: "youtube", url: "https://www.youtube.com/channel/UCKelCK4ZaO6HeEI1KQjqzWA", channelId: "UCKelCK4ZaO6HeEI1KQjqzWA", profileIds: ["person-nathaniel-whittemore"], note: "Show channel hosted by Nathaniel Whittemore and treated as his primary video outlet." })
]);

export function publicSourcesFor(tab) {
  return PUBLIC_SOURCE_REGISTRY.filter(entry => entry.tab === tab);
}
