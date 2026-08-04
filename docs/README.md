# DG-OS Documentation

- Status: active index
- Last reviewed: 4 August 2026

This index separates current product direction, executable engineering rules, operating guidance,
and historical material. A document under `archive/` explains an earlier decision or build. It is
not a current source of truth.

## Sources of truth

| Question                                      | Authoritative source                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is DG-OS building next?                  | [`DG_OS_PRODUCT_ROADMAP.md`](./DG_OS_PRODUCT_ROADMAP.md)                                                                                                        |
| How will private workspaces publish to DG-OS? | [`engineering/WORKSPACE_PUBLICATION_ARCHITECTURE.md`](./engineering/WORKSPACE_PUBLICATION_ARCHITECTURE.md)                                                      |
| Which dependencies are permitted?             | [`../architecture/manifest.mjs`](../architecture/manifest.mjs) and [`engineering/ARCHITECTURE_RULES.md`](./engineering/ARCHITECTURE_RULES.md)                   |
| Which state machines and invariants exist?    | [`../architecture/state-machines/catalog.ts`](../architecture/state-machines/catalog.ts) and [`engineering/STATE_MACHINES.md`](./engineering/STATE_MACHINES.md) |
| What must pass before handoff?                | [`engineering/DEFINITION_OF_DONE.md`](./engineering/DEFINITION_OF_DONE.md)                                                                                      |
| How is the application deployed?              | [`VERCEL_DEPLOYMENT_RUNBOOK.md`](./VERCEL_DEPLOYMENT_RUNBOOK.md)                                                                                                |
| Why was an architectural direction chosen?    | [`engineering/decisions/`](./engineering/decisions/)                                                                                                            |

## Active product documents

| Document                                                                           | Purpose                                                             | Status                  |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------- |
| [`DG_OS_PRODUCT_ROADMAP.md`](./DG_OS_PRODUCT_ROADMAP.md)                           | Product purpose, phases, gates, measures and current build          | Living                  |
| [`DESSI_PROFILE_DEPENDENCY_INVENTORY.md`](./DESSI_PROFILE_DEPENDENCY_INVENTORY.md) | Remaining work required to make Dessi one portable profile instance | Temporary migration map |
| [`VERCEL_DEPLOYMENT_RUNBOOK.md`](./VERCEL_DEPLOYMENT_RUNBOOK.md)                   | Deployment, firewall, smoke checks and rollback                     | Operational             |

The profile dependency inventory should be archived when a second fixture can use every shared
public module without importing Dessi-owned compatibility data.

## Engineering documents

| Document                                                                                                   | Purpose                                                         |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`engineering/ARCHITECTURE_RULES.md`](./engineering/ARCHITECTURE_RULES.md)                                 | Architecture zones, dependency direction and graph budgets      |
| [`engineering/STATE_MACHINES.md`](./engineering/STATE_MACHINES.md)                                         | Stateful workflow requirements and invariants                   |
| [`engineering/TESTING_STRATEGY.md`](./engineering/TESTING_STRATEGY.md)                                     | Harness test groups and deterministic test policy               |
| [`engineering/DEFINITION_OF_DONE.md`](./engineering/DEFINITION_OF_DONE.md)                                 | Completion criteria for product and engineering changes         |
| [`engineering/UI_EVENT_STATE_GUIDE.md`](./engineering/UI_EVENT_STATE_GUIDE.md)                             | Supporting guide for the current UI event and reducer model     |
| [`engineering/WORKSPACE_PUBLICATION_ARCHITECTURE.md`](./engineering/WORKSPACE_PUBLICATION_ARCHITECTURE.md) | Planned private workspace, publication and AI-client boundaries |

Executable manifests and tests take precedence over explanatory engineering prose. If they differ,
correct the document or make the architectural change explicit. Do not silently treat the prose as
an exception.

## Decision records

| ADR                                                                        | Decision                                                               | Status   |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| [`0001`](./engineering/decisions/0001-gateplane-control-plane-boundary.md) | Keep identity and workspace control behind a bounded control-plane API | Accepted |

New decisions use [`0000-template.md`](./engineering/decisions/0000-template.md). Published contract
versions remain immutable. A breaking semantic change requires a new version, migration and tests.

## Archive

| Document                                                                             | Replaced by                                        |
| ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| [`archive/PORTFOLIO_APP_ROADMAP.md`](./archive/PORTFOLIO_APP_ROADMAP.md)             | Current product roadmap                            |
| [`archive/AION_REUSE_ASSESSMENT.md`](./archive/AION_REUSE_ASSESSMENT.md)             | ADR-0001                                           |
| [`archive/CODEBASE_STABILIZATION_PLAN.md`](./archive/CODEBASE_STABILIZATION_PLAN.md) | Engineering harness and current Definition of Done |

Archived files preserve context. Do not update their plans, status lists or implementation advice.
Add a new decision or change an active document instead.
