# DG-OS Engineering Instructions

Before changing architecture, contracts, stateful behaviour, or interactions, read the relevant
documents under `docs/engineering/` and the executable manifest under `architecture/`.

## Required workflow

1. Identify the architecture zones, contracts, state machines, and interactions affected.
2. Preserve dependency direction. Do not introduce a cycle or bypass a service boundary.
3. Treat published schema versions as immutable. Add a new version and migration for breaking
   semantic changes.
4. Add or update invariants when stateful behaviour changes.
5. Test both the changed module and its important interactions with other modules.
6. Keep model output outside deterministic authority boundaries. Models may propose text; validated
   code controls evidence, permissions, tools, transitions, and publication.
7. Run `pnpm test:harness` during development and `pnpm check` before handoff.

## Baseline policy

Never update `architecture/dependency-baseline.json` only to make CI pass. A budget increase requires
an explained architecture decision under `docs/engineering/decisions/`, including the reason, risk,
and a later reduction plan where appropriate.

Do not weaken, skip, or delete a guardrail test without explaining which invariant has changed and
why the new behaviour remains safe.
