# State Machines and Invariants

## Model

DG-OS is a federation of small state machines, not one global machine. Each machine owns a bounded
state, accepts typed inputs, produces deterministic outputs, and isolates external effects.

The executable catalogue is `architecture/state-machines/catalog.ts`.

## Current machines

| Machine                     | Current maturity  | Deterministic boundary                                              |
| --------------------------- | ----------------- | ------------------------------------------------------------------- |
| Desktop shell               | Explicit reducer  | Open windows and focused application                                |
| Profile activation          | Boundary-enforced | Published projection, handle-preserving route, or rejection         |
| Profile module registration | Boundary-enforced | Matching profile, Network, Writing, and Resume modules or rejection |
| Profile CV resolution       | Boundary-enforced | Approved Resume view, matching CV variant, or rejection             |
| Profile Agent request       | Implicit          | Validation, evidence scope, provider and SSE sequencing             |

`implicit` means behaviour is tested across services but is not yet represented by one transition
function. New complex workflows should prefer an explicit transition model.

## Required machine definition

Every new stateful workflow defines:

1. State names and state data.
2. Typed inputs or events.
3. Guards and rejected inputs.
4. Next-state rules.
5. Outputs and external effects.
6. Invariants that must hold after every transition.
7. Replay and idempotency expectations.
8. Recovery, cancellation, and terminal states.
9. Which effects are intentionally non-deterministic.

## Testing rules

- Test every named transition and rejection.
- Generate deterministic event sequences and check invariants after every step.
- Replay identical sequences and compare final state and outputs.
- Inject timeouts, malformed events, missing identities, and unavailable dependencies.
- Keep model-generated text non-deterministic, but keep evidence scope, permissions, tool execution,
  response envelopes, and publication deterministic.

## Publication machine gate

Before local-to-public publication is implemented, it must be added to the executable catalogue and
define at least:

```text
draft -> prepared -> reviewed -> approved -> publishing -> published -> superseded
                   \-> rejected            \-> failed
published -> rollback-requested -> rolled-back
```

Publication must be idempotent, versioned, attributable to an actor, and recoverable without
rewriting previous public evidence. Approval binds one immutable bundle digest, and a repeated
publication request returns the existing result rather than creating another version. Profile,
workspace, base-version, signature, permission, and privacy mismatches fail before activation.

The target envelope, API boundary, persistence split, AI-client scopes, and full invariants are in
[`WORKSPACE_PUBLICATION_ARCHITECTURE.md`](./WORKSPACE_PUBLICATION_ARCHITECTURE.md). That document is
the design gate; `architecture/state-machines/catalog.ts` becomes executable authority when the
workflow is implemented.

The CV build boundary follows the same fail-closed principle: profile metadata is selected before
rendering, and the public Markdown, DOCX, and PDF set is replaced only after a fresh PDF is verified.
The general CV is a deterministic view of the selected published profile, its independently
approved Resume module, and its referenced Workbench and Evidence records. A versioned artifact
manifest binds every committed Markdown, DOCX, and PDF to its profile, variant, source fingerprint,
approval version, and SHA-256 digest. Missing references, source drift, missing artifact records, or
binary drift are rejected before release.
