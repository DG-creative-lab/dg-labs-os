import { DESKTOP_APP_IDS, type DesktopAppId, type DesktopFocusedAppId } from './desktopAppRegistry';

export type { DesktopAppId, DesktopFocusedAppId } from './desktopAppRegistry';

export type DesktopOpenState = Record<DesktopAppId, boolean>;

export const INITIAL_DESKTOP_OPEN_STATE: DesktopOpenState = Object.fromEntries(
  DESKTOP_APP_IDS.map((id) => [id, false])
) as DesktopOpenState;

export const toggleDesktopWindow = (
  open: DesktopOpenState,
  focused: DesktopFocusedAppId,
  appId: DesktopAppId
): { open: DesktopOpenState; focused: DesktopFocusedAppId } => {
  const nextOpen = { ...open, [appId]: !open[appId] };
  const nextFocused = nextOpen[appId] ? appId : focused === appId ? 'home' : focused;
  return { open: nextOpen, focused: nextFocused };
};

export const openDesktopWindow = (
  open: DesktopOpenState,
  appId: DesktopAppId
): DesktopOpenState => ({
  ...open,
  [appId]: true,
});

export const closeDesktopWindow = (
  open: DesktopOpenState,
  focused: DesktopFocusedAppId,
  appId: DesktopAppId
): { open: DesktopOpenState; focused: DesktopFocusedAppId } => ({
  open: { ...open, [appId]: false },
  focused: focused === appId ? 'home' : focused,
});

export const focusDesktopApp = (
  focused: DesktopFocusedAppId,
  appId: DesktopAppId
): DesktopFocusedAppId => (focused === appId ? focused : appId);
