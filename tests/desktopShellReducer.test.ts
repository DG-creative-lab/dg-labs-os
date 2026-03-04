import { describe, expect, it } from 'vitest';
import {
  desktopShellReducer,
  INITIAL_DESKTOP_SHELL_STATE,
} from '../src/services/desktopShellReducer';

describe('desktopShellReducer', () => {
  it('opens window and focuses app', () => {
    const next = desktopShellReducer(INITIAL_DESKTOP_SHELL_STATE, {
      type: 'OPEN_WINDOW',
      appId: 'network',
    });
    expect(next.open.network).toBe(true);
    expect(next.focusedAppId).toBe('network');
  });

  it('toggles window twice and returns focus to home', () => {
    const opened = desktopShellReducer(INITIAL_DESKTOP_SHELL_STATE, {
      type: 'TOGGLE_WINDOW',
      appId: 'terminal',
    });
    const closed = desktopShellReducer(opened, {
      type: 'TOGGLE_WINDOW',
      appId: 'terminal',
    });
    expect(closed.open.terminal).toBe(false);
    expect(closed.focusedAppId).toBe('home');
  });

  it('focus action updates active app', () => {
    const next = desktopShellReducer(INITIAL_DESKTOP_SHELL_STATE, {
      type: 'FOCUS_APP',
      appId: 'projects',
    });
    expect(next.focusedAppId).toBe('projects');
  });

  it('close window keeps focus if another app is active', () => {
    const opened = desktopShellReducer(INITIAL_DESKTOP_SHELL_STATE, {
      type: 'OPEN_WINDOW',
      appId: 'notes',
    });
    const focused = desktopShellReducer(opened, {
      type: 'FOCUS_APP',
      appId: 'network',
    });
    const closed = desktopShellReducer(focused, {
      type: 'CLOSE_WINDOW',
      appId: 'notes',
    });
    expect(closed.open.notes).toBe(false);
    expect(closed.focusedAppId).toBe('network');
  });
});
