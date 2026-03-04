import { describe, expect, it, vi } from 'vitest';
import {
  APP_ROUTE_MAP,
  openAppFromMenu,
  openContactFromMenu,
  openWorkbenchSectionFromMenu,
} from '../src/services/appOpenHandlers';

const createAdapter = (pathname: string) => {
  const events: Event[] = [];
  const timers: Array<{ handler: TimerHandler; timeout?: number }> = [];
  return {
    adapter: {
      location: { pathname, href: pathname },
      dispatchEvent: (event: Event) => {
        events.push(event);
        return true;
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      setTimeout: (handler: TimerHandler, timeout?: number) => {
        timers.push({ handler, timeout });
        return timers.length;
      },
    } as unknown as Window,
    events,
    timers,
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

  it('opens workbench and jumps to section on desktop', () => {
    const { adapter, events, timers } = createAdapter('/desktop');
    openWorkbenchSectionFromMenu('workbench-platforms', adapter, 120);

    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('dg-desktop-open-window');
    expect(events[1].type).toBe('dg-app-focus');
    expect(timers).toHaveLength(1);
    expect(timers[0].timeout).toBe(120);

    const cb = timers[0].handler;
    if (typeof cb === 'function') cb();
    expect(events).toHaveLength(3);
    expect(events[2].type).toBe('dg-workbench-menu-action');
  });

  it('jumps directly to workbench section on /apps/projects', () => {
    const { adapter, events, timers } = createAdapter('/apps/projects');
    openWorkbenchSectionFromMenu('workbench-writing', adapter);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dg-workbench-menu-action');
    expect(timers).toHaveLength(0);
  });

  it('navigates to section anchor when outside desktop and workbench route', () => {
    const { adapter, events, timers } = createAdapter('/apps/network');
    openWorkbenchSectionFromMenu('workbench-hackathons', adapter);
    expect(events).toHaveLength(0);
    expect(timers).toHaveLength(0);
    expect(adapter.location.href).toBe('/apps/projects#workbench-hackathons');
  });
});
