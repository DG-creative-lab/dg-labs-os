# Engineering Harness Testing Strategy

## Principles

1. Test invariants and boundaries, not implementation trivia.
2. Test interactions as well as isolated modules.
3. Keep generated tests reproducible with fixed seeds.
4. Fail closed at identity, evidence, permission, and publication boundaries.
5. Keep contract fixtures for every supported public schema version.
6. Prefer fast deterministic tests on every change and deeper fault testing on pull requests or a
   schedule.

## Test groups

| Group         | Protects                                                        |
| ------------- | --------------------------------------------------------------- |
| Architecture  | Zones, cycles, fan-out, graph density, dependency depth         |
| Contracts     | Schema compatibility, validation, privacy, registry matching    |
| Machines      | Transitions, invalid events, replay, state invariants           |
| Interactions  | Identity and evidence across registry, agent, API, and UI seams |
| Security      | Secrets, local paths, tenant/profile isolation, rate limits     |
| API contracts | Request schemas, responses, SSE order, fallback and errors      |
| E2E smoke     | Critical visitor flows in a real browser                        |

## Commands

```bash
pnpm architecture:check
pnpm test:architecture
pnpm test:contracts
pnpm test:machines
pnpm test:interactions
pnpm test:harness
pnpm check
```

`pnpm test:harness` is the focused development loop. `pnpm check` is the full handoff and CI gate.

## Contract compatibility

Committed fixtures under `tests/fixtures/contracts/` represent the minimum valid form of every
supported schema. Existing fixtures must remain valid. Breaking semantics require a new schema
version, fixture, migration, and consumer tests.

## Property sequences

Machine tests should generate many valid and invalid event orders with fixed seeds. The seed and
input sequence must appear in a failure so the behaviour can be replayed. Property testing does not
replace targeted examples; it covers transition combinations examples commonly miss.

## Non-deterministic systems

Do not test that a model always produces exact prose. Test the deterministic envelope around it:

- selected profile and evidence;
- prompt authority boundaries;
- provider selection and fallback policy;
- allowed tool calls;
- SSE event ordering;
- timeouts and typed errors;
- source and confidence metadata.
