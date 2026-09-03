# Contributing to PierView.io

PierView.io / Intelligence Hub is migrated incrementally. Contributions must preserve working behavior while moving the repository toward the ratified v10 architecture.

Read [`STATUS.md`](STATUS.md), [`AGENTS.md`](AGENTS.md), and the [`Repository Map`](docs/architecture/REPOSITORY_MAP.md) before changing code. `AGENTS.md` remains the complete operating contract; this file summarizes the human contribution workflow.

## Branch lifecycle

- Start from the current `main` SHA.
- Use one short-lived branch for one architectural concern.
- Prefer `<type>/<stable-id>-<concern>` in lowercase kebab-case, such as `feature/v10-m10-publications-media`.
- Do not create long-lived development or release branches without an explicit repository decision.
- Open a pull request, complete validation and review, then delete the head branch after merge.
- Never force-push or delete `main`.

## Pull requests

Every pull request should identify:

1. stable milestone ID or named concern;
2. exact base SHA;
3. changed paths;
4. behavior intentionally changed;
5. behavior intentionally preserved;
6. validation performed and results;
7. manual/browser verification performed or explicitly not performed;
8. rollback or migration notes;
9. unresolved risks;
10. confirmation that unrelated lenses were not changed.

Run `npm run validate` before requesting merge. For rendering, interaction, responsive, persistence, or transport changes, also run `npm run test:browser`; GitHub Actions executes the pinned Chromium suite and preserves its evidence report. A passing source validator does not substitute for browser/device acceptance, and deterministic fixtures do not substitute for explicitly required physical-device or live-network evidence.

## Compatibility boundary

Age, filename, or location alone does not make a file safe to delete. Keep active compatibility code until its replacement has parity and regression evidence. Historical documents should be indexed under `docs/history/`; proven-dead source should be deleted and recovered through Git history if needed.

## Configuration and evidence

Do not invent endpoints, community identities, authorship relationships, license terms, source capabilities, or verification results. Record unresolved facts explicitly.
