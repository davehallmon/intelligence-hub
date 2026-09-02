# Implementation Evidence Index

These files record implementation and verification evidence at the time each migration transaction occurred. They do not override [`STATUS.md`](../../STATUS.md) as the present-state authority.

Historical implementation phase numbers diverged from the stable v10 milestone sequence after the shared item store and runtime lens service were inserted. Use the stable IDs below for current work.

| Stable milestone | Historical evidence |
| --- | --- |
| V10-M01 — Canonical configuration and entity foundation | [`PHASE1_FOUNDATION_AUDIT.md`](PHASE1_FOUNDATION_AUDIT.md) |
| V10-M02 — Normalized Intelligence Object relationships | [`PHASE2_NORMALIZATION_AUDIT.md`](PHASE2_NORMALIZATION_AUDIT.md) |
| V10-M03 — Connector catalog and source-endpoint registry | [`PHASE3_CONNECTOR_ENDPOINT_AUDIT.md`](PHASE3_CONNECTOR_ENDPOINT_AUDIT.md) |
| V10-M04 — Lens query/read-model layer | [`PHASE4_LENS_READ_MODEL_AUDIT.md`](PHASE4_LENS_READ_MODEL_AUDIT.md) |
| V10-M05 — Shared canonical item store | [`PHASE5_SHARED_ITEM_STORE_AUDIT.md`](PHASE5_SHARED_ITEM_STORE_AUDIT.md) |
| V10-M06 — Runtime lens service | [`PHASE6_RUNTIME_LENS_SERVICE_AUDIT.md`](PHASE6_RUNTIME_LENS_SERVICE_AUDIT.md) |
| V10-M07 — Watchlist visible migration | [`PHASE7_WATCHLIST_VISIBLE_AUDIT.md`](PHASE7_WATCHLIST_VISIBLE_AUDIT.md) |
| V10-M08 — People & Organizations visible migration | [`PHASE8_PEOPLE_ORGANIZATIONS_AUDIT.md`](PHASE8_PEOPLE_ORGANIZATIONS_AUDIT.md), [`PHASE8_FOLLOWUP_RESOLUTION.md`](PHASE8_FOLLOWUP_RESOLUTION.md), [`V10_MOBILE_SHELL_INTEGRATION_AUDIT.md`](V10_MOBILE_SHELL_INTEGRATION_AUDIT.md) |
| V10-M09 — Products & Platforms visible migration | [`V10_M09_PRODUCTS_PLATFORMS_AUDIT.md`](V10_M09_PRODUCTS_PLATFORMS_AUDIT.md) |

See [`V10_MILESTONE_MAP.md`](../architecture/V10_MILESTONE_MAP.md) for the canonical ordinal reconciliation. New evidence files should use lowercase kebab-case and the stable milestone ID, for example `v10-m10-publications-media-audit.md`.

## Current precondition gate

V10-M10 remains paused under the [Pre-V10-M10 Readiness Gate](v10-m10-readiness-gate-2026-09-02.md), governed through [Issue #40](https://github.com/davehallmon/intelligence-hub/issues/40). This gate is an active execution precondition, not evidence that its requirements have passed. [`STATUS.md`](../../STATUS.md) remains the present-state authority.

## Current path note

The historical audits above name the paths that existed when their transactions were completed. V10-M09A.2 later moved shared/visible lens modules to `js/lenses/`, lens styles to `css/lenses/`, and Node-only fixtures to `tests/`. The historical records are intentionally not rewritten; use the current [`Repository Map`](../architecture/REPOSITORY_MAP.md) for live ownership.
