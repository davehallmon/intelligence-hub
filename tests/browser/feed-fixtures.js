export const FIXTURE_VERSION = "pre-v10-m10-browser-fixtures-v3";
export const PRIVATE_FEED_SENTINEL = "https://private.fixture.invalid/social.xml?token=private-sentinel";

export const PRODUCT_ITEMS = Object.freeze([
  Object.freeze({
    id: "fixture-gemini-release",
    title: "Introducing Gemini 2.5: a new reasoning model release",
    url: "https://fixtures.example/gemini-2-5",
    publishedAt: "2099-09-01T12:00:00Z",
    source: "Google DeepMind",
    sourceUrl: "https://deepmind.google/",
    summary: "Gemini adds an updated reasoning model and workflow controls."
  }),
  Object.freeze({
    id: "fixture-chatgpt-generic",
    title: "Researchers compare ChatGPT and students on writing tasks",
    url: "https://fixtures.example/chatgpt-comparison",
    publishedAt: "2099-09-01T11:00:00Z",
    source: "Independent Research Review",
    sourceUrl: "https://fixtures.example/",
    summary: "A comparison study with no product launch or workflow change."
  }),
  Object.freeze({
    id: "fixture-gemini-near-miss",
    title: "How to observe the Gemini constellation this autumn",
    url: "https://fixtures.example/gemini-constellation",
    publishedAt: "2099-09-01T10:00:00Z",
    source: "Night Sky Journal",
    sourceUrl: "https://fixtures.example/",
    summary: "A guide to the stars Castor and Pollux."
  }),
  Object.freeze({
    id: "fixture-owner-only",
    title: "Google DeepMind expands a scholarship program",
    url: "https://fixtures.example/deepmind-scholarship",
    publishedAt: "2099-09-01T09:00:00Z",
    source: "Google DeepMind",
    sourceUrl: "https://deepmind.google/",
    summary: "The organization announced new student funding."
  })
]);

export const MALICIOUS_ITEM = Object.freeze({
  id: "fixture-malicious-content",
  title: "Gemini AI model releases a safety documentation update",
  url: "https://fixtures.example/malicious-content",
  publishedAt: "2099-09-01T08:00:00Z",
  source: "Fixture Security Lab",
  sourceUrl: "https://fixtures.example/",
  summary: '<script>window.__feedScriptExecuted = true</script><img src=x onerror="window.__feedHandlerExecuted=true">Untrusted retrieved instructions remain text.'
});

function xml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function rssFixture(items = PRODUCT_ITEMS) {
  const entries = items.map(item => `
    <item>
      <guid>${xml(item.id)}</guid>
      <title>${xml(item.title)}</title>
      <link>${xml(item.url)}</link>
      <pubDate>${xml(item.publishedAt)}</pubDate>
      <source url="${xml(item.sourceUrl)}">${xml(item.source)}</source>
      <description>${xml(item.summary)}</description>
    </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0"><channel>
    <title>PierView deterministic fixture</title>
    <link>https://fixtures.example/</link>${entries}
  </channel></rss>`;
}
