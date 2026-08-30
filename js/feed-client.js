import { getSettings } from "./settings.js";

const DEFAULT_TIMEOUT = 12000;

export class FeedFetchError extends Error {
  constructor(message, { url, cause } = {}) {
    super(message);
    this.name = "FeedFetchError";
    this.url = url;
    this.cause = cause;
  }
}

function withTimeout(ms = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

export function stripHtml(value = "") {
  const doc = new DOMParser().parseFromString(String(value), "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

function childText(node, names) {
  for (const name of names) {
    const found = node.getElementsByTagName(name)?.[0];
    if (found?.textContent?.trim()) return found.textContent.trim();
  }
  return "";
}

function atomLink(node) {
  const links = [...node.getElementsByTagName("link")];
  const preferred =
    links.find(link => (link.getAttribute("rel") || "alternate") === "alternate" && link.getAttribute("href"))
    || links.find(link => link.getAttribute("href"));
  return preferred?.getAttribute("href") || childText(node, ["link"]);
}

function namespacedAttribute(node, tagName, attribute) {
  const elements = node.getElementsByTagName(tagName);
  return elements?.[0]?.getAttribute(attribute) || "";
}

export function parseXmlFeed(xmlText, fallbackTitle = "") {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) {
    throw new FeedFetchError("The feed returned invalid XML.");
  }

  const feedTitle = childText(xml, ["title"]) || fallbackTitle;
  const nodes = [
    ...xml.getElementsByTagName("item"),
    ...xml.getElementsByTagName("entry")
  ];

  return {
    title: feedTitle,
    items: nodes.map(node => {
      const authorNames = [...node.getElementsByTagName("author")]
        .map(author => childText(author, ["name"]) || author.textContent?.trim())
        .filter(Boolean);

      const sourceNode = node.getElementsByTagName("source")?.[0];
      const source = sourceNode?.textContent?.trim() || "";

      const thumbnail =
        namespacedAttribute(node, "media:thumbnail", "url") ||
        namespacedAttribute(node, "media:content", "url") ||
        childText(node, ["thumbnail"]);

      const videoId = childText(node, ["yt:videoId"]);

      return {
        title: childText(node, ["title"]) || "Untitled",
        link: atomLink(node),
        date: childText(node, ["pubDate", "published", "updated", "dc:date"]),
        description: stripHtml(childText(node, ["description", "summary", "content", "content:encoded"])),
        author: authorNames.join(", ") || childText(node, ["dc:creator", "author"]),
        authors: authorNames,
        source,
        id: childText(node, ["guid", "id"]),
        thumbnail,
        videoId
      };
    })
  };
}

async function fetchTextDirect(url, timeout = DEFAULT_TIMEOUT) {
  const timer = withTimeout(timeout);
  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      signal: timer.signal,
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    timer.cancel();
  }
}

async function fetchViaRss2Json(feedUrl, timeout = DEFAULT_TIMEOUT) {
  const settings = getSettings();
  const params = new URLSearchParams({ rss_url: feedUrl });
  if (settings.rss2jsonApiKey) params.set("api_key", settings.rss2jsonApiKey);

  const timer = withTimeout(timeout);
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?${params.toString()}`, {
      credentials: "omit",
      cache: "no-store",
      signal: timer.signal
    });
    if (!response.ok) throw new Error(`RSS2JSON HTTP ${response.status}`);

    const data = await response.json();
    if (data.status !== "ok") throw new Error(data.message || "RSS2JSON rejected the feed.");

    return {
      title: data.feed?.title || "",
      items: (data.items || []).map(item => ({
        title: item.title || "Untitled",
        link: item.link || item.guid || "",
        date: item.pubDate || "",
        description: stripHtml(item.description || item.content || ""),
        author: item.author || "",
        authors: item.author ? [item.author] : [],
        source: "",
        id: item.guid || "",
        thumbnail: item.thumbnail || item.enclosure?.link || "",
        videoId: ""
      }))
    };
  } finally {
    timer.cancel();
  }
}

export async function fetchPublicFeed(feedUrl, { timeout = DEFAULT_TIMEOUT } = {}) {
  let directError;
  try {
    const text = await fetchTextDirect(feedUrl, timeout);
    return { ...(parseXmlFeed(text)), transport: "direct" };
  } catch (error) {
    directError = error;
  }

  try {
    return { ...(await fetchViaRss2Json(feedUrl, timeout)), transport: "rss2json" };
  } catch (proxyError) {
    throw new FeedFetchError("Feed unavailable by direct request and public proxy.", {
      url: feedUrl,
      cause: { directError, proxyError }
    });
  }
}

export async function fetchPrivateFeed(feedUrl, { timeout = DEFAULT_TIMEOUT } = {}) {
  // Privacy rule: never forward a private/tokenized URL to a third-party proxy.
  try {
    const text = await fetchTextDirect(feedUrl, timeout);
    return { ...(parseXmlFeed(text)), transport: "direct-private" };
  } catch (error) {
    throw new FeedFetchError(
      "This private feed could not be fetched directly. Its host must allow CORS; it will not be sent through a public proxy.",
      { url: feedUrl, cause: error }
    );
  }
}

export async function fetchReadwiseExport(token, { updatedAfter, maxPages = 4 } = {}) {
  if (!token) throw new FeedFetchError("No Readwise API token is configured.");

  let cursor = null;
  let page = 0;
  const results = [];

  while (page < maxPages) {
    const params = new URLSearchParams();
    if (updatedAfter) params.set("updatedAfter", updatedAfter);
    if (cursor) params.set("pageCursor", cursor);

    const timer = withTimeout(15000);
    let response;
    try {
      response = await fetch(`https://readwise.io/api/v2/export/?${params.toString()}`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        signal: timer.signal,
        headers: { Authorization: `Token ${token}` }
      });
    } finally {
      timer.cancel();
    }

    if (response.status === 401 || response.status === 403) {
      throw new FeedFetchError("Readwise rejected the token.");
    }
    if (!response.ok) {
      throw new FeedFetchError(`Readwise returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    results.push(...(data.results || []));
    cursor = data.nextPageCursor || null;
    page += 1;
    if (!cursor) break;
  }

  return results;
}
