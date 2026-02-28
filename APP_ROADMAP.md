# DG-Labs OS App Roadmap

## 1. Product Intent (Consolidated)

DG-Labs OS is a portfolio presented as a cognitive operating system:

- Facts are represented as apps, windows, nodes, and workflows.
- The core narrative is human agency: systems should empower people rather than extract attention.
- The UI metaphor is not decorative only; it is the information architecture.

Primary metaphor:

- Desktop = current cognitive state (what is active now)
- Apps = stable modules of work/thinking
- Terminal = agent runtime and command surface
- Network = factual graph of education, experience, research, and projects

## 2. What Is Already Implemented (Current State)

### 2.0 Authentication Checkpoint (Applied)

- Admin authentication has been hardened from client-stored token to signed `HttpOnly` cookie session:
  - Added HMAC-based session helpers in `src/utils/adminAuth.ts`.
  - `POST /api/admin/login` now issues signed cookie session.
  - `GET /api/admin/messages` verifies signed cookie or bearer token.
  - `DELETE /api/admin/messages` clears admin session cookie.
  - Admin dashboard now uses `credentials: 'include'` instead of `sessionStorage` token.
- Added optional `ADMIN_SESSION_SECRET` env var (falls back to `ADMIN_PASSWORD`).
- Added unit tests for session token creation/verification and timing-safe match.

### 2.1 Platform and Routing

- Astro + React hybrid app with page-based routes (`/apps/*`) and mobile routes (`/mobile/*`).
- Device middleware redirects:
  - Mobile UAs -> `/mobile/lock`
  - Desktop UAs away from `/mobile/*` -> `/desktop`
- Desktop and index routes both load the desktop layout.

### 2.2 Desktop Shell

- `DesktopLayout.astro` includes:
  - RippleGrid animated background
  - Reading scrim for content legibility
  - Mac-like toolbar and dock
- Toolbar includes Apple menu and app menus (File/Edit/View/Go/Window/Help).
- Dock includes current modules:
  - Workbench, Lab Notes, Timeline, News Hub, Network, Links, Agents

### 2.3 Mobile Shell

- iPhone-inspired lock/home UX:
  - `/mobile/lock` tap-to-unlock
  - `/mobile/` home with app grid + bottom dock
- Mobile app routes exist for notes/projects/resume/network/terminal.

### 2.4 Content Modules

- Workbench (`/apps/projects`) mapped from `src/config/workbench.ts`
- Lab Notes (`/apps/notes`) mapped from `src/config/labNotes.ts`
- Network (`/apps/network`) backed by weighted nodes + idea edges in `src/config/network.ts`
- Resume and Terminal pages currently minimal
- News app route exists (`/apps/news`)

### 2.5 Network Graph

- Sigma.js graph view with:
  - weighted nodes
  - idea edges (strength + solid/dotted style)
  - filters (All/Education/Research/Projects/Experience)
  - search
  - list <-> graph toggle
  - dark-mode labels/tooltips
- Network page links now include:
  - LinkedIn, GitHub, ai-knowledge-hub org, DG-creative-lab, AI News Hub, AI Skills Platform

### 2.6 Agent Runtime (Terminal)

- OpenRouter-backed chat API exists at `/api/chat`
- model currently configured to `openai/gpt-oss-120b`
- terminal UI currently basic and not yet full CLI command runtime

### 2.7 Quality and Delivery

- Scripts: lint, format, tests, typecheck, check
- Tests present for:
  - content config sanity
  - mobile UA detection
  - network graph and network search utilities
- CI exists (`.github/workflows/ci.yml`) for quality + build on push/PR

## 3. Intent Already Stored In Code (Source of Truth)

The app intent is not only in README; it is already encoded across:

- `src/config/workbench.ts`: flagship systems/platform/writing/hackathons narrative
- `src/config/labNotes.ts`: deep-dive research thread and principles
- `src/config/network.ts`: knowledge-graph structure, weighting, and idea edges
- `src/components/global/DesktopDock.tsx`: OS metaphor through module naming

This means roadmap execution can be incremental without redesigning the whole information model.

## 4. Gaps and Opportunities

### 4.1 Product/UX Gaps

- Terminal is visually present but not yet functionally a real CLI runtime.
- Resume is too thin relative to your actual depth.
- News app needs a stronger in-app experience (embedded curated view vs plain external jump).
- Toolbar actions are useful but not yet fully aligned to the cognitive-OS story.

### 4.2 Content Architecture Gaps

- Some CV depth is in network config but not yet reflected in:
  - Timeline/Resume app
  - About DG-Labs Pro window details
  - app-level cross-links ("open in Network", "open in Workbench")

### 4.3 System Gaps

- No central planning document currently in repo (this file fixes that baseline).
- No content schema validation that enforces required links/fields by module.
- No E2E smoke tests yet for key UX flows (desktop nav, mobile unlock, toolbar actions).

## 5. Roadmap (Phased)

## Phase 1 - Product Cohesion (1-2 weeks)

Goal: make current modules feel intentionally connected.

1. Terminal v1 (deterministic CLI commands)

- Add command parser:
  - `help`
  - `open projects|notes|resume|news|network|contact`
  - `projects`
  - `project <id>`
  - `resume`
  - `links`
  - `now`
  - `search <query>`
  - `whoami`
- Keep LLM as optional wrapper, not dependency for core functionality.

2. Timeline/Resume upgrade

- Convert `/apps/resume` from single button to:
  - summary section
  - milestones
  - downloadable PDF action
  - link-outs to Workbench/Network nodes

3. About DG-Labs Pro alignment

- Make "About" values consistent with current story (DG-Labs Pro, chip/memory/OS narrative).
- Ensure close/minimize behavior matches other windows.

## Phase 2 - Content Operating System (2-3 weeks)

Goal: map all high-value content into app-native modules.

1. News Hub app strategy

- Option A: embed selected feed cards in-window + external open
- Option B: pure curated summary + outbound links
- Keep performance and readability first.

2. Network -> App deep linking

- Add "open in app" actions from graph inspector/list cards:
  - research node -> notes deep dive
  - project node -> workbench item
  - org/experience node -> resume timeline anchor

3. Toolbar semantics hardening

- Keep mac menu order.
- Re-map actions to meaningful system controls:
  - Apple: About, Preferences, Lock, Sleep (dim), Restart (seed refresh)
  - File/View/Go/Window/Help tied to real app actions.

## Phase 3 - Visual System and Originality (2 weeks)

Goal: stronger DG visual language while preserving simplicity.

1. Icon system unification

- Build a consistent DG-Labs icon set (squircle + gradient + glyph grammar).
- Apply to desktop dock + mobile home + graph legend badges.

2. Typography and spacing pass

- Introduce one strong type scale token set for window headers/body/meta text.
- Tighten chip/button variants:
  - external actions
  - filters
  - utility controls

3. Motion polish

- Keep transitions minimal first (fade/slide), avoid over-animation.

## Phase 4 - Reliability and Shipping (ongoing)

Goal: production confidence.

1. Testing expansion

- Add unit tests for terminal command parser and router mapping.
- Add integration tests for critical pages:
  - `/desktop`
  - `/apps/network` (filter/search/list/graph toggles)
  - `/mobile/lock -> /mobile/`

2. E2E smoke tests

- Add Playwright smoke suite for:
  - navigation from dock
  - toolbar menu actions
  - mobile unlock flow

3. Deployment hardening (Vercel)

- Confirm envs for OpenRouter and Supabase.
- Keep chat persistence in `localStorage` initially.
- Move to server persistence only when product behavior is stable.

## 6. Information Architecture Target (App Map)

Recommended steady-state modules:

- Agents (Terminal): CLI + LLM wrapper
- Workbench (Projects): problem -> solution -> outcome
- Lab Notes (Notes): deep dives + research logs
- Timeline (Resume): canonical trajectory + milestones
- News Hub (Browser): maintained publication
- Network: graph of facts + ideas
- Preferences (System Settings): principles, stack, defaults
- Now (Activity Monitor): active month focus and experiments

## 7. Backlog (Prioritized)

P0 (next):

- Terminal deterministic commands
- Resume app enrichment
- About window behavior/design parity

P1:

- News app curation mode
- Network deep links into other apps
- Toolbar action model finalization

P2:

- Icon system redesign
- E2E suite
- Preferences + Activity Monitor modules

## 8. Definition of Done (for each module)

A module is "done" when:

- It has a clear narrative role in the OS metaphor.
- It has meaningful content (not placeholder copy).
- It can be reached from both toolbar and dock (or justified otherwise).
- It has at least one testable behavior path.
- It links coherently to at least one other module.
