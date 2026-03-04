import { describe, expect, it, vi } from 'vitest';
import {
  APP_ROUTE_MAP,
  openAppFromMenu,
  openContactFromMenu,
} from '../src/services/appOpenHandlers';

const createAdapter = (pathname: string) => {
  const events: Event[] = [];
  return {
    adapter: {
      location: { pathname, href: pathname },
      dispatchEvent: (event: Event) => {
        events.push(event);
        return true;
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as Window,
    events,
  };
};

describe('appOpenHandlers', () => {
  it('maps app ids to canonical routes', () => {
    expect(APP_ROUTE_MAP.terminal).toBe('/apps/terminal');
    expect(APP_ROUTE_MAP.network).toBe('/apps/network');
    expect(APP_ROUTE_MAP.projects).toBe('/apps/projects');
    expect(APP_ROUTE_MAP.notes).toBe('/apps/notes');
    expect(APP_ROUTE_MAP.resume).toBe('/apps/resume');
    expect(APP_ROUTE_MAP.news).toBe('/apps/news');
  });

  it('opens app via desktop event when on /desktop', () => {
    const { adapter, events } = createAdapter('/desktop');
    openAppFromMenu('network', adapter);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dg-desktop-open-window');
  });

  it('navigates to target route when outside desktop shell', () => {
    const { adapter, events } = createAdapter('/apps/notes');
    openAppFromMenu('projects', adapter);
    expect(events).toHaveLength(0);
    expect(adapter.location.href).toBe('/apps/projects');
  });

  it('opens contact callback when provided', () => {
    const { adapter } = createAdapter('/desktop');
    const onOpenContact = vi.fn();
    openContactFromMenu({
      email: 'test@example.com',
      onOpenContact,
      adapter,
    });
    expect(onOpenContact).toHaveBeenCalledTimes(1);
  });

  it('opens dock links on desktop when callback not provided', () => {
    const { adapter, events } = createAdapter('/desktop');
    openContactFromMenu({
      email: 'test@example.com',
      adapter,
    });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dg-dock-open-links');
  });

  it('falls back to mailto outside desktop', () => {
    const { adapter, events } = createAdapter('/apps/network');
    openContactFromMenu({
      email: 'test@example.com',
      adapter,
    });
    expect(events).toHaveLength(0);
    expect(adapter.location.href).toBe('mailto:test@example.com');
  });
});
