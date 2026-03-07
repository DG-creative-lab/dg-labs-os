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

### 2.0 Access Model

- Public portfolio routes are intentionally open.
- Private admin inbox/dashboard functionality has been removed to keep the product surface focused.

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
- Menubar behavior is context-aware by focused app (desktop shell events + route fallback).
- Dock includes current modules:
  - Workbench, Lab Notes, Timeline, News Hub, Network, Links, Agents
- `Window -> Contact...` opens the dock Links panel on desktop (mailto fallback on app routes).

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

- Multi-provider chat gateway exists at `/api/chat`:
  - `openrouter`, `openai`, `anthropic`, `gemini`
- Provider health route exists at `/api/llm/health` (status + probe)
- Terminal runtime now supports:
  - deterministic commands (`help`, `open`, `search`, `context`, `sources`, etc.)
  - answer modes (`ask`, `brief`, `cv`, `projects`)
  - local retrieval-grounded context + citations footer
  - provider diagnostics metadata (provider/model/latency/fallback)
  - BYOK flow (session default, optional local persistence)
  - capability-aware provider fallback (opt-in)
  - links-registry-informed verification query planning

### 2.7 Quality and Delivery

- Scripts: lint, format, tests, typecheck, check
- Tests present for:
  - content config sanity
  - mobile UA detection
  - network graph and network search utilities
- Service layer now includes:
  - `chatService` (LLM + grounding orchestration)
  - `navigationService` (desktop open/focus/navigation dispatch)
  - `desktopWindowService` (window open/toggle/close/focus state transitions)
- CI exists (`.github/workflows/ci.yml`) for quality + build on push/PR
- Playwright smoke suite is active and runs in CI (`test:e2e:smoke`) for desktop/mobile core UX flows.

## 3. Intent Already Stored In Code (Source of Truth)

The app intent is not only in README; it is already encoded across:

- `src/config/workbench.ts`: flagship systems/platform/writing/hackathons narrative
- `src/config/labNotes.ts`: deep-dive research thread and principles
- `src/config/network.ts`: knowledge-graph structure, weighting, and idea edges
- `src/components/global/DesktopDock.tsx`: OS metaphor through module naming

This means roadmap execution can be incremental without redesigning the whole information model.

## 4. Gaps and Opportunities

### 4.1 Product/UX Gaps

- Resume is too thin relative to your actual depth.
- News app needs a stronger in-app experience (embedded curated view vs plain external jump).
- Toolbar actions are useful but not yet fully aligned to the cognitive-OS story.

### 4.4 Help UX

- Dedicated Help windows are now implemented:
  - DG-Labs User Guide
  - Terminal Command Guide
  - Navigation Tips
  - About DG-Labs OS
- Next iteration: add a lightweight Troubleshooting / FAQ panel.

### 4.2 Content Architecture Gaps

- Some CV depth is in network config but not yet reflected in:
  - Timeline/Resume app
  - About DG-Labs Pro window details
  - app-level cross-links ("open in Network", "open in Workbench")

### 4.3 System Gaps

- No central planning document currently in repo (this file fixes that baseline).
- No content schema validation that enforces required links/fields by module.
- Need deeper E2E coverage beyond smoke (terminal tool interactions, graph interaction modes, window lifecycle edge cases).
- Deployment is not yet fully hardened for Vercel production (secrets, provider routing, runtime checks, observability).

### 4.5 LLM Platform and Deployment Gaps

- BYOK currently supports session use + optional local persistence; next iteration should add explicit key rotation affordances.
- Provider fallback policy exists and is capability-aware; next iteration should expose richer provider error guidance.
- Deployment runbook now exists (`docs/VERCEL_DEPLOYMENT_RUNBOOK.md`); next iteration is enforcement via release checklist automation.

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

2. Agent identity and evidence model (CV index)

- Create a canonical `CV/Identity Index` dataset (single source of truth) that the agent uses for:
  - complete work experience timeline
  - project classification (long-term research vs delivery projects vs experiments)
  - education, publications, talks, and impact signals
  - verified profile links (LinkedIn, GitHub personal/org, AI News Hub, Skills platform)
- Add provenance fields to index entries (source URL, last-verified date, confidence).
- Use this index as retrieval context for `ask` and as query planner input for `verify`.
- Define profile-facing outputs for target users:
  - human recruiters/hiring managers
  - AI HR agents
  - technical peer agents performing due diligence

3. Verification semantics (agent runtime)

- Re-scope `web_verify` from generic tech checks to identity/work verification checks:
  - person identity + public profile consistency
  - experience and education corroboration
  - project/publication footprint corroboration
- Add verification query presets aligned to DG-Labs OS intent.
- Add completion criteria for verify responses:
  - claim coverage (what was checked)
  - source list
  - confidence and unresolved gaps
- Wire verification to a centralized Links registry:
  - make Links app the single source of public footprint URLs
  - feed `web_verify` query planning from this registry
  - support domain-priority and per-link trust metadata
  - remove hardcoded footprint URLs from verifier internals

4. BYOK + Provider Gateway (terminal)

- Add BYOK mode in terminal settings:
  - user can select provider (`openrouter`, `openai`, `anthropic`, `gemini`)
  - user can provide key in session scope (and optional local persistence if explicitly enabled)
  - clear warning for public/shared device usage
- Add `llmGateway` service with provider adapters:
  - normalized input/output contract (`message`, `usage`, `model`, `provider`, `error`)
  - consistent timeout/retry behavior across providers
  - deterministic fallback order when selected provider fails
- Add provider health checks and explicit terminal feedback:
  - “provider unavailable”, “invalid key”, “rate limited”, “timeout”
  - no silent fallback without user-facing note
  - status: completed (v1)

5. Timeline/Resume upgrade

- Convert `/apps/resume` from single button to:
  - summary section
  - milestones
  - downloadable PDF action
  - link-outs to Workbench/Network nodes

6. About DG-Labs Pro alignment

- Make "About" values consistent with current story (DG-Labs Pro, chip/memory/OS narrative).
- Ensure close/minimize behavior matches other windows.

7. Dedicated Help instruction windows

- Replace duplicated Help links with guide-first windows and structured in-app help content.
- Keep `Search Help in Agents` as the action entry point to terminal.
- Add acceptance criteria:
  - each Help item triggers unique guidance content
  - no dead/duplicate app-link behavior
  - guidance content is reachable from both desktop shell and page routes
  - status: completed

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
- Dynamic menu model per active app (Mac-like context switch):
  - when Terminal is active: show terminal-relevant actions (history, mode, clear, verify presets)
  - when Network is active: show graph/filter/search/layout actions
  - when Workbench/Notes/Resume are active: show module-specific actions
  - fallback to global menu set on desktop home
  - labels and shortcuts should update on app-focus change, not only on route change
  - acceptance criteria:
    - active app switch updates menu content within one frame
    - no dead menu items (each menu entry must trigger a real action)
    - mobile keeps simplified status bar behavior (no desktop-style menu expansion)
  - implementation slices:
    - route-aware menubar (`activeAppId`) wired through desktop layout
    - terminal vertical slice: menu actions can change mode, clear output, and trigger verify presets
    - network slice: menu actions can change list/graph mode, apply category filters, and run query presets
  - workbench/notes/resume slice: menu actions trigger section jumps and module-specific actions
  - focus slice: draggable windows emit app-focus events (`dg-app-focus`) and menubar resolves focused app before route app
  - next slice: full single-page multi-window desktop (focus by active window instance, including non-draggable frames)

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
  - status: completed (committed and CI-wired)
  - next: expand coverage for terminal tool flows, graph interaction mode toggles, and window lifecycle edges

3. Deployment hardening (Vercel)

- Add Vercel deployment runbook:
  - preview and production projects
  - env variable matrix (public vs server-only)
  - protected branch + deploy gating rules
- Define provider secret strategy:
  - server-owned default keys (`OPENROUTER_API_KEY`, optional provider keys)
  - BYOK request path where user keys are never logged
  - redact provider errors and key material from client-visible traces
- Add runtime hardening checks:
  - startup env validation
  - `/api/health` provider readiness summary
  - graceful degraded behavior when any provider is down
- Add release safety:
  - rollback checklist
  - smoke validation after deploy (`/desktop`, terminal ask/verify, network graph load)
  - basic observability and alerting hooks

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

- BYOK + multi-provider LLM gateway:
  - terminal provider selector + BYOK session flow
  - gateway adapters for OpenAI / Claude / Gemini / OpenRouter
  - normalized errors + fallback policy
- Vercel deployment hardening:
  - deploy runbook + env matrix + health checks + rollback flow
- Content schema validation for core configs (`workbench`, `network`, `notes`, `links`)
- Resume app enrichment
- About window behavior/design parity

P1:

- Terminal deterministic commands hardening (UX + tests)
- Links registry -> `web_verify` wiring hardening (single source of truth for external profile/project links)
- News app curation mode
- Network deep links into other apps
- Toolbar action model finalization
- Dynamic Mac menubar per active app (contextual menu sets and shortcuts)
- Troubleshooting/FAQ help panel

P2:

- Icon system redesign
- E2E suite expansion beyond smoke
- Preferences + Activity Monitor modules

## 8. Definition of Done (for each module)

A module is "done" when:

- It has a clear narrative role in the OS metaphor.
- It has meaningful content (not placeholder copy).
- It can be reached from both toolbar and dock (or justified otherwise).
- It has at least one testable behavior path.
- It links coherently to at least one other module.
