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
  const main = read("js/main.js");
  const status = read("STATUS.md");
  const readme = read("README.md");
  const milestones = read("docs/architecture/V10_MILESTONE_MAP.md");

  assert(!main.includes("lucide@latest"), "Lucide CDN dependency must be pinned to an exact version.");
  assert(/const LUCIDE_VERSION = "\d+\.\d+\.\d+";/.test(main), "Pinned Lucide version constant is missing from js/main.js.");

  assert(main.includes("function wirePrimaryTabSemantics()"), "Primary tab semantics must be wired centrally.");
  assert(main.includes('tab.setAttribute("aria-controls", `panel-${key}`)'), "Primary tabs must reference their panels.");
  assert(main.includes('panel.setAttribute("role", "tabpanel")'), "Primary panels must declare role=tabpanel.");
  assert(main.includes('panel.setAttribute("aria-labelledby", `tab-${key}`)'), "Primary panels must reference their tabs.");
  assert(main.includes("wirePrimaryTabSemantics();"), "The centralized tab semantics function must execute during UI decoration.");

  assert(readme.includes("PierView.io"), "README must identify the PierView.io product direction.");
  assert(status.includes("V10-M09"), "STATUS.md must identify the current stable Product milestone before merge.");
  assert(milestones.includes("V10-M09"), "Stable milestone map must define Products & Platforms as V10-M09.");
  assert(milestones.includes("Do not use bare phase numbers"), "Stable milestone map must resolve phase-number ambiguity explicitly.");

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
await import("../js/tests/validate-products-platforms-v10.js");
await import("../js/tests/validate-v10-mobile-shell.js");

repositoryContractChecks();
console.log("All Intelligence Hub / PierView.io repository validations passed.");
