import { describe, expect, it } from 'vitest';
import {
  emitNetworkMenuAction,
  emitNotesMenuAction,
  emitResumeMenuAction,
  emitTerminalMenuAction,
  emitWorkbenchMenuAction,
} from '../src/services/menubarActions';

const eventRecorder = () => {
  const events: CustomEvent[] = [];
  return {
    target: {
      dispatchEvent: (event: Event) => {
        events.push(event as CustomEvent);
        return true;
      },
    } as Pick<Window, 'dispatchEvent'>,
    events,
  };
};

describe('menubarActions', () => {
  it('emits terminal menu action', () => {
    const { target, events } = eventRecorder();
    emitTerminalMenuAction(target, 'set_mode', { mode: 'research' });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dg-terminal-menu-action');
    expect(events[0].detail).toMatchObject({ action: 'set_mode', mode: 'research' });
  });

  it('emits network menu action', () => {
    const { target, events } = eventRecorder();
    emitNetworkMenuAction(target, 'set_filter', { filter: 'Projects' });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dg-network-menu-action');
    expect(events[0].detail).toMatchObject({ action: 'set_filter', filter: 'Projects' });
  });

  it('emits workbench menu action', () => {
    const { target, events } = eventRecorder();
    emitWorkbenchMenuAction(target, 'jump_section', { sectionId: 'workbench-writing' });
    expect(events[0].type).toBe('dg-workbench-menu-action');
    expect(events[0].detail).toMatchObject({
      action: 'jump_section',
      sectionId: 'workbench-writing',
    });
  });

  it('emits notes menu action', () => {
    const { target, events } = eventRecorder();
    emitNotesMenuAction(target, 'open_news_hub');
    expect(events[0].type).toBe('dg-notes-menu-action');
    expect(events[0].detail).toMatchObject({ action: 'open_news_hub' });
  });

  it('emits resume menu action', () => {
    const { target, events } = eventRecorder();
    emitResumeMenuAction(target, 'download', { format: 'pdf' });
    expect(events[0].type).toBe('dg-resume-menu-action');
    expect(events[0].detail).toMatchObject({ action: 'download', format: 'pdf' });
  });
});
