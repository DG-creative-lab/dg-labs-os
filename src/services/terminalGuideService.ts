import { emitTerminalMenuAction } from './menubarActions';
import { dispatchAppFocus, dispatchDesktopOpenWindow, normalizePath } from './navigationService';
import type { DesktopEventTarget } from './desktopEvents';

export type TerminalGuideAdapter = {
  location: { pathname: string; href: string };
  dispatchEvent: (event: Event) => boolean;
  setTimeout: (handler: TimerHandler, timeout?: number) => number;
} & DesktopEventTarget;

const defaultAdapter = (): TerminalGuideAdapter => ({
  location: window.location,
  dispatchEvent: window.dispatchEvent.bind(window),
  addEventListener: window.addEventListener.bind(window),
  removeEventListener: window.removeEventListener.bind(window),
  setTimeout: window.setTimeout.bind(window),
});

export const openTerminalGuideFromMenu = (
  adapter: TerminalGuideAdapter = defaultAdapter(),
  delayMs = 120
) => {
  const path = normalizePath(adapter.location.pathname);

  if (path === '/desktop') {
    dispatchDesktopOpenWindow('terminal', adapter);
    dispatchAppFocus('terminal', adapter);
    adapter.setTimeout(() => {
      emitTerminalMenuAction(adapter, 'set_mode', { mode: 'explainer' });
    }, delayMs);
    return;
  }

  if (path === '/apps/terminal') {
    emitTerminalMenuAction(adapter, 'set_mode', { mode: 'explainer' });
    return;
  }

  adapter.location.href = '/apps/terminal';
};
