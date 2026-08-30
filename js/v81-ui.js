export function initV81UI() {
  if (!document.querySelector('link[href="feed-intelligence.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "feed-intelligence.css";
    document.head.append(link);
  }

  const versionPill = document.querySelector(".meta-row .meta-pill");
  if (versionPill?.textContent?.trim() === "v8") versionPill.textContent = "v8.1";

  const footer = document.querySelector(".footer > div:first-child");
  if (footer) {
    const strong = footer.querySelector("strong");
    footer.replaceChildren();
    if (strong) footer.append(strong);
    footer.append(document.createTextNode(" · v8.1 · Static GitHub Pages dashboard"));
  }
}
