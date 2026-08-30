# Intelligence Hub v9.0 — My Feed

v9.0 turns Intelligence Hub from a collection of feed tabs into a deterministic personal intelligence dashboard.

## Governing model

My Feed does not create a new source architecture. It reuses the normalized items already produced by News, Socials, Academic, Research, and Video.

`Sources → normalize → classify → resolve profiles → cache → score → diversify → My Feed`

Books/Readwise highlights remain separate and are not part of the initial My Feed ranking pool.

## Default landing view

My Feed is the default v9.0 primary tab for a fresh navigation state. Existing explicit hash routes remain respected.

## Approved High Priority topics

- AI Agents
- AI Adoption & Future of Work
- AI Literacy
- AI-powered Coding
- Context Engineering
- Prompt Engineering
- LLM-as-a-Judge
- AI Evaluation & Benchmarking

All other topics start at Normal. People and Organizations start without explicit preference overrides; their existing Core Active / Selective Active tiers provide structural priority.

## Ranking signals

The client-side scorer uses only explicit, inspectable signals:

- freshness
- topic preference: High / Normal / Lower
- person and organization preference: High / Normal / Lower
- canonical profile tier
- provenance/source quality
- diversity caps

There is no click tracking, behavioral learning, remote personalization service, or hidden model ranking.

## Provenance weights

Official and direct authored sources receive stronger provenance weight than coverage. Profile-attributed Social bridges remain below direct authored feeds but above general coverage. Primary research and institutional publication items receive explicit source-quality weight.

## Diversity

The first section, **Worth your attention**, contains up to 8 items with tighter caps across source, profile, topic, and content type.

The second section, **More for you**, contains up to 40 additional ranked items with broader diversity caps.

## Shared cache

Opening My Feed triggers the existing News, Socials, Academic, Research, and Video loaders. Their normalized item arrays are cached and reused by their individual tabs, avoiding a duplicate My Feed retrieval stack.

Refreshing My Feed refreshes those underlying source tabs. Refreshing an individual source tab invalidates the My Feed ranking so the next My Feed visit is recalculated from the newest snapshot.

## Privacy

My Feed preferences are stored in the existing browser-local Intelligence Hub settings object. They are not committed to GitHub. Private Social bridge feeds remain direct-only and are not sent through public RSS proxies.
