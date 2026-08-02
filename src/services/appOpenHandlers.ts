import { dispatchDockOpenLinks, type DesktopEventTarget } from './desktopEvents';
import {
  dispatchAppFocus,
  dispatchDesktopOpenWindow,
  normalizePath,
  openDesktopOrNavigate,
} from './navigationService';
import { emitWorkbenchMenuAction } from './menubarActions';
import type { DesktopAppId } from './desktopWindowService';
import { DESKTOP_APP_ROUTES } from './desktopAppRegistry';
import {
  getPublicProfileModulePath,
  isPublicProfileModuleId,
  matchPublicProfilePathShape,
} from '../utils/profileRoutes';

export const APP_ROUTE_MAP: Record<DesktopAppId, string> = DESKTOP_APP_ROUTES;

export type AppOpenAdapter = {
  location: { pathname: string; href: string };
} & DesktopEventTarget;

export type AppSectionAdapter = AppOpenAdapter & {
  setTimeout: (handler: TimerHandler, timeout?: number) => number;
};

const defaultAdapter = (): AppOpenAdapter => window as AppOpenAdapter;
const defaultSectionAdapter = (): AppSectionAdapter => window as AppSectionAdapter;

export const openAppFromMenu = (
  appId: DesktopAppId,
  adapter: AppOpenAdapter = defaultAdapter()
) => {
  openDesktopOrNavigate(appId, APP_ROUTE_MAP[appId], adapter);
};

export const openContactFromMenu = ({
  email,
  onOpenContact,
  adapter = defaultAdapter(),
}: {
  email: string;
  onOpenContact?: () => void;
  adapter?: AppOpenAdapter;
}) => {
  if (onOpenContact) {
    onOpenContact();
    return;
  }

  const path = normalizePath(adapter.location.pathname);
  if (path === '/desktop') {
    dispatchDockOpenLinks(adapter);
    return;
  }

  adapter.location.href = `mailto:${email}`;
};

export const openWorkbenchSectionFromMenu = (
  sectionId: string,
  adapter: AppSectionAdapter = defaultSectionAdapter(),
  delayMs = 120
) => {
  const path = normalizePath(adapter.location.pathname);

  if (path === '/desktop') {
    dispatchDesktopOpenWindow('projects', adapter);
    dispatchAppFocus('projects', adapter);
    adapter.setTimeout(() => {
      emitWorkbenchMenuAction(adapter, 'jump_section', { sectionId });
    }, delayMs);
    return;
  }

  if (path === '/apps/projects') {
    emitWorkbenchMenuAction(adapter, 'jump_section', { sectionId });
    return;
  }

  const profileRoute = matchPublicProfilePathShape(path);
  if (profileRoute?.moduleId === 'workbench') {
    emitWorkbenchMenuAction(adapter, 'jump_section', { sectionId });
    return;
  }

  if (profileRoute?.moduleId && isPublicProfileModuleId(profileRoute.moduleId)) {
    adapter.location.href = `${getPublicProfileModulePath(profileRoute.handle, 'workbench')}#${sectionId}`;
    return;
  }

  adapter.location.href = `/apps/projects#${sectionId}`;
};

export const getAppCloseDestination = (pathname: string): string => {
  const profileRoute = matchPublicProfilePathShape(normalizePath(pathname));
  if (profileRoute?.moduleId && isPublicProfileModuleId(profileRoute.moduleId)) {
    return `/@${profileRoute.handle}`;
  }

  return '/desktop';
};
