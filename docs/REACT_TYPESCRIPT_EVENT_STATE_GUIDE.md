# React + TypeScript Event & State Management Guide

This guide is for learning. It explains the _why_ behind state and event management, then shows how those principles are applied in DG-Labs OS.

## 1) First Principles

### 1.1 UI as a Function of State

In React, rendered UI is a projection of current state.

- State changes
- React re-renders
- UI updates

If the UI can change, there must be a state variable (or derived value) that explains that change.

### 1.2 Single Source of Truth

For any behavior, keep one canonical owner of state.

Examples:

- `DesktopWorkspace` owns which desktop windows are open/focused.
- `MacToolbar` owns which dropdown menu is open.
- `NetworkApp` owns local filter/search/view mode.

When multiple places own the same truth, bugs appear (stale menus, mismatched focus, duplicated logic).

### 1.3 Events as Intent

An event should represent intent, not implementation.

- Good: `OPEN_WINDOW: projects`
- Bad: “find DOM node and set class + scroll + force focus”

Intent events let you change implementation later without changing every caller.

### 1.4 Reducers for Stateful Flows

When state transitions have rules, use a reducer.

- Current state + action -> next state
- Deterministic
- Easy to test
- Easy to reason about

That is why desktop shell behavior is in reducer/services rather than ad-hoc `useState` updates everywhere.

### 1.5 Side Effects Should Be Isolated

Pure state transitions should stay pure.

- Reducers: no `window.location`, no DOM mutations, no timers
- Side effects: in services/effects/handlers

This separation makes logic testable and avoids hidden coupling.

---

## 2) Mental Model Used in This App

The app uses a layered model:

1. **Intent layer** (menu clicks, dock clicks, keyboard-like actions)
2. **Event layer** (custom browser events for desktop shell communication)
3. **State layer** (reducer-managed desktop state)
4. **Reaction layer** (handlers that turn menu-event payloads into concrete local actions)
5. **UI layer** (React components render from current state)

Think of it as:

`User intent -> typed action/event -> reducer/handler -> state/effect -> render`

---

## 3) Where Each Layer Lives in DG-Labs OS

## 3.1 Core Desktop State (Reducer)

- [`src/services/desktopShellReducer.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/desktopShellReducer.ts)
- [`src/services/desktopWindowService.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/desktopWindowService.ts)

What this does:

- Defines window open/focus rules
- Handles `OPEN_WINDOW`, `TOGGLE_WINDOW`, `FOCUS_APP`, `CLOSE_WINDOW`
- Keeps transitions predictable

Why it matters:

- One canonical state machine for desktop windows
- Fewer race conditions between toolbar/dock/windows

## 3.2 Event Bus (Custom Events)

- [`src/services/desktopEvents.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/desktopEvents.ts)

What this does:

- Defines typed custom event names
- Wraps `dispatchEvent` + listener registration
- Carries intent payloads across components

Why it matters:

- Decouples sender from receiver
- Dock, toolbar, and workspace can evolve independently

## 3.3 Navigation + Open Behavior Services

- [`src/services/navigationService.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/navigationService.ts)
- [`src/services/appOpenHandlers.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/appOpenHandlers.ts)
- [`src/services/terminalGuideService.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/terminalGuideService.ts)

What this does:

- Normalizes route behavior (`/desktop` shell vs direct app pages)
- Opens windows in-shell or navigates when outside shell
- Centralizes “smart open + jump” behavior for section menus

Why it matters:

- Removes route/focus branching from UI components
- Prevents duplicated brittle logic

## 3.4 Menubar Intent & Reaction Split

- Intent emitters: [`src/services/menubarActions.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/menubarActions.ts)
- Reaction handlers: [`src/services/menuActionHandlers.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/services/menuActionHandlers.ts)

What this does:

- “Intent” functions emit semantic actions (`set_filter`, `download`, `verify_profile`, etc.)
- Handler functions interpret payload and call concrete state setters/effects

Why it matters:

- Clear boundary between _what user wants_ and _how component reacts_
- Easier unit + integration testing

## 3.5 UI Components as Thin Orchestrators

- Toolbar: [`src/components/global/MacToolbar.tsx`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/components/global/MacToolbar.tsx)
- Desktop shell: [`src/components/global/DesktopWorkspace.tsx`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/components/global/DesktopWorkspace.tsx)
- Window surface: [`src/components/global/DraggableWindow.tsx`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/src/components/global/DraggableWindow.tsx)
- App modules: `NetworkApp`, `ResumeApp`, `AgentsTerminal`

Best practice applied:

- Components mostly compose services/handlers
- Complex branching extracted into service modules
- UI remains readable

---

## 4) Why You Need This Architecture

Without explicit state/event architecture:

- Menu context gets stale after close/focus changes
- Route behavior diverges between desktop shell and direct app pages
- Same logic gets copied into toolbar/dock/components
- Testing becomes mostly manual

With this architecture:

- State transitions are explicit and testable
- Event-driven interactions are composable
- Adding features (new app, new menu action) is low-risk

---

## 5) Best Practices Checklist (Practical)

## 5.1 Use Reducers When

- You have multiple related state fields
- Actions have transition rules
- You need predictable transitions

## 5.2 Use Services When

- Logic is reused by multiple components
- Logic depends on route/environment
- Logic is mostly imperative (open, navigate, copy, emit, focus)

## 5.3 Keep Events Typed

- Event name constants
- Typed payload shapes
- Validate action payloads in handlers

## 5.4 Avoid Business Logic in JSX

- JSX should mostly render and wire handlers
- Extract if/else-heavy branching out to services

## 5.5 Test by Layer

- **Unit tests** for pure helpers/reducers/services
- **Integration-style tests** for intent -> event -> reaction
- Minimal DOM coupling for behavioral correctness

---

## 6) Testing Strategy Used Here

Representative test files:

- Reducer transitions:
  - [`tests/desktopShellReducer.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/desktopShellReducer.test.ts)
- Event bus contracts:
  - [`tests/desktopEvents.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/desktopEvents.test.ts)
- Menubar intent emitters:
  - [`tests/menubarActions.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/menubarActions.test.ts)
- Reaction handlers:
  - [`tests/menuActionHandlers.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/menuActionHandlers.test.ts)
- Intent->reaction integration:
  - [`tests/menuActionIntegration.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/menuActionIntegration.test.ts)
- Open/navigate routing logic:
  - [`tests/appOpenHandlers.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/appOpenHandlers.test.ts)
- Terminal help open behavior:
  - [`tests/terminalGuideService.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/terminalGuideService.test.ts)
- Clipboard fallback behavior:
  - [`tests/clipboardService.test.ts`](/Users/dessigeorgieva/Desktop/testing_websites/my-stuff/portfolio/tests/clipboardService.test.ts)

---

## 7) Common Pitfalls (and Fixes)

### Pitfall: Stale menu context after closing a window

Cause:

- Listening only to focus events, not full desktop state updates.

Fix:

- Listen to both app focus and desktop state signals in toolbar.

### Pitfall: Duplicate route-open logic in many places

Cause:

- Direct `window.location` checks in components.

Fix:

- Centralize with route-aware open services.

### Pitfall: “View” menu items that do nothing unless app is already open

Cause:

- Scroll/jump actions without open-or-navigate fallback.

Fix:

- “Smart open then jump” handlers (e.g. workbench sections).

---

## 8) Learning Path (What to Study Next)

1. React state fundamentals (`useState`, `useReducer`, lifting state)
2. Side-effects model (`useEffect`) and dependency correctness
3. Domain-driven UI service boundaries (pure vs impure code)
4. Event-driven architecture in frontend apps
5. Testing pyramid for frontend: unit/integration/e2e

Suggested sequence in this repo:

1. Read reducer + window service first
2. Read event bus second
3. Read toolbar service calls third
4. Read tests that map to each service
5. Then implement one new menu action end-to-end yourself

---

## 9) External References

Core React:

- React docs: [State: A Component’s Memory](https://react.dev/learn/state-a-components-memory)
- React docs: [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- React docs: [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)

TypeScript:

- TypeScript handbook: [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- TypeScript handbook: [Unions and Intersections](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)

Architecture & patterns:

- Redux style guide (applies broadly beyond Redux): [Redux Style Guide](https://redux.js.org/style-guide/)
- Martin Fowler: [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

Testing:

- Vitest docs: [Getting Started](https://vitest.dev/guide/)
- Testing Library guiding principles (for UI-level tests): [Guiding Principles](https://testing-library.com/docs/guiding-principles)

---

## 10) Practical Rule of Thumb

When adding a feature:

1. Define intent (`what user means`)
2. Define state transition (`what changes`)
3. Define side-effects (`what to trigger`)
4. Keep component thin
5. Add tests for both unit logic and integration path

If you follow this cycle, the app stays fast to change and hard to break.
