# Phase 8 Follow-up Resolution — Shared Mobile Shell

**Resolved by:** PR #28  
**Runtime baseline:** `815155efc5db83477bc523b967e87186d1d771b5`  
**Resolution date:** 2026-08-31

## Historical context

`PHASE8_PEOPLE_ORGANIZATIONS_AUDIT.md` correctly recorded, at the time PR #27 was prepared, that Watchlist and People & Organizations still needed to inherit the existing Phase 4 mobile interaction shell.

That follow-up is no longer pending.

## Resolution

PR #28 integrated both visible v10 lenses with the existing shared mobile authorities rather than creating parallel systems.

The resolved scope includes:

- Watchlist and People & Organizations added to the shared Pull-to-Refresh eligibility model;
- v10 lens controls handed into the existing scroll-aware mobile bottom-control shell;
- Watchlist topics presented through the shared mobile shell/fly-up behavior;
- People & Organizations `Following` selector moved into the shared mobile controls;
- v10 lens containers added to the shared Saved-star observer path;
- retry routing extended to both v10 lens containers;
- redundant mobile static Refresh controls suppressed while desktop controls remain available.

See `V10_MOBILE_SHELL_INTEGRATION_AUDIT.md` for the implementation detail and live acceptance checklist.

## Verification distinction

The code/structural follow-up is **complete**. The repository does not currently contain a recorded human result for the documented post-merge iPhone acceptance checklist.

Therefore current status is:

- implementation follow-up: **complete**;
- GitHub Pages deployment after merge: **successful**;
- recorded live iPhone acceptance: **pending human confirmation**.

`STATUS.md` is the present-state authority for this distinction.
