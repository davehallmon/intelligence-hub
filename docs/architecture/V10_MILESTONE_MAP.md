# Intelligence Hub / PierView.io v10 Stable Milestone Map

**Status:** Canonical milestone naming reconciliation  
**Adopted:** 2026-08-31

## Why this file exists

The original `MIGRATION_PLAN.md` assigned numeric phases before two additional runtime-foundation steps were inserted during implementation: the shared canonical item store and runtime lens service. As a result, historical planning ordinals and implementation phase numbers diverged.

For example, the original plan called Products & Platforms “Phase 7,” while implementation Phase 7 became the first visible Watchlist lens. People & Organizations then became implementation Phase 8 even though the original plan used Phase 8 for Publications & Media.

**Do not use bare phase numbers for future work.**

Stable milestone IDs and names below are authoritative for handoff, PR scope, status, and future implementation. The old numeric headings in `MIGRATION_PLAN.md` remain useful historical planning ordinals but do not override this map.

## Stable milestones

| Stable ID | Milestone | Original planning ordinal | Implemented/current ordinal | State |
| --- | --- | ---: | ---: | --- |
| V10-M00 | Architecture ratification | 0 | 0 | Complete — PR #18 |
| V10-M01 | Canonical configuration and entity foundation | 1 | 1 | Complete — PR #19 |
| V10-M02 | Normalized Intelligence Object relationships | 2 | 2 | Complete — PR #20 |
| V10-M03 | Connector catalog and source-endpoint registry | 3 | 3 | Complete — PR #21 |
| V10-M04 | Lens query/read-model layer | — inserted | 4 | Complete — PR #22 |
| V10-M05 | Shared canonical item store | — inserted | 5 | Complete — PR #23 |
| V10-M06 | Runtime lens service | — inserted | 6 | Complete — PR #24 |
| V10-M07 | Watchlist visible migration | 5 | 7 | Complete — PRs #25–26 |
| V10-M08 | People & Organizations visible migration | 6 | 8 | Complete — PRs #27–28 |
| V10-M09 | Products & Platforms visible migration | 7 | 9 | Complete — PR #35 |
| V10-M10 | Publications & Media migration | 8 | 10 | **Next product milestone** |
| V10-M11 | Research migration | 9 | 11 | Planned |
| V10-M12 | Communities migration | 10 | 12 | Planned |
| V10-M13 | Events & Learning migration | 11 | 13 | Planned |
| V10-M14 | Library, Saved, Bookmarks, Personal boundaries | 12 | 14 | Planned |
| V10-M15 | Questions | 13 | 15 | Planned |
| V10-M16 | Story clustering and Signals engine | 14 | 16 | Planned |
| V10-M17 | Focus v10 | 15 | 17 | Planned |
| V10-M18 | Legacy cleanup | 16 | 18 | Planned last |

## Reference rule

A valid future instruction should say, for example:

> Continue **V10-M10 — Publications & Media migration**.

A bare instruction such as:

> Continue Phase 10.

is ambiguous and must be reconciled against `STATUS.md` and this file before implementation.

## Relationship to MIGRATION_PLAN.md

`MIGRATION_PLAN.md` remains the detailed scope/acceptance roadmap. Read its named milestone sections for requirements, but translate any old numeric ordinal through this map.

The detailed Product & Platforms requirements originally written under “Phase 7” govern **V10-M09**. The detailed Publications & Media requirements originally written under “Phase 8” govern **V10-M10**, and so on.

## Change rule

Stable milestone IDs must not be renumbered when new enabling work is inserted. If future foundation work is required between existing milestones, give it a named sub-milestone (for example `V10-M09A`) rather than shifting every later ID.
