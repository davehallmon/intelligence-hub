import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateFoundation } from "../js/config/validate-foundation.js";
import { validateNormalizationV10 } from "../js/tests/validate-normalization-v10.js";
import { validateConnectorsV10 } from "../js/tests/validate-connectors-v10.js";
import { validateLensReadModelV10 } from "../js/tests/validate-lens-read-model-v10.js";
import { validateItemStoreV10 } from "../js/tests/validate-item-store-v10.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function sourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...sourceFiles(full));
    else if (/\.(?:js|mjs)$/.test(entry.name)) results.push(full);
  }
  return results;
}

function syntaxCheck() {
  const files = sourceFiles(root).sort();
  for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], {
      cwd: root,
      encoding: "utf8"
    });
    if (result.status !== 0) {
      throw new Error(`Syntax check failed for ${relative(file)}\n${result.stderr || result.stdout}`);
    }
  }
  console.log(`Syntax validation passed for ${files.length} JavaScript files.`);
}

function runResultSuite(name, validator) {
  const result = validator();
  assert(result?.ok !== false, `${name} failed: ${(result?.errors || []).join("; ")}`);
  if (result?.warnings?.length) {
    console.warn(`${name} warnings: ${result.warnings.join("; ")}`);
  }
  const fixtureCount = result?.fixtures?.length;
  console.log(`${name} passed${Number.isInteger(fixtureCount) ? ` (${fixtureCount} fixtures)` : ""}.`);
}

function repositoryContractChecks() {
  const read = file => fs.readFileSync(path.join(root, file), "utf8");
  const index = read("index.html");
  const main = read("js/main.js");
  const myFeed = read("js/my-feed-ui.js");
  const watchlist = read("js/watchlist-ui.js");
  const people = read("js/people-organizations-ui.js");
  const status = read("STATUS.md");
  const readme = read("README.md");

  assert(!main.includes("lucide@latest"), "Lucide CDN dependency must be pinned to an exact version.");
  assert(/lucide@\d+\.\d+\.\d+/.test(main), "Pinned Lucide version is missing from js/main.js.");

  const staticTabs = ["myfeed", "news", "socials", "academic", "research", "video", "books", "launchpad"];
  for (const tab of staticTabs) {
    assert(index.includes(`id="tab-${tab}"`), `Primary tab ${tab} must have a stable id.`);
    assert(index.includes(`aria-controls="panel-${tab}"`), `Primary tab ${tab} must point to its panel.`);
  }

  const staticPanels = ["launchpad", "news", "socials", "academic", "research", "video", "books"];
  for (const panel of staticPanels) {
    const panelPattern = new RegExp(`<section[^>]+id="panel-${panel}"[^>]+role="tabpanel"[^>]+aria-labelledby="tab-${panel}"|<section[^>]+id="panel-${panel}"[^>]+aria-labelledby="tab-${panel}"[^>]+role="tabpanel"`);
    assert(panelPattern.test(index), `panel-${panel} must implement the ARIA tabpanel relationship.`);
  }

  assert(myFeed.includes('panel.setAttribute("role", "tabpanel")'), "Dynamic My Feed panel must declare role=tabpanel.");
  assert(myFeed.includes('panel.setAttribute("aria-labelledby", "tab-myfeed")'), "Dynamic My Feed panel must reference tab-myfeed.");

  assert(watchlist.includes('button.id = "tab-watchlist"'), "Watchlist tab must have a stable id.");
  assert(watchlist.includes('button.setAttribute("aria-controls", "panel-watchlist")'), "Watchlist tab must reference panel-watchlist.");
  assert(watchlist.includes('panel.setAttribute("role", "tabpanel")'), "Watchlist panel must declare role=tabpanel.");
  assert(watchlist.includes('panel.setAttribute("aria-labelledby", "tab-watchlist")'), "Watchlist panel must reference tab-watchlist.");

  assert(people.includes('button.id = "tab-people-organizations"'), "People & Organizations tab must have a stable id.");
  assert(people.includes('button.setAttribute("aria-controls", "panel-people-organizations")'), "People & Organizations tab must reference its panel.");
  assert(people.includes('panel.setAttribute("role", "tabpanel")'), "People & Organizations panel must declare role=tabpanel.");
  assert(people.includes('panel.setAttribute("aria-labelledby", "tab-people-organizations")'), "People & Organizations panel must reference its tab.");

  assert(!index.includes("</strong>Try"), "Launchpad empty-state copy must contain whitespace after the strong element.");
  assert(readme.includes("PierView.io"), "README must identify the PierView.io product direction.");
  assert(status.includes("V10-M09"), "STATUS.md must identify the next stable milestone.");

  console.log("Repository contract/accessibility checks passed.");
}

syntaxCheck();
runResultSuite("Foundation validation", validateFoundation);
runResultSuite("Normalization validation", validateNormalizationV10);
runResultSuite("Connector validation", validateConnectorsV10);
runResultSuite("Lens read-model validation", validateLensReadModelV10);
runResultSuite("Shared item-store validation", validateItemStoreV10);

// These modules use node:assert and execute their fixtures on import.
await import("../js/tests/validate-lens-service-v10.js");
await import("../js/tests/validate-watchlist-visible-v10.js");
await import("../js/tests/validate-people-organizations-v10.js");
await import("../js/tests/validate-v10-mobile-shell.js");

repositoryContractChecks();
console.log("All Intelligence Hub / PierView.io repository validations passed.");
