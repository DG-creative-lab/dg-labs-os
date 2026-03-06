# DG-Labs OS Codebase Stabilization Plan

## Purpose

Track stabilization work that makes the codebase predictable and easy to evolve with AI coding agents.

## Snapshot (2026-03-04)

## Status

Stabilization objectives are now met. This document is retained as a completion log and should be treated as archived for active planning.

### Completed

- Quality gates are standardized and enforced:
  - `pnpm check` (lint + format + tests + typecheck)
  - CI runs quality + build on push/PR
- Focused scripts and test suites are in place for network/terminal/api/content/device/schema.
- API contract coverage exists for core endpoints (chat/contact/tools/verify).
- Desktop shell supports single-page multi-window behavior with focus-aware menubar.
- Terminal runtime has deterministic commands + LLM mode with retrieval-grounded citations.
- Service-layer extraction started and shipped for core paths:
  - `chatService` (route orchestration extracted from `/api/chat`)
  - `navigationService` + `desktopWindowService` for desktop open/toggle/focus logic
- Desktop interaction event bus is centralized in `desktopEvents`:
  - open/toggle/focus/state + dock links events
  - component wiring now uses shared dispatch/listener helpers
- Desktop shell state is reducer-driven via `desktopShellReducer`:
  - deterministic action handling for open/toggle/focus/close
  - integration-style reducer tests for event-sequence behavior
- Menubar action adapter extracted via `menubarActions`:
  - terminal/network/workbench/notes/resume menu intents mapped to typed events
  - menu-action dispatch behavior covered by unit tests
- Service-level behavior tests added:
  - `tests/navigationService.test.ts`
  - `tests/desktopWindowService.test.ts`
  - `tests/desktopEvents.test.ts`
  - `tests/desktopShellReducer.test.ts`
  - `tests/menubarActions.test.ts`
- Help system redesign shipped:
  - dedicated Help windows (User Guide, Terminal Command Guide, Navigation Tips, About DG-Labs OS)
  - no duplicate/dead app-link behavior in Help menu
- Playwright smoke layer shipped:
  - desktop shell + dock flows
  - menubar action flows (View, Window -> Contact, Help guide open/close)
  - mobile redirect and lock/home flow
- Typecheck baseline is clean (`astro check`: 0 errors, 0 warnings, 0 hints).

## Definition of “Stabilized”

This document can be archived when all conditions are true:

- `pnpm check` passes locally and in CI by default.
- Help system redesign is shipped (no duplicate/dead Help items).
- Desktop interaction tests exist for focus and event dispatch.
- Service layer exists for major side-effect paths (chat + navigation).
- Critical UX paths have behavior-level test coverage (unit/integration and/or smoke).

Current state: all conditions satisfied.

## Notes

- Active roadmap tracking now lives in `docs/APP_ROADMAP.md`.
