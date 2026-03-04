import { describe, expect, it } from 'vitest';
import { openTerminalGuideFromMenu } from '../src/services/terminalGuideService';

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

describe('terminalGuideService', () => {
  it('on /desktop opens terminal, focuses it, then sets explainer mode', () => {
    const ctx = createAdapter('/desktop');
    openTerminalGuideFromMenu(ctx.adapter, 120);

    expect(ctx.events).toHaveLength(2);
    expect(ctx.events[0].type).toBe('dg-desktop-open-window');
    expect(ctx.events[1].type).toBe('dg-app-focus');
    expect(ctx.timers).toHaveLength(1);
    expect(ctx.timers[0].timeout).toBe(120);

    const cb = ctx.timers[0].handler;
    if (typeof cb === 'function') cb();
    expect(ctx.events).toHaveLength(3);
    expect(ctx.events[2].type).toBe('dg-terminal-menu-action');
  });

  it('on /apps/terminal only emits terminal menu action', () => {
    const ctx = createAdapter('/apps/terminal');
    openTerminalGuideFromMenu(ctx.adapter);
    expect(ctx.events).toHaveLength(1);
    expect(ctx.events[0].type).toBe('dg-terminal-menu-action');
    expect(ctx.timers).toHaveLength(0);
  });

  it('on other routes navigates to /apps/terminal', () => {
    const ctx = createAdapter('/apps/network');
    openTerminalGuideFromMenu(ctx.adapter);
    expect(ctx.events).toHaveLength(0);
    expect(ctx.timers).toHaveLength(0);
    expect(ctx.adapter.location.href).toBe('/apps/terminal');
  });
});
