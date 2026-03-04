import type { DesktopAppId } from './desktopWindowService';
import {
  dispatchDesktopAppFocus as emitDesktopAppFocus,
  dispatchDesktopOpenWindow as emitDesktopOpenWindow,
  dispatchDesktopToggleWindow as emitDesktopToggleWindow,
  type DesktopEventTarget,
} from './desktopEvents';

export const normalizePath = (path: string): string => path.replace(/\/+$/, '') || '/';

export const isDesktopShellPath = (path: string): boolean => normalizePath(path) === '/desktop';

type NavigationAdapter = {
  location: { pathname: string; href: string };
} & DesktopEventTarget;

const defaultAdapter = (): NavigationAdapter => window as NavigationAdapter;

export const dispatchDesktopOpenWindow = (
  appId: DesktopAppId,
  adapter: NavigationAdapter = defaultAdapter()
) => {
  emitDesktopOpenWindow(adapter, appId);
};

export const dispatchDesktopToggleWindow = (
  appId: DesktopAppId,
  adapter: NavigationAdapter = defaultAdapter()
) => {
  emitDesktopToggleWindow(adapter, appId);
};

export const dispatchAppFocus = (
  appId: DesktopAppId | 'home',
  adapter: NavigationAdapter = defaultAdapter()
) => {
  emitDesktopAppFocus(adapter, appId);
};

export const openDesktopOrNavigate = (
  appId: DesktopAppId,
  href: string,
  adapter: NavigationAdapter = defaultAdapter()
) => {
  const path = normalizePath(adapter.location.pathname);
  const target = normalizePath(href);

  if (isDesktopShellPath(path)) {
    dispatchDesktopOpenWindow(appId, adapter);
    return;
  }

  if (path === target) {
    dispatchAppFocus(appId, adapter);
    return;
  }

  adapter.location.href = href;
};
