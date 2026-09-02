# Agent / Developer Handoff Guide

This repository is developed incrementally with both human and LLM contributors. This file defines the minimum operating contract for any fresh developer or agent.

## Start here

Read these files before changing code:

1. `STATUS.md` — current implementation state and next milestone.
2. `docs/configuration/RATIFIED_CONFIGURATION.md` — approved configuration.
3. `docs/architecture/PRODUCT_ARCHITECTURE.md` — target product contract.
4. `docs/architecture/INFORMATION_ARCHITECTURE.md` — canonical relationships and boundaries.
5. `docs/architecture/MIGRATION_PLAN.md` — migration sequence and stable milestone IDs.
6. `TECHNICAL_SPEC.md` — current UI/runtime compatibility requirements.
7. Relevant `docs/implementation/*` audit files for the specific concern being changed.

Human contributors should also read `CONTRIBUTING.md` for the short-lived branch and pull-request workflow.

Historical PR descriptions and phase audits are evidence of what was true when written. They are not a substitute for `STATUS.md`.

## Stable milestone rule

Do not direct work using a bare phrase such as “Phase 9.” The original planning document and later implementation inserted additional foundation phases, so numeric ordinals drifted.

Use the stable ID plus name, for example:

> `V10-M09 — Products & Platforms visible migration`

If a prompt contains only a bare phase number, reconcile it against `STATUS.md` and `MIGRATION_PLAN.md` before implementation.

## Architectural invariants

Unless a later ratified decision explicitly changes them:

- GitHub Pages remains the production deployment model.
- Production remains semantic HTML/CSS and vanilla JavaScript; no backend or mandatory Node runtime.
- Node may be used for development-time validation only.
- One canonical intelligence object may participate in multiple lenses without being copied into lens-specific ingestion silos.
- Provenance must remain visible and semantically accurate.
- `authored by`, `published by`, `featuring`, `about/mentioned`, and source ownership are distinct relationships.
- Discovery coverage is not equivalent to target-authored content.
- Private/browser-local sources must not be sent through public feed proxies.
- Bookmark presence does not automatically create continuous monitoring.
- Parked/Known entities remain queryable but are not continuous defaults.
- My Feed ranking remains deterministic until Focus explicitly supersedes it.
- Passive clicks/scrolling do not silently train ranking.
- Saved is a cross-Hub action/state, not a lens.
- Library, Saved, Bookmarks, and Personal remain distinct lifecycle concepts.
- Legacy compatibility code is removed only after replacement parity and regression evidence exist.

## Current runtime seams

- `js/dashboard.js` — composition root.
- `js/feeds.js` / `js/feed-client.js` — current live loading and transport behavior.
- `js/normalize.js` + `js/intelligence-object.js` — normalized object authority.
- `js/item-store.js` — shared canonical session store.
- `js/lenses/lens-read-model.js` — pure v10 selection/read models.
- `js/lenses/lens-service.js` — runtime bridge from shared store to read models.
- `js/lenses/` — visible lens UI and lens-specific domain/presentation helpers.
- `js/config/` — canonical configuration and compatibility maps.
- `js/connectors/` — connector capability and endpoint identity.
- `js/phase3.js` / `js/phase4.js` — existing cross-route interaction authorities; do not create duplicate gesture/save/navigation systems without a deliberate replacement plan.

See `docs/architecture/REPOSITORY_MAP.md` for the fuller current/compatibility/legacy map.

## Required validation

Run:

```bash
npm run validate
```

before a PR is considered ready.

The validation command must remain dependency-light and should cover:

- JavaScript syntax across the repository;
- canonical foundation validation;
- normalization fixtures;
- connector/endpoint fixtures;
- lens read-model fixtures;
- shared item-store fixtures;
- runtime lens-service fixtures;
- visible Watchlist fixtures;
- People & Organizations fixtures;
- shared mobile-shell structural validation;
- production-resource and repository-root placement checks;
- repository accessibility/contract checks that can be tested without a browser.

Do not claim browser/device acceptance merely because this command passes.

## Browser acceptance

Interaction or rendering PRs should explicitly test relevant states after GitHub Pages deployment, including as applicable:

- mobile touch behavior;
- tablet and desktop navigation;
- keyboard operation;
- loading/ready/empty/error states;
- Saved persistence;
- responsive safe areas;
- remote-feed transport/CORS behavior.

If the execution environment cannot perform those checks, say so in the PR and leave a concrete manual checklist.

## Pull-request discipline

Use one short-lived branch per architectural concern. Prefer `<type>/<stable-id>-<concern>` in lowercase kebab-case, merge through a pull request, and delete the head branch after merge. Do not introduce a long-lived development or release branch without an explicit repository decision.

Each implementation PR should include:

1. stable milestone ID / concern;
2. exact base SHA;
3. changed paths;
4. behavior intentionally changed;
5. behavior intentionally preserved;
6. validation performed and results;
7. manual/browser verification performed or explicitly not performed;
8. rollback/migration notes;
9. unresolved risks;
10. confirmation that unrelated lenses were not changed.

Prefer one architectural concern per PR.

## Documentation maintenance

Update `STATUS.md` whenever a PR changes:

- the latest completed milestone;
- visible production capabilities;
- verification state;
- the next milestone;
- blockers or resolved follow-ups.

Update architecture/configuration documents only when the governing design itself changes. Do not rewrite historical implementation audit files to erase history; instead add a clearly dated resolution/supersession note when later work closes an earlier gap.

## Do not guess

If an endpoint, community, source identity, authorship relationship, license choice, or external capability has not been verified, record it as unresolved rather than inventing it.
