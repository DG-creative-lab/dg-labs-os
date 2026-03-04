import {
  closeDesktopWindow,
  focusDesktopApp,
  INITIAL_DESKTOP_OPEN_STATE,
  openDesktopWindow,
  toggleDesktopWindow,
  type DesktopAppId,
  type DesktopFocusedAppId,
  type DesktopOpenState,
} from './desktopWindowService';

export type DesktopShellState = {
  open: DesktopOpenState;
  focusedAppId: DesktopFocusedAppId;
};

export type DesktopShellAction =
  | { type: 'OPEN_WINDOW'; appId: DesktopAppId }
  | { type: 'TOGGLE_WINDOW'; appId: DesktopAppId }
  | { type: 'FOCUS_APP'; appId: DesktopFocusedAppId }
  | { type: 'CLOSE_WINDOW'; appId: DesktopAppId };

export const INITIAL_DESKTOP_SHELL_STATE: DesktopShellState = {
  open: INITIAL_DESKTOP_OPEN_STATE,
  focusedAppId: 'home',
};

export const desktopShellReducer = (
  state: DesktopShellState,
  action: DesktopShellAction
): DesktopShellState => {
  switch (action.type) {
    case 'OPEN_WINDOW':
      return {
        open: openDesktopWindow(state.open, action.appId),
        focusedAppId: action.appId,
      };
    case 'TOGGLE_WINDOW': {
      const next = toggleDesktopWindow(state.open, state.focusedAppId, action.appId);
      return { open: next.open, focusedAppId: next.focused };
    }
    case 'FOCUS_APP':
      if (action.appId === 'home') return { ...state, focusedAppId: 'home' };
      return { ...state, focusedAppId: focusDesktopApp(state.focusedAppId, action.appId) };
    case 'CLOSE_WINDOW': {
      const next = closeDesktopWindow(state.open, state.focusedAppId, action.appId);
      return { open: next.open, focusedAppId: next.focused };
    }
    default:
      return state;
  }
};
