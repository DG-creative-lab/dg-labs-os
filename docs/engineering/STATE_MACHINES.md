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

Before local-to-public publication is implemented, it must define at least:

```text
prepared -> reviewed -> approved -> published -> superseded
                  \-> rejected
published -> rolled-back
```

Publication must be idempotent, versioned, attributable to an actor, and recoverable without
rewriting previous public evidence.

The CV build boundary follows the same fail-closed principle: profile metadata is selected before
rendering, and the public Markdown, DOCX, and PDF set is replaced only after a fresh PDF is verified.
The general CV is a deterministic view of the selected published profile, its Resume module, and
its referenced Workbench and Evidence records. Missing references or committed Markdown drift are
rejected before document rendering.
