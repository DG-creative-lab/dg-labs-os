import { describe, expect, it } from 'vitest';
import {
  dispatchDesktopAppFocus,
  dispatchDesktopOpenWindow,
  dispatchDesktopState,
  dispatchDesktopToggleWindow,
  dispatchDockCloseLinks,
  dispatchDockOpenLinks,
  onDesktopAppFocus,
  onDesktopOpenWindow,
  onDesktopState,
  onDesktopToggleWindow,
  onDockCloseLinks,
  onDockOpenLinks,
} from '../src/services/desktopEvents';
import { INITIAL_DESKTOP_OPEN_STATE } from '../src/services/desktopWindowService';

describe('desktopEvents', () => {
  it('dispatches and listens for open/toggle/focus events', () => {
    const target = new EventTarget();
    const open: string[] = [];
    const toggle: string[] = [];
    const focus: string[] = [];

    const offOpen = onDesktopOpenWindow(target as unknown as Window, ({ appId }) => {
      if (appId) open.push(appId);
    });
    const offToggle = onDesktopToggleWindow(target as unknown as Window, ({ appId }) => {
      if (appId) toggle.push(appId);
    });
    const offFocus = onDesktopAppFocus(target as unknown as Window, ({ appId }) => {
      if (appId) focus.push(appId);
    });

    dispatchDesktopOpenWindow(target as unknown as Window, 'network');
    dispatchDesktopToggleWindow(target as unknown as Window, 'notes');
    dispatchDesktopAppFocus(target as unknown as Window, 'terminal');

    expect(open).toEqual(['network']);
    expect(toggle).toEqual(['notes']);
    expect(focus).toEqual(['terminal']);

    offOpen();
    offToggle();
    offFocus();
  });

  it('dispatches desktop state with open map and focused app', () => {
    const target = new EventTarget();
    let focused = 'home';
    let networkOpen = false;

    const offState = onDesktopState(target as unknown as Window, ({ open, focusedAppId }) => {
      focused = focusedAppId ?? focused;
      networkOpen = Boolean(open?.network);
    });

    dispatchDesktopState(
      target as unknown as Window,
      { ...INITIAL_DESKTOP_OPEN_STATE, network: true },
      'network'
    );

    expect(focused).toBe('network');
    expect(networkOpen).toBe(true);
    offState();
  });

  it('dispatches and listens for dock links open/close events', () => {
    const target = new EventTarget();
    let opened = 0;
    let closed = 0;

    const offOpen = onDockOpenLinks(target as unknown as Window, () => {
      opened += 1;
    });
    const offClose = onDockCloseLinks(target as unknown as Window, () => {
      closed += 1;
    });

    dispatchDockOpenLinks(target as unknown as Window);
    dispatchDockCloseLinks(target as unknown as Window);

    expect(opened).toBe(1);
    expect(closed).toBe(1);

    offOpen();
    offClose();
  });
});
