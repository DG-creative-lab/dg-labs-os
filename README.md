# DG-Labs OS

DG-Labs OS is a portfolio presented as a personal operating system - an interface for exploring what DG-Labs thinks about, builds, and ships. The UI leans on familiar OS metaphors (toolbar, dock, windows) but reframes them as a brain-like control panel: a machine of memory, experiments, and evolving ideas.

## Documentation

- Product and implementation roadmap: `APP_ROADMAP.md`

## Features

- Desktop OS UI with a Mac-style toolbar and dock
- Mobile iPhone-inspired lock + home screens (`/mobile`)
- RippleGrid live background with mouse interaction
- Page-based apps (`/apps/notes`, `/apps/projects`, `/apps/resume`, `/apps/terminal`)
- Terminal v3 hybrid runtime:
  - deterministic commands (`help`, `open`, `search`, `context`, `sources`, etc.)
  - natural-language command router (high-confidence phrase -> deterministic command)
  - retrieval-grounded LLM mode (`ask ...`) using local knowledge index
  - runtime toggles for `LLM fallback`, `router debug`, and `LLM source footer`
- Apple menu "About DG-Labs Pro" window
- Modular config in `src/config/`
- API routes for chat + contact + admin dashboard

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
pnpm test:unit
pnpm typecheck
pnpm check
```

Focused unit test suites:

```bash
pnpm test:auth
pnpm test:network
pnpm test:terminal
pnpm test:terminal:llm
pnpm test:terminal:settings
pnpm test tests/terminalKnowledge.test.ts tests/terminalRouter.test.ts
pnpm test:content
pnpm test:device
pnpm test:schemas
pnpm test:api
```

`test:api` includes API helper tests, response contract tests, and route contract tests (failure and success paths).

Or use `make` shortcuts:

```bash
make lint
make test-unit
make test-auth
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
# AI Terminal (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here
# Optional (used for request headers / OpenRouter rankings)
# PUBLIC_SITE_URL=https://your-domain.tld
# PUBLIC_SITE_NAME=DG-Labs OS

# Site
# PUBLIC_SITE_URL=https://your-domain.tld

# Supabase (server-only; do NOT expose in PUBLIC_ vars)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin dashboard credentials (server-only)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me
```

Security notes:

- `.env*` files are gitignored (except `.env.example`).
- If an env file was committed in the past, remove it from git tracking before push:

```bash
git rm --cached .env.local .env.production .env
```

## Configuration

Edit the config files in `src/config/`:

- `personal.ts` - name, role, focus
- `social.ts` - GitHub, LinkedIn
- `contact.ts` - email, phone, Calendly
- `education.ts`, `experience.ts`, `skills.ts`
- `projects.ts` + `src/config/projects/*.json`
- `apps.ts` - resume URL
- `site.ts` - SEO + theme colors

## Deployment

This project runs with Astro SSR (API routes). Deploy anywhere that supports a Node runtime.

## License

MIT
