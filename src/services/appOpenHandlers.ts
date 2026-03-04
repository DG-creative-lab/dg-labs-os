import { dispatchDockOpenLinks, type DesktopEventTarget } from './desktopEvents';
import { normalizePath, openDesktopOrNavigate } from './navigationService';
import type { DesktopAppId } from './desktopWindowService';

export const APP_ROUTE_MAP: Record<DesktopAppId, string> = {
  terminal: '/apps/terminal',
  network: '/apps/network',
  projects: '/apps/projects',
  notes: '/apps/notes',
  resume: '/apps/resume',
  news: '/apps/news',
};

export type AppOpenAdapter = {
  location: { pathname: string; href: string };
} & DesktopEventTarget;

const defaultAdapter = (): AppOpenAdapter => window as AppOpenAdapter;

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
