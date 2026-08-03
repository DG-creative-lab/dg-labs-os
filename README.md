# DG-OS

DG-OS is an evidence-led public profile system presented through an operating-system interface. The root route introduces the platform and its private-to-public publication boundary; `/@dessi` is the first live profile instance. Familiar OS metaphors become a navigable model of memory, experiments, evidence, and evolving ideas.

## Documentation

- Product direction, architecture, and decision record: `docs/DG_OS_PRODUCT_ROADMAP.md`
- Gateplane/Aion authentication and workspace reuse decision: `docs/AION_REUSE_ASSESSMENT.md`
- Dessi-to-profile migration inventory: `docs/DESSI_PROFILE_DEPENDENCY_INVENTORY.md`
- Architecture rules and dependency fitness functions: `docs/engineering/ARCHITECTURE_RULES.md`
- State machines and invariants: `docs/engineering/STATE_MACHINES.md`
- Engineering test strategy: `docs/engineering/TESTING_STRATEGY.md`
- Definition of Done: `docs/engineering/DEFINITION_OF_DONE.md`
- Detailed application implementation backlog: `docs/APP_ROADMAP.md`
- React + TypeScript event/state guide: `docs/REACT_TYPESCRIPT_EVENT_STATE_GUIDE.md`
- Archived stabilization completion log: `docs/archive/CODEBASE_STABILIZATION_PLAN.md`

## Features

- Product entrance and public profile registry at `/`
- Canonical, responsive public profile at `/@dessi`
- Owner-reviewed profile projection contract with private-source boundaries
- Versioned Workbench, Evidence/Evolution, Writing, and Network modules shared by the UI and Profile Agent
- Profile-aware Resume resolution with explicit general and application CV variants
- Desktop OS UI with a Mac-style toolbar and dock
- Focus-aware desktop menubar (menu sets update by active/focused app)
- Mobile iPhone-inspired lock + home screens (`/mobile`)
- RippleGrid live background with mouse interaction
- Page-based apps (`/apps/notes`, `/apps/projects`, `/apps/resume`, `/apps/terminal`)
- Terminal v3 hybrid runtime:
  - deterministic commands (`help`, `open`, `search`, `context`, `sources`, etc.)
  - natural-language command router (high-confidence phrase -> deterministic command)
  - retrieval-grounded LLM mode (`ask ...`) using local knowledge index
  - answer modes (`ask`, `brief`, `cv`, `projects`)
  - provider selector (`openrouter`, `openai`, `anthropic`, `gemini`)
  - BYOK support (session-only or optional browser-local persistence)
  - provider health diagnostics via `/api/llm/health`
  - capability-aware provider fallback (opt-in, only when alternate keys exist)
  - runtime toggles for `LLM fallback`, `provider fallback`, `router debug`, and `LLM source footer`
- Apple menu "About DG-Labs Pro" window
- `Window -> Contact...` opens dock Links panel on desktop (email fallback on page routes)
- Modular config in `src/config/`
- API routes for chat + contact
- Distributed Profile Agent rate limiting through a required Vercel Firewall rule
- Engineering Harness v1 for dependency direction, contract compatibility, state invariants, and
  cross-module interactions

## Current Priority

- Complete the Dessi proof as one versioned public projection.
- Migrate remaining profile content behind the shared profile boundary.
- Prepare the private review-and-publication contract before adding hosted accounts or storage.

## Tech Stack

- [Astro](https://astro.build/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) (contact storage)

## Getting Started

0. Use the same runtime versions (recommended for reproducibility)

```bash
nvm use
pnpm -v
node -v
```

1. Install dependencies from lockfile

```bash
pnpm install --frozen-lockfile
```

If `pnpm` prints `Ignored build scripts` (for example `esbuild`), run:

```bash
pnpm approve-builds
```

2. Run the dev server

```bash
pnpm dev
```

## Quality Checks

Run locally with `pnpm` scripts:

```bash
pnpm lint
pnpm format:check
pnpm test:harness
pnpm test:unit
pnpm typecheck
pnpm check
```

Focused unit test suites:

```bash
pnpm test:network
pnpm test:terminal
pnpm test:terminal:llm
pnpm test:terminal:settings
pnpm test tests/terminalKnowledge.test.ts tests/terminalRouter.test.ts
pnpm test:content
pnpm test:device
pnpm test:schemas
pnpm test:api
pnpm architecture:check
pnpm test:architecture
pnpm test:contracts
pnpm test:machines
pnpm test:interactions
```

`test:api` includes API helper tests, response contract tests, and route contract tests (failure and success paths).

Or use `make` shortcuts:

```bash
make lint
make test-unit
make test-network
make test-terminal
make test-terminal-llm
make test-terminal-settings
make test-content
make test-device
make test-schemas
make test-api
make typecheck
make check
```

3. Environment variables

Copy `.env.example` to `.env` and fill in:

```
# AI Terminal (server-owned defaults)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
# Optional (used for request headers / OpenRouter rankings)
# PUBLIC_SITE_URL=https://your-domain.tld
# PUBLIC_SITE_NAME=DG-Labs OS

# Site
# PUBLIC_SITE_URL=https://your-domain.tld

# Supabase (server-only; do NOT expose in PUBLIC_ vars)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

```

Security notes:

- `.env*` files are gitignored (except `.env.example`).
- If an env file was committed in the past, remove it from git tracking before push:

```bash
git rm --cached .env.local .env.production .env
```

## Configuration

Public profile identity, links, CV references, SEO, and publication approval enter through the
versioned contract in `src/profiles/`. Workbench and Evidence/Evolution records enter through the
versioned module bundle in `src/profiles/modules/`. Writing, Network, and Resume use independent
versioned contracts so each surface can evolve without changing the frozen profile-modules v1
schema. The remaining single-profile surfaces continue to migrate incrementally.

Platform identity and root-route SEO live in `src/config/platform.ts`.

Edit profile-owned public Workbench and Evidence/Evolution content in
`src/profiles/modules/dessiWorkbench.ts` and `src/profiles/modules/dessiEvidenceEvolution.ts`.

Edit profile-owned public Writing content in `src/profiles/writing/dessi.ts`.

Edit the remaining content config files in `src/config/`:

- `personal.ts` - name, role, focus
- `social.ts` - GitHub, LinkedIn
- `contact.ts` - email, phone, Calendly
- `education.ts`, `experience.ts`, `skills.ts`
- `projects.ts` + `src/config/projects/*.json`
- `apps.ts` - resume asset links (`pdf`, `docx`, `markdown`)
- `site.ts` - SEO + theme colors

## Resume Module

Resume is resolved from the selected public profile and served from local static assets:

- `/cv/Dessi_Georgieva_CV.pdf`
- `/cv/Dessi_Georgieva_CV.docx`
- `/cv/Dessi_Georgieva_CV.md`

The general CV is rendered deterministically from the approved Profile, Resume, Workbench, and
Evidence/Evolution modules. Its canonical Resume data lives in `src/profiles/resume/`; the committed
Markdown, DOCX, and PDF are generated views rather than editable sources. Application-specific CVs
remain explicit Markdown variants.

Build-only source mappings live in `scripts/resume/cv-build-manifest.json`. Local source paths are
never included in the public profile projection or client runtime.

Build one explicit profile CV variant:

```bash
pnpm cv:build --profile dessi --variant general
pnpm cv:build --profile dessi --variant openai-codex
```

Preview the resolved build target without generating files:

```bash
pnpm cv:build --profile dessi --variant general --dry-run
```

Verify that the committed general CV Markdown matches the approved modules without replacing any
files:

```bash
pnpm resume:check
```

Regenerate all currently registered Dessi variants:

```bash
pnpm resume:build
pnpm resume:sync
```

`resume:sync` is retained as a compatibility alias for the same complete build. It does not publish
Markdown independently.

Requirements for `resume:build`:

- Python with the pinned dependencies from `scripts/resume/requirements.txt` installed for DOCX
  generation.
- LibreOffice (`soffice`) for mandatory PDF conversion.

The CI build installs both requirements explicitly before regenerating the public resume assets.
The main quality gate also runs `resume:check`. It verifies the expected Markdown for every CV
variant and checks the committed Markdown, DOCX, and PDF SHA-256 digests against
`scripts/resume/cv-artifact-manifest.json`, so source or binary drift fails before release.

Each variant is rendered in an isolated staging directory. Markdown, DOCX, and PDF replace the
public assets only after all three fresh files have been produced. Missing or failed PDF conversion
fails the build and preserves the previously reviewed public set.

## Deployment

This project runs with Astro SSR (API routes). Deploy anywhere that supports a Node runtime.

For Vercel deployment specifics, use:

- `docs/VERCEL_DEPLOYMENT_RUNBOOK.md`

## Release Checklist

Use this quick path before and after each merge to `main`.

1. Pre-merge local checks

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm deploy:preflight
pnpm build:vercel
```

2. Secret hygiene

```bash
git ls-files | rg -n "^\\.env"
```

Expected: only `.env.example`.

Before Production deployment, publish the Vercel Firewall rule with ID `profile-agent-chat` as described in `docs/VERCEL_DEPLOYMENT_RUNBOOK.md`. The Profile Agent API fails closed with `503 RATE_LIMIT_UNAVAILABLE` if the rule is missing on Vercel.

3. Post-deploy smoke checks

- Open `/desktop`
- Open `/apps/network` and toggle List/Graph
- Open `/apps/terminal`, run `help` and one `ask ...`
- Confirm the Profile Agent request succeeds without `RATE_LIMIT_UNAVAILABLE`
- Check provider status endpoint: `/api/llm/health?probe=0`

4. Full operational guide

- `docs/VERCEL_DEPLOYMENT_RUNBOOK.md`

## License

Copyright (C) 2026 Dessi Georgieva.

DG-OS software is licensed under the [GNU Affero General Public License version 3 only](./LICENSE) (`AGPL-3.0-only`). Modified versions offered over a network must provide their corresponding source to their users under the same licence.

The DG-OS name, visual identity, personal profile content, CV content, original writing, and personal media are excluded from the software licence unless explicitly stated otherwise. See [`NOTICE`](./NOTICE).
