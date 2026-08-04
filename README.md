# DG-OS

DG-OS is a public profile system for work, learning and professional evolution. It turns a small,
owner-reviewed record into an explorable web profile, generated CV and evidence-grounded Profile
Agent.

The operating-system interface is part of the information model. Workbench holds built systems.
Evidence and Evolution shows what changed and what supports it. Writing and Network expose selected
ideas and relationships. The Profile Agent provides another way to inspect the same approved
record.

Dessi Georgieva is the first live instance. The root route introduces the platform; `/@dessi` opens
the canonical profile.

## Current product boundary

DG-OS is the public projection, not a mirror of a private workspace.

```text
private sources -> owner review -> versioned public projection -> web, CV and Profile Agent
```

The current repository contains one public profile and no hosted user login or private workspace.
The next product slice defines a signed local publication bundle. Accounts, isolated workspaces and
authenticated Codex or Claude Code connections follow the gates in the product roadmap.

Core rules:

- private source material remains local by default;
- public records are explicit, versioned and owner reviewed;
- generated CVs and agent evidence use the same approved profile data;
- unknown profiles, modules and evidence registries fail closed;
- model output cannot select private evidence, grant authority or publish data;
- DG-OS identity remains independent of an AI provider.

## Live surfaces

| Route                 | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `/`                   | DG-OS product entrance and public profile directory       |
| `/@dessi`             | Canonical Dessi profile and OS entrance                   |
| `/@dessi/workbench`   | Reviewed projects and systems                             |
| `/@dessi/evolution`   | Claims, case studies, boundaries and evolution            |
| `/@dessi/writing`     | Selected writing with authorship and evidence disclosures |
| `/@dessi/network`     | Profile-owned nodes and evidenced relationships           |
| `/@dessi/resume`      | Approved Resume view and generated CV downloads           |
| `/apps/terminal`      | Current Dessi Profile Agent compatibility route           |
| `/systems`            | Public systems overview                                   |
| `/apply/openai-codex` | Deliberate application-specific profile variant           |

Legacy `/apps/*` routes remain as Dessi-only compatibility paths while the final single-profile
dependencies are migrated.

## Implemented foundation

- Astro and React public renderer with desktop and responsive profile surfaces
- Versioned Profile, Workbench, Evidence and Evolution, Writing, Network and Resume contracts
- Registries that validate publication, identity, privacy and cross-profile boundaries
- React Flow network view backed by a validated Graphology model
- Profile Agent with deterministic commands, approved evidence retrieval and SSE responses
- OpenRouter, OpenAI, Anthropic and Gemini gateway adapters
- Vercel Firewall rate limiting for provider-backed chat routes
- Deterministic general CV generation from approved profile modules
- Markdown, DOCX and PDF artifact drift verification
- Engineering harness for dependency direction, contracts, state machines and interactions
- Playwright smoke coverage for critical desktop and mobile flows

## Documentation

Start with [`docs/README.md`](./docs/README.md). It identifies the current sources of truth and the
historical archive.

- [Product roadmap](./docs/DG_OS_PRODUCT_ROADMAP.md)
- [Workspace and publication architecture](./docs/engineering/WORKSPACE_PUBLICATION_ARCHITECTURE.md)
- [Architecture rules](./docs/engineering/ARCHITECTURE_RULES.md)
- [State machines and invariants](./docs/engineering/STATE_MACHINES.md)
- [Testing strategy](./docs/engineering/TESTING_STRATEGY.md)
- [Definition of Done](./docs/engineering/DEFINITION_OF_DONE.md)
- [Vercel deployment runbook](./docs/VERCEL_DEPLOYMENT_RUNBOOK.md)

The executable architecture sources are [`architecture/manifest.mjs`](./architecture/manifest.mjs)
and [`architecture/state-machines/catalog.ts`](./architecture/state-machines/catalog.ts).

## Technology

- Astro 5 with React 19 and TypeScript
- Tailwind CSS
- React Flow and Graphology
- Vitest and Playwright
- Vercel serverless deployment and Firewall rate limiting
- Supabase for the optional Contact API store
- pnpm 10 and Node.js 20 to 24

## Local development

Requirements:

- Node.js `>=20 <25`
- pnpm `>=10 <11`

Install and run:

```bash
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

If pnpm reports ignored package build scripts, review them before running:

```bash
pnpm approve-builds
```

## Environment

Copy `.env.example` to `.env`. At least one server-side provider key is required for model-backed
Profile Agent answers:

```text
OPENROUTER_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

PUBLIC_SITE_URL=
PUBLIC_SITE_NAME=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Provider and Supabase credentials are server-only. Never expose them through a `PUBLIC_*` variable.
The terminal also supports explicitly supplied browser-session keys. Do not use persistent browser
storage on a shared device.

All `.env*` files are ignored except `.env.example`. If a secret was ever committed, rotate it and
remove it from repository history before deployment.

## Quality gates

Use the focused harness while developing architecture, contracts, state or interactions:

```bash
pnpm test:harness
```

Run the complete handoff gate before a pull request:

```bash
pnpm check
```

Relevant commands:

```bash
pnpm architecture:check
pnpm test:contracts
pnpm test:machines
pnpm test:interactions
pnpm test:e2e:smoke
pnpm build:vercel
```

Do not update `architecture/dependency-baseline.json` merely to make CI pass. A budget increase
requires an architecture decision that records its reason, risk and reduction plan.

## Profile data

Canonical public identity and publication approval live under `src/profiles/`. Each public module
owns an independent versioned contract so it can evolve without silently changing another schema.

Current Dessi sources:

```text
src/profiles/dessi.ts
src/profiles/modules/dessiWorkbench.ts
src/profiles/modules/dessiEvidenceEvolution.ts
src/profiles/writing/dessi.ts
src/profiles/network/dessi.ts
src/profiles/resume/dessi.ts
```

Compatibility configuration under `src/config/` may read canonical profile data. Canonical profile
contracts must not import compatibility configuration, UI code, provider adapters or private
workspace services.

## Resume generation

The general CV is a deterministic view of approved Profile, Resume, Workbench, and Evidence and
Evolution records. Application CVs remain explicit variants.

Build or inspect one target:

```bash
pnpm cv:build --profile dessi --variant general
pnpm cv:build --profile dessi --variant openai-codex
pnpm cv:build --profile dessi --variant general --dry-run
```

Verify committed assets without replacing them:

```bash
pnpm resume:check
```

Regenerate every registered Dessi variant:

```bash
pnpm resume:build
```

Generation requires the pinned Python packages in `scripts/resume/requirements.txt` and
LibreOffice `soffice`. Every variant is built in an isolated staging directory. Markdown, DOCX and
PDF assets replace the public set only after fresh files are produced and verified. The artifact
manifest binds each file to its profile, variant, source fingerprint, approval version and SHA-256
digest.

## Deployment

Production uses Astro SSR on Vercel. Before a pull request or deployment:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm deploy:preflight
pnpm build:vercel
```

Production Profile Agent routes require the published Vercel Firewall rule
`profile-agent-chat`. The API fails closed with `503 RATE_LIMIT_UNAVAILABLE` when the distributed
rate limiter is unavailable on Vercel.

Follow the complete [Vercel deployment runbook](./docs/VERCEL_DEPLOYMENT_RUNBOOK.md) for environment
configuration, smoke checks and rollback.

## Contribution policy

Before changing architecture, contracts, stateful behaviour or interactions, read `AGENTS.md`, the
relevant documents under `docs/engineering/`, and the executable architecture manifest.

Published schema versions are immutable. Breaking semantics require a new schema version,
migration, fixture and consumer tests. Models may propose text, but validated code controls
evidence, permissions, tools, transitions and publication.

## Licence

Copyright (C) 2026 Dessi Georgieva.

DG-OS software is licensed under the [GNU Affero General Public License version 3 only](./LICENSE)
(`AGPL-3.0-only`). Modified versions offered over a network must provide corresponding source to
their users under the same licence.

The DG-OS name, visual identity, personal profile content, CV content, original writing and personal
media are excluded from the software licence unless explicitly stated otherwise. See
[`NOTICE`](./NOTICE).
