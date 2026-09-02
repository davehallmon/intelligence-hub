import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function expect(source, snippet, label) {
  if (!source.includes(snippet)) throw new Error(`Missing ${label}: ${snippet}`);
}

const phase4 = read("js/phase4.js");
const watchlistMobile = read("js/lenses/watchlist-mobile.js");
const watchlistCss = read("css/lenses/watchlist-mobile.css");
const peopleCss = read("css/lenses/people-organizations.css");

expect(phase4, '"watchlist", "people-organizations"', "v10 refreshable routes");
expect(phase4, '"watchlistFeed", "peopleOrganizationsFeed"', "v10 saved-card containers");
expect(phase4, 'a.rich-feed-card', "rich-card Saved observer selector");
expect(phase4, 'watchlistFeed: "watchlist"', "Watchlist retry routing");
expect(phase4, 'peopleOrganizationsFeed: "people-organizations"', "People & Organizations retry routing");
expect(phase4, 'tab === "watchlist"', "Watchlist mobile shell handoff");
expect(phase4, 'tab === "people-organizations"', "People & Organizations mobile shell handoff");
expect(phase4, 'mobileShellMedia.addEventListener', "viewport handoff resync");

expect(watchlistMobile, '(max-width: 767px)', "shared mobile breakpoint");
expect(watchlistMobile, 'document.body.dataset.primaryView !== "watchlist"', "route-close guard");
expect(watchlistCss, '#watchlistRefresh', "mobile Watchlist refresh removal");
expect(watchlistCss, 'position: fixed;', "Watchlist topic fly-up positioning");
expect(watchlistCss, '.context-controls .watchlist-mobile-toggle', "Watchlist bottom-control styling");

expect(peopleCss, '#peopleOrganizationsRefresh', "mobile People refresh removal");
expect(peopleCss, '.context-controls .entity-lens-select-label', "People selector bottom-control styling");
expect(peopleCss, '.entity-lens-controls {\n    display: none;', "mobile inline People control removal");

console.log("v10 mobile-shell structural validation passed");
