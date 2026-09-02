import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import * as configuration from "../js/config/index.js";
import { validateFoundation } from "../js/config/validate-foundation.js";
import { validateNormalizationV10 } from "../tests/normalization-v10.test.js";
import { validateConnectorsV10 } from "../tests/connectors-v10.test.js";
import { validateLensReadModelV10 } from "../tests/lens-read-model-v10.test.js";
import { validateItemStoreV10 } from "../tests/item-store-v10.test.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const ROOT_FILE_ALLOWLIST = new Set([
  ".editorconfig",
  ".gitignore",
  ".nojekyll",
  ".nvmrc",
  "AGENTS.md",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "LICENSE.md",
  "README.md",
  "SECURITY.md",
  "STATUS.md",
  "TECHNICAL_SPEC.md",
  "app.js",
  "dashboard.css",
  "data-destinations-1.js",
  "data-destinations-2.js",
  "data-destinations-3.js",
  "data-watchlists-1.js",
  "data-watchlists-2.js",
  "feed-intelligence.css",
  "index.html",
  "my-feed.css",
  "package-lock.json",
  "package.json",
  "social-source-policy.css",
  "styles.css",
  "tabs.css"
]);

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

function filesMatching(dir, pattern) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...filesMatching(full, pattern));
    else if (pattern.test(entry.name)) results.push(full);
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

function localReference(fromFile, specifier) {
  if (!specifier || /^(?:[a-z]+:|\/\/|#)/i.test(specifier)) return null;
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) return null;

  const cleanSpecifier = specifier.replace(/[?#].*$/, "");
  const base = specifier.startsWith("/") ? root : path.dirname(fromFile);
  return path.resolve(base, cleanSpecifier.replace(/^\//, ""));
}

function browserReference(reference) {
  if (!reference || /^(?:[a-z]+:|\/\/|#)/i.test(reference)) return null;
  const cleanReference = reference.replace(/[?#].*$/, "").replace(/^\//, "");
  return cleanReference ? path.resolve(root, cleanReference) : null;
}

function javascriptReferences(file) {
  const source = fs.readFileSync(file, "utf8");
  const specifiers = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^"'`;]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }

  return [...specifiers]
    .map(specifier => localReference(file, specifier))
    .filter(Boolean);
}

function dependencyGraph(entries) {
  const visited = new Set();
  const pending = [...entries];

  while (pending.length) {
    const file = pending.pop();
    assert(fs.existsSync(file), `Local JavaScript reference does not resolve: ${relative(file)}`);
    if (visited.has(file)) continue;
    visited.add(file);

    if (/\.(?:js|mjs)$/.test(file)) pending.push(...javascriptReferences(file));
  }

  return visited;
}

function repositoryReachabilityChecks() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const htmlScripts = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1])
    .filter(specifier => !/^(?:[a-z]+:|\/\/|#)/i.test(specifier))
    .map(specifier => path.resolve(root, specifier.replace(/[?#].*$/, "").replace(/^\//, "")))
    .filter(Boolean);

  assert(htmlScripts.length > 0, "index.html must expose at least one local JavaScript entry point.");

  const productionGraph = dependencyGraph(htmlScripts);
  const validationGraph = dependencyGraph([path.join(root, "scripts/validate.mjs")]);
  const reachable = new Set([...productionGraph, ...validationGraph]);
  const orphaned = sourceFiles(root)
    .filter(file => !reachable.has(file))
    .map(relative)
    .sort();

  assert(
    orphaned.length === 0,
    `JavaScript files are unreachable from production or validation entry points: ${orphaned.join(", ")}`
  );

  const expectedConfigurationExports = [
    "ENTITY_TYPES",
    "ENTITY_REGISTRY",
    "WATCHLIST_TOPICS",
    "PERSON_INGESTION_PREFERENCES",
    "EVIDENCE_TYPES",
    "LENS_REGISTRY",
    "LEGACY_PROFILE_TO_ENTITY",
    "validateFoundation"
  ];
  const missingExports = expectedConfigurationExports.filter(name => !(name in configuration));
  assert(
    missingExports.length === 0,
    `js/config/index.js is missing public exports: ${missingExports.join(", ")}`
  );

  console.log(
    `Repository reachability passed (${productionGraph.size} production, ${validationGraph.size} validation files).`
  );

  return Object.freeze({ html, productionGraph, validationGraph });
}

function productionResourceChecks(html, productionGraph) {
  const references = new Set();

  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    const resource = browserReference(match[1]);
    if (resource) references.add(resource);
  }

  for (const file of productionGraph) {
    if (!/\.(?:js|mjs)$/.test(file)) continue;
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/["']([^"']+\.css(?:[?#][^"']*)?)["']/gi)) {
      const resource = browserReference(match[1]);
      if (resource) references.add(resource);
    }
  }

  const broken = [...references]
    .filter(file => !fs.existsSync(file))
    .map(relative)
    .sort();
  assert(broken.length === 0, `Production resources do not resolve: ${broken.join(", ")}`);
  console.log(`Production resource validation passed for ${references.size} local resources.`);
}

function rootFileContractChecks() {
  const unexpected = fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isFile() && !ROOT_FILE_ALLOWLIST.has(entry.name))
    .map(entry => entry.name)
    .sort();

  assert(
    unexpected.length === 0,
    `Unexpected repository-root files require an explicit placement decision: ${unexpected.join(", ")}`
  );
  console.log("Repository-root file contract passed.");
}

function markdownReferenceChecks() {
  const broken = [];
  const markdownFiles = filesMatching(root, /\.md$/).sort();

  for (const file of markdownFiles) {
    const source = fs.readFileSync(file, "utf8");
    const links = source.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+[^)]*)?\)/g);

    for (const match of links) {
      const reference = match[1].replace(/^<|>$/g, "");
      if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue;

      const target = reference.split("#", 1)[0];
      if (!target) continue;

      let decodedTarget;
      try {
        decodedTarget = decodeURIComponent(target);
      } catch {
        broken.push(`${relative(file)} -> ${reference} (invalid URI encoding)`);
        continue;
      }

      const resolved = path.resolve(path.dirname(file), decodedTarget);
      if (!fs.existsSync(resolved)) broken.push(`${relative(file)} -> ${reference}`);
    }
  }

  assert(broken.length === 0, `Broken local Markdown references: ${broken.join(", ")}`);
  console.log(`Markdown reference validation passed for ${markdownFiles.length} files.`);
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
const repositoryGraphs = repositoryReachabilityChecks();
productionResourceChecks(repositoryGraphs.html, repositoryGraphs.productionGraph);
rootFileContractChecks();
markdownReferenceChecks();
runResultSuite("Foundation validation", validateFoundation);
runResultSuite("Normalization validation", validateNormalizationV10);
runResultSuite("Connector validation", validateConnectorsV10);
runResultSuite("Lens read-model validation", validateLensReadModelV10);
runResultSuite("Shared item-store validation", validateItemStoreV10);

// These modules use node:assert and execute their fixtures on import.
await import("../tests/lens-service-v10.test.js");
await import("../tests/watchlist-visible-v10.test.js");
await import("../tests/people-organizations-v10.test.js");
await import("../tests/products-platforms-v10.test.js");
await import("../tests/product-attribution-v10.test.js");
await import("../tests/v10-mobile-shell.test.js");

repositoryContractChecks();
console.log("All Intelligence Hub / PierView.io repository validations passed.");
