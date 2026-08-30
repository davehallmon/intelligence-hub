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

export function firstImageFromHtml(value = "") {
  if (!value) return "";
  const doc = new DOMParser().parseFromString(String(value), "text/html");
  const image = doc.querySelector("img[src], source[srcset]");
  if (!image) return "";
  if (image.matches("img[src]")) return image.getAttribute("src") || "";
  const srcset = image.getAttribute("srcset") || "";
  return srcset.split(",")[0]?.trim().split(/\s+/)[0] || "";
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

function elementsByLocalName(node, localName) {
  return [...node.getElementsByTagName("*")].filter(el => el.localName === localName);
}

function firstMediaImage(node) {
  const thumbnails = elementsByLocalName(node, "thumbnail");
  for (const element of thumbnails) {
    const url = element.getAttribute("url") || element.getAttribute("href");
    if (url) return url;
  }

  const media = elementsByLocalName(node, "content");
  for (const element of media) {
    const type = (element.getAttribute("type") || "").toLowerCase();
    const medium = (element.getAttribute("medium") || "").toLowerCase();
    const url = element.getAttribute("url") || element.getAttribute("src");
    if (url && (medium === "image" || type.startsWith("image/"))) return url;
  }

  const enclosures = [...node.getElementsByTagName("enclosure")];
  for (const element of enclosures) {
    const type = (element.getAttribute("type") || "").toLowerCase();
    const url = element.getAttribute("url") || "";
    if (url && (!type || type.startsWith("image/"))) return url;
  }

  return "";
}

export function parseXmlFeed(xmlText, fallbackTitle = "") {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) throw new FeedFetchError("The feed returned invalid XML.");

  const feedTitle = childText(xml, ["title"]) || fallbackTitle;
  const feedLink = atomLink(xml);
  const nodes = [...xml.getElementsByTagName("item"), ...xml.getElementsByTagName("entry")];

  return {
    title: feedTitle,
    link: feedLink,
    items: nodes.map(node => {
      const authorNames = [...node.getElementsByTagName("author")]
        .map(author => childText(author, ["name"]) || author.textContent?.trim())
        .filter(Boolean);

      const sourceNode = node.getElementsByTagName("source")?.[0];
      const source = sourceNode?.textContent?.trim() || "";
      const sourceUrl = sourceNode?.getAttribute("url") || sourceNode?.getAttribute("href") || "";
      const rawContent = childText(node, ["content:encoded", "description", "summary", "content"]);
      const imageUrl = firstMediaImage(node) || firstImageFromHtml(rawContent);
      const videoId = childText(node, ["yt:videoId"]);

      return {
        title: childText(node, ["title"]) || "Untitled",
        link: atomLink(node),
        date: childText(node, ["pubDate", "published", "updated", "dc:date"]),
        description: stripHtml(rawContent),
        rawContent,
        author: authorNames.join(", ") || childText(node, ["dc:creator", "author"]),
        authors: authorNames,
        source,
        sourceUrl,
        id: childText(node, ["guid", "id"]),
        imageUrl,
        thumbnail: imageUrl,
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
      link: data.feed?.link || "",
      items: (data.items || []).map(item => {
        const rawContent = item.content || item.description || "";
        const enclosure = item.enclosure || {};
        const enclosureImage = String(enclosure.type || "").startsWith("image/") ? enclosure.link : "";
        const imageUrl = item.thumbnail || enclosureImage || firstImageFromHtml(rawContent);
        return {
          title: item.title || "Untitled",
          link: item.link || item.guid || "",
          date: item.pubDate || "",
          description: stripHtml(rawContent),
          rawContent,
          author: item.author || "",
          authors: item.author ? [item.author] : [],
          source: "",
          sourceUrl: data.feed?.link || "",
          id: item.guid || "",
          imageUrl,
          thumbnail: imageUrl,
          videoId: ""
        };
      })
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

    if (response.status === 401 || response.status === 403) throw new FeedFetchError("Readwise rejected the token.");
    if (!response.ok) throw new FeedFetchError(`Readwise returned HTTP ${response.status}.`);

    const data = await response.json();
    results.push(...(data.results || []));
    cursor = data.nextPageCursor || null;
    page += 1;
    if (!cursor) break;
  }

  return results;
}
