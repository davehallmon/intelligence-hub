// Public, repository-safe feed configuration.
// Never put private tokens or private feed URLs in this file.

export const FEED_CONFIG = Object.freeze({
  news: {
    freshness: "1d",
    maxItems: 48,
    queries: [
      "OpenAI",
      "Anthropic",
      "\"Google DeepMind\"",
      "\"AI agents\"",
      "\"AI regulation\"",
      "\"AI safety\"",
      "\"AI coding\"",
      "\"generative AI\""
    ]
  },

  socials: {
    maxItems: 50,
    substackSources: [
      { name: "One Useful Thing", url: "https://www.oneusefulthing.org/" },
      { name: "Rachel Woods", url: "https://rachelwoods.substack.com/" }
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
    pinKeywords: [
      "agentic",
      "genai",
      "generative ai",
      "large language model",
      "llm",
      "retrieval augmented generation",
      "rag",
      "multimodal"
    ]
  },

  video: {
    maxItems: 36,
    // Add stable YouTube channel IDs (UC...) here.
    // Example: channels: [{ name: "Creator Name", channelId: "UCxxxxxxxxxxxxxxxxxxxxxx" }]
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
