// Public, repository-safe feed configuration.
// Never put private tokens or private feed URLs in this file.
// Feed sources attach to canonical identities from profiles.js; profiles are not feeds.

export const FEED_CONFIG = Object.freeze({
  news: {
    freshness: "1d",
    maxItems: 48,
    queries: [
      { label: "OpenAI", query: "OpenAI", profileIds: ["org-openai"] },
      { label: "Anthropic", query: "Anthropic", profileIds: ["org-anthropic"] },
      { label: "Google DeepMind", query: "\"Google DeepMind\"", profileIds: ["org-google-deepmind"] },
      { label: "AI Agents", query: "\"AI agents\"", topics: ["AI Agents"] },
      { label: "AI Regulation", query: "\"AI regulation\"", topics: ["AI Regulation & Policy"] },
      { label: "AI Safety", query: "\"AI safety\"", topics: ["AI Safety & Alignment"] },
      { label: "AI Coding", query: "\"AI coding\"", topics: ["AI-powered Coding"] },
      { label: "Generative AI", query: "\"generative AI\"" }
    ]
  },

  socials: {
    maxItems: 50,
    // Direct public outlets can attach to a profile here. X/LinkedIn/Threads
    // profiles are intentionally supplied later through the browser-local social bridge.
    substackSources: [
      { name: "One Useful Thing", url: "https://www.oneusefulthing.org/", profileIds: ["person-ethan-mollick"] },
      { name: "Rachel Woods", url: "https://rachelwoods.substack.com/", profileIds: ["person-rachel-woods"] }
    ]
  },

  academic: {
    maxItems: 48,
    sources: [
      {
        name: "Harvard Business Review",
        feedUrl: "https://feeds.hbr.org/harvardbusiness",
        fallbackQuery: "site:hbr.org artificial intelligence OR technology OR leadership"
      },
      {
        name: "MIT Technology Review",
        feedUrl: "https://www.technologyreview.com/feed/",
        fallbackQuery: "site:technologyreview.com artificial intelligence"
      },
      {
        name: "Stanford HAI",
        feedUrl: "https://hai.stanford.edu/rss.xml",
        fallbackQuery: "site:hai.stanford.edu AI"
      },
      {
        name: "Knowledge at Wharton",
        feedUrl: null,
        fallbackQuery: "site:knowledge.wharton.upenn.edu AI OR technology OR management"
      }
    ]
  },

  research: {
    endpoint: "https://export.arxiv.org/api/query",
    searchQuery: "cat:cs.AI OR cat:cs.CL OR cat:cs.LG",
    maxResults: 45,
    maxItems: 45,
    pinTopics: ["AI Agents", "RAG", "Multimodal AI", "AI Safety & Alignment", "LLM-as-a-Judge"]
  },

  video: {
    maxItems: 36,
    // Add stable YouTube channel IDs (UC...) here and attach them to a profile ID.
    // Example: channels: [{ name: "Creator Name", channelId: "UC...", profileIds: ["person-creator-name"] }]
    channels: []
  }
});

export function googleNewsRss(query, freshness = "1d") {
  const q = `${query} when:${freshness}`.trim();
  const params = new URLSearchParams({ q, hl: "en-US", gl: "US", ceid: "US:en" });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

export function substackFeedUrl(url) {
  return `${String(url).replace(/\/+$/, "")}/feed`;
}

export function youtubeFeedUrl(channelId) {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

export function arxivQueryUrl(config = FEED_CONFIG.research) {
  const params = new URLSearchParams({
    search_query: config.searchQuery,
    start: "0",
    max_results: String(config.maxResults),
    sortBy: "submittedDate",
    sortOrder: "descending"
  });
  return `${config.endpoint}?${params.toString()}`;
}
