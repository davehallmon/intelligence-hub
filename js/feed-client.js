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

function numericDimension(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function imageUrlLooksLowValue(url = "") {
  const value = String(url).toLowerCase();
  return (
    !/^https?:\/\//i.test(value)
    || /\b(?:pixel|spacer|beacon|tracking|analytics|transparent|blank)\b/i.test(value)
    || /(?:^|[\/_.-])1x1(?:[\/_.-]|$)/i.test(value)
    || /gravatar\.com\/avatar/i.test(value)
    || /doubleclick|google-analytics|scorecardresearch/i.test(value)
  );
}

function scoreImageCandidate(candidate) {
  if (!candidate?.url || imageUrlLooksLowValue(candidate.url)) return -Infinity;

  const width = Number(candidate.width || 0);
  const height = Number(candidate.height || 0);
  const url = String(candidate.url).toLowerCase();
  let score = Number(candidate.baseScore || 0);

  if (width && height && (width <= 80 || height <= 80)) return -Infinity;
  if (width >= 320) score += 4;
  if (width >= 640) score += 4;
  if (width >= 1000) score += 2;
  if (height >= 180) score += 3;
  if (height >= 360) score += 2;

  if (width && height) {
    const ratio = width / height;
    if (ratio >= 1.2 && ratio <= 2.2) score += 3;
  }

  if (/\b(?:hero|featured|feature|cover|lead|article|post|story)\b/i.test(url)) score += 3;
  if (/wp-content|uploads|images|image|cdn/i.test(url)) score += 1;
  if (/\b(?:avatar|profile|emoji|icon|logo|badge)\b/i.test(url)) score -= 5;

  return score;
}

function bestCandidate(candidates) {
  return candidates
    .map(candidate => ({ ...candidate, score: scoreImageCandidate(candidate) }))
    .filter(candidate => Number.isFinite(candidate.score))
    .sort((a, b) => b.score - a.score)[0]?.url || "";
}

function parseSrcset(srcset = "") {
  return String(srcset)
    .split(",")
    .map(part => {
      const [url, descriptor = ""] = part.trim().split(/\s+/, 2);
      const widthMatch = descriptor.match(/^(\d+)w$/i);
      const densityMatch = descriptor.match(/^([\d.]+)x$/i);
      return {
        url,
        width: widthMatch ? Number(widthMatch[1]) : densityMatch ? Math.round(Number(densityMatch[1]) * 640) : 0,
        baseScore: densityMatch ? Number(densityMatch[1]) : 0
      };
    })
    .filter(candidate => candidate.url);
}

export function firstImageFromHtml(value = "") {
  if (!value) return "";
  const doc = new DOMParser().parseFromString(String(value), "text/html");
  const candidates = [];

  doc.querySelectorAll('meta[property="og:image"][content], meta[name="twitter:image"][content]').forEach(meta => {
    candidates.push({ url: meta.getAttribute("content"), baseScore: 8 });
  });

  doc.querySelectorAll("img[src], img[srcset]").forEach(image => {
    const width = numericDimension(image.getAttribute("width"));
    const height = numericDimension(image.getAttribute("height"));
    const src = image.getAttribute("src");
    if (src) candidates.push({ url: src, width, height, baseScore: 2 });
    parseSrcset(image.getAttribute("srcset")).forEach(candidate => {
      candidates.push({ ...candidate, height, baseScore: 4 });
    });
  });

  doc.querySelectorAll("source[srcset]").forEach(source => {
    parseSrcset(source.getAttribute("srcset")).forEach(candidate => {
      candidates.push({ ...candidate, baseScore: 5 });
    });
  });

  return bestCandidate(candidates);
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

function bestMediaImage(node) {
  const candidates = [];

  elementsByLocalName(node, "thumbnail").forEach(element => {
    const url = element.getAttribute("url") || element.getAttribute("href");
    if (!url) return;
    candidates.push({
      url,
      width: numericDimension(element.getAttribute("width")),
      height: numericDimension(element.getAttribute("height")),
      baseScore: 5
    });
  });

  elementsByLocalName(node, "content").forEach(element => {
    const type = (element.getAttribute("type") || "").toLowerCase();
    const medium = (element.getAttribute("medium") || "").toLowerCase();
    const url = element.getAttribute("url") || element.getAttribute("src");
    if (!url || !(medium === "image" || type.startsWith("image/"))) return;
    candidates.push({
      url,
      width: numericDimension(element.getAttribute("width")),
      height: numericDimension(element.getAttribute("height")),
      baseScore: 7
    });
  });

  [...node.getElementsByTagName("enclosure")].forEach(element => {
    const type = (element.getAttribute("type") || "").toLowerCase();
    const url = element.getAttribute("url") || "";
    if (!url || (type && !type.startsWith("image/"))) return;
    candidates.push({ url, baseScore: 6 });
  });

  return bestCandidate(candidates);
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
      const imageUrl = bestMediaImage(node) || firstImageFromHtml(rawContent);
      const videoId = childText(node, ["yt:videoId"]);

      return {
        title: childText(node, ["title"]) || "Untitled",
        link: atomLink(node) || childText(node, ["guid"]),
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
        const candidates = [
          { url: item.thumbnail || "", baseScore: 5 },
          {
            url: String(enclosure.type || "").startsWith("image/") ? enclosure.link : "",
            baseScore: 6
          },
          { url: firstImageFromHtml(rawContent), baseScore: 4 }
        ];
        const imageUrl = bestCandidate(candidates);

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
