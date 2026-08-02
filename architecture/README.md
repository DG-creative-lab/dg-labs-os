# Architecture Fitness Harness

This directory contains the executable description of DG-OS architecture.

- `manifest.mjs` assigns every source file to a zone and defines allowed dependency directions.
- `dependency-baseline.json` ratchets graph density, direct fan-out, and dependency depth.
- `state-machines/catalog.ts` records deterministic states, inputs, outputs, invariants, and external
  non-determinism.
- `scripts/architecture/check-dependencies.mjs` resolves internal imports, detects cycles, checks zone
  edges, and enforces budgets.

Run:

```bash
pnpm architecture:check
pnpm architecture:report
```

The baseline is a reviewed budget, not generated output. If a deliberate architectural change
requires a larger budget, add an architecture decision explaining why the new dependency is
necessary, what alternatives were rejected, and whether the increase should later be reduced.
