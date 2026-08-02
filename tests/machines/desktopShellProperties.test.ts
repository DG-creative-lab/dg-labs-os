import { describe, expect, it } from 'vitest';
import { DESKTOP_APP_IDS, type DesktopAppId } from '../../src/services/desktopAppRegistry';
import {
  desktopShellReducer,
  INITIAL_DESKTOP_SHELL_STATE,
  type DesktopShellAction,
  type DesktopShellState,
} from '../../src/services/desktopShellReducer';

const assertDesktopInvariant = (state: DesktopShellState) => {
  expect(Object.keys(state.open).sort()).toEqual([...DESKTOP_APP_IDS].sort());
  expect(['home', ...DESKTOP_APP_IDS]).toContain(state.focusedAppId);
};

const createSeededGenerator = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x1_0000_0000;
  };
};

const buildActionSequence = (seed: number, length: number): DesktopShellAction[] => {
  const random = createSeededGenerator(seed);
  const actions: DesktopShellAction[] = [];
  const kinds = ['OPEN_WINDOW', 'TOGGLE_WINDOW', 'FOCUS_APP', 'CLOSE_WINDOW'] as const;

  for (let index = 0; index < length; index += 1) {
    const type = kinds[Math.floor(random() * kinds.length)];
    const appId = DESKTOP_APP_IDS[Math.floor(random() * DESKTOP_APP_IDS.length)] as DesktopAppId;
    switch (type) {
      case 'OPEN_WINDOW':
        actions.push({ type: 'OPEN_WINDOW', appId });
        break;
      case 'TOGGLE_WINDOW':
        actions.push({ type: 'TOGGLE_WINDOW', appId });
        break;
      case 'FOCUS_APP':
        actions.push({ type: 'FOCUS_APP', appId });
        break;
      case 'CLOSE_WINDOW':
        actions.push({ type: 'CLOSE_WINDOW', appId });
        break;
    }
  }
  return actions;
};

const replay = (actions: readonly DesktopShellAction[]): DesktopShellState =>
  actions.reduce(desktopShellReducer, INITIAL_DESKTOP_SHELL_STATE);

describe('desktop shell machine properties', () => {
  it('preserves focus and open-state invariants across generated action sequences', () => {
    for (let seed = 1; seed <= 64; seed += 1) {
      let state = INITIAL_DESKTOP_SHELL_STATE;
      for (const action of buildActionSequence(seed, 48)) {
        state = desktopShellReducer(state, action);
        assertDesktopInvariant(state);
      }
    }
  });

  it('replays the same input sequence deterministically', () => {
    for (let seed = 100; seed < 120; seed += 1) {
      const actions = buildActionSequence(seed, 64);
      expect(replay(actions)).toEqual(replay(actions));
    }
  });

  it('returns focus home when the focused application closes', () => {
    for (const appId of DESKTOP_APP_IDS) {
      const opened = desktopShellReducer(INITIAL_DESKTOP_SHELL_STATE, {
        type: 'OPEN_WINDOW',
        appId,
      });
      const closed = desktopShellReducer(opened, { type: 'CLOSE_WINDOW', appId });
      expect(closed.focusedAppId).toBe('home');
      expect(closed.open[appId]).toBe(false);
    }
  });

  it('keeps logical application focus independent of window visibility', () => {
    for (const appId of DESKTOP_APP_IDS) {
      const next = desktopShellReducer(INITIAL_DESKTOP_SHELL_STATE, {
        type: 'FOCUS_APP',
        appId,
      });
      expect(next.focusedAppId).toBe(appId);
      expect(next.open[appId]).toBe(false);
    }
  });
});
