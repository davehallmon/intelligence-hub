export function initV81UI() {
  if (!document.querySelector('link[href="feed-intelligence.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "feed-intelligence.css";
    document.head.append(link);
  }

  const versionPill = document.querySelector(".meta-row .meta-pill");
  if (versionPill) versionPill.textContent = "v8.3.1";

  const newsDescription = document.querySelector("#panel-news .feed-panel-header p:last-child");
  if (newsDescription) newsDescription.textContent = "Official profile feeds plus Google News coverage, merged into one high-signal timeline.";

  const socialDescription = document.querySelector("#panel-socials .feed-panel-header p:last-child");
  if (socialDescription) socialDescription.textContent = "Direct public profile outlets plus your browser-local social bridge. No platform scraping.";

  const footer = document.querySelector(".footer > div:first-child");
  if (footer) {
    const strong = footer.querySelector("strong");
    footer.replaceChildren();
    if (strong) footer.append(strong);
    footer.append(document.createTextNode(" · v8.3.1 · Static GitHub Pages dashboard"));
  }
}
