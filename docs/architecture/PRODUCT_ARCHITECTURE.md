# Intelligence Hub — Product Architecture

**Status:** Ratified target architecture  
**Version:** v10 target  
**Adopted:** 2026-08-31  
**Repository:** `davehallmon/intelligence-hub`  
**Deployment constraint:** Static GitHub Pages; semantic HTML/CSS and vanilla ES6 JavaScript

## 1. Authority and relationship to the existing application

This document governs the target product architecture for Intelligence Hub v10 and later staged migration work.

The existing root `TECHNICAL_SPEC.md` remains authoritative for current v9.x UI/runtime constraints until individual components are migrated. This v10 specification does not invalidate working behavior merely because that behavior has not yet been migrated.

Implementation rule:

> Specification first. Migration second. Runtime behavior changes only in separately reviewed implementation pull requests.

No v10 migration may weaken existing provenance, browser-local privacy, deterministic ranking behavior, source-registry boundaries, or static GitHub Pages deployment unless a later decision explicitly supersedes those constraints.

---

## 2. Product definition

Intelligence Hub is a **personal intelligence aggregation and monitoring app**, part RSS reader, part research dashboard, and part personal knowledge-management system.

It is a browser-based personal intelligence workspace for collecting, organizing, filtering, connecting, and prioritizing information from the people, organizations, products, topics, publications, communities, and information sources the user chooses to follow.

The product is designed to reduce repeated context switching across websites and platforms. Instead of inheriting each platform's ranking algorithm, Intelligence Hub creates a deliberate information environment shaped around the user's own priorities, questions, projects, evidence standards, and attention budget.

### Product category

- Productivity / Personal Knowledge Management
- Personal Intelligence
- Research
- Monitoring
- RSS / Feed Aggregation
- Knowledge Management

---

## 3. North-star acceptance criterion

> **Focus is working if I can open Intelligence Hub for 10 minutes and know precisely how emerging evidence, structural shifts, or product realities change the underlying assumptions of my ongoing consulting, writing, or instructional projects.**

This is the primary product acceptance criterion. Features that increase volume, novelty, clicks, or time-on-site without improving this outcome are not inherently valuable.

---

## 4. Governing product principles

### 4.1 Protect attention, do not maximize engagement

Intelligence Hub is intentionally not optimized for infinite consumption, virality, click-through rate, or passive engagement.

- Popularity alone does not create importance.
- Novelty alone does not create importance.
- Passive scroll/open/time-spent behavior does not drive personalization.
- Explicit actions may influence ranking.
- Focus is finite and finishable.

### 4.2 Relevance plus evidence beats popularity plus novelty

The system should reward:

- alignment with Core Watchlist facets;
- relevance to active Questions/projects;
- strong empirical evidence;
- independent source convergence;
- contradictions that may change an existing conclusion;
- useful primary-source and practitioner evidence.

### 4.3 One intelligence object, many views

A source item must not be duplicated simply because it is relevant to several lenses.

Example: one Anthropic video announcing a Claude feature may be relevant to People & Organizations, Products & Platforms, Media, Watchlist, and Focus. It remains one canonical intelligence object with multiple relationships.

### 4.4 Provenance must be visible

The user should be able to tell:

- where an item came from;
- whether it is primary or secondary;
- whether it is research, reporting, analysis, opinion, practitioner evidence, an unverified community report, or AI synthesis;
- whether private/personal evidence contributed to an answer.

### 4.5 Private knowledge may inform investigation without leaking into public intelligence

Private/personal sources may participate in Search and Questions and may be deliberately added to Library. They must not silently enter Focus or Trends & Signals, and private provenance must remain explicit.

### 4.6 Configuration should describe intent, not plumbing

Source types such as RSS, YouTube, newsletters, web search, social posts, podcasts, or APIs are connectors/endpoints. Lenses describe how the user wants to think about information.

---

## 5. Locked navigation model

The left-hand navigation is organized into three groups.

### Intelligence lenses

1. **Focus** — cross-Hub high-priority intelligence, trends, signals, and notable changes.
2. **Watchlist** — continuous monitoring of selected topics/issues using facets, searches, exclusions, source rules, and priorities.
3. **People & Organizations** — activity from selected people, companies, labs, institutions, and other organizations.
4. **Products & Platforms** — meaningful product, platform, model, service, feature, release, and changelog changes.
5. **Publications** — magazines, newsletters, blogs, journals, and editorial outlets.
6. **Research** — primary research, papers, working papers, datasets, benchmarks, models, tools, and research artifacts.
7. **Media** — podcasts, audio, video, interviews, recurring shows, and YouTube-first channels.
8. **Communities** — Reddit, forums, discussion spaces, and selected developer/community ecosystems.
9. **Events & Learning** — conferences, webinars, workshops, labs, courses, seminars, training, and keynotes.
10. **Library** — consumed/learned material such as Readwise highlights, books, transcripts, and intentionally incorporated reference material.

### My workspace

11. **Questions** — structured investigations, comparisons, evidence checks, trend questions, saved questions, and monitored questions.
12. **Bookmarks** — bookmark manager, Launchpad, and searchable directory of destinations/tools/resources.
13. **Personal** — manually introduced or private/nonstandard sources and materials.

### System

14. **Settings** — global connectors, credentials, preferences, privacy, import/export, defaults, and system configuration.

### Persistent top-right action

**Saved ⭐** remains a cross-Hub action/state in the application chrome rather than a left-navigation lens.

---

## 6. Locked lens definitions

### Focus

The decision layer over the entire Hub. Focus is not chronological and is not a source-type feed. It determines what most deserves attention now and why.

### Watchlist

A deliberately bounded monitoring layer for topics, issues, policy areas, and recurring searches. Parked topics remain searchable/indexed but are not continuously monitored.

### People & Organizations

A canonical entity view that can combine authored work, social activity, appearances, official publishing, and selected external coverage without creating separate duplicate subscriptions for each endpoint.

### Products & Platforms

Monitors meaningful workflow-affecting changes rather than every release note. Supports parent/child product families such as `Microsoft 365 Copilot → PowerPoint` and `Claude → Skills`.

### Publications

Editorial sources followed independently. A publication may coexist with author/person relationships without duplicating the underlying article.

### Research

An evidence-oriented lens that values methodology, provenance, publication status, limitations, and applicability over recency or citation popularity alone.

### Media

Long-form audiovisual intelligence. Podcast/video transcripts should become searchable and analyzable when feasible. YouTube is a connector/platform, not itself a lens entity.

### Communities

A high-noise lens intended to capture practitioner evidence formal sources often miss: firsthand use, workarounds, discovered limitations, practical workflows, and repeated user-reported problems.

### Events & Learning

Forward-looking discovery of learning opportunities worth the user's time. Actionability and applicability matter more than prestige, popularity, price, or credentials.

### Library

**What I've learned.** Library is intentionally narrower than all personal storage. It contains material intentionally incorporated into the user's knowledge corpus.

### Saved ⭐

**What I want to keep.** Star captures an item durably for later triage. Saving does not assert that the item has been read or learned.

### Bookmarks

**Where I go.** Bookmarks are a manager, Launchpad, and searchable directory. Bookmarking a product may make it a known entity but must not automatically start monitoring it.

### Personal

**What I add.** Personal is the controlled front door for URLs, feeds, documents, email/newsletter sources, videos, repositories, searches, and pasted text. The system may suggest a lens/entity classification, but the user approves it.

### Questions

**What I'm actively trying to understand.** Questions are plan-first investigations that can persist, accumulate evidence, monitor material changes, and optionally be promoted into Watchlists.

---

## 7. Focus product contract

### 7.1 Allowed Focus objects

Focus may contain:

- individual high-value items;
- research papers/reports;
- product/platform changes;
- Priority-person publications/appearances;
- community signals;
- exceptional upcoming learning opportunities;
- monitored Question updates;
- cross-source story clusters;
- emerging trends/signals;
- relevant Library resurfacing.

Routine Saved reminders do not belong in Focus.

### 7.2 Structure

Focus uses a hybrid structure:

1. **Worth Your Attention** — maximum 8 items.
2. **Signals** — cross-source patterns and changes.
3. **Research & Evidence** — notable studies/reports.
4. **Questions** — material monitored-investigation changes.
5. **Coming Up** — only exceptional events the user could realistically act on.

Maximum default Focus surface before `Show more`: **15 objects**.

### 7.3 Focus must explain itself

Every Focus card must expose a concise **Why am I seeing this?** explanation. Example:

> Matches AI in Education → Formative Feedback; strong field evidence; relevant to an active Question.

Opaque personalization is a failure mode.

### 7.4 Summaries

Default AI synthesis should be concise:

- **What happened**
- **Why it matters**

Full summaries remain optional.

### 7.5 Pull, not push

No proactive alerts are enabled by default. Focus is a pull surface. Explicit monitored Questions, event reminders, or future user-created alerts may notify separately.

### 7.6 Ingestion and attention cadence are separate

Content ingestion may be continuous. Focus should change only when something materially outranks what is already present.

---

## 8. Signals & Trends product contract

Trends & Signals are integrated into Focus rather than implemented as a separate left-navigation lens.

Valid signal patterns include:

- the same development appearing across independent sources;
- several Priority people independently converging;
- research accumulating in one direction;
- repeated practitioner reports of the same problem;
- multiple products introducing the same capability;
- framing/language shifts across publications;
- a previously strong conclusion weakening.

Popularity alone does not constitute a signal.

Signals should expose maturity:

**Weak signal → Emerging → Established → Reversing**

---

## 9. Questions product contract

Questions support:

- one-time investigation;
- deep research;
- saved questions;
- monitored questions;
- comparisons;
- evidence checks;
- trend questions;
- source discovery.

Substantial Questions are **plan-first**: the system may interpret the question, identify facets/entities/sources, decompose it, and propose search logic, but it must not execute the research plan until the user approves it.

Maximum simultaneously monitored Questions: **5**.

A Question may be promoted to a Watchlist. Watchlists should also offer an `Ask a Question about this` path.

AI-generated follow-up questions should appear only when a genuine unresolved issue exists, not as an engagement mechanism.

---

## 10. Personal knowledge lifecycle

The locked conceptual model is:

- **Library = what I've learned**
- **Saved = what I want to keep**
- **Bookmarks = where I go**
- **Personal = what I add**

Typical lifecycle:

`Incoming intelligence → Saved ⭐ → deliberate triage → Library`

Saving is durable capture, not proof of consumption. Library incorporation is a separate state transition.

General unsaved feed history retention target: **90 days**.

---

## 11. Interaction-learning policy

Ranking may use deliberate explicit signals:

- Save ⭐
- Add to Library
- Ask a Question about this
- explicit relevant / not relevant feedback
- More like this / Less like this

Ranking must not learn from these passive behaviors by default:

- open/read alone;
- scroll-past/ignore;
- time spent reading.

Every Focus card should support negative/feedback controls including:

- Less like this
- More like this
- Mute topic temporarily
- Mute source
- This isn't relevant
- Already knew this
- Hide story
- Explain ranking

`Already knew this` is distinct from `Not relevant`.

---

## 12. Success and anti-goals

### Success

Intelligence Hub should help the user:

- detect consequential changes quickly;
- connect new evidence to ongoing work and prior knowledge;
- investigate questions rigorously;
- recognize cross-source convergence and contradiction;
- spend less time checking separate platforms;
- maintain a deliberate information environment.

### Anti-goals

Intelligence Hub is not intended to become:

- an infinite feed;
- a popularity-ranking engine;
- a general social network;
- a duplicate archive of every source endpoint;
- a passive behavioral-surveillance system;
- a system that silently mixes private evidence into public claims;
- a reason to monitor every tool merely because it is bookmarked.

---

## 13. Implementation sequencing rule

No implementation phase should infer new product architecture merely because coding convenience suggests it.

When the existing code and this target architecture diverge:

1. preserve current working behavior unless migration explicitly changes it;
2. document the migration decision;
3. implement in a bounded PR;
4. verify regression safety;
5. update governing documentation if an approved decision changes.
