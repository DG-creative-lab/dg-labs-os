# ADR-0001: Keep identity and workspaces behind a bounded control plane

- Status: accepted
- Date: 2026-08-04
- Owners: DG-OS maintainers

## Context

DG-OS currently has one reviewed public profile and no hosted private workspace. A future
multi-person product needs authentication, stable user identity, workspace membership, delegated
agent grants, approval records and access audit. Aion, presented publicly as Gateplane, already
contains useful implementations and policy patterns for these responsibilities.

The public Astro application owns profile semantics and rendering. Copying authentication and
tenant internals into it would mix public presentation, private authority and provider code. Using
an OpenAI or Anthropic account as the canonical DG-OS identity would also make workspace ownership
depend on an AI provider.

The detailed repository assessment is preserved in
[`../../archive/AION_REUSE_ASSESSMENT.md`](../../archive/AION_REUSE_ASSESSMENT.md).

## Decision

Gateplane is the planned identity and authorization control plane for hosted DG-OS workspaces. DG-OS
will consume a narrow API contract rather than copy Gateplane's Python domain models into this
repository.

The boundary is:

- Gateplane owns users, identity connections, sessions, tenants, workspaces, memberships, delegated
  grants and access audit.
- DG-OS owns public profile projections, evidence semantics, publication versions, CV generation,
  Profile Agent evidence and public rendering.
- The Personal System owns raw local material, draft interpretation and the human review surface.
- Publication approval is a DG-OS domain action. Existing Gateplane approval mechanics may support
  it, but a general agent grant cannot become publication authority.
- Codex and Claude Code authenticate to DG-OS as MCP clients through provider-neutral OAuth scopes.
  Their provider sessions are not DG-OS identities.

No Gateplane runtime dependency is introduced during the single-person, repository-backed proof.
Stable IDs, versioning, provenance and audit language may shape contracts now.

## Alternatives considered

### Implement authentication directly in Astro

This shortens the first login path but places security-sensitive identity and session behaviour in
the public renderer. It also duplicates capabilities already present in Gateplane.

### Copy Gateplane internals into DG-OS

This appears to offer rapid reuse. It would couple TypeScript profile code to Python persistence and
legacy tenant concepts, making both systems harder to evolve.

### Use the AI provider as the user identity

This would make onboarding look simple for one provider. It confuses the AI client's login with
workspace ownership, complicates provider changes and weakens the provider-neutral product
boundary.

### Add no hosted identity layer

This remains correct for the current proof but cannot support isolated workspaces, revocation,
recovery or a second user.

## Consequences

- The current build can remain local-first and repository-backed.
- Hosted onboarding waits until a real invited user needs an isolated workspace.
- A generated OpenAPI client, or an equivalently versioned contract, will be required between
  Gateplane and DG-OS.
- Tenant and workspace denial must be tested on both sides of the boundary.
- Gateplane needs a provider-neutral identity-connection model before direct reuse.
- The integration has more explicit components, but each authority can be audited and replaced
  independently.

## Verification

Before the control plane is connected:

- contract tests cover user, identity, workspace, membership and revocation semantics;
- policy tests deny cross-tenant and cross-workspace access;
- DG-OS tests reject absent, invalid or mismatched workspace identity;
- MCP tools enforce scopes independently of model output;
- publication tests require a separate owner approval bound to one bundle digest;
- audit tests cover allowed, denied, approved, rejected, published and revoked actions.

## Review or expiry

Review this decision before the invited second-person pilot or if Gateplane cannot expose the
required provider-neutral contract without importing legacy client and agency concepts.
