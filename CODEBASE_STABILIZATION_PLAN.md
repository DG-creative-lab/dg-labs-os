# DG-Labs OS Codebase Stabilization Plan

## Objective

Make the codebase stable, predictable, and easy for AI coding agents to modify safely:

- clear architectural boundaries
- deterministic local quality gates
- focused test commands
- explicit refactor backlog with priorities

## Current Snapshot (Audit)

### Strengths

- Good baseline quality tooling exists:
  - lint (`eslint`)
  - formatting (`prettier`)
  - unit tests (`vitest`)
  - typecheck (`astro check`)
  - CI workflow with quality + build
- Strong domain-oriented config modules already exist:
  - `src/config/workbench.ts`
  - `src/config/labNotes.ts`
  - `src/config/network.ts`
- Critical security improvement now present:
  - signed `HttpOnly` admin session cookie flow (`src/utils/adminAuth.ts`)

### Gaps

1. **Boundary clarity**

- Business logic appears in UI and API handlers together.
- Navigation and side-effects (`window.location.href`) are scattered through components.

2. **Test coverage breadth**

- Current tests cover utility logic, but not enough app behavior contracts.
- No component-level tests for terminal command output/rendering.
- No API contract tests for chat/contact/admin endpoints.

3. **Operational consistency**

- Scripts exist but are not grouped by concern (content/network/auth/terminal).
- Makefile can be more expressive for focused local workflows.

4. **Type safety debt**

- `any` usage remains in API parsing and some component catch blocks.
- Request payload validation is ad-hoc and duplicated.

## Target Architecture

## 1) Layers

- `src/config/*`: source-of-truth content and static domain data
- `src/utils/*`: pure logic (search, graph transforms, terminal parsing, auth token utils)
- `src/services/*` (next): side-effect orchestration (API clients, navigation, storage adapters)
- `src/pages/api/*`: thin request/response adapters + validation + service calls
- `src/components/*`: presentational + interaction orchestration only

## 2) Rules for AI-agent friendliness

- Keep domain logic pure and exported from `utils`/`services`.
- Keep components thin: call pure functions, render returned state.
- Keep API routes small: validate input -> call service -> normalize output.
- Add/extend tests in same PR as behavior changes.

## Stabilization Backlog (Prioritized)

## P0 (Immediate)

1. **Testing command matrix and Makefile orchestration**

- Add focused test scripts:
  - auth
  - network
  - terminal
  - content
  - full unit suite
- Mirror these in Make targets.

2. **API input parsing hardening**

- Replace `any` in `/api/chat`, `/api/contact`, `/api/admin/login` with narrow runtime parsing.

3. **Lock quality gates**

- Keep CI as mandatory quality gate:
  - lint + format + unit tests + typecheck + build

## P1 (Next)

1. **Extract service modules**

- `src/services/chatService.ts`
- `src/services/adminService.ts`
- `src/services/navigation.ts`

2. **Add API contract tests**

- happy/error paths for:
  - chat
  - contact
  - admin login/messages

3. **Terminal behavior tests (UI-level)**

- command history rendering
- clear/reset behavior
- local command vs action dispatch contract

## P2 (After)

1. **Component test harness**

- add React Testing Library for component-level behavior tests

2. **Schema validation layer**

- unify payload validation and error typing

3. **Observability hooks**

- structured error logs for API endpoints
- request-id propagation for debugging

## Unit Test Matrix (Current + Planned)

Current:

- `tests/adminAuth.test.ts`
- `tests/contentConfig.test.ts`
- `tests/deviceDetection.test.ts`
- `tests/networkGraph.test.ts`
- `tests/networkSearch.test.ts`
- `tests/terminalCommands.test.ts`

Planned additions:

- `tests/api/chat.contract.test.ts`
- `tests/api/contact.contract.test.ts`
- `tests/api/admin.contract.test.ts`
- `tests/terminal.ui.test.tsx`

## Definition of Stable (for this repo)

Stable means:

- `make check` passes locally and in CI.
- No `any` in API boundary parsing paths.
- Every changed utility/service has unit tests.
- Every endpoint has at least one success and one failure contract test.
- Critical UX modules (Terminal, Network) have behavior-level test coverage.

## Execution Notes

- Prefer incremental hardening over large rewrites.
- Preserve current product momentum (Terminal + Network + content mapping).
- Treat architecture changes as enabling work for faster, safer AI-assisted development.
