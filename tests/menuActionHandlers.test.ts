import { describe, expect, it, vi } from 'vitest';
import {
  handleNetworkMenuAction,
  handleNotesMenuAction,
  handleResumeMenuAction,
  handleTerminalMenuAction,
  handleWorkbenchMenuAction,
} from '../src/services/menuActionHandlers';

describe('menuActionHandlers', () => {
  it('routes network actions to state setters', () => {
    const setFilter = vi.fn();
    const setView = vi.fn();
    const setQuery = vi.fn();

    handleNetworkMenuAction(
      { action: 'set_filter', filter: 'Projects' },
      { setFilter, setView, setQuery }
    );
    handleNetworkMenuAction(
      { action: 'set_view', view: 'GRAPH' },
      { setFilter, setView, setQuery }
    );
    handleNetworkMenuAction(
      { action: 'apply_query', query: 'intent' },
      { setFilter, setView, setQuery }
    );
    handleNetworkMenuAction({ action: 'clear_search' }, { setFilter, setView, setQuery });

    expect(setFilter).toHaveBeenCalledWith('Projects');
    expect(setView).toHaveBeenCalledWith('GRAPH');
    expect(setQuery).toHaveBeenNthCalledWith(1, 'intent');
    expect(setQuery).toHaveBeenNthCalledWith(2, '');
  });

  it('routes notes/workbench actions', () => {
    const jumpToSection = vi.fn();
    const openNewsHub = vi.fn();
    const scrollTop = vi.fn();

    handleNotesMenuAction(
      { action: 'jump_section', sectionId: 'notes-principles' },
      { jumpToSection, openNewsHub, scrollTop }
    );
    handleNotesMenuAction({ action: 'open_news_hub' }, { jumpToSection, openNewsHub, scrollTop });
    handleNotesMenuAction({ action: 'scroll_top' }, { jumpToSection, openNewsHub, scrollTop });

    expect(jumpToSection).toHaveBeenCalledWith('notes-principles');
    expect(openNewsHub).toHaveBeenCalledTimes(1);
    expect(scrollTop).toHaveBeenCalledTimes(1);

    const wbJump = vi.fn();
    const wbScroll = vi.fn();
    handleWorkbenchMenuAction(
      { action: 'jump_section', sectionId: 'workbench-writing' },
      {
        jumpToSection: wbJump,
        scrollTop: wbScroll,
      }
    );
    handleWorkbenchMenuAction(
      { action: 'scroll_top' },
      { jumpToSection: wbJump, scrollTop: wbScroll }
    );
    expect(wbJump).toHaveBeenCalledWith('workbench-writing');
    expect(wbScroll).toHaveBeenCalledTimes(1);
  });

  it('routes resume/terminal actions', () => {
    const jumpToSection = vi.fn();
    const download = vi.fn();
    const scrollTop = vi.fn();
    handleResumeMenuAction(
      { action: 'jump_section', sectionId: 'resume-summary' },
      { jumpToSection, download, scrollTop }
    );
    handleResumeMenuAction(
      { action: 'download', format: 'pdf' },
      { jumpToSection, download, scrollTop }
    );
    handleResumeMenuAction({ action: 'scroll_top' }, { jumpToSection, download, scrollTop });
    expect(jumpToSection).toHaveBeenCalledWith('resume-summary');
    expect(download).toHaveBeenCalledWith('pdf');
    expect(scrollTop).toHaveBeenCalledTimes(1);

    const terminal = {
      clearOutput: vi.fn(),
      setMode: vi.fn(),
      toggleSources: vi.fn(),
      verifyProfile: vi.fn(),
      verifyProjects: vi.fn(),
    };
    handleTerminalMenuAction({ action: 'clear_output' }, terminal);
    handleTerminalMenuAction({ action: 'set_mode', mode: 'research' }, terminal);
    handleTerminalMenuAction({ action: 'toggle_sources' }, terminal);
    handleTerminalMenuAction({ action: 'verify_profile' }, terminal);
    handleTerminalMenuAction({ action: 'verify_projects' }, terminal);
    expect(terminal.clearOutput).toHaveBeenCalledTimes(1);
    expect(terminal.setMode).toHaveBeenCalledWith('research');
    expect(terminal.toggleSources).toHaveBeenCalledTimes(1);
    expect(terminal.verifyProfile).toHaveBeenCalledTimes(1);
    expect(terminal.verifyProjects).toHaveBeenCalledTimes(1);
  });
});
