type DispatchTarget = Pick<Window, 'dispatchEvent'>;

type TerminalAction =
  | 'clear_output'
  | 'set_mode'
  | 'toggle_sources'
  | 'verify_profile'
  | 'verify_projects';
type NetworkAction = 'set_filter' | 'set_view' | 'clear_search' | 'apply_query';
type WorkbenchAction = 'jump_section' | 'scroll_top';
type NotesAction = 'jump_section' | 'open_news_hub' | 'scroll_top';
type ResumeAction = 'jump_section' | 'download' | 'scroll_top';

const emit = (target: DispatchTarget, type: string, detail: Record<string, unknown>) => {
  target.dispatchEvent(
    new CustomEvent(type, {
      detail,
    })
  );
};

export const emitTerminalMenuAction = (
  target: DispatchTarget,
  action: TerminalAction,
  payload?: Record<string, unknown>
) => {
  emit(target, 'dg-terminal-menu-action', { action, ...(payload ?? {}) });
};

export const emitNetworkMenuAction = (
  target: DispatchTarget,
  action: NetworkAction,
  payload?: Record<string, unknown>
) => {
  emit(target, 'dg-network-menu-action', { action, ...(payload ?? {}) });
};

export const emitWorkbenchMenuAction = (
  target: DispatchTarget,
  action: WorkbenchAction,
  payload?: Record<string, unknown>
) => {
  emit(target, 'dg-workbench-menu-action', { action, ...(payload ?? {}) });
};

export const emitNotesMenuAction = (
  target: DispatchTarget,
  action: NotesAction,
  payload?: Record<string, unknown>
) => {
  emit(target, 'dg-notes-menu-action', { action, ...(payload ?? {}) });
};

export const emitResumeMenuAction = (
  target: DispatchTarget,
  action: ResumeAction,
  payload?: Record<string, unknown>
) => {
  emit(target, 'dg-resume-menu-action', { action, ...(payload ?? {}) });
};
