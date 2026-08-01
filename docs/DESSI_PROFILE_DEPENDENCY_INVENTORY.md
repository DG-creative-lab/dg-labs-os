# Dessi Profile Dependency Inventory

> Status: active migration map  
> Last reviewed: 2026-08-01  
> Related: [`DG_OS_PRODUCT_ROADMAP.md`](./DG_OS_PRODUCT_ROADMAP.md)

## Purpose

DG-OS currently renders one person, but much of its content is embedded directly in UI, knowledge, scripts, and routes. The first multi-profile step is therefore not authentication. It is a trustworthy boundary between a person's private workspace and the public profile that DG-OS is allowed to render.

`src/profiles/` now defines that boundary as a versioned, provider-neutral `ProfileProjection`. Dessi is its first real instance. Existing screens continue to work through compatibility configuration derived from the projection, so the migration can remain incremental.

## Completed in the first contract slice

| Area                                        | Canonical source                            | State                          |
| ------------------------------------------- | ------------------------------------------- | ------------------------------ |
| Identity, role, location, positioning       | `dessiProfileProjection.identity`           | Migrated                       |
| Public contact details                      | `dessiProfileProjection.contact`            | Migrated                       |
| Public links and their allowed surfaces     | `dessiProfileProjection.links`              | Migrated                       |
| General CV asset references                 | `dessiProfileProjection.cv.primary`         | Migrated                       |
| SEO title, description, and keywords        | `dessiProfileProjection.seo`                | Migrated                       |
| Systems/Evidence hero identity              | projection-derived `systemsEvidenceProfile` | Migrated                       |
| Owner approval and private-source exclusion | `dessiProfileProjection.publication`        | Enforced                       |
| Application-specific OpenAI CV and role     | `openAiCodexApplication`                    | Intentionally separate variant |

The validator rejects malformed identifiers and URLs, duplicate links and CV IDs, local filesystem paths, secret-bearing fields, and publication without the explicit privacy boundary. A JSON round-trip test protects the portability requirement.

## Remaining Dessi-specific dependencies

### 1. Shared interface copy

Direct references remain in `ResumeApp`, `EvolutionApp`, `TechnicalWritingApp`, `DesktopWorkspace`, `CreativeMachineMonitor`, `HelpGuideWindow`, and the Evidence surface. These should become copy or labels supplied through an active profile runtime, not individual component props added ad hoc.

**Disposition:** introduce a small `ProfileRuntimeContext` generated from the public projection, then migrate the shared shell and apps one surface at a time.

### 2. Terminal and agent behaviour

`terminalLlm.ts`, `webVerify.ts`, `AgentsTerminal`, and `TerminalControlPanels` currently assume Dessi in prompts, query routing, and verification language. This is behavioural identity and must not silently switch profiles through string replacement.

**Disposition:** derive a public agent context from the active projection and a separately approved knowledge registry. Keep provider credentials, private memories, and local source access outside the projection.

### 3. Knowledge corpus

The Markdown chunks under `src/knowledge/chunks/` mix reusable DG-OS concepts with Dessi-specific biography, work, links, and instructions.

**Disposition:** classify each chunk as `platform`, `profile`, or `application`; attach an owner profile ID and publication state to profile material; generate the profile system context only from approved chunks. The current corpus remains the Dessi fixture until this classification exists.

### 4. Projects, evolution, writing, and network data

`workbench.ts`, `applicationProfile.ts`, `labNotes.ts`, `network.ts`, education, experience, and related configuration are still single-profile content stores.

**Disposition:** extend the contract with versioned public modules or stable module references after the base identity contract has proved stable. Preserve evidence confidence, visibility, source boundaries, and owner review rather than flattening these records into generic portfolio cards.

### 5. CV sources and build scripts

The projection owns published CV asset references, while filenames and resume-generation scripts still assume Dessi.

**Disposition:** make the resume builder accept a profile handle and an explicit CV variant. Keep the OpenAI application as a deliberate variant; it should not redefine the general profile.

### 6. Routes and page metadata

`/systems`, project routes, and page titles still assume the single Dessi profile. `/apply/openai-codex` is intentionally specific to one application.

**Disposition:** first render the existing shell from an active profile context. Add a canonical profile route such as `/@dessi` only when a second fixture can exercise profile selection. Authentication and database-backed workspaces remain gated on a real second user.

### 7. Tests

Existing terminal, API, and end-to-end suites contain fixture-specific Dessi assertions.

**Disposition:** retain Dessi assertions where they verify the Dessi fixture, move portable contract behaviour into `profileProjection.test.ts`, and generalise shared-shell tests when the runtime context lands.

## Migration rules

1. Data flows in one direction: public projection → compatibility config → UI.
2. `src/profiles/` must not import UI code, terminal providers, private workspace services, or legacy config.
3. A projection must remain serialisable JSON with a declared schema and projection version.
4. No secrets, local paths, private repository identifiers, raw activity, or unreviewed claims may enter a public projection.
5. Each migrated module keeps its current behaviour covered by tests before the legacy value is removed.
6. Application campaigns are profile variants, not the canonical identity.

## Next implementation slice

Build an active-profile runtime around `ProfileProjection` and use it in the desktop shell, Resume, Evidence, and page metadata. This proves that the current Dessi experience is genuinely profile-driven before routes, workspaces, authentication, Neon, or Blob storage are introduced.
