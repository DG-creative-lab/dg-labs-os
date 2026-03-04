export type DesktopAppId = 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news';

export type DesktopFocusedAppId = DesktopAppId | 'home';

export type DesktopOpenState = Record<DesktopAppId, boolean>;

export const INITIAL_DESKTOP_OPEN_STATE: DesktopOpenState = {
  terminal: false,
  network: false,
  projects: false,
  notes: false,
  resume: false,
  news: false,
};

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
