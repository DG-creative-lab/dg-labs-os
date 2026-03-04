import { describe, expect, it } from 'vitest';
import {
  dispatchAppFocus,
  dispatchDesktopOpenWindow,
  isDesktopShellPath,
  normalizePath,
  openDesktopOrNavigate,
} from '../src/services/navigationService';

describe('navigationService', () => {
  const adapter = (pathname: string) => {
    const events: Event[] = [];
    const listeners = new Map<string, Set<EventListener>>();
    return {
      windowLike: {
        location: { pathname, href: pathname },
        dispatchEvent: (event: Event) => {
          events.push(event);
          const set = listeners.get(event.type);
          set?.forEach((listener) => listener(event));
          return true;
        },
        addEventListener: (type: string, listener: EventListenerOrEventListenerObject | null) => {
          if (!listener) return;
          const fn =
            typeof listener === 'function'
              ? listener
              : (event: Event) => listener.handleEvent(event);
          const set = listeners.get(type) ?? new Set<EventListener>();
          set.add(fn);
          listeners.set(type, set);
        },
        removeEventListener: (
          type: string,
          listener: EventListenerOrEventListenerObject | null
        ) => {
          if (!listener) return;
          const fn =
            typeof listener === 'function'
              ? listener
              : (event: Event) => listener.handleEvent(event);
          listeners.get(type)?.delete(fn);
        },
      },
      events,
    };
  };

  it('normalizes trailing slashes', () => {
    expect(normalizePath('/apps/network/')).toBe('/apps/network');
    expect(normalizePath('/')).toBe('/');
  });

  it('detects desktop shell path', () => {
    expect(isDesktopShellPath('/desktop')).toBe(true);
    expect(isDesktopShellPath('/apps/network')).toBe(false);
  });

  it('dispatches desktop open event on desktop path', () => {
    const ctx = adapter('/desktop');
    openDesktopOrNavigate('network', '/apps/network', ctx.windowLike);
    expect(ctx.events).toHaveLength(1);
    expect(ctx.events[0].type).toBe('dg-desktop-open-window');
  });

  it('dispatches focus event when already on target route', () => {
    const ctx = adapter('/apps/notes');
    openDesktopOrNavigate('notes', '/apps/notes', ctx.windowLike);
    expect(ctx.events).toHaveLength(1);
    expect(ctx.events[0].type).toBe('dg-app-focus');
  });

  it('navigates when not desktop and target is different', () => {
    const ctx = adapter('/apps/network');
    openDesktopOrNavigate('notes', '/apps/notes', ctx.windowLike);
    expect(ctx.events).toHaveLength(0);
    expect(ctx.windowLike.location.href).toBe('/apps/notes');
  });

  it('exposes explicit focus/open dispatch helpers', () => {
    const ctx = adapter('/desktop');

    dispatchDesktopOpenWindow('terminal', ctx.windowLike);
    dispatchAppFocus('terminal', ctx.windowLike);

    expect(ctx.events).toHaveLength(2);
    expect(ctx.events[0].type).toBe('dg-desktop-open-window');
    expect(ctx.events[1].type).toBe('dg-app-focus');
  });
});
