import { TOPIC_LABELS } from "./topics.js";
import { profilesForType } from "./profiles.js";
import { MY_FEED_DEFAULT_HIGH_TOPICS } from "./my-feed-config.js";

function ensureStylesheet() {
  if (document.querySelector('link[href="my-feed.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "my-feed.css";
  document.head.append(link);
}

function createPrimaryTab() {
  if (document.querySelector('[data-primary-tab="myfeed"]')) return;
  const nav = document.getElementById("primaryTabs");
  const first = nav?.querySelector("[data-primary-tab]");
  if (!nav || !first) return;

  const button = document.createElement("button");
  button.className = "primary-tab";
  button.type = "button";
  button.setAttribute("role", "tab");
  button.dataset.primaryTab = "myfeed";
  button.setAttribute("aria-selected", "false");
  button.tabIndex = -1;
  button.textContent = "My Feed";
  nav.insertBefore(button, first);
}

function createMyFeedPanel() {
  if (document.getElementById("panel-myfeed")) return;
  const workspace = document.querySelector("main.workspace");
  const launchpad = document.getElementById("panel-launchpad");
  if (!workspace || !launchpad) return;

  const panel = document.createElement("section");
  panel.className = "primary-panel feed-panel";
  panel.id = "panel-myfeed";
  panel.dataset.primaryPanel = "myfeed";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="feed-panel-header my-feed-intro">
      <div>
        <p class="panel-kicker">Personal intelligence layer</p>
        <h2>My Feed</h2>
        <p>The strongest signals across News, Socials, Academic, Research, and Video—ranked by explicit priorities, provenance, freshness, and diversity.</p>
      </div>
      <div class="feed-actions">
        <button class="btn" type="button" data-open-settings>Priorities</button>
        <button class="btn" type="button" data-refresh-feed="myfeed">Refresh</button>
      </div>
    </div>
    <div class="feed-health" id="myfeedStatus" aria-live="polite">Open this tab to rank your sources.</div>
    <section class="my-feed-section" aria-labelledby="myFeedAttentionTitle">
      <div class="my-feed-section-heading">
        <h3 id="myFeedAttentionTitle">Worth your attention</h3>
        <p>Top 8 · tighter diversity controls</p>
      </div>
      <div class="my-feed-list" id="myFeedAttention"></div>
    </section>
    <section class="my-feed-section" aria-labelledby="myFeedMoreTitle">
      <div class="my-feed-section-heading">
        <h3 id="myFeedMoreTitle">More for you</h3>
        <p>Broader ranked feed · up to 40 items</p>
      </div>
      <div class="my-feed-list" id="myFeedFeed"></div>
    </section>`;

  workspace.insertBefore(panel, launchpad);
}

function priorityDetails(title, count, containerId, open = false) {
  const details = document.createElement("details");
  details.className = "priority-details";
  details.open = open;
  const summary = document.createElement("summary");
  summary.textContent = `${title} · ${count}`;
  const list = document.createElement("div");
  list.className = "priority-list";
  list.id = containerId;
  details.append(summary, list);
  return details;
}

function createPrioritySettings() {
  if (document.getElementById("myFeedPrioritySettings")) return;
  const form = document.getElementById("settingsForm");
  const socialSection = document.querySelector('[aria-labelledby="socialBridgeHeading"]');
  if (!form || !socialSection) return;

  const people = profilesForType("person", { includeWatchlist: false });
  const organizations = profilesForType("organization", { includeWatchlist: false });

  const section = document.createElement("section");
  section.className = "settings-section";
  section.id = "myFeedPrioritySettings";
  section.setAttribute("aria-labelledby", "myFeedPriorityHeading");

  const heading = document.createElement("div");
  heading.className = "settings-section-heading";
  const title = document.createElement("span");
  title.id = "myFeedPriorityHeading";
  title.textContent = "My Feed priorities";
  const subtitle = document.createElement("small");
  subtitle.textContent = "Explicit preferences only. Intelligence Hub does not learn from clicks or silently change these settings.";
  heading.append(title, subtitle);

  const note = document.createElement("p");
  note.className = "settings-note";
  note.textContent = `v9.0 starts with ${MY_FEED_DEFAULT_HIGH_TOPICS.length} approved High Priority topics. Everything else starts at Normal; People and Organizations use their Core/Selective structural tiers unless you override them here.`;

  section.append(
    heading,
    note,
    priorityDetails("Topics", TOPIC_LABELS.length, "myFeedTopicPriorities", true),
    priorityDetails("People", people.length, "myFeedPeoplePriorities"),
    priorityDetails("Organizations", organizations.length, "myFeedOrganizationPriorities")
  );

  form.insertBefore(section, socialSection);
}

export function initMyFeedUI() {
  ensureStylesheet();
  createPrimaryTab();
  createMyFeedPanel();
  createPrioritySettings();
}
