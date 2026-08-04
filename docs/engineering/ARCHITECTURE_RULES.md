# Architecture Rules

## Objective

DG-OS should become more capable without making its behaviour or authority boundaries harder to
understand. Complexity is allowed when the product requires it. Accidental coupling, cycles, hidden
state, and silent contract changes are not.

The executable source of these rules is `architecture/manifest.mjs`.

## Zones

| Zone                    | Responsibility                                             |
| ----------------------- | ---------------------------------------------------------- |
| `publication-contracts` | Signed publication envelope, canonical form and validation |
| `publication-crypto`    | Server or local signing and signature verification         |
| `profile-contracts`     | Provider-neutral schemas and pure validation               |
| `profile-data`          | Reviewed public profile fixtures and module content        |
| `profile-runtime`       | Profile and module registries                              |
| `profile-agent`         | Explicit assembly of a profile and approved agent evidence |
| `services`              | Use cases, reducers, gateways, and deterministic utilities |
| `api`                   | Request validation, platform controls, and delegation      |
| `ui`                    | Astro and React presentation surfaces                      |
| `content`               | Compatibility config, knowledge, and non-contract content  |
| `platform`              | Shared leaf types and framework declarations               |

Every source file must belong to exactly one zone. New top-level responsibilities require an
explicit manifest update rather than silently inheriting broad permissions.

## Direction rules

1. Contracts do not import UI, services, providers, config, or private data.
2. Publication contracts may reference supported public profile contract versions. Public profile
   contracts never import publication code.
3. Public profile data depends on contracts, not on rendering or providers.
4. Registries validate data before activation and fail closed for unknown identities.
5. API routes validate and delegate. Domain or provider policy belongs in a service.
6. UI code does not import API route implementations or server-only controls.
7. Provider adapters do not choose profiles, evidence, permissions, or tools.
8. Compatibility config may read canonical profile data; canonical profile contracts do not read
   compatibility config.
9. Cryptographic signing and key access remain server or local-service concerns. Publication
   contracts contain signatures and key identifiers, never private keys.
10. Cycles are forbidden.

## Dependency budgets

The harness measures:

- cycles;
- forbidden zone edges;
- unassigned files;
- internal edges per source file;
- maximum direct fan-out;
- maximum dependency depth;
- fan-out of critical contract and registry files.

Budgets are ratchets. They make growth visible and reviewable; they are not a claim that the current
numbers are theoretically optimal. Do not game a metric by creating meaningless wrapper modules.

## Exceptions

An exception requires a decision record containing:

- the capability that requires the dependency;
- why a permitted direction cannot support it;
- security, reliability, and maintenance risks;
- the proposed budget change;
- an expiry or reduction plan when the exception is temporary.
