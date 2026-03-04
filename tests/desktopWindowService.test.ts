import { describe, expect, it } from 'vitest';
import {
  closeDesktopWindow,
  focusDesktopApp,
  INITIAL_DESKTOP_OPEN_STATE,
  openDesktopWindow,
  toggleDesktopWindow,
} from '../src/services/desktopWindowService';

describe('desktopWindowService', () => {
  it('toggles a closed window open and focuses it', () => {
    const state = toggleDesktopWindow(INITIAL_DESKTOP_OPEN_STATE, 'home', 'network');
    expect(state.open.network).toBe(true);
    expect(state.focused).toBe('network');
  });

  it('toggles an open focused window closed and returns focus to home', () => {
    const opened = openDesktopWindow(INITIAL_DESKTOP_OPEN_STATE, 'terminal');
    const state = toggleDesktopWindow(opened, 'terminal', 'terminal');
    expect(state.open.terminal).toBe(false);
    expect(state.focused).toBe('home');
  });

  it('close keeps focus when another app is focused', () => {
    const opened = openDesktopWindow(INITIAL_DESKTOP_OPEN_STATE, 'projects');
    const state = closeDesktopWindow(opened, 'network', 'projects');
    expect(state.open.projects).toBe(false);
    expect(state.focused).toBe('network');
  });

  it('focus updates focused app', () => {
    expect(focusDesktopApp('home', 'resume')).toBe('resume');
  });
});
