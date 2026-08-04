# Dessi Profile Dependency Inventory

- Status: temporary migration map
- Last reviewed: 4 August 2026
- Archive condition: a second fixture can use every shared public module without Dessi-owned
  compatibility data.

## Purpose

Dessi is the first real profile, but she must remain data passed into the product rather than an
identity assumed by shared code. This document tracks the remaining assumptions after the public
profile refactoring. It is not the product backlog. The next product build is Publication Bundle v1
in [`DG_OS_PRODUCT_ROADMAP.md`](./DG_OS_PRODUCT_ROADMAP.md).

## Completed boundary

| Area                                     | Canonical source               | State    |
| ---------------------------------------- | ------------------------------ | -------- |
| Identity, positioning and public contact | `src/profiles/dessi.ts`        | Migrated |
| Public links and CV references           | Profile projection             | Migrated |
| Workbench and Evidence and Evolution     | `src/profiles/modules/`        | Migrated |
| Selected writing and authorship boundary | `src/profiles/writing/`        | Migrated |
| Network nodes and typed relationships    | `src/profiles/network/`        | Migrated |
| Resume data and generated general CV     | `src/profiles/resume/`         | Migrated |
| Profile-aware module routes              | `/@{handle}/{module}`          | Migrated |
| Profile Agent evidence selection         | Profile-owned registries       | Migrated |
| Deterministic terminal retrieval         | Selected profile evidence      | Migrated |
| Unknown profile and module behaviour     | Explicit rejection or 404      | Enforced |
| Public privacy boundary                  | Contract validation            | Enforced |
| CV source and artifact drift             | Build-only manifest and hashes | Enforced |

The validators reject malformed identifiers and URLs, cross-profile module registration, missing
publication approval, local filesystem paths in public fields and unsupported CV references.
Contract fixtures protect the published v1 schemas.

## Remaining dependencies

### Shared interface copy

`CreativeMachineMonitor` and `HelpGuideWindow` still contain Dessi-specific narrative or labels.
They are currently used only inside Dessi's profile experience, but they are not portable shared
surfaces.

**Required change:** pass serialisable profile copy or explicitly mark the component as a
Dessi-owned presentation. Do not introduce a browser-global mutable profile store.

### Legacy Profile Agent knowledge

The Markdown corpus under `src/knowledge/chunks/` mixes platform explanation with Dessi biography,
work and instructions. `webVerify.ts` also retains Dessi-specific verification terms. The registry
prevents another profile from receiving this corpus, but the content classification remains
single-profile.

**Required change:** classify knowledge as `platform`, `profile` or `application`; attach a profile
owner and publication state to profile chunks; generate prompts only from the selected approved
registry.

### Compatibility configuration

Files under `src/config/` still assemble older application shapes from Dessi's projection and
profile-owned modules. This direction is permitted while legacy surfaces remain, but it should not
become an input to new public contracts.

**Required change:** new profile-aware work reads the registries directly. Remove compatibility
config only when its consumers have migrated and their behaviour is covered by tests.

### Compatibility and application routes

`/apps/*` routes remain Dessi-only compatibility paths. `/systems` is a shared product surface.
`/apply/openai-codex` is an intentional Dessi application variant and should not be generalised into
canonical profile identity.

**Required change:** keep profile identity when compatibility actions enter a canonical profile
route. Retire an `/apps/*` path only after links, mobile behaviour and E2E coverage use its canonical
replacement.

### Portable second fixture

Tests contain valid Dessi assertions and synthetic cross-profile fixtures, but there is no complete
second profile with every module and CV view.

**Required change:** before public multi-profile onboarding, register a complete isolated fixture
and verify the platform entrance, module routes, Profile Agent, CV resolution and mobile 404 paths
without editing shared UI.

## Migration rules

1. Data flows from public contracts and modules into registries, adapters and UI.
2. `src/profiles/` does not import UI, provider, API route or private workspace code.
3. Every public record is serialisable, versioned and validated before activation.
4. Secrets, local paths, raw activity, private repository identifiers and unreviewed claims do not
   enter the public projection.
5. An application campaign is a deliberate profile variant, never the canonical identity.
6. A shared surface receives the selected profile explicitly and never falls back silently.
7. Dessi fixture assertions remain where they verify her content. Portable behaviour belongs in
   contract, interaction and second-fixture tests.

## Relation to the expansion build

Publication Bundle v1 may use Dessi as its first valid fixture while the remaining compatibility
work continues. It must reference profile and module contracts by version and cannot package legacy
configuration or the unclassified knowledge corpus as public authority.
