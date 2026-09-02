# Intelligence Hub — Ratified Configuration

**Status:** Ratified human-readable configuration source  
**Version:** v10 target  
**Adopted:** 2026-08-31

This document records the user-approved configuration decisions produced during the guided Intelligence Hub intake. It is intentionally human-readable. Future machine-readable configuration files may be generated from or reconciled against this source, but must not silently change these decisions.

Status meanings:

- **Priority/Core** — deliberately scarce, highest-intent monitoring or relevance tier.
- **Active** — deliberately monitored, but weaker than Priority/Core.
- **Parked** — known/indexed/searchable on demand; not continuously monitored.
- **Known/child/endpoint** — represented in the graph without consuming a scarce monitoring slot.

---

## 1. Watchlist

### 1.1 Priority topics — 5

1. AI Adoption & Future of Work
2. AI in Education & Learning
3. Creative AI & AI-Assisted Writing
4. Prompt / Harness / Workflow Engineering
5. RAG, Retrieval & Knowledge Systems

### 1.2 Active topics — 7

1. AI Literacy & Fluency
2. AI Productivity & Workflow Redesign
3. AI Agents & Agentic Workflows
4. Context Engineering & AI Memory
5. Multimodal AI
6. Open Models & Open vs. Closed AI
7. AI Regulation, Policy & Governance

### 1.3 Parked topics

- AI-Powered Coding & Software Development
- AI Evaluation, Benchmarking & LLM-as-a-Judge
- Model Optimization & Infrastructure
- AI in Science & Research
- AI Safety, Reliability & Alignment
- AI Ethics, Bias & Responsible Use
- AI Copyright, Training Data & IP
- AI Security, Prompt Injection & Model/Data Risk

Parked topics remain available to Questions, Search, and Research.

### 1.4 Priority-topic facets

#### AI Adoption & Future of Work

**Core**
- Enterprise AI adoption
- AI productivity evidence
- Workflow/job redesign
- Organizational change & adoption

**Secondary**
- Workforce transformation / future of work
- Leadership & executive AI strategy
- AI skills / workforce readiness
- Professional services / consulting
- Employment, displacement & labor economics
- Human judgment / human-AI collaboration

#### AI in Education & Learning

**Core**
- AI in teaching & learning
- Learning design / instructional design
- Assessment & grading
- Formative feedback

**Secondary**
- AI literacy for students/faculty
- Faculty adoption & institutional change
- Academic integrity
- LMS / education-platform integration
- Research on learning outcomes

**Parked facet**
- AI tutors / personalized learning

#### Creative AI & AI-Assisted Writing

**Core**
- AI-assisted writing & editing
- Writing quality / voice preservation
- Long-form / narrative workflows
- Character / visual consistency

**Secondary**
- AI image generation
- Visual storytelling
- Satire / comics / illustrated storytelling
- New creative tools & experimental platforms

**Parked facets**
- AI video / generative media
- Copyright / ethics specifically affecting creators

#### Prompt / Harness / Workflow Engineering

**Core**
- Prompt design / prompting techniques
- System prompts & instruction architecture
- Context management
- Human-in-the-loop workflows

**Secondary**
- Agent harnesses / orchestration
- Agent skills / reusable capabilities
- Tool use / function calling
- Workflow automation
- Prompt libraries / templates

**Parked facet**
- Multi-agent workflows

#### RAG, Retrieval & Knowledge Systems

**Core**
- Grounding / source attribution
- Personal knowledge systems
- Research synthesis / evidence workflows
- Agent memory / persistent knowledge

**Secondary**
- Retrieval-augmented generation
- Enterprise search / knowledge retrieval
- Knowledge management
- Document ingestion & chunking
- AI over SharePoint / enterprise content

**Parked facet**
- Semantic / vector search

### 1.5 Additional concepts treated as facets, not new top-level Watchlists

- Experimental Media & Generative Creative Tools
- Learning Design, Assessment & Formative Feedback Systems
- Visual Storytelling & Satirical Media Pipelines

These live under the existing Priority topics, with cross-tagging where relevant.

### 1.6 Watchlist discovery behavior

**Hybrid:** broad discovery, but Focus surfaces only strong matches.

---

## 2. Focus promotion principles established during Watchlist intake

Focus rewards usefulness and evidentiary value rather than novelty or popularity.

Promotion signals include:

- Core facet match;
- Priority person;
- Priority organization;
- official/primary source;
- independent-source convergence;
- strong empirical evidence;
- unusual relevance to an active project/Question.

---

## 3. People

### 3.1 Priority people — 7

| Person | Priority ingestion |
|---|---|
| Ethan Mollick | Original work, Social, Appearances |
| Arvind Narayanan | Original work, Social, Appearances |
| Simon Willison | Original work, Social |
| Andrej Karpathy | Original work, Social, Appearances |
| Paul Ford | Original work, Appearances |
| Benedict Evans | Original work, Social |
| Dario Amodei | Original work, Appearances; filter general press mentions |

### 3.2 Active people — 12

- Andrew Ng
- Rachel Woods
- Azeem Azhar
- Sayash Kapoor
- Chip Huyen
- Jerry Liu
- Kevin Kelly
- Nathaniel Whittemore
- Fei-Fei Li
- Dan Shipper
- Lance Eaton
- Lilian Weng

### 3.3 Parked people

- Kamil Banc
- Nufar Gaspar
- Hamish Ogilvy
- Harrison Chase
- Cat Goetze
- Satya Nadella
- Jensen Huang
- Mustafa Suleyman
- Sam Altman
- Demis Hassabis
- Steven Levy

The last three were normalized out of Active monitoring to preserve the 12-person Active ceiling; organization/publication monitoring supplies much of their overlapping signal.

### 3.4 Person story convergence

When multiple Priority people independently say substantially the same thing:

**Group them into one cluster and explicitly highlight independent convergence.**

Relationship rule:

`authored by ≠ featuring ≠ about/mentioned ≠ published by`

---

## 4. Organizations & Institutions

### 4.1 Priority organizations — 5

| Organization | Activity monitoring |
|---|---|
| Anthropic | Product changes, Research, Leadership essays/interviews |
| OpenAI | Product changes, Research, Official announcements |
| Google | Product changes, Research, Official announcements; includes AI, Workspace & Labs ecosystem |
| EDUCAUSE | Research, Governance/policy, Official announcements |
| Stanford HAI | Research only |

### 4.2 Active organizations — 8

- Microsoft
- Hugging Face
- Meta AI
- Perplexity
- NIST
- OECD.AI
- U.S. Department of Education
- Instructure (Canvas)

### 4.3 Parked organizations

- Google DeepMind
- Ai2 / Allen Institute for AI
- Mistral AI
- NVIDIA
- Princeton CITP
- UNESCO — AI & Education
- Wharton Interactive

### 4.4 Product overlap

A product update may appear in both Organization and Product lenses, but it is stored as **one canonical intelligence object**, not duplicated.

---

## 5. Products & Platforms

### 5.1 Priority products — 6

| Product | Priority signals |
|---|---|
| ChatGPT / OpenAI consumer platform | Features, Model changes, Workflow/UI, Documentation |
| Claude | Features, Model changes, Workflow/UI, Documentation |
| Gemini | Features, Model changes, Workflow/UI, Documentation |
| NotebookLM | Features, Integrations, Workflow/UI, Documentation |
| Google Labs / experimental AI tools | Features, Release notes |
| Canvas / Instructure | Features, Integrations, Workflow/UI |

### 5.2 Active products — 10

- Microsoft 365 Copilot
- Perplexity
- Google AI Mode / AI Search
- Claude Code
- Google AI Studio
- OpenRouter
- Ollama
- LM Studio
- Midjourney
- Google Workspace AI

### 5.3 Parked products/platforms

- OpenAI Codex
- Microsoft Copilot Studio
- GitHub Copilot
- Hugging Face product/platform monitoring
- n8n
- Google Flow
- Ideogram
- Adobe Firefly
- Runway
- Canva AI / Magic Studio
- Microsoft SharePoint + Copilot
- Microsoft Teams / M365 AI integrations

### 5.4 Child capabilities / non-slot entities

- `Claude → Claude Skills`
- `ChatGPT → Custom GPTs`

These are tracked as children of the monitored parent rather than consuming Active product slots.

### 5.5 Research-oriented tool normalization

- STORM → Research / Questions workflow, not continuous Product monitoring.

### 5.6 Product-change rules

- Report **meaningful workflow-affecting changes only**.
- Product families use parent → sub-product relationships.
- Preview/experimental products are tracked when relevant to a Core Watchlist facet.

---

## 6. Publications

### 6.1 Core publications — 6

| Publication | Behavior |
|---|---|
| Harvard Business Review | Topic match only |
| MIT Technology Review | Topic match only |
| Every | SMART relevance classification |
| Stratechery | Topic match only |
| The Chronicle of Higher Education | Topic match only |
| Write With AI | Topic match only |

### 6.2 Active publications

- WIRED
- The Information
- Ars Technica
- The Neuron
- Faculty Focus
- Platformer
- EdSurge

### 6.3 Parked publications

- The Verge
- Inside Higher Ed
- EDUCAUSE Review
- Daily Dose of Data Science
- The AI Rabbit Hole

### 6.4 Publication/source normalization

- AI Daily Brief newsletter → endpoint of the AI Daily Brief Media property.
- Google Workspace Blog / The Keyword → official Google organization/product endpoint rather than an independent Publication monitoring slot.
- Person-authored newsletters/blogs such as One Useful Thing, Exponential View, AI Snake Oil, or Simon Willison's blog should attach to their canonical Person entities when the primary reason for following them is the person.

### 6.5 Publication rules

- RSS, email, and web-discovered copies resolve to one canonical article.
- Prefer the primary source as cluster anchor; attach publication coverage to the same story cluster.
- Keep analysis/opinion, but classify it separately from Research/Evidence.

---

## 7. Media

### 7.1 Core Media properties — 5

| Media property | Trigger |
|---|---|
| The AI Daily Brief | SMART |
| AI & I | ALL |
| The Cognitive Revolution | Topic or Entity match |
| Hard Fork | Topic match |
| Practical AI | Topic match |

### 7.2 Active Media properties — 8

Active Media defaults to Topic-or-Entity matching unless otherwise configured.

- How I AI
- Latent Space
- Decoder
- TED AI Show
- Lenny's Podcast
- Marketplace Tech
- Designed for Learning
- You can with AI

### 7.3 Parked Media

- No Priors
- Dwarkesh Podcast
- The Ezra Klein Show
- Possible
- The Gradient Podcast
- Tech Brew Ride Home

### 7.4 Media normalization

- Exponential View → Azeem Azhar Person endpoint rather than a Media slot.
- Priority-person guest appearances are pulled into Media automatically even when the host show is not followed.
- One episode object may contain transcript plus multiple formats.
- Podcast + YouTube + newsletter recap of the same episode resolve to one canonical episode.
- Official organization channels remain endpoints of the Organization/Product entities rather than separate Media subscriptions.

---

## 8. YouTube / Video

### 8.1 Core independent YouTube-first sources — 3

- AI Explained
- Jeff Su
- Curious Refuge

### 8.2 Active independent YouTube-first sources — 4

- Matt Wolfe
- Skill Leap AI
- Writing Secrets
- Sharbel A.

### 8.3 Existing-entity YouTube endpoints

Do not consume separate Media slots:

- AI Daily Brief → Core Media endpoint
- Andrej Karpathy → Priority Person endpoint
- Exponential View → Azeem Azhar Active Person endpoint
- The Neuron → Active Publication endpoint
- Every → Core Publication endpoint

### 8.4 Video behavior

- Independent channels: SMART ingestion.
- Index metadata immediately.
- Obtain/analyze transcript when feasible.
- Exclude Shorts by default.
- Discover Priority-person appearances across YouTube even when the channel is not followed.

---

## 9. Research

### 9.1 Core Research domains — 5

1. AI adoption & workplace productivity
2. AI in education / learning outcomes
3. Prompting & human-AI interaction
4. RAG, grounding & retrieval
5. Creative AI / writing quality

### 9.2 Active Research domains — 4

- Future of work / labor economics
- Assessment, grading & formative feedback
- Human-AI collaboration / judgment
- Context, memory & agent systems

### 9.3 Parked Research domains

- AI governance / regulation
- General frontier-model research

### 9.4 Preferred evidence types

- Peer-reviewed studies
- Working papers / preprints
- Randomized or controlled experiments
- Longitudinal studies
- Field studies / real workplace deployments
- Systematic reviews / meta-analyses
- Institutional reports / indices

Not preferred by default:

- large surveys as a class;
- case studies as a class;
- benchmark/evaluation studies as a class;
- technical papers as a class.

These may still surface when otherwise relevant.

### 9.5 Approved Research sources

**Use**
- arXiv
- SSRN
- NBER
- Semantic Scholar
- Google Scholar
- Stanford HAI research
- Wharton / academic business research
- EDUCAUSE research
- Anthropic research
- ERIC / Institute of Education Sciences

**Park**
- OECD research/data
- Microsoft Research
- OpenAI research
- Hugging Face papers/models

### 9.6 Research source normalization

- NBER Economics of AI Working Group → child/filter under NBER.
- Consensus / Elicit → literature-discovery connectors for Questions, not evidence sources in themselves.

### 9.7 Research Focus-promotion signals

- Core Research domain match
- Core Watchlist facet match
- strong methodology / meaningful sample
- Priority institution
- Priority author
- active Question/project relevance
- discussion by multiple Priority people/publications

Not sufficient:

- citation/popularity alone
- newness alone

### 9.8 Research card defaults

Show:

- plain-English finding
- research question
- method
- sample size
- limitations
- authors/institution
- publication status
- why it matters to the user
- related coverage/commentary

Do not require original abstract as a default visible field.

---

## 10. Communities

### 10.1 Core Communities — 4

- r/PromptEngineering
- r/notebooklm
- r/WritingWithAI
- Instructure / Canvas Community

#### Explicit Core signal rules supplied

- r/PromptEngineering → Practical firsthand evidence + High-quality discussion
- r/notebooklm → Practical firsthand evidence + Priority entity/product relevance
- Instructure / Canvas Community → Practical firsthand evidence + Topic match

**Implementation note:** a specific ingestion code for `r/WritingWithAI` was not explicitly selected during intake. Do not invent one silently; resolve before or during the Community implementation PR. General Community Focus rules below still apply.

### 10.2 Active Communities — 6

- r/ClaudeAI
- r/AIEducation
- r/ChatGPTPromptGenius
- r/hermesagent
- r/BookWritingAI
- r/LinguisticsPrograming

**Verification note:** community existence, current names/casing, activity, and feed availability for the last four added communities must be verified before they are encoded as live connectors. Preserve intent if a literal name requires correction.

### 10.3 Parked Communities

- r/ChatGPT
- r/LocalLLaMA
- Hacker News
- DEV Community
- AI in Education Google Group
- EDUCAUSE community discussions
- r/indiecomics
- r/webtoons
- generic selected writing/author communities

### 10.4 Community Focus preferences

Favor:

- firsthand user experience
- workarounds / discovered limitations
- practical workflows
- emerging concern repeated across users

Popularity alone never promotes a community post into Focus.

Community convergence:

**Create one community signal summarizing the pattern, with representative posts attached.**

Unconfirmed product changes:

**Surface as `Community Report / Unverified`, then update the same story if official confirmation appears.**

---

## 11. Events & Learning

### 11.1 Opportunity types

#### Discover proactively

- Hands-on workshops / labs
- Short courses / bootcamps

#### Discover only if highly relevant

- Webinars / virtual talks
- Conferences
- Conference sessions / keynotes
- Self-paced courses
- Professional training programs
- University / academic seminars
- Product training / vendor academies
- Community meetups / discussion events
- Calls for papers / proposals / presentations

#### Ignore by default

- Certifications / credentials

### 11.2 Core Event/Learning domains

- Enterprise AI adoption & workforce enablement
- AI in teaching & learning
- Prompting & AI workflow design
- AI-assisted writing & creative workflows

### 11.3 Active Event/Learning domains

- Instructional design / assessment
- RAG / knowledge management / research workflows
- AI agents for knowledge workers
- Multimodal / visual creation

### 11.4 Parked Event/Learning domains

- AI policy / governance
- General AI/product education

### 11.5 Priority providers — 5

- Microsoft AI / Copilot learning
- Google AI / Workspace learning
- Anthropic education/events
- KPMG AI learning/events
- Every / AI & I workshops or learning

### 11.6 Active providers

- OpenAI events/learning
- Stanford HAI
- Wharton / Wharton Interactive
- Harvard / HBR learning events
- Outskill / similar practitioner training

### 11.7 Parked providers

- EDUCAUSE
- Instructure / Canvas training & events
- Section

### 11.8 Event endpoints attached to existing entities

- AI Daily Brief → event/learning endpoint of Media property
- Nufar Gaspar → event endpoint of Person entity
- Azeem Azhar → event endpoint of Person entity
- The Neuron → event endpoint of Publication entity

### 11.9 Opportunity scoring signals

Use:

- directly applicable to current work
- directly applicable to a course taught
- supports an active writing/research project
- teaches something immediately practicable
- includes hands-on exercises/labs
- features a Priority person
- provides original research/evidence
- includes reusable templates/resources
- available asynchronously afterward

Do not reward by default:

- hosted by a Priority organization alone
- free/low-cost alone
- credential/certificate
- popularity/attendance

### 11.10 Time-budget preferences

- Focus threshold: **only exceptional opportunities the user would realistically register for**
- Weekday webinar preference: **≤60 minutes**
- Course/workshop preference: **≤5 total hours**
- Cost: secondary to value

These are ranking preferences, not absolute exclusions.

### 11.11 Lifecycle and calendar

- If recording/transcript/materials become available, convert them into reusable Media/Library material.
- Allow Save, Add to Calendar, and Remind me.
- Existing calendar commitment boosts relevance but does not force Focus placement.

---

## 12. Library

### 12.1 Include in Library

- Readwise highlights
- Books / book metadata
- Podcast/video transcripts
- Event recordings/materials
- Selected saved web pages **only after deliberate promotion/triage**

### 12.2 Keep separate from Library by default

- Articles merely because they were read
- Research papers/PDFs merely because they were encountered

They may be deliberately incorporated later.

### 12.3 Exclude from Library by default

- own notes
- published writing
- draft writing / working documents
- teaching/course materials

These may exist in Personal/private storage but are not automatically part of the factual/external Library corpus.

### 12.4 Library capabilities — all enabled

- full-text search
- Watchlist topic matching
- surface past material when a new story appears
- connect current research to previous highlights
- identify contradictions/changes over time
- suggest related material while answering Questions
- periodically resurface forgotten material
- summarize previous reading
- show where an idea was previously encountered
- use Library connections as a Focus relevance signal

---

## 13. Saved ⭐

- Star means durable intentional capture.
- The Saved state may support read-later, importance, future Questions, and later Library promotion, but saving itself does **not** claim the item was learned.
- Saved is permanent with unread/read/archive filters.
- AI categorizes automatically; user can correct classification.
- Saved reminders do not enter Focus by default.

---

## 14. Bookmarks

Bookmarks serve all three roles:

1. traditional categorized bookmark manager;
2. Launchpad for frequently used destinations;
3. searchable directory of useful tools/sites.

Bookmark relationships:

- bookmarked product may become a **known** Product entity;
- bookmark categories may help infer interests;
- bookmarks may appear in Questions results;
- bookmarking does **not** begin monitoring;
- bookmarks remain separate from monitoring state.

No ranking weight was granted to passive/frequent bookmark use.

---

## 15. Personal

### 15.1 Allowed Personal inputs

- web page URL
- RSS / Atom feed URL
- private feed URL
- Google Doc / Drive file
- PDF
- newsletter/email source
- YouTube/video URL
- GitHub repository
- custom search/query
- plain text / pasted note

### 15.2 Classification behavior

**Intelligence Hub suggests the appropriate entity/lens and the user approves.**

### 15.3 Privacy boundary

Private/personal content may participate in:

- Questions
- Search
- Library when deliberately added

It must not silently participate in:

- Focus
- Trends & Signals
- public-source claims

Private provenance must always remain clearly marked.

---

## 16. Retention

General unsaved feed history: **90 days**.

If an item matters long-term, it should be Saved, incorporated into Library, retained as Question evidence, or otherwise deliberately preserved.

---

## 17. Questions

### 17.1 Supported Question modes — all enabled

- One-time question
- Deep research question
- Saved question
- Monitored question
- Comparison
- Evidence check
- Trend question
- Source discovery

### 17.2 Plan-first execution

The system may internally interpret/decompose a substantial Question and propose facets, sources, terms, exclusions, and subquestions, but **the user approves the research plan before execution**.

### 17.3 Default information spaces

Search by default:

- Watchlist/news discovery
- People
- Organizations
- Products & Platforms
- Publications
- Research
- Media/transcripts
- Communities
- Library
- Saved ⭐

Optional per Question:

- Bookmarks
- Personal/private sources

### 17.4 Evidence hierarchy

1. Primary research / original study
2. Official primary source / original document
3. High-quality independent reporting
4. Practitioner/community experience
5. Expert analysis/commentary
6. AI-generated summary/synthesis

### 17.5 Research standards — all mandatory

- cite every material factual claim
- prefer primary sources where available
- separate fact, evidence, inference, and opinion
- surface meaningful conflicting evidence
- explicitly state uncertainty
- show methodological limitations
- distinguish peer-reviewed research from preprints
- distinguish official claims from independent validation
- never silently blend private sources with public evidence
- state when evidence is insufficient for confidence

### 17.6 Default available output formats

- Research brief
- Evidence table
- Compare/contrast table
- Timeline
- Key findings + limitations
- Source list
- Exportable notes/report

Quick chat-style `Direct answer` and `Executive summary` were not selected as default Question-output modes.

### 17.7 Saved Question state — retain all

- Original question
- Refined research question
- Search terms
- Included/excluded sources
- Research plan/subquestions
- Previous answer
- Supporting evidence
- Personal notes
- Changes since previous run

### 17.8 Monitored Question triggers

Update when:

- new high-quality research appears
- multiple sources converge on a new development
- existing evidence is contradicted
- material conclusion changes

Do not update merely because any matching item appears.

Update frequency: **user chooses per Question**.

### 17.9 Question/Watchlist relationship

- A Question may be promoted to a Watchlist.
- A Watchlist should be able to launch an `Ask a Question about this` investigation.

### 17.10 Follow-up questions

Suggest follow-up Questions only when a genuine unresolved issue exists.

### 17.11 Monitored Question ceiling

Maximum **5** active monitored Questions at once.

---

## 18. Focus

### 18.1 Allowed Focus objects

- Individual high-value article/item
- Research paper/report
- Product/platform change
- Priority-person publication/appearance
- Community signal
- Upcoming exceptional event/learning opportunity
- Monitored Question update
- Cross-source story cluster
- Emerging trend/signal
- Relevant Library resurfacing

Excluded:

- routine Saved ⭐ reminders

### 18.2 Promotion weights

| Signal | Weight |
|---|---:|
| Core Watchlist facet match | 3 |
| Active Question/project relevance | 3 |
| Strong empirical evidence / methodology | 3 |
| Multiple independent sources converge | 3 |
| Priority Person author/speaker | 2 |
| Priority Organization producer | 2 |
| Meaningful Priority Product change | 2 |
| Official/primary source | 2 |
| Firsthand practitioner evidence | 2 |
| Contradicts existing conclusion | 3 |
| Strong Library connection | 2 |
| Active Person/Organization/Product match | 1 |
| High popularity/engagement | 0 |
| Very recent/new | 1 |

### 18.3 Hard Focus eligibility rules

May bypass the normal **eligibility** threshold:

- new high-quality research in a Core Research domain
- material Active Question change
- strong convergence across multiple reliable independent sources

Not sufficient by themselves:

- new item from Priority Person
- Priority Organization announcement
- Priority Product update
- Core Watchlist match
- virality/popularity

Hard eligibility does not guarantee top-eight placement.

### 18.4 Focus structure

Hybrid:

1. Worth Your Attention
2. Signals
3. Research & Evidence
4. Questions
5. Coming Up

### 18.5 Attention budget

- Worth Your Attention: **maximum 8**
- total Focus objects before `Show more`: **15**

### 18.6 Freshness

- `<24h` → Normal
- `1–3 days` → Normal
- `4–7 days` → Normal / decay
- `8–30 days` → only if unusually relevant
- `>30 days` → Library/Question resurfacing only

### 18.7 Diversity protection

Merge closely related items into story clusters first. Apply caps if clustering is insufficient.

### 18.8 Story-cluster display — show all

- What happened
- Why it matters to me
- What is actually new
- Primary source
- Independent reporting
- Priority-person analysis
- Research/evidence
- Community reaction
- What sources disagree about
- Confidence / verification status
- Related Watchlists/entities
- Related Library material

### 18.9 Signal patterns

Create Signals from:

- independent-source convergence
- Priority-person convergence
- accumulating research direction
- repeated practitioner problem reports
- multiple products introducing same capability
- publication-language/framing shifts
- weakening of a previous conclusion

Do not create a Signal merely because something becomes popular.

Signal maturity:

**Weak signal → Emerging → Established → Reversing**

### 18.10 Explainability and evidence labels

- `Why am I seeing this?` visible on every Focus card.
- Evidence labels visible: Primary source, Research, Independent reporting, Analysis, Opinion, Practitioner report, Community report — unverified, AI synthesis.

### 18.11 AI summary

Default: concise **What happened / Why it matters**.

### 18.12 Interaction signals used for ranking

Use explicit actions:

- Save ⭐
- Add to Library
- Ask a Question about it
- explicit relevant feedback
- explicit not-relevant feedback

Do not use by default:

- open/read alone
- ignore/scroll past
- time spent reading

### 18.13 Negative/feedback controls — all enabled

- Less like this
- More like this
- Mute this topic temporarily
- Mute this source
- This isn't relevant
- Already knew this
- Hide story
- Explain ranking

### 18.14 Interruptions

**Nothing by default — Focus is pull, not push.**

Explicit monitored Questions/reminders may notify according to their own settings.

### 18.15 Refresh rhythm

**Continuous ingestion, but Focus changes only when something materially outranks what is already there.**

### 18.16 North-star success test

> **Focus is working if I can open Intelligence Hub for 10 minutes and know precisely how emerging evidence, structural shifts, or product realities change the underlying assumptions of my ongoing consulting, writing, or instructional projects.**

---

## 19. Open implementation-verification items

The architecture and intent are ratified. The following should be resolved during implementation without altering intent:

1. Verify current names/casing/feed availability for newly added communities such as `r/ChatGPTPromptGenius`, `r/hermesagent`, `r/BookWritingAI`, and `r/LinguisticsPrograming` before creating live connectors.
2. Confirm the specific Core ingestion code for `r/WritingWithAI`; it was selected as Core but no dedicated code was supplied.
3. Verify canonical handles/URLs for newly added YouTube-first creators before wiring endpoints.
4. Resolve source/API feasibility separately from product intent; inability to ingest one endpoint must not silently demote the entity/topic configuration.
