export type TerminalMenuEventDetail = {
  action: 'clear_output' | 'set_mode' | 'toggle_sources' | 'verify_profile' | 'verify_projects';
  mode?: 'concise' | 'explainer' | 'research';
};

export type NetworkMenuEventDetail = {
  action: 'set_filter' | 'set_view' | 'clear_search' | 'apply_query';
  filter?: 'ALL' | 'Education' | 'Research' | 'Projects' | 'Experience';
  view?: 'LIST' | 'GRAPH';
  query?: string;
};

export type WorkbenchMenuEventDetail = {
  action?: 'jump_section' | 'scroll_top';
  sectionId?: string;
};

export type NotesMenuEventDetail = {
  action?: 'jump_section' | 'open_news_hub' | 'scroll_top';
  sectionId?: string;
};

export type ResumeMenuEventDetail = {
  action: 'jump_section' | 'download' | 'scroll_top';
  sectionId?: string;
  format?: 'pdf' | 'docx' | 'markdown';
};

export const handleNetworkMenuAction = (
  detail: NetworkMenuEventDetail,
  actions: {
    setFilter: (filter: 'ALL' | 'Education' | 'Research' | 'Projects' | 'Experience') => void;
    setView: (view: 'LIST' | 'GRAPH') => void;
    setQuery: (query: string) => void;
  }
) => {
  if (!detail?.action) return;
  if (detail.action === 'set_filter' && detail.filter) {
    actions.setFilter(detail.filter);
    return;
  }
  if (detail.action === 'set_view' && detail.view) {
    actions.setView(detail.view);
    return;
  }
  if (detail.action === 'clear_search') {
    actions.setQuery('');
    return;
  }
  if (detail.action === 'apply_query' && typeof detail.query === 'string') {
    actions.setQuery(detail.query);
  }
};

export const handleWorkbenchMenuAction = (
  detail: WorkbenchMenuEventDetail,
  actions: { jumpToSection: (sectionId: string) => void; scrollTop: () => void }
) => {
  if (!detail?.action) return;
  if (detail.action === 'jump_section' && typeof detail.sectionId === 'string') {
    actions.jumpToSection(detail.sectionId);
    return;
  }
  if (detail.action === 'scroll_top') actions.scrollTop();
};

export const handleNotesMenuAction = (
  detail: NotesMenuEventDetail,
  actions: {
    jumpToSection: (sectionId: string) => void;
    openNewsHub: () => void;
    scrollTop: () => void;
  }
) => {
  if (!detail?.action) return;
  if (detail.action === 'jump_section' && typeof detail.sectionId === 'string') {
    actions.jumpToSection(detail.sectionId);
    return;
  }
  if (detail.action === 'open_news_hub') {
    actions.openNewsHub();
    return;
  }
  if (detail.action === 'scroll_top') actions.scrollTop();
};

export const handleResumeMenuAction = (
  detail: ResumeMenuEventDetail,
  actions: {
    jumpToSection: (sectionId: string) => void;
    download: (format: 'pdf' | 'docx' | 'markdown') => void;
    scrollTop: () => void;
  }
) => {
  if (!detail?.action) return;
  if (detail.action === 'jump_section' && typeof detail.sectionId === 'string') {
    actions.jumpToSection(detail.sectionId);
    return;
  }
  if (detail.action === 'download' && detail.format) {
    actions.download(detail.format);
    return;
  }
  if (detail.action === 'scroll_top') actions.scrollTop();
};

export const handleTerminalMenuAction = (
  detail: TerminalMenuEventDetail,
  actions: {
    clearOutput: () => void;
    setMode: (mode: 'concise' | 'explainer' | 'research') => void;
    toggleSources: () => void;
    verifyProfile: () => void;
    verifyProjects: () => void;
  }
) => {
  if (!detail?.action) return;
  if (detail.action === 'clear_output') {
    actions.clearOutput();
    return;
  }
  if (detail.action === 'set_mode') {
    if (detail.mode === 'concise' || detail.mode === 'explainer' || detail.mode === 'research') {
      actions.setMode(detail.mode);
    }
    return;
  }
  if (detail.action === 'toggle_sources') {
    actions.toggleSources();
    return;
  }
  if (detail.action === 'verify_profile') {
    actions.verifyProfile();
    return;
  }
  if (detail.action === 'verify_projects') {
    actions.verifyProjects();
  }
};
