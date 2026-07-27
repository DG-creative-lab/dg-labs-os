import type React from 'react';
import { FaEnvelope, FaGithub, FaLinkedin, FaWindowRestore } from 'react-icons/fa';
import { IoCodeSlash, IoDocumentText, IoHelpCircle, IoMail } from 'react-icons/io5';
import { userConfig } from '../config';
import {
  openAppFromMenu,
  openContactFromMenu,
  openWorkbenchSectionFromMenu,
} from './appOpenHandlers';
import {
  emitNetworkMenuAction,
  emitNotesMenuAction,
  emitResumeMenuAction,
  emitTerminalMenuAction,
  emitWorkbenchMenuAction,
} from './menubarActions';
import { openTerminalGuideFromMenu } from './terminalGuideService';

export type ToolbarAppId =
  | 'home'
  | 'terminal'
  | 'network'
  | 'projects'
  | 'notes'
  | 'evolution'
  | 'resume'
  | 'news';

export type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  submenu?: MenuItem[];
};

export type MenuName = 'Apple' | 'File' | 'Edit' | 'View' | 'Go' | 'Window' | 'Help';

export type MenuSet = Record<MenuName, MenuItem[]>;

export type DesktopMenuModel = {
  appMenuLabelMap: Record<ToolbarAppId, string>;
  appMenuItemsMap: Record<ToolbarAppId, MenuItem[]>;
  menus: MenuSet;
  menuOrder: Array<Exclude<MenuName, 'Apple'>>;
};

type DesktopMenuModelOptions = {
  resolvedAppId: ToolbarAppId;
  onOpenContact?: () => void;
  onOpenAbout: () => void;
  onOpenHelp: (topic: 'user-guide' | 'terminal-guide' | 'navigation-tips' | 'about-os') => void;
  onCloseApp: (appId: Exclude<ToolbarAppId, 'home'>) => void;
  onCopyText: (text: string, label: string) => void;
};

const contactAction = (onOpenContact?: () => void) => () => {
  openContactFromMenu({
    email: userConfig.contact.email,
    onOpenContact,
  });
};

export const buildDesktopMenuModel = ({
  resolvedAppId,
  onOpenContact,
  onOpenAbout,
  onOpenHelp,
  onCloseApp,
  onCopyText,
}: DesktopMenuModelOptions): DesktopMenuModel => {
  const commonMenus: MenuSet = {
    Apple: [
      {
        label: 'About DG-Labs Pro',
        icon: <FaWindowRestore size={16} />,
        action: onOpenAbout,
      },
      {
        label: 'Technical Writing...',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('notes'),
      },
    ],
    File: [
      {
        label: 'Resume',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('resume'),
      },
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('projects'),
      },
    ],
    Edit: [
      {
        label: 'Copy Quick Intro',
        icon: <IoDocumentText size={16} />,
        action: () =>
          onCopyText(
            `${userConfig.ownerName} builds AI systems, agent infrastructure, and product interfaces that make complex automation inspectable and useful. DG-Labs OS connects the systems, professional writing, and evidence behind that work.`,
            'Quick intro'
          ),
      },
      {
        label: 'Copy Public Footprint',
        icon: <IoMail size={16} />,
        action: () => {
          const footprint = [
            `LinkedIn: ${userConfig.social.linkedin}`,
            `GitHub: ${userConfig.social.github}`,
            'AI Knowledge Hub: https://github.com/ai-knowledge-hub',
            'AI News Hub: https://ai-news-hub.performics-labs.com/',
            'AI Skills Platform: https://skills.ai-knowledge-hub.org/',
            `Email: ${userConfig.contact.email}`,
          ].join('\n');
          onCopyText(footprint, 'Public footprint');
        },
      },
      {
        label: 'Copy Current View Link',
        icon: <IoCodeSlash size={16} />,
        action: () => onCopyText(window.location.href, 'Current view link'),
      },
    ],
    View: [
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('projects'),
      },
      {
        label: 'Technical Writing',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('notes'),
      },
      {
        label: 'Terminal',
        icon: <IoHelpCircle size={16} />,
        action: () => openAppFromMenu('terminal'),
      },
    ],
    Go: [
      {
        label: 'GitHub',
        icon: <FaGithub size={16} />,
        action: () => window.open(userConfig.social.github, '_blank'),
      },
      {
        label: 'LinkedIn',
        icon: <FaLinkedin size={16} />,
        action: () => window.open(userConfig.social.linkedin, '_blank'),
      },
      {
        label: 'Performics Labs Archive',
        icon: <IoDocumentText size={16} />,
        action: () => window.open('https://ai-news-hub.performics-labs.com/analysis', '_blank'),
      },
      {
        label: 'Email',
        icon: <FaEnvelope size={16} />,
        action: () => {
          window.location.href = `mailto:${userConfig.contact.email}`;
        },
      },
    ],
    Window: [
      {
        label: 'Contact...',
        icon: <IoMail size={16} />,
        action: contactAction(onOpenContact),
      },
    ],
    Help: [
      {
        label: 'Search Help in Agents...',
        icon: <IoHelpCircle size={16} />,
        action: () => openTerminalGuideFromMenu(),
      },
      {
        label: 'DG-Labs User Guide',
        icon: <IoDocumentText size={16} />,
        action: () => onOpenHelp('user-guide'),
      },
      {
        label: 'Terminal Command Guide',
        icon: <IoHelpCircle size={16} />,
        action: () => onOpenHelp('terminal-guide'),
      },
      {
        label: 'Navigation Tips',
        icon: <IoDocumentText size={16} />,
        action: () => onOpenHelp('navigation-tips'),
      },
      {
        label: 'About DG-Labs OS',
        icon: <IoHelpCircle size={16} />,
        action: () => onOpenHelp('about-os'),
      },
    ],
  };

  const homeMenus: MenuSet = {
    ...commonMenus,
    View: [
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('projects'),
      },
      {
        label: 'System Map',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('network'),
      },
      {
        label: 'Technical Writing',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('notes'),
      },
      {
        label: 'Terminal',
        icon: <IoHelpCircle size={16} />,
        action: () => openAppFromMenu('terminal'),
      },
    ],
    Window: [
      { label: 'Contact...', icon: <IoMail size={16} />, action: contactAction(onOpenContact) },
      {
        label: 'Open Resume',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('resume'),
      },
    ],
    Help: [
      {
        label: 'DG-Labs User Guide',
        icon: <IoDocumentText size={16} />,
        action: () => onOpenHelp('user-guide'),
      },
      {
        label: 'Navigation Tips',
        icon: <IoDocumentText size={16} />,
        action: () => onOpenHelp('navigation-tips'),
      },
      {
        label: 'Search Help in Agents...',
        icon: <IoHelpCircle size={16} />,
        action: () => openTerminalGuideFromMenu(),
      },
      {
        label: 'About DG-Labs OS',
        icon: <IoHelpCircle size={16} />,
        action: () => onOpenHelp('about-os'),
      },
    ],
  };

  const terminalMenus: MenuSet = {
    ...commonMenus,
    View: [
      {
        label: 'Set Mode: Concise',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalMenuAction(window, 'set_mode', { mode: 'concise' }),
      },
      {
        label: 'Set Mode: Explainer',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalMenuAction(window, 'set_mode', { mode: 'explainer' }),
      },
      {
        label: 'Set Mode: Research',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalMenuAction(window, 'set_mode', { mode: 'research' }),
      },
      {
        label: 'Toggle Sources Footer',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalMenuAction(window, 'toggle_sources'),
      },
    ],
    Window: [
      {
        label: 'Clear Output',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalMenuAction(window, 'clear_output'),
      },
      {
        label: 'Verify LinkedIn Profile',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalMenuAction(window, 'verify_profile'),
      },
      {
        label: 'Verify Project Footprint',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalMenuAction(window, 'verify_projects'),
      },
    ],
    Help: [
      ...commonMenus.Help,
      {
        label: 'Terminal Help',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalMenuAction(window, 'set_mode', { mode: 'explainer' }),
      },
    ],
  };

  const networkMenus: MenuSet = {
    ...commonMenus,
    View: [
      {
        label: 'Index Mode',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_view', { view: 'INDEX' }),
      },
      {
        label: 'Map Mode',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_view', { view: 'MAP' }),
      },
      {
        label: 'Clear Search',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'clear_search'),
      },
    ],
    Window: [
      {
        label: 'Filter: All',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'ALL' }),
      },
      {
        label: 'Filter: Foundations',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Foundation' }),
      },
      {
        label: 'Filter: Career',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Career' }),
      },
      {
        label: 'Filter: Practices',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Practice' }),
      },
      {
        label: 'Filter: Systems',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'System' }),
      },
      {
        label: 'Filter: Evidence',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Evidence' }),
      },
    ],
    Help: [
      ...commonMenus.Help,
      {
        label: 'Find: Evaluation & Evidence',
        icon: <IoHelpCircle size={16} />,
        action: () =>
          emitNetworkMenuAction(window, 'apply_query', { query: 'evaluation evidence' }),
      },
    ],
  };

  const workbenchMenus: MenuSet = {
    ...commonMenus,
    View: [
      {
        label: 'Selected Systems',
        icon: <IoCodeSlash size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-selected-systems'),
      },
      {
        label: 'Professional Context',
        icon: <IoCodeSlash size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-professional-context'),
      },
    ],
    Window: [
      {
        label: 'Back to Top',
        icon: <IoDocumentText size={16} />,
        action: () => emitWorkbenchMenuAction(window, 'scroll_top'),
      },
    ],
  };

  const notesMenus: MenuSet = {
    ...commonMenus,
    View: [
      {
        label: 'Selected Writing',
        icon: <IoDocumentText size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'writing-selected' }),
      },
      {
        label: 'Provenance',
        icon: <IoHelpCircle size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'writing-provenance' }),
      },
    ],
    Window: [
      {
        label: 'Back to Top',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesMenuAction(window, 'scroll_top'),
      },
      {
        label: 'Open Full Archive',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesMenuAction(window, 'open_news_hub'),
      },
    ],
  };

  const resumeMenus: MenuSet = {
    ...commonMenus,
    View: [
      {
        label: 'Summary',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeMenuAction(window, 'jump_section', { sectionId: 'resume-summary' }),
      },
      {
        label: 'Downloads',
        icon: <IoDocumentText size={16} />,
        action: () =>
          emitResumeMenuAction(window, 'jump_section', { sectionId: 'resume-downloads' }),
      },
      {
        label: 'Resume Body',
        icon: <IoCodeSlash size={16} />,
        action: () => emitResumeMenuAction(window, 'jump_section', { sectionId: 'resume-body' }),
      },
    ],
    Window: [
      {
        label: 'Download PDF',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeMenuAction(window, 'download', { format: 'pdf' }),
      },
      {
        label: 'Download DOCX',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeMenuAction(window, 'download', { format: 'docx' }),
      },
      {
        label: 'Download Markdown',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeMenuAction(window, 'download', { format: 'markdown' }),
      },
      {
        label: 'Back to Top',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeMenuAction(window, 'scroll_top'),
      },
    ],
  };

  const appMenuLabelMap: Record<ToolbarAppId, string> = {
    home: userConfig.name,
    terminal: 'Agents',
    network: 'System Map',
    projects: 'Workbench',
    notes: 'Technical Writing',
    evolution: 'Evidence & Evolution',
    resume: 'Resume',
    news: 'Technical Writing',
  };

  const appMenuItemsMap: Record<ToolbarAppId, MenuItem[]> = {
    home: [
      { label: 'About DG-Labs Pro', icon: <FaWindowRestore size={16} />, action: onOpenAbout },
      {
        label: 'Open Workbench',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('projects'),
      },
      {
        label: 'Open System Map',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('network'),
      },
      {
        label: 'Open Agents Runtime',
        icon: <IoHelpCircle size={16} />,
        action: () => openAppFromMenu('terminal'),
      },
    ],
    terminal: [
      {
        label: 'Terminal Help',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalMenuAction(window, 'set_mode', { mode: 'explainer' }),
      },
      {
        label: 'Clear Output',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalMenuAction(window, 'clear_output'),
      },
      {
        label: 'Close Agents Terminal',
        icon: <FaWindowRestore size={16} />,
        action: () => onCloseApp('terminal'),
      },
    ],
    network: [
      {
        label: 'Reset Map Search',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'clear_search'),
      },
      {
        label: 'Switch to Map Mode',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_view', { view: 'MAP' }),
      },
      {
        label: 'Close System Map',
        icon: <FaWindowRestore size={16} />,
        action: () => onCloseApp('network'),
      },
    ],
    projects: [
      {
        label: 'Jump to Selected Systems',
        icon: <IoCodeSlash size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-selected-systems'),
      },
      {
        label: 'Jump to Professional Context',
        icon: <IoDocumentText size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-professional-context'),
      },
      {
        label: 'Close Workbench',
        icon: <FaWindowRestore size={16} />,
        action: () => onCloseApp('projects'),
      },
    ],
    notes: [
      {
        label: 'Open Selected Writing',
        icon: <IoDocumentText size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'writing-selected' }),
      },
      {
        label: 'Open Full Archive',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNotesMenuAction(window, 'open_news_hub'),
      },
      {
        label: 'Close Technical Writing',
        icon: <FaWindowRestore size={16} />,
        action: () => onCloseApp('notes'),
      },
    ],
    evolution: [
      {
        label: 'Open Application Evidence',
        icon: <IoDocumentText size={16} />,
        action: () => {
          window.location.href = '/apply/openai-codex';
        },
      },
      {
        label: 'Open Resume',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('resume'),
      },
      {
        label: 'Close Evidence & Evolution',
        icon: <FaWindowRestore size={16} />,
        action: () => onCloseApp('evolution'),
      },
    ],
    resume: [
      {
        label: 'Download PDF',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeMenuAction(window, 'download', { format: 'pdf' }),
      },
      {
        label: 'Download DOCX',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeMenuAction(window, 'download', { format: 'docx' }),
      },
      {
        label: 'Close Resume',
        icon: <FaWindowRestore size={16} />,
        action: () => onCloseApp('resume'),
      },
    ],
    news: [
      {
        label: 'Open Technical Writing',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('notes'),
      },
      {
        label: 'Open Full Archive',
        icon: <IoCodeSlash size={16} />,
        action: () => window.open('https://ai-news-hub.performics-labs.com/analysis', '_blank'),
      },
      {
        label: 'Close Technical Writing',
        icon: <FaWindowRestore size={16} />,
        action: () => onCloseApp('news'),
      },
    ],
  };

  const menus =
    resolvedAppId === 'home'
      ? homeMenus
      : resolvedAppId === 'terminal'
        ? terminalMenus
        : resolvedAppId === 'network'
          ? networkMenus
          : resolvedAppId === 'projects'
            ? workbenchMenus
            : resolvedAppId === 'notes'
              ? notesMenus
              : resolvedAppId === 'resume'
                ? resumeMenus
                : commonMenus;

  return {
    appMenuLabelMap,
    appMenuItemsMap,
    menus,
    menuOrder: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'],
  };
};
