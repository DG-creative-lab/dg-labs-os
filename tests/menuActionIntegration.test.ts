import { describe, expect, it } from 'vitest';
import {
  emitNetworkMenuAction,
  emitResumeMenuAction,
  emitTerminalMenuAction,
} from '../src/services/menubarActions';
import {
  handleNetworkMenuAction,
  handleResumeMenuAction,
  handleTerminalMenuAction,
  type NetworkMenuEventDetail,
  type ResumeMenuEventDetail,
  type TerminalMenuEventDetail,
} from '../src/services/menuActionHandlers';

describe('menu action integration (intent -> reaction)', () => {
  it('updates network filter through emitted event + listener', () => {
    const target = new EventTarget();
    let filter: 'ALL' | 'Education' | 'Research' | 'Projects' | 'Experience' = 'ALL';

    const listener: EventListener = (event) => {
      const customEvent = event as CustomEvent<NetworkMenuEventDetail>;
      handleNetworkMenuAction(customEvent.detail, {
        setFilter: (next) => {
          filter = next;
        },
        setView: () => undefined,
        setQuery: () => undefined,
      });
    };

    target.addEventListener('dg-network-menu-action', listener);
    emitNetworkMenuAction(target as unknown as Window, 'set_filter', { filter: 'Projects' });
    target.removeEventListener('dg-network-menu-action', listener);

    expect(filter).toBe('Projects');
  });

  it('routes resume download intent through emitted event + listener', () => {
    const target = new EventTarget();
    let downloaded: 'pdf' | 'docx' | 'markdown' | null = null;

    const listener: EventListener = (event) => {
      const customEvent = event as CustomEvent<ResumeMenuEventDetail>;
      handleResumeMenuAction(customEvent.detail, {
        jumpToSection: () => undefined,
        download: (format) => {
          downloaded = format;
        },
        scrollTop: () => undefined,
      });
    };

    target.addEventListener('dg-resume-menu-action', listener);
    emitResumeMenuAction(target as unknown as Window, 'download', { format: 'docx' });
    target.removeEventListener('dg-resume-menu-action', listener);

    expect(downloaded).toBe('docx');
  });

  it('routes terminal mode switch through emitted event + listener', () => {
    const target = new EventTarget();
    let mode: 'concise' | 'explainer' | 'research' = 'explainer';

    const listener: EventListener = (event) => {
      const customEvent = event as CustomEvent<TerminalMenuEventDetail>;
      handleTerminalMenuAction(customEvent.detail, {
        clearOutput: () => undefined,
        setMode: (next) => {
          mode = next;
        },
        toggleSources: () => undefined,
        verifyProfile: () => undefined,
        verifyProjects: () => undefined,
      });
    };

    target.addEventListener('dg-terminal-menu-action', listener);
    emitTerminalMenuAction(target as unknown as Window, 'set_mode', { mode: 'concise' });
    target.removeEventListener('dg-terminal-menu-action', listener);

    expect(mode).toBe('concise');
  });
});
