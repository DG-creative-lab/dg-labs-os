import type { DesktopAppId, DesktopFocusedAppId, DesktopOpenState } from './desktopWindowService';

export const DESKTOP_EVENTS = {
  OPEN_WINDOW: 'dg-desktop-open-window',
  TOGGLE_WINDOW: 'dg-desktop-toggle-window',
  APP_FOCUS: 'dg-app-focus',
  DESKTOP_STATE: 'dg-desktop-state',
  DOCK_OPEN_LINKS: 'dg-dock-open-links',
  DOCK_CLOSE_LINKS: 'dg-dock-close-links',
} as const;

type DesktopEventName = (typeof DESKTOP_EVENTS)[keyof typeof DESKTOP_EVENTS];

export type DesktopEventTarget = Pick<
  Window,
  'addEventListener' | 'removeEventListener' | 'dispatchEvent'
>;

export type DesktopWindowDetail = { appId?: DesktopAppId };
export type DesktopFocusDetail = { appId?: DesktopFocusedAppId };
export type DesktopStateDetail = {
  open?: Partial<DesktopOpenState>;
  focusedAppId?: DesktopFocusedAppId;
};

const dispatch = (target: DesktopEventTarget, type: DesktopEventName, detail?: object) => {
  target.dispatchEvent(new CustomEvent(type, detail ? { detail } : undefined));
};

export const dispatchDesktopOpenWindow = (target: DesktopEventTarget, appId: DesktopAppId) => {
  dispatch(target, DESKTOP_EVENTS.OPEN_WINDOW, { appId });
};

export const dispatchDesktopToggleWindow = (target: DesktopEventTarget, appId: DesktopAppId) => {
  dispatch(target, DESKTOP_EVENTS.TOGGLE_WINDOW, { appId });
};

export const dispatchDesktopAppFocus = (target: DesktopEventTarget, appId: DesktopFocusedAppId) => {
  dispatch(target, DESKTOP_EVENTS.APP_FOCUS, { appId });
};

export const dispatchDesktopState = (
  target: DesktopEventTarget,
  open: DesktopOpenState,
  focusedAppId: DesktopFocusedAppId
) => {
  dispatch(target, DESKTOP_EVENTS.DESKTOP_STATE, { open, focusedAppId });
};

export const dispatchDockOpenLinks = (target: DesktopEventTarget) => {
  dispatch(target, DESKTOP_EVENTS.DOCK_OPEN_LINKS);
};

export const dispatchDockCloseLinks = (target: DesktopEventTarget) => {
  dispatch(target, DESKTOP_EVENTS.DOCK_CLOSE_LINKS);
};

const listen = <TDetail>(
  target: DesktopEventTarget,
  type: DesktopEventName,
  handler: (detail: TDetail) => void
) => {
  const listener: EventListener = (event) => {
    const custom = event as CustomEvent<TDetail>;
    handler(custom.detail);
  };
  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
};

export const onDesktopOpenWindow = (
  target: DesktopEventTarget,
  handler: (detail: DesktopWindowDetail) => void
) => listen(target, DESKTOP_EVENTS.OPEN_WINDOW, handler);

export const onDesktopToggleWindow = (
  target: DesktopEventTarget,
  handler: (detail: DesktopWindowDetail) => void
) => listen(target, DESKTOP_EVENTS.TOGGLE_WINDOW, handler);

export const onDesktopAppFocus = (
  target: DesktopEventTarget,
  handler: (detail: DesktopFocusDetail) => void
) => listen(target, DESKTOP_EVENTS.APP_FOCUS, handler);

export const onDesktopState = (
  target: DesktopEventTarget,
  handler: (detail: DesktopStateDetail) => void
) => listen(target, DESKTOP_EVENTS.DESKTOP_STATE, handler);

export const onDockOpenLinks = (target: DesktopEventTarget, handler: () => void) => {
  const listener: EventListener = () => handler();
  target.addEventListener(DESKTOP_EVENTS.DOCK_OPEN_LINKS, listener);
  return () => target.removeEventListener(DESKTOP_EVENTS.DOCK_OPEN_LINKS, listener);
};

export const onDockCloseLinks = (target: DesktopEventTarget, handler: () => void) => {
  const listener: EventListener = () => handler();
  target.addEventListener(DESKTOP_EVENTS.DOCK_CLOSE_LINKS, listener);
  return () => target.removeEventListener(DESKTOP_EVENTS.DOCK_CLOSE_LINKS, listener);
};
