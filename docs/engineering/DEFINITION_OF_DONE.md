# Engineering Definition of Done

A change is ready when all relevant statements are true.

## Architecture

- The change belongs to an existing zone or adds a reviewed zone.
- No cycle or forbidden dependency edge is introduced.
- Any graph-budget increase has an architecture decision.
- Canonical data still flows toward adapters and UI, never backwards.

## Contracts and data

- Inputs are validated at the boundary.
- Public contracts remain serialisable and private-safe.
- Existing version fixtures remain valid.
- Breaking semantics use a new schema version and migration.
- Profile and workspace identity cannot silently fall back.

## State and interactions

- New states, events, guards, outputs, and invariants are documented.
- Invalid event orders fail safely or become explicit no-ops.
- Important interaction paths and failure paths have tests.
- Retries, duplicate requests, and recovery are deterministic where applicable.

## AI and security

- Model text cannot grant authority, select private evidence, or publish data.
- Secrets and local paths do not cross public or client boundaries.
- Rate limits and external effects fail closed.
- Logs and errors do not expose private material.

## Verification

- `pnpm test:harness` passes.
- `pnpm check` passes.
- Relevant production builds and browser smoke tests pass.
- Documentation and decision records match the implemented behaviour.
