import { useState, useEffect, useRef } from 'react';
import { MdWifi } from 'react-icons/md';
import { FaApple, FaGithub, FaLinkedin, FaEnvelope, FaWindowRestore } from 'react-icons/fa';
import {
  IoBatteryHalfOutline,
  IoCellular,
  IoDocumentText,
  IoCodeSlash,
  IoMail,
  IoHelpCircle,
} from 'react-icons/io5';
import { VscVscode } from 'react-icons/vsc';
import { userConfig } from '../../config/index';
import {
  dispatchDesktopToggleWindow,
  onDesktopAppFocus,
  onDesktopState,
} from '../../services/desktopEvents';
import { clearDesktopReady, markDesktopReady } from '../../services/desktopReady';
import {
  openAppFromMenu,
  openContactFromMenu,
  openWorkbenchSectionFromMenu,
} from '../../services/appOpenHandlers';
import { copyTextWithFallback } from '../../services/clipboardService';
import { openTerminalGuideFromMenu } from '../../services/terminalGuideService';
import {
  emitNetworkMenuAction,
  emitNotesMenuAction,
  emitResumeMenuAction,
  emitTerminalMenuAction,
  emitWorkbenchMenuAction,
} from '../../services/menubarActions';
import AboutDGWindow from './AboutDGWindow';
import HelpGuideWindow, { type HelpTopic } from './HelpGuideWindow';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  submenu?: MenuItem[];
};

type ToolbarAppId = 'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news';

interface MacToolbarProps {
  onOpenContact?: () => void;
  activeAppId?: 'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news';
}

export default function MacToolbar({ onOpenContact, activeAppId = 'home' }: MacToolbarProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const [focusedAppId, setFocusedAppId] = useState<
    'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news' | null
  >(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markDesktopReady(window, 'toolbar');
    return () => clearDesktopReady(window, 'toolbar');
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribeFocus = onDesktopAppFocus(window, ({ appId }) => {
      const next = appId;
      if (!next) return;
      if (next === 'home') {
        setFocusedAppId(null);
        return;
      }
      setFocusedAppId(next);
    });
    const unsubscribeState = onDesktopState(window, ({ focusedAppId: next }) => {
      if (!next) return;
      if (next === 'home') {
        setFocusedAppId(null);
        return;
      }
      setFocusedAppId(next);
    });
    return () => {
      unsubscribeFocus();
      unsubscribeState();
    };
  }, []);

  useEffect(() => {
    setFocusedAppId((current) => (current === activeAppId ? current : null));
  }, [activeAppId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatMacDate = (date: Date) => {
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const hour = date.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
    const minute = date.getMinutes().toString().padStart(2, '0');
    const period = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${weekday} ${month} ${day} ${hour.replace(/\s?[AP]M/, '')}:${minute} ${period}`;
  };

  const formatIPhoneTime = (date: Date) => {
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');

    hour = hour % 12;
    hour = hour ? hour : 12;

    return `${hour}:${minute}`;
  };

  const handleVSCodeClick = () => {
    window.location.href = 'vscode:/';
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleAction = (action?: () => void) => {
    if (action) {
      action();
      setActiveMenu(null);
    }
  };

  const copyText = async (text: string, label: string) => {
    const copied = await copyTextWithFallback(text);
    if (copied) {
      alert(`${label} copied to clipboard.`);
      return;
    }
    alert(`Unable to copy ${label.toLowerCase()}.`);
  };

  const openTerminalGuide = () => {
    openTerminalGuideFromMenu();
  };

  const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

  const closeApp = (appId: Exclude<ToolbarAppId, 'home'>) => {
    const path = normalizePath(window.location.pathname);
    if (path === '/desktop') {
      dispatchDesktopToggleWindow(window, appId);
      return;
    }

    if (path === `/apps/${appId === 'projects' ? 'projects' : appId}`) {
      window.location.href = '/desktop';
      return;
    }

    window.location.href = '/desktop';
  };

  const commonMenus: Record<
    'Apple' | 'File' | 'Edit' | 'View' | 'Go' | 'Window' | 'Help',
    MenuItem[]
  > = {
    Apple: [
      {
        label: 'About DG-Labs Pro',
        icon: <FaWindowRestore size={16} />,
        action: () => setShowAbout(true),
      },
      {
        label: 'System Settings...',
        icon: <IoDocumentText size={16} />,
        action: () => {
          openAppFromMenu('notes');
        },
      },
    ],
    File: [
      {
        label: 'Resume',
        icon: <IoDocumentText size={16} />,
        action: () => {
          openAppFromMenu('resume');
        },
      },
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => {
          openAppFromMenu('projects');
        },
      },
    ],
    Edit: [
      {
        label: 'Copy Quick Intro',
        icon: <IoDocumentText size={16} />,
        action: () => {
          void copyText(
            `${userConfig.ownerName} builds AI systems and research interfaces focused on human agency. DG-Labs OS presents this work as a cognitive operating system across projects, networked ideas, and an agent runtime.`,
            'Quick intro'
          );
        },
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
          void copyText(footprint, 'Public footprint');
        },
      },
      {
        label: 'Copy Current View Link',
        icon: <IoCodeSlash size={16} />,
        action: () => {
          const href = window.location.href;
          void copyText(href, 'Current view link');
        },
      },
    ],
    View: [
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => {
          openAppFromMenu('projects');
        },
      },
      {
        label: 'AI News Hub',
        icon: <IoDocumentText size={16} />,
        action: () => {
          openAppFromMenu('news');
        },
      },
      {
        label: 'Notes',
        icon: <IoDocumentText size={16} />,
        action: () => {
          openAppFromMenu('notes');
        },
      },
      {
        label: 'Terminal',
        icon: <IoHelpCircle size={16} />,
        action: () => {
          openAppFromMenu('terminal');
        },
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
        label: 'AI News Hub',
        icon: <IoDocumentText size={16} />,
        action: () => window.open('https://ai-news-hub.performics-labs.com/', '_blank'),
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
        action: () => {
          openContactFromMenu({
            email: userConfig.contact.email,
            onOpenContact,
          });
        },
      },
    ],
    Help: [
      {
        label: 'Search Help in Agents...',
        icon: <IoHelpCircle size={16} />,
        action: () => openTerminalGuide(),
      },
      {
        label: 'DG-Labs User Guide',
        icon: <IoDocumentText size={16} />,
        action: () => setHelpTopic('user-guide'),
      },
      {
        label: 'Terminal Command Guide',
        icon: <IoHelpCircle size={16} />,
        action: () => setHelpTopic('terminal-guide'),
      },
      {
        label: 'Navigation Tips',
        icon: <IoDocumentText size={16} />,
        action: () => setHelpTopic('navigation-tips'),
      },
      {
        label: 'About DG-Labs OS',
        icon: <IoHelpCircle size={16} />,
        action: () => setHelpTopic('about-os'),
      },
    ],
  };

  const homeMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('projects'),
      },
      {
        label: 'Network',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('network'),
      },
      {
        label: 'Notes',
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
      {
        label: 'Contact...',
        icon: <IoMail size={16} />,
        action: () => {
          openContactFromMenu({
            email: userConfig.contact.email,
            onOpenContact,
          });
        },
      },
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
        action: () => setHelpTopic('user-guide'),
      },
      {
        label: 'Navigation Tips',
        icon: <IoDocumentText size={16} />,
        action: () => setHelpTopic('navigation-tips'),
      },
      {
        label: 'Search Help in Agents...',
        icon: <IoHelpCircle size={16} />,
        action: () => openTerminalGuide(),
      },
      {
        label: 'About DG-Labs OS',
        icon: <IoHelpCircle size={16} />,
        action: () => setHelpTopic('about-os'),
      },
    ],
  };

  const terminalMenus: typeof commonMenus = {
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

  const networkMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'List Mode',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_view', { view: 'LIST' }),
      },
      {
        label: 'Graph Mode',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_view', { view: 'GRAPH' }),
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
        label: 'Filter: Education',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Education' }),
      },
      {
        label: 'Filter: Research',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Research' }),
      },
      {
        label: 'Filter: Projects',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Projects' }),
      },
      {
        label: 'Filter: Experience',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_filter', { filter: 'Experience' }),
      },
    ],
    Help: [
      ...commonMenus.Help,
      {
        label: 'Find: Human Agency',
        icon: <IoHelpCircle size={16} />,
        action: () =>
          emitNetworkMenuAction(window, 'apply_query', { query: 'human agency empowerment' }),
      },
    ],
  };

  const workbenchMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'Research Systems',
        icon: <IoCodeSlash size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-research-systems'),
      },
      {
        label: 'Platforms',
        icon: <IoCodeSlash size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-platforms'),
      },
      {
        label: 'Writing',
        icon: <IoDocumentText size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-writing'),
      },
      {
        label: 'Hackathons',
        icon: <IoHelpCircle size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-hackathons'),
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

  const notesMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'Principles',
        icon: <IoDocumentText size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'notes-principles' }),
      },
      {
        label: 'Quick Actions',
        icon: <IoHelpCircle size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'notes-quick-actions' }),
      },
      {
        label: 'Pinned Deep Dives',
        icon: <IoCodeSlash size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'notes-deep-dives' }),
      },
      {
        label: 'News Analysis',
        icon: <IoDocumentText size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'notes-news-analysis' }),
      },
    ],
    Window: [
      {
        label: 'Back to Top',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesMenuAction(window, 'scroll_top'),
      },
      {
        label: 'Open AI News Hub',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesMenuAction(window, 'open_news_hub'),
      },
    ],
  };

  const resumeMenus: typeof commonMenus = {
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

  const resolvedAppId = focusedAppId ?? activeAppId;

  const appMenuLabelMap: Record<ToolbarAppId, string> = {
    home: userConfig.name,
    terminal: 'Agents',
    network: 'Network',
    projects: 'Workbench',
    notes: 'Lab Notes',
    resume: 'Resume',
    news: 'AI News Hub',
  };

  const appMenuItemsMap: Record<ToolbarAppId, MenuItem[]> = {
    home: [
      {
        label: 'About DG-Labs Pro',
        icon: <FaWindowRestore size={16} />,
        action: () => setShowAbout(true),
      },
      {
        label: 'Open Workbench',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('projects'),
      },
      {
        label: 'Open Network',
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
        action: () => closeApp('terminal'),
      },
    ],
    network: [
      {
        label: 'Reset Network Search',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkMenuAction(window, 'clear_search'),
      },
      {
        label: 'Switch to Graph Mode',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNetworkMenuAction(window, 'set_view', { view: 'GRAPH' }),
      },
      {
        label: 'Close Network',
        icon: <FaWindowRestore size={16} />,
        action: () => closeApp('network'),
      },
    ],
    projects: [
      {
        label: 'Jump to Research Systems',
        icon: <IoCodeSlash size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-research-systems'),
      },
      {
        label: 'Jump to Platforms',
        icon: <IoDocumentText size={16} />,
        action: () => openWorkbenchSectionFromMenu('workbench-platforms'),
      },
      {
        label: 'Close Workbench',
        icon: <FaWindowRestore size={16} />,
        action: () => closeApp('projects'),
      },
    ],
    notes: [
      {
        label: 'Open Principles',
        icon: <IoDocumentText size={16} />,
        action: () =>
          emitNotesMenuAction(window, 'jump_section', { sectionId: 'notes-principles' }),
      },
      {
        label: 'Open AI News Hub',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNotesMenuAction(window, 'open_news_hub'),
      },
      {
        label: 'Close Lab Notes',
        icon: <FaWindowRestore size={16} />,
        action: () => closeApp('notes'),
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
        action: () => closeApp('resume'),
      },
    ],
    news: [
      {
        label: 'Open AI News Hub Site',
        icon: <IoDocumentText size={16} />,
        action: () => openAppFromMenu('news'),
      },
      {
        label: 'Open Lab Notes',
        icon: <IoCodeSlash size={16} />,
        action: () => openAppFromMenu('notes'),
      },
      {
        label: 'Close AI News Hub',
        icon: <FaWindowRestore size={16} />,
        action: () => closeApp('news'),
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

  const menuOrder: Array<'File' | 'Edit' | 'View' | 'Go' | 'Window' | 'Help'> = [
    'File',
    'Edit',
    'View',
    'Go',
    'Window',
    'Help',
  ];

  const renderMenu = (menuItems: MenuItem[]) => (
    <div
      className="absolute top-full left-0 mt-1 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl py-1 min-w-[200px]"
      role="menu"
    >
      {menuItems.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => handleAction(item.action)}
            role="menuitem"
            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700/50 flex items-center gap-2"
          >
            {item.icon}
            {item.label}
          </button>
          {item.submenu && (
            <div
              className="absolute left-full top-0 ml-1 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl py-1 min-w-[200px]"
              role="menu"
            >
              {item.submenu.map((subItem, subIndex) => (
                <button
                  key={subIndex}
                  onClick={() => handleAction(subItem.action)}
                  role="menuitem"
                  className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700/50 flex items-center gap-2"
                >
                  {subItem.icon}
                  {subItem.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-50 md:hidden bg-transparent text-white h-12 px-8 flex items-center justify-between text-base font-medium">
        <span className="font-semibold">{formatIPhoneTime(currentDateTime)}</span>
        <div className="flex items-center gap-1.5">
          <IoCellular size={20} />
          <MdWifi size={20} />
          <IoBatteryHalfOutline size={24} />
        </div>
      </div>

      <div
        data-desktop-surface="menubar"
        className="sticky top-0 z-50 hidden md:flex bg-black/20 backdrop-blur-md text-white h-6 px-4 items-center justify-between text-sm"
        role="menubar"
        aria-label="Application menu bar"
      >
        <div className="flex items-center space-x-4" ref={menuRef}>
          <div className="relative">
            <button
              className="cursor-pointer hover:text-gray-300 transition-colors flex items-center gap-1"
              onClick={() => handleMenuClick('Apple')}
              aria-haspopup="menu"
              aria-expanded={activeMenu === 'Apple'}
              aria-controls="menu-Apple"
              role="menuitem"
            >
              <FaApple size={16} />
            </button>
            {activeMenu === 'Apple' && <div id="menu-Apple">{renderMenu(menus.Apple)}</div>}
          </div>
          <div className="relative">
            <button
              className="cursor-pointer font-semibold text-white/90 hover:text-gray-300 transition-colors"
              onClick={() => handleMenuClick('App')}
              aria-haspopup="menu"
              aria-expanded={activeMenu === 'App'}
              aria-controls="menu-App"
              role="menuitem"
            >
              {appMenuLabelMap[resolvedAppId]}
            </button>
            {activeMenu === 'App' && (
              <div id="menu-App">{renderMenu(appMenuItemsMap[resolvedAppId])}</div>
            )}
          </div>
          {menuOrder.map((menu) => (
            <div key={menu} className="relative">
              <button
                className="cursor-pointer hover:text-gray-300 transition-colors flex items-center gap-1"
                onClick={() => handleMenuClick(menu)}
                aria-haspopup="menu"
                aria-expanded={activeMenu === menu}
                aria-controls={`menu-${menu}`}
                role="menuitem"
              >
                {menu}
              </button>
              {activeMenu === menu && <div id={`menu-${menu}`}>{renderMenu(menus[menu])}</div>}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <VscVscode
            size={16}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleVSCodeClick}
            title="Open in VSCode"
          />
          <MdWifi size={16} />
          <span className="cursor-default">{formatMacDate(currentDateTime)}</span>
        </div>
      </div>
      <AboutDGWindow
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        onMoreInfo={() => {
          window.location.href = '/apps/notes';
        }}
      />
      <HelpGuideWindow
        isOpen={helpTopic !== null}
        topic={helpTopic}
        onClose={() => setHelpTopic(null)}
      />
    </>
  );
}
