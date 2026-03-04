# DG-Labs OS Codebase Stabilization Plan

## Purpose

Track stabilization work that makes the codebase predictable and easy to evolve with AI coding agents.

## Snapshot (2026-03-03)

### Completed

- Quality gates are standardized and enforced:
  - `pnpm check` (lint + format + tests + typecheck)
  - CI runs quality + build on push/PR
- Focused scripts and test suites are in place for network/terminal/api/content/device/schema.
- API contract coverage exists for core endpoints (chat/contact/tools/verify).
- Desktop shell supports single-page multi-window behavior with focus-aware menubar.
- Terminal runtime has deterministic commands + LLM mode with retrieval-grounded citations.

### In Progress

- Help system redesign:
  - replace duplicated Help links with dedicated instruction windows.

### Remaining Stabilization Work

1. Desktop interaction test harness

- Add behavior tests for window focus and menubar action dispatch.
- Add tests for shell events:
  - `dg-desktop-open-window`
  - `dg-desktop-toggle-window`
  - `dg-app-focus`
  - `dg-dock-open-links`

2. Service-layer extraction

- Introduce `src/services/*` for side-effect orchestration:
  - `chatService`
  - `navigationService`
- Keep API routes thin: parse -> validate -> service -> normalized response.

3. Component behavior test coverage

- Add UI-level tests for:
  - terminal interaction flows
  - dock/menu behaviors
  - draggable window lifecycle (open/focus/close)

4. Type-safety tightening

- Continue removing boundary `any` usage.
- Centralize request schema validation where duplicated.

5. Optional E2E smoke layer

- Add Playwright smoke checks for:
  - desktop shell navigation
  - mobile lock -> home flow
  - key toolbar actions

## Definition of “Stabilized”

This document can be archived when all conditions are true:

- `pnpm check` passes locally and in CI by default.
- Help system redesign is shipped (no duplicate/dead Help items).
- Desktop interaction tests exist for focus and event dispatch.
- Service layer exists for major side-effect paths (chat + navigation).
- Critical UX paths have behavior-level test coverage (unit/integration and/or smoke).

## Notes

- Keep this file as a short operational checklist.
- When “Stabilized” is reached, merge remaining evergreen items into `docs/APP_ROADMAP.md` and archive this file.
