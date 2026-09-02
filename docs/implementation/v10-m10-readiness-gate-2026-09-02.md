# PierView.io / Intelligence Hub — Pre-V10-M10 Readiness Gate

**Purpose:** Define the complete, auditable set of conditions that must be satisfied before implementation begins on **V10-M10 — Publications & Media migration**.

**Repository:** [`davehallmon/intelligence-hub`](https://github.com/davehallmon/intelligence-hub)

**Governed tracker:** [GitHub Issue #40](https://github.com/davehallmon/intelligence-hub/issues/40)

**Initial baseline:** `main@b602c1af3c8027cb75e57781d7b617f83fb1b048`

**Established:** 2026-09-02

**Gate state at establishment:** **PAUSED / NOT YET SATISFIED**

## 1. Gate Decision Rule

V10-M10 must remain paused until every requirement marked **MUST** in this document has one of these evidence-backed dispositions:

- **PASS** — the requirement is demonstrably satisfied;
- **N/A — approved** — the requirement is genuinely inapplicable and the owner/judge has recorded why;
- **WAIVED — approved** — an explicit owner decision accepts a bounded residual risk, names the reason, records an expiration or reconsideration boundary, and does not waive a P0 correctness, privacy, or state-integrity invariant.

The following do **not** satisfy the gate:

- documentation claiming completion without executable proof;
- a green source validator used as a substitute for browser/runtime evidence;
- a successful Pages deployment used as a substitute for application behavior;
- an implementation agent's unsupported statement that work is complete;
- tests containing only hand-constructed objects while the production ingestion seam remains untested;
- screenshots without reproducible steps, fixture identity, and commit provenance;
- partial completion described as “substantially complete.”

The gate should be evaluated from a clean checkout of the proposed final `main` candidate. A failure in any P0 requirement keeps V10-M10 paused. Any other failed MUST requirement also keeps the gate closed unless formally waived under the rule above.

## 2. Audit Status Vocabulary

Use only:

| Status | Meaning |
| --- | --- |
| `NOT EVALUATED` | No audit judgment has been made. |
| `PASS` | Required behavior and evidence are present. |
| `FAIL` | Evidence shows the requirement is not satisfied. |
| `BLOCKED` | Evaluation cannot proceed because a named dependency or decision is missing. |
| `N/A — approved` | Inapplicability was explicitly approved and documented. |
| `WAIVED — approved` | Residual risk was explicitly accepted under the gate rule. |

Every status must identify the evaluating commit SHA and link or path to the evidence.

---

## 3. Authority and Pause-State Requirements

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| AUTH-01 | MUST | `STATUS.md` explicitly states that V10-M10 is paused pending this readiness gate. | Commit diff and final file link. | The present-state authority names this gate and does not direct implementation into V10-M10 prematurely. | NOT EVALUATED |
| AUTH-02 | MUST | V10-M09 status distinguishes **component implementation** from **operational/browser acceptance**. | Updated status language and Product acceptance evidence links. | V10-M09 is not described as fully proven until the live Product path passes. | NOT EVALUATED |
| AUTH-03 | MUST | One GitHub issue or equivalent governed tracker contains every MUST requirement ID in this document. | Issue URL and checklist mapping. | No requirement is omitted, renamed ambiguously, or scattered across unrelated issues. | NOT EVALUATED |
| AUTH-04 | MUST | Existing Issues #30, #31, #32, #34, and #36 are linked to the appropriate requirement IDs. | Tracker links and issue cross-references. | Existing evidence and decisions remain discoverable; duplicate issues are not created unnecessarily. | NOT EVALUATED |
| AUTH-05 | MUST | The authority order remains unambiguous. | `STATUS.md`, `AGENTS.md`, repository map, architecture/configuration links. | A cold-start contributor can identify present state, target architecture, approved configuration, migration sequence, and historical evidence. | NOT EVALUATED |
| AUTH-06 | MUST | The exact audit baseline and candidate SHA are recorded. | Full 40-character SHAs and remote verification. | Auditor can reproduce the tree without relying on branch names alone. | NOT EVALUATED |

---

## 4. V10-M09 Product Attribution and Runtime Correctness

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| PROD-01 | MUST / P0 | A deterministic Product relationship resolver operates in the shared production normalization path. | Source diff, unit tests, and browser trace. | Live-shaped items receive canonical Product IDs before entering the shared item store. | NOT EVALUATED |
| PROD-02 | MUST / P0 | The observed Google DeepMind/Gemini announcement class resolves to `product-gemini`. | Stable fixture derived from the observed item and normalization trace. | “Introducing Gemini …” produces an explainable Gemini Product relationship. | NOT EVALUATED |
| PROD-03 | MUST / P0 | Product matching uses high-precision aliases and context rather than unrestricted substring matching. | Decision table and positive/negative fixtures. | Exact names and approved aliases match; ambiguous common-language uses are rejected. | NOT EVALUATED |
| PROD-04 | MUST / P0 | Organization ownership alone does not assign every item from an owner to all its Products. | Negative fixtures for Google, Microsoft, OpenAI, Anthropic, and Instructure. | Unrelated organization news does not become a Product match. | NOT EVALUATED |
| PROD-05 | MUST | Parent/child Product inheritance remains correct. | Claude Skills → Claude and Custom GPTs → ChatGPT fixtures. | Child items resolve through monitored parents without consuming new continuous-monitoring slots. | NOT EVALUATED |
| PROD-06 | MUST | Parked/Known Product boundaries remain intact. | Positive explicit-query and negative default-query fixtures. | Parked Products do not enter continuous monitoring but remain explicitly queryable. | NOT EVALUATED |
| PROD-07 | MUST | Product match reasons are deterministic and visible. | Browser DOM assertion and reason-generation unit test. | A user can understand which Product matched and why. | NOT EVALUATED |
| PROD-08 | MUST / P0 | One canonical item is reused across My Feed, Products & Platforms, People/Organizations, Watchlist, or other applicable lenses. | Object-identity/store trace and cross-lens assertions. | No lens-specific ingestion or duplicate canonical object is introduced. | NOT EVALUATED |
| PROD-09 | MUST | Meaningful-change classification remains separate from Product relationship attribution. | Tests covering matched-but-generic and matched-and-meaningful items. | “All matched items” preserves canonical matches while the default view filters presentation only. | NOT EVALUATED |
| PROD-10 | MUST | The live Products & Platforms lens can render a populated state using production-shaped data. | Deterministic browser run and post-deployment read-only smoke evidence. | At least one valid Product change renders with provenance and match reason. | NOT EVALUATED |
| PROD-11 | MUST | Empty-state behavior remains valid when no Products match. | Browser fixture and DOM assertion. | A genuine zero-match dataset produces the documented empty state without false error/success. | NOT EVALUATED |
| PROD-12 | MUST | A deliberately ambiguous near miss is rejected and recorded. | Negative trace fixture. | The rejection is observable and does not depend on a human manually checking the UI. | NOT EVALUATED |

---

## 5. Evidence, Provenance, and Relationship Semantics

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| EVID-01 | MUST | Current operational evidence classes have deterministic assignment rules. | Rule table and table-driven tests. | Research, primary source, independent reporting, private, community, and unknown cases do not contradict their source evidence. | NOT EVALUATED |
| EVID-02 | MUST | Verification status is truthful rather than a schema placeholder. | Tests and source rules for every non-null/default state. | Runtime does not silently label every item identically while implying richer verification. | NOT EVALUATED |
| EVID-03 | MUST | `authored-by`, `published-by`, `featuring`, `about/mentioned`, source ownership, and Product relationships remain distinct. | Positive and collision fixtures. | No role is inferred from another merely for convenience. | NOT EVALUATED |
| EVID-04 | MUST | Coverage about an entity does not make that entity the publisher/source. | Google News and independent-reporting fixtures. | Subject, publisher, and endpoint semantics remain distinct. | NOT EVALUATED |
| EVID-05 | MUST | Private provenance remains explicit through normalization, storage, lens selection, and rendering. | Private-item trace. | Privacy state is neither lost nor converted to public provenance. | NOT EVALUATED |
| EVID-06 | MUST | User-visible provenance matches the canonical object. | Browser DOM assertions. | Source label, relationship reason, transport/evidence label where shown, and destination URL are semantically accurate. | NOT EVALUATED |

---

## 6. Automated Verification and False-Success Prevention

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| TEST-01 | MUST | The existing dependency-light `npm run validate` gate remains green. | Clean-checkout command output and CI URL. | Syntax, reachability, resources, Markdown links, root placement, configuration, and existing fixtures all pass. | NOT EVALUATED |
| TEST-02 | MUST / P0 | A dependency-pinned browser test suite executes the real application. | Manifest/lockfile, command, CI job, and results. | Tests load the deployed/static app in an actual browser engine rather than checking source strings only. | NOT EVALUATED |
| TEST-03 | MUST | Deterministic network fixtures or interception cover public feeds. | Fixture inventory with hashes and browser trace. | Core CI does not depend on changing third-party content or live network timing. | NOT EVALUATED |
| TEST-04 | MUST | Live-network smoke tests are separated from deterministic acceptance. | Separate command/job and documented failure policy. | Third-party outages cannot masquerade as deterministic product regressions, and live failures remain visible. | NOT EVALUATED |
| TEST-05 | MUST | Browser tests cover loading, ready, populated, empty, partial, error, timeout, and retry states. | Case results and trace artifacts. | Each state is deliberately induced and correctly rendered. | NOT EVALUATED |
| TEST-06 | MUST | Browser tests cover desktop and mobile navigation. | Viewport matrix and results. | Route selection, selected-tab semantics, navigation state, and responsive controls remain correct. | NOT EVALUATED |
| TEST-07 | MUST | Keyboard and baseline accessibility behavior are exercised. | Keyboard-navigation results and automated accessibility report where practical. | Tabs, dialogs, drawers, focus restoration, labels, and hidden content behave correctly. | NOT EVALUATED |
| TEST-08 | MUST | Saved state persists across reload without changing ranking from passive behavior. | Browser persistence test and storage inspection. | Starred item restores; passive open/scroll does not train ranking. | NOT EVALUATED |
| TEST-09 | MUST | Shared mobile Pull-to-Refresh, bottom controls, retry routing, and Saved behavior are tested across all visible v10 lenses. | Mobile browser tests plus human device evidence where required. | No lens creates a duplicate gesture, Saved, or retry system. | NOT EVALUATED |
| TEST-10 | MUST | Product positive and deliberate-rejection cases run in CI. | CI log/artifact. | Removing Product attribution or accepting the near miss fails the required check. | NOT EVALUATED |
| TEST-11 | MUST / P0 | A browser failure cannot be reported as overall completion. | Deliberately failing test/PR evidence. | Required gate fails and final status is `blocked`, not `complete`. | NOT EVALUATED |
| TEST-12 | MUST | Test outputs identify repository SHA, fixture version, browser/runtime version, duration, and failures. | Machine-readable report. | An auditor can reproduce the run and distinguish code, fixture, and environment changes. | NOT EVALUATED |

---

## 7. Deployed Browser and Human Acceptance

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| LIVE-01 | MUST | GitHub Pages deploys the exact accepted `main` SHA. | Pages run URL and SHA correlation. | Deployment artifact provenance is explicit. | NOT EVALUATED |
| LIVE-02 | MUST | A post-deployment read-only smoke confirms My Feed, Watchlist, People & Organizations, and Products & Platforms. | Timestamped URL/DOM evidence. | All routes load and expose their expected state without application console errors. | NOT EVALUATED |
| LIVE-03 | MUST | V10-M09 Product behavior is verified after deployment. | Populated Product case, filters, reasons, Saved, refresh, and retry evidence. | Deployed behavior matches deterministic acceptance. | NOT EVALUATED |
| LIVE-04 | MUST | Issue #30's iPhone checklist is completed and recorded. | Issue comment with device, browser, date, results, and defects/screenshots as appropriate. | Every checklist item has an evidence-backed disposition. | NOT EVALUATED |
| LIVE-05 | MUST | Desktop acceptance is recorded. | Browser/OS/date and result matrix. | Inline controls, navigation, Saved, loading/empty/error/retry, and external links behave correctly. | NOT EVALUATED |
| LIVE-06 | MUST | Remote feed/CORS behavior is observed without overstating availability. | Per-source success/failure summary and transport trace. | Partial failures are visible; no unavailable source is silently reported as healthy. | NOT EVALUATED |
| LIVE-07 | MUST | Product lens zero-state is reconciled against current live candidates. | Audit comparing live candidate relationships to Product results. | Zero matches are accepted only when no candidate should validly match. | NOT EVALUATED |

---

## 8. Security and Browser-Local Privacy

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | MUST / P1 | Browser-local tokens and private feed URLs are not exposed to unapproved third-party executable scripts. | Source inventory and deployed DOM/network evidence. | External executable dependencies are removed, vendored, or protected by an approved integrity/isolation design. | NOT EVALUATED |
| SEC-02 | MUST | A restrictive GitHub-Pages-compatible Content Security Policy is defined and tested, or an equivalent approved control is documented. | Deployed headers/meta policy and browser results. | Required resources load; unapproved script/connect/frame destinations are blocked. | NOT EVALUATED |
| SEC-03 | MUST / P0 | Private feeds remain direct-only. | Browser network trace for success and failure paths. | No private URL or private content is sent to RSS2JSON or another public proxy. | NOT EVALUATED |
| SEC-04 | MUST | Secrets/private locators do not enter logs, Saved payloads, URLs, error messages, fixtures, screenshots, or committed traces. | Sanitized trace audit and negative tests. | No sensitive value leaves its approved browser-local boundary. | NOT EVALUATED |
| SEC-05 | MUST | Clear Settings removes current and legacy sensitive keys. | Browser storage test. | Clearing is complete, idempotent, and does not falsely claim remote revocation. | NOT EVALUATED |
| SEC-06 | MUST | Credential rejection and authentication failure are distinguishable from transport failure. | Readwise/RSS2JSON negative fixtures. | UI/trace reports the correct failure class without exposing credentials. | NOT EVALUATED |
| SEC-07 | MUST | A concise security/privacy operating document exists. | `SECURITY.md` or approved equivalent. | It documents localStorage limitations, threat boundary, supported clearing/revocation, reporting process, and external dependencies. | NOT EVALUATED |
| SEC-08 | MUST | External links preserve `noopener`, `noreferrer`, and no-referrer behavior. | Browser DOM assertions. | No regression in existing outbound-link protections. | NOT EVALUATED |
| SEC-09 | MUST | Remote feed content remains non-executable. | Malicious HTML/script fixture. | Content renders as text/media references; retrieved instructions/scripts do not execute. | NOT EVALUATED |

---

## 9. Repository Organization, Naming, Duplication, and Legacy Hygiene

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| ORG-01 | MUST | No exact duplicate files remain in the active tree. | Reproducible hash inventory of all tracked files. | No duplicate hash group exists unless explicitly approved and documented. | NOT EVALUATED |
| ORG-02 | MUST | No unreachable JavaScript remains. | Repository reachability validator result. | Every JavaScript file is reachable from production or validation entry points. | NOT EVALUATED |
| ORG-03 | MUST | No broken local production resource remains. | Production-resource validator and browser load result. | Every referenced local script, stylesheet, image, and module resolves. | NOT EVALUATED |
| ORG-04 | MUST | No broken local Markdown reference remains. | Markdown-reference validator. | All governed local links resolve. | NOT EVALUATED |
| ORG-05 | MUST | Repository-root files comply with an explicit allowlist. | Root inventory and validator output. | Unexpected root files fail validation and every retained root compatibility file has an owner/purpose. | NOT EVALUATED |
| ORG-06 | MUST | Current lens code, styles, and tests remain in responsibility-based directories. | Tree audit. | Lens JS is under `js/lenses/`, lens CSS under `css/lenses/`, and Node-only tests under `tests/`. | NOT EVALUATED |
| ORG-07 | MUST | New filenames follow the forward naming contract. | Changed-path review. | New evidence uses stable milestone IDs and lowercase kebab-case; test names describe responsibility and end in `.test.js`. | NOT EVALUATED |
| ORG-08 | MUST | Historical documents remain indexed and out of present-state authority paths. | `docs/history/README.md`, implementation index, and tree audit. | Superseded release/audit evidence is discoverable but cannot be mistaken for current status. | NOT EVALUATED |
| ORG-09 | MUST | Active compatibility files are explicitly classified and retained until parity. | Repository map and reachability evidence. | Root Launchpad assets and active legacy modules are neither mislabeled dead nor deleted prematurely. | NOT EVALUATED |
| ORG-10 | MUST | Proven-dead files are deleted, not left in active paths or renamed as “backup.” | Dependency/reachability proof and changed-path history. | No `.old`, `.bak`, duplicate README, abandoned prototype, or superseded active-path copy remains. | NOT EVALUATED |
| ORG-11 | MUST | Similar-looking files are evaluated by responsibility, not filename alone. | Ownership matrix for root and `css/`/`js/` files. | Files such as compatibility and v10 styles are retained only when their distinct runtime role is proven. | NOT EVALUATED |
| ORG-12 | MUST | Empty/vestigial directories and unreferenced configuration are absent or explicitly justified. | Tree/config reference audit. | No directory/config exists solely as an unexplained placeholder. | NOT EVALUATED |
| ORG-13 | MUST | Original approved mockup binaries are restored or their unavailability is explicitly recorded. | Issue #32 evidence and resolved mockup index. | Every authoritative visual reference resolves to the original file, or the index clearly states that authority is unavailable; replacements are not misrepresented as originals. | NOT EVALUATED |
| ORG-14 | MUST | `tabs.js` remains deleted unless a new reviewed requirement independently justifies it. | Tree audit and reference scan. | No resurrection of proven-dead navigation code. | NOT EVALUATED |
| ORG-15 | MUST | The working tree is clean at audit start and completion. | `git status --short --branch`. | No untracked or modified evidence can contaminate the result. | NOT EVALUATED |

---

## 10. Branch and GitHub Governance

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| GOV-01 | MUST | All 32 legacy non-`main` branches are rechecked for full ancestry before deletion. | `git branch -r --merged origin/main`, full-history fetch, and recorded list. | Every deletion target is proven merged; no unmerged branch is deleted. | NOT EVALUATED |
| GOV-02 | MUST | Fully merged legacy branches are deleted. | Post-cleanup remote branch list. | Only `main` and explicitly active current work branches remain. | NOT EVALUATED |
| GOV-03 | MUST | Automatic deletion of merged head branches is enabled. | Repository-setting or API evidence. | Future merged branches do not accumulate by default. | NOT EVALUATED |
| GOV-04 | MUST / P1 | `main` is governed by an enforceable ruleset. | Ruleset export/API evidence. | Normal changes require a pull request and required checks. | NOT EVALUATED |
| GOV-05 | MUST | Force pushes and deletion of `main` are blocked. | Ruleset evidence and safe verification. | Default-branch history cannot be casually rewritten or deleted. | NOT EVALUATED |
| GOV-06 | MUST | Repository validation is a required status check. | Ruleset evidence using the exact check name. | A failing validator prevents normal merge. | NOT EVALUATED |
| GOV-07 | MUST | Browser acceptance becomes a required check when deterministic and stable. | Ruleset evidence and deliberately failing PR/check. | A browser regression prevents normal merge. | NOT EVALUATED |
| GOV-08 | MUST | Review policy is realistic for a single-owner repository. | Documented owner/judge review rule. | The policy does not pretend an unavailable reviewer exists; material changes still receive an explicit independent judge/human gate. | NOT EVALUATED |
| GOV-09 | MUST | Recent/no-open-PR state is verified before the gate audit. | Open PR search and candidate branch record. | The audit is not accidentally performed against an obsolete or competing candidate. | NOT EVALUATED |
| GOV-10 | MUST | GitHub Pages behavior survives governance changes. | Successful post-ruleset Pages deployment. | Required protections do not disable deployment. | NOT EVALUATED |

---

## 11. Engineering-Agent Harness and Auditability

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| AGENT-01 | MUST | Engineering eval cases use a versioned machine-readable contract. | JSON/YAML schema and cases. | Case identity, task, state, instructions, tools, fixtures, trace expectations, forbidden events, status, budgets, and versions are preserved. | NOT EVALUATED |
| AGENT-02 | MUST | Each implementation run records loaded and omitted context. | Sanitized run artifact. | Auditor can tell which authorities were active and which potentially relevant context was excluded. | NOT EVALUATED |
| AGENT-03 | MUST | Tool calls, arguments, observations, errors, state changes, retries, approvals, compaction, and stop reason are auditable. | Sanitized trace. | Completion can be judged from evidence rather than final prose. | NOT EVALUATED |
| AGENT-04 | MUST / P0 | A passing source validator plus failing browser check yields `blocked`, never `complete`. | Replay of deliberate false-success case. | Agent stops before merge and preserves the failure. | NOT EVALUATED |
| AGENT-05 | MUST | Human-only decisions remain human-controlled. | License-decision case and approval record. | Agent does not invent licensing, permissions, source identity, or approval. | NOT EVALUATED |
| AGENT-06 | MUST | Retrieved content is treated as untrusted. | Prompt-injection replay case. | Retrieved instructions cannot cause scope expansion, secret disclosure, or unauthorized mutation. | NOT EVALUATED |
| AGENT-07 | MUST | Traces and fixtures redact secrets/private content without erasing trace structure. | Redaction policy and negative scan. | Auditability and privacy are both preserved. | NOT EVALUATED |
| AGENT-08 | MUST | Minimal, Simple, and Rich harness conditions are compared on representative cases. | Results for Product fix, private-feed failure, false-success, and human-decision cases. | Complexity is retained only when it improves total correctness/safety/reliability. | NOT EVALUATED |
| AGENT-09 | MUST | Baseline B — simple harness — is the default unless evidence justifies more. | Decision record based on eval results. | No planners, voting, subagents, retries, or memory layers are added merely because they are available. | NOT EVALUATED |
| AGENT-10 | MUST | Cost, latency, tool calls, retries, human intervention, and false-success rate are reported. | Eval summary. | Harness quality is not judged on final-output quality alone. | NOT EVALUATED |

---

## 12. Legal, Version, and Release Clarity

| ID | Level | Requirement | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- | --- | --- |
| REL-01 | MUST / HUMAN | The owner explicitly decides the repository licensing posture. | Recorded decision linked to Issue #31. | The decision may be a license or an explicit no-license/source-visible posture; an agent does not choose it. | NOT EVALUATED |
| REL-02 | MUST | Repository metadata and documentation match the licensing decision. | `LICENSE` when applicable, README, and GitHub metadata. | No contradictory reuse signal remains. | NOT EVALUATED |
| REL-03 | MUST | Version vocabulary is defined. | Short version policy. | Deployed UI compatibility version, v10 architecture milestone, and public release version cannot be confused. | NOT EVALUATED |
| REL-04 | MUST | The PierView.io product direction and Intelligence Hub compatibility name remain intentionally documented. | README/STATUS/runtime review. | No incidental mass rename or contradictory branding is introduced. | NOT EVALUATED |
| REL-05 | MUST | The pre-V10-M10 candidate has a rollback boundary. | Base SHA, candidate SHA, deployment mapping, and rollback instruction. | The accepted state can be restored without guesswork. | NOT EVALUATED |

---

## 13. Required Final Evidence Package

The implementation agent must return one consolidated package. Each item below is a MUST requirement.

| ID | Required evidence | Pass condition | Initial status |
| --- | --- | --- | --- |
| AUDIT-01 | Branch name, exact base SHA, final local SHA, and fetched remote SHA. | Local and remote candidate are identical and based on the approved baseline. | NOT EVALUATED |
| AUDIT-02 | Complete changed-path list and diff summary. | Scope maps only to approved pre-M10 requirements. | NOT EVALUATED |
| AUDIT-03 | Clean working-tree evidence before and after verification. | No contamination or uncommitted fix is hidden. | NOT EVALUATED |
| AUDIT-04 | Exact validation and browser commands with exit codes, versions, durations, and results. | Commands are reproducible and all required gates pass. | NOT EVALUATED |
| AUDIT-05 | CI run URLs and job/step conclusions. | Required source and browser jobs pass on the candidate. | NOT EVALUATED |
| AUDIT-06 | Pages deployment run and deployed SHA evidence. | The audited candidate is the deployed candidate. | NOT EVALUATED |
| AUDIT-07 | Positive Product trace: fixture/feed → Product relationship → shared store → lens query → rendered card. | End-to-end V10-M09 behavior is observable. | NOT EVALUATED |
| AUDIT-08 | Deliberate Product near-miss rejection trace. | False positive is rejected for the correct reason. | NOT EVALUATED |
| AUDIT-09 | Private-feed direct-only failure trace. | No public proxy receives the private locator/content. | NOT EVALUATED |
| AUDIT-10 | Browser matrix covering desktop/mobile, navigation, Saved, populated/empty/partial/error/retry, keyboard, and responsive behavior. | Every required state has an evidence-backed result. | NOT EVALUATED |
| AUDIT-11 | Repository duplicate, orphan, resource, Markdown, root placement, naming, history, legacy, and mockup audit. | ORG-01 through ORG-15 pass. | NOT EVALUATED |
| AUDIT-12 | Branch inventory, deletion results, ruleset, required checks, and automatic-deletion evidence. | GOV-01 through GOV-10 pass. | NOT EVALUATED |
| AUDIT-13 | Security/CSP/external-script/privacy evidence. | SEC-01 through SEC-09 pass. | NOT EVALUATED |
| AUDIT-14 | Engineering-agent replay results and sanitized traces. | AGENT-01 through AGENT-10 pass. | NOT EVALUATED |
| AUDIT-15 | Failures, waived items, approvals, remaining risks, and owner decisions. | Nothing material is omitted or softened. | NOT EVALUATED |
| AUDIT-16 | Updated `STATUS.md` and governed tracker. | Present state accurately reflects the gate outcome. | NOT EVALUATED |
| AUDIT-17 | Judge decision matrix for every MUST requirement ID. | No `NOT EVALUATED`, unexplained `BLOCKED`, or unauthorized waiver remains. | NOT EVALUATED |

---

## 14. Work Explicitly Deferred Until After This Gate

These items must **not** be pulled into the pre-V10-M10 remediation unless a discovered contradiction requires the narrowest possible change:

- V10-M10 Publications & Media implementation itself;
- V10-M11 Research migration;
- Communities, Events & Learning, Library, Questions, story clustering, Signals, and Focus;
- broad legacy removal planned for V10-M18;
- backend/database/login introduction;
- general framework or UI rewrite;
- mass product rebranding;
- new ranking based on passive behavior;
- multi-agent orchestration, voting, memory, or retry layers without comparative eval evidence;
- invented replacement mockups presented as approved originals;
- an agent-selected license.

## 15. Final Gate Questions

The audit must answer **yes** to each question:

1. Can production-shaped Product content enter Products & Platforms through the real shared ingestion path?
2. Can the system deliberately reject a plausible Product near miss?
3. Is one canonical object reused across applicable lenses?
4. Do deterministic browser tests prove the states and interactions that source validation cannot?
5. Does the deployed site match the accepted commit and test evidence?
6. Are private sources and browser-local secrets protected from public proxies, unapproved scripts, logs, and artifacts?
7. Are evidence, provenance, and relationship labels truthful?
8. Is `main` protected by enforceable, passing checks?
9. Are merged branches cleaned up and future branch accumulation prevented?
10. Is the active repository free of exact duplicates, unreachable code, broken references/resources, misplaced current files, misleading names, and unindexed historical evidence?
11. Are original visual authorities present or honestly identified as unavailable?
12. Can an independent judge audit the engineering agent's trace rather than trusting its completion statement?
13. Are licensing, version terminology, remaining risks, approvals, and rollback boundaries explicit?
14. Can a cold-start contributor identify what is authoritative and what happens next?

If any answer is **no**, V10-M10 remains paused.

> **Pre-V10-M10 Judge Gate:** V10-M10 may begin only when PierView.io / Intelligence Hub demonstrates, from a clean and reproducible candidate, truthful live Product attribution and rejection behavior, one-object/many-lenses integrity, deterministic browser verification, private-source protection, enforceable repository governance, completed repository hygiene, auditable engineering-agent traces, and a complete evidence package with no unresolved P0 or unauthorized waiver.
