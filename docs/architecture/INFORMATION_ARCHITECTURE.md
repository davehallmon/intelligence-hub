# Intelligence Hub — Information Architecture

**Status:** Ratified target architecture  
**Version:** v10 target  
**Adopted:** 2026-08-31

## 1. Purpose

This document defines the canonical information model that underpins Intelligence Hub. It separates **entities**, **source endpoints/connectors**, **normalized intelligence objects**, **lenses**, **relationships**, **provenance**, **evidence classes**, **story clusters**, and **signals** so that the application can reuse one underlying object across many views without duplication.

The architecture is designed for staged migration from the current static GitHub Pages application. It does not prescribe a backend or database and must remain implementable in static HTML/CSS/vanilla JavaScript with browser-local persistence unless a later architecture decision explicitly changes that constraint.

---

## 2. Core model

At the highest level:

```text
Entity
  ├─ Person
  ├─ Organization
  ├─ Product / Platform
  ├─ Publication
  ├─ Media Property
  ├─ Community
  └─ Research Source / Institution

Entity → one or more Source Endpoints
Source Endpoint → emits Raw Items
Raw Item → normalized into Intelligence Object
Intelligence Object → linked to Entities / Topics / Questions / Library / Lenses
Related Intelligence Objects → may be clustered into a Story Cluster
Repeated cross-source patterns → may mature into a Signal
Lenses → query/view the shared graph rather than own duplicate copies
```

---

## 3. Canonical entities

### 3.1 Entity identity

An entity is a canonical subject or source-bearing identity that may have multiple aliases, endpoints, and relationships.

Recommended common fields:

```text
id
entityType
name
aliases[]
status            // priority | active | parked | known
canonicalUrl
parentEntityId?   // optional hierarchy
childEntityIds[]
topics[]
facets[]
sourceEndpointIds[]
metadata{}
```

### 3.2 Entity types

#### Person

A human identity that may have authored sources, social endpoints, media appearances, organizational affiliations, and external mentions.

Important relationship distinctions:

- **authoredBy** — the person created the content;
- **featuring** — the person appears/interviewed/speaks in the content;
- **about / mentions** — the content discusses the person;
- **publishedBy** — the publishing identity, which may differ from the author.

These relationships must not be treated as equivalent.

#### Organization

Company, institution, lab, agency, nonprofit, education provider, or other organization.

An Organization may expose official announcements, research, leadership content, product updates, video channels, events, or other endpoints.

#### Product / Platform

A product, model family, platform, application, service, feature family, or technology the user may wish to monitor.

Product hierarchies are supported:

```text
Google
  ├─ Gemini
  ├─ NotebookLM
  ├─ Google Workspace AI
  └─ Google Labs

Anthropic
  └─ Claude
      └─ Claude Skills

OpenAI
  └─ ChatGPT
      └─ Custom GPTs

Microsoft
  └─ Microsoft 365 Copilot
      ├─ PowerPoint
      ├─ Word
      └─ other sub-products
```

A child capability does not automatically require its own monitoring slot.

#### Publication

An editorial property followed independently, such as a magazine, newsletter, blog, or journal.

Publication identity is distinct from delivery mechanism. Medium, Substack, email, RSS, or LinkedIn may be endpoints/platforms rather than the publication itself.

#### Media Property

A recurring show, podcast, channel, interview series, or independent YouTube-first creator that is worth following in its own right.

#### Community

A specific discussion community rather than the platform as a whole.

Example:

```text
Reddit → r/notebooklm → post
Google Groups → named group → thread
```

`Reddit` alone is not the community entity.

#### Research Source / Institution

A source or corpus approved for research discovery/ingestion, such as arXiv, SSRN, NBER, ERIC, or an institutional research program.

---

## 4. Source endpoints and connectors

### 4.1 Source endpoint

A source endpoint is the concrete place or mechanism through which content can be discovered.

Example endpoint types:

- RSS / Atom
- web page / sitemap
- newsletter/email source
- YouTube channel/feed
- podcast feed
- social profile
- research corpus/API
- changelog/release notes
- events/calendar listing
- community feed
- GitHub repository/release feed
- web/news search query
- private feed URL
- local/pasted content

A single entity may expose several endpoint types without becoming several entities.

### 4.2 Connector

A connector is reusable ingestion logic capable of reading one or more endpoint types.

Recommended connector metadata:

```text
id
connectorType
supportedSelectorTypes[]
transport
requiresCredential
browserSafe
corsStrategy
normalizer
freshnessPolicy
ratePolicy
```

### 4.3 Supported selector types

Connectors should advertise what they can target, such as:

- person
- organization
- product
- topic
- publication
- media property
- community
- repository
- search
- channel

### 4.4 Source vs. discovery connector

A discovery tool that helps locate evidence is not automatically an evidence source.

Examples:

- **ERIC / NBER / arXiv** → evidence-bearing research sources.
- **Consensus / Elicit** → research-discovery connectors for Questions; results must resolve to underlying evidence sources.
- **Google Scholar / Semantic Scholar** → discovery/indexing sources whose metadata may point to the authoritative paper.

The UI and Questions logic should preserve this distinction.

---

## 5. YouTube and audiovisual architecture

YouTube is a platform/connector, not a lens entity.

A YouTube channel can be handled in two ways:

1. **Endpoint of an existing entity**
   - Anthropic YouTube → Anthropic Organization
   - Andrej Karpathy YouTube → Andrej Karpathy Person
   - Every YouTube → Every Publication
   - AI Daily Brief YouTube → AI Daily Brief Media Property

2. **Independent Media Property**
   - a YouTube-first creator/channel followed independently

Video ingestion rules:

- independent channels use SMART ingestion;
- metadata is indexed immediately;
- transcripts are obtained/analyzed when feasible;
- Shorts are excluded by default;
- Priority-person appearances may be discovered across YouTube even when the channel itself is not followed.

One episode/video object may expose several available formats (video, audio, newsletter recap, transcript) without creating duplicate intelligence objects.

---

## 6. Normalized intelligence object

The normalized intelligence object is the central reusable unit of incoming intelligence.

Recommended core fields:

```text
id
objectType
title
url
canonicalUrl
sourceEndpointId
publisherEntityId?
authorEntityIds[]
featuredEntityIds[]
mentionedEntityIds[]
organizationEntityIds[]
productEntityIds[]
publicationEntityId?
mediaPropertyEntityId?
communityEntityId?
topicIds[]
facetIds[]
publishedAt
ingestedAt
summary
image
favicon
transcript?
contentText?
provenance[]
evidenceClass
verificationStatus
publicationStatus?
rawSourceRef
storyClusterId?
relatedQuestionIds[]
relatedLibraryIds[]
```

Existing normalized fields such as id, type, title, URL, source, author(s), profiles, published date, summary, image/thumbnail, topics, provenance, video id, transport, and raw source item should be migrated rather than discarded.

---

## 7. Object types

Possible object types include:

- article
- research-paper
- report
- announcement
- product-change
- release-note
- social-post
- video
- podcast-episode
- transcript
- community-post
- community-signal
- event
- course
- question-update
- story-cluster
- signal
- library-resurfacing

Object type and evidence class are separate dimensions.

---

## 8. Evidence and epistemic classification

Intelligence Hub must visibly distinguish evidence status.

Required evidence classes:

1. **Research** — original study, working paper, peer-reviewed paper, institutional research.
2. **Primary source** — official document, announcement, changelog, original transcript, first-party statement.
3. **Independent reporting** — reporting by an editorial source independent of the subject.
4. **Practitioner report** — firsthand implementation/use experience.
5. **Analysis** — expert interpretation or synthesis.
6. **Opinion** — viewpoint/commentary without equivalent evidentiary status.
7. **Community report — unverified** — emerging report not yet independently confirmed.
8. **AI synthesis** — machine-generated navigation/synthesis layer, never itself treated as the source of truth.

### Questions default authority hierarchy

When evidence conflicts, the default authority ordering is:

1. Primary research / original study
2. Official primary source / original document
3. High-quality independent reporting
4. Practitioner/community experience
5. Expert analysis/commentary
6. AI-generated summary/synthesis

This hierarchy is a weighting principle, not a rule to suppress lower-level evidence.

---

## 9. Verification states

Recommended verification states:

- verified-primary
- independently-confirmed
- corroborated
- unverified-community-report
- disputed
- superseded
- unknown

Community reports may enter the system as `unverified-community-report` and later update the **same story** when official confirmation appears.

---

## 10. Story clusters

### 10.1 Purpose

Closely related items should be merged into a canonical story cluster before diversity caps are applied.

Example:

```text
Claude gains capability X
  ├─ Anthropic announcement
  ├─ Simon Willison analysis
  ├─ independent reporting
  ├─ AI Daily Brief episode
  └─ practitioner/community reaction
```

Focus displays one dossier instead of five near-duplicate cards.

### 10.2 Story-cluster fields

A cluster should be able to expose:

- what happened;
- why it matters to the user;
- what is actually new;
- primary source;
- independent reporting;
- Priority-person analysis;
- research/evidence;
- community reaction;
- source disagreements;
- confidence/verification status;
- related Watchlists/entities;
- related Library material;
- constituent item IDs.

### 10.3 Canonicalization rules

- RSS, email, and web-discovered copies of the same article resolve to one canonical article.
- Primary source is preferred as the story anchor when a publication merely summarizes it.
- Coverage is attached to the cluster rather than treated as equivalent duplicate stories.

---

## 11. Signals

Signals are higher-order patterns inferred from multiple intelligence objects or clusters.

Signal candidates include:

- independent source convergence;
- several Priority people independently converging;
- research evidence accumulating in one direction;
- repeated practitioner reports of one problem;
- multiple products introducing the same capability;
- language/framing changes across publications;
- weakening of a previously strong conclusion.

Popularity alone is not sufficient.

Signal maturity states:

```text
weak-signal
emerging
established
reversing
```

A signal should retain provenance back to the objects/clusters that support it.

---

## 12. Lenses as views over shared state

A lens is a configuration/query over the shared graph, not an owning datastore.

Recommended lens configuration fields:

```text
id
name
selectedEntityIds[]
selectedTopicIds[]
selectedFacetIds[]
enabledEndpointTypes[]
includeRules[]
excludeRules[]
priorityRules[]
freshnessPolicy
rankingPolicy
displayPolicy
```

### Global configuration — what exists

- canonical entities;
- aliases;
- connector catalog;
- source endpoints;
- topic/facet taxonomy;
- global evidence classes;
- global privacy/provenance rules.

### Lens configuration — what a view uses

- selected entities/topics;
- enabled endpoints;
- searches;
- includes/excludes;
- priority tiers;
- freshness;
- ranking;
- display choices.

---

## 13. Priority vs. relevance

The system must distinguish:

- **global entity priority** — how important the entity is overall;
- **lens/topic-specific relevance** — how strongly a particular item relates to the current lens, topic, Question, or project.

A single simplistic importance score is insufficient.

Priority raises relevance probability but does not automatically guarantee Focus placement.

---

## 14. Research architecture

Research objects should support fields such as:

```text
researchQuestion
plainEnglishFinding
method
sampleSize
limitations
authors
institution
publicationStatus   // preprint | working-paper | peer-reviewed | report
publicationVenue
relatedCoverage[]
whyItMatters
```

The default Research presentation should expose:

- plain-English finding;
- research question;
- method;
- sample size;
- limitations;
- authors/institution;
- publication status;
- why it matters to the user;
- related coverage/commentary.

The original abstract is not required as a default visible field.

---

## 15. Community architecture

Community platform, community, and post are separate layers.

Community convergence should produce a `community-signal` object when many independent users report substantially the same issue. Representative posts remain attached as supporting evidence.

Popularity is supporting evidence only, never sufficient for Focus promotion.

Preferred community evidence:

- firsthand user experience;
- workarounds/discovered limitations;
- practical workflows;
- emerging concern repeated across users.

---

## 16. Events & Learning architecture

Events are forward-looking opportunity objects with fields such as:

```text
providerEntityId
opportunityType
domainIds[]
startAt
endAt
deadline?
durationMinutes?
price?
format
recordingExpected?
registrationUrl
calendarEventId?
scoreReasons[]
```

After an event passes, available recordings, transcripts, or materials may become Media/Library objects rather than disappearing.

Lifecycle:

```text
Upcoming event → attend/watch → recording/transcript/resources → Library/Media
```

Calendar commitment may boost relevance but must not force the event into Focus.

---

## 17. Saved, Library, Bookmarks, and Personal state

### Saved

A star creates durable capture with states such as:

```text
savedAt
readState       // unread | read
archiveState    // active | archived
tags[]
autoTags[]
```

Saving does not automatically mean the item has been learned or added to Library.

### Library

Library is an intentionally incorporated knowledge corpus. Approved types include:

- Readwise highlights;
- books/book metadata;
- podcast/video transcripts;
- event recordings/materials;
- selected saved web pages promoted after triage.

Library can support full-text search, topic matching, resurfacing, contradiction tracking, previous-encounter tracing, Question support, summaries of prior reading, and Focus relevance evidence.

### Bookmarks

Bookmarks are destinations/tools/resources. A bookmarked product may become a known Product entity and bookmark categories may inform interests, but bookmarking must not start monitoring.

### Personal

Personal accepts:

- web URL;
- RSS/Atom URL;
- private feed URL;
- Google Drive/Doc reference;
- PDF;
- newsletter/email source;
- YouTube/video URL;
- GitHub repository;
- custom search/query;
- pasted/plain text.

The system suggests entity/lens placement and requires user approval.

---

## 18. Privacy boundary

Personal/private sources may be used in:

- Search;
- Questions;
- Library when deliberately added.

They must not be silently mixed into:

- Focus;
- Trends & Signals;
- public-source claims.

If a private source contributes to an answer, private provenance must remain clearly marked.

---

## 19. Questions information model

A saved Question should retain:

```text
id
originalQuestion
refinedQuestion
searchTerms[]
includeSources[]
excludeSources[]
researchPlan[]
subquestions[]
previousAnswers[]
supportingEvidenceIds[]
personalNotes[]
changeHistory[]
monitoringPolicy
updateCadence
status
```

Default searchable spaces:

- Watchlist/news discovery;
- People;
- Organizations;
- Products & Platforms;
- Publications;
- Research;
- Media/transcripts;
- Communities;
- Library;
- Saved.

Optional spaces:

- Bookmarks;
- Personal/private sources.

Monitored Questions trigger on:

- new high-quality research;
- multiple-source convergence;
- contradiction of existing evidence;
- material change in conclusion.

Any new matching item alone is not a sufficient update trigger.

---

## 20. Focus ranking model

### Promotion weights

```text
3  Core Watchlist facet match
3  active Question/project relevance
3  strong empirical evidence/methodology
3  independent source convergence
3  contradicts an existing conclusion
2  Priority Person author/speaker
2  Priority Organization producer
2  meaningful Priority Product change
2  official/primary source
2  firsthand practitioner evidence
2  strong Library connection
1  Active Person/Organization/Product match
1  recency/newness
0  popularity/engagement
```

### Hard Focus eligibility rules

The following may bypass the normal Focus **eligibility** threshold:

- new high-quality research in a Core Research domain;
- a material Active Question change;
- strong convergence across multiple reliable independent sources.

This does **not** guarantee placement in the top-eight Worth Your Attention section. Clustering, diversity, and section placement still apply.

### Freshness

- `<24h` — normal
- `1–3d` — normal
- `4–7d` — normal with decay
- `8–30d` — only if unusually relevant
- `>30d` — Library/Question resurfacing only

### Diversity

Story clustering is the first protection. Source/organization/product/topic caps are fallback mechanisms if clustering is insufficient.

---

## 21. Retention

General unsaved incoming-feed history target: **90 days**.

Durable exceptions include:

- Saved items;
- Library objects;
- Question evidence/history;
- explicitly retained configuration/entities.

---

## 22. Data migration principles

When migrating existing data:

1. preserve stable IDs where practical;
2. preserve existing aliases and topic associations;
3. do not turn every bookmarked destination into a monitored entity;
4. separate identity from endpoint;
5. separate endpoint from connector implementation;
6. normalize one object once;
7. attach multiple lens/entity relationships to that object;
8. preserve provenance to raw source data;
9. avoid destructive migration until old/new parity is verified.
