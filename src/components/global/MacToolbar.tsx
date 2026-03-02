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
import AboutDGWindow from './AboutDGWindow';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  submenu?: MenuItem[];
};

interface MacToolbarProps {
  onOpenContact?: () => void;
  activeAppId?: 'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news';
}

export default function MacToolbar({ onOpenContact, activeAppId = 'home' }: MacToolbarProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [focusedAppId, setFocusedAppId] = useState<
    'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news' | null
  >(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleAppFocus = (event: Event) => {
      const customEvent = event as CustomEvent<{
        appId?: 'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news';
      }>;
      const next = customEvent.detail?.appId;
      if (!next) return;
      setFocusedAppId(next);
    };

    window.addEventListener('dg-app-focus', handleAppFocus as EventListener);
    return () => {
      window.removeEventListener('dg-app-focus', handleAppFocus as EventListener);
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

  const openDesktopOrNavigate = (
    appId: 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news',
    href: string
  ) => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const target = href.replace(/\/+$/, '') || '/';
    const isDesktopShell = path === '/desktop';
    if (isDesktopShell) {
      window.dispatchEvent(
        new CustomEvent('dg-desktop-open-window', {
          detail: { appId },
        })
      );
      return;
    }
    if (path === target) {
      window.dispatchEvent(
        new CustomEvent('dg-app-focus', {
          detail: { appId },
        })
      );
      return;
    }
    window.location.href = href;
  };

  const emitTerminalAction = (
    action: 'clear_output' | 'set_mode' | 'toggle_sources' | 'verify_profile' | 'verify_projects',
    payload?: Record<string, unknown>
  ) => {
    window.dispatchEvent(
      new CustomEvent('dg-terminal-menu-action', {
        detail: { action, ...payload },
      })
    );
  };

  const emitNetworkAction = (
    action: 'set_filter' | 'set_view' | 'clear_search' | 'apply_query',
    payload?: Record<string, unknown>
  ) => {
    window.dispatchEvent(
      new CustomEvent('dg-network-menu-action', {
        detail: { action, ...payload },
      })
    );
  };

  const emitWorkbenchAction = (
    action: 'jump_section' | 'scroll_top',
    payload?: Record<string, unknown>
  ) => {
    window.dispatchEvent(
      new CustomEvent('dg-workbench-menu-action', {
        detail: { action, ...payload },
      })
    );
  };

  const emitNotesAction = (
    action: 'jump_section' | 'open_news_hub' | 'scroll_top',
    payload?: Record<string, unknown>
  ) => {
    window.dispatchEvent(
      new CustomEvent('dg-notes-menu-action', {
        detail: { action, ...payload },
      })
    );
  };

  const emitResumeAction = (
    action: 'jump_section' | 'download' | 'scroll_top',
    payload?: Record<string, unknown>
  ) => {
    window.dispatchEvent(
      new CustomEvent('dg-resume-menu-action', {
        detail: { action, ...payload },
      })
    );
  };

  const openNotesHelpSection = (sectionId: string) => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/desktop') {
      window.dispatchEvent(
        new CustomEvent('dg-desktop-open-window', {
          detail: { appId: 'notes' },
        })
      );
      window.dispatchEvent(
        new CustomEvent('dg-app-focus', {
          detail: { appId: 'notes' },
        })
      );
      [80, 220, 420].forEach((delay) => {
        window.setTimeout(() => {
          emitNotesAction('jump_section', { sectionId });
        }, delay);
      });
      return;
    }
    if (path === '/apps/notes') {
      emitNotesAction('jump_section', { sectionId });
      return;
    }
    window.location.href = `/apps/notes#${sectionId}`;
  };

  const openTerminalGuide = () => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/desktop') {
      window.dispatchEvent(
        new CustomEvent('dg-desktop-open-window', {
          detail: { appId: 'terminal' },
        })
      );
      window.dispatchEvent(
        new CustomEvent('dg-app-focus', {
          detail: { appId: 'terminal' },
        })
      );
      window.setTimeout(() => {
        emitTerminalAction('set_mode', { mode: 'explainer' });
      }, 120);
      return;
    }
    if (path === '/apps/terminal') {
      emitTerminalAction('set_mode', { mode: 'explainer' });
      return;
    }
    window.location.href = '/apps/terminal';
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
          openDesktopOrNavigate('notes', '/apps/notes');
        },
      },
    ],
    File: [
      {
        label: 'Resume',
        icon: <IoDocumentText size={16} />,
        action: () => {
          openDesktopOrNavigate('resume', '/apps/resume');
        },
      },
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => {
          openDesktopOrNavigate('projects', '/apps/projects');
        },
      },
      {
        label: 'Admin Dashboard',
        icon: <FaWindowRestore size={16} />,
        action: () => {
          window.location.href = '/admin';
        },
      },
    ],
    Edit: [
      {
        label: 'Copy Email',
        icon: <IoMail size={16} />,
        action: () => {
          navigator.clipboard.writeText(userConfig.contact.email);
          alert('Email copied to clipboard!');
        },
      },
    ],
    View: [
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => {
          openDesktopOrNavigate('projects', '/apps/projects');
        },
      },
      {
        label: 'AI News Hub',
        icon: <IoDocumentText size={16} />,
        action: () => {
          openDesktopOrNavigate('news', '/apps/news');
        },
      },
      {
        label: 'Notes',
        icon: <IoDocumentText size={16} />,
        action: () => {
          openDesktopOrNavigate('notes', '/apps/notes');
        },
      },
      {
        label: 'Terminal',
        icon: <IoHelpCircle size={16} />,
        action: () => {
          openDesktopOrNavigate('terminal', '/apps/terminal');
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
          if (onOpenContact) {
            onOpenContact();
            return;
          }
          const path = window.location.pathname.replace(/\/+$/, '') || '/';
          if (path === '/desktop') {
            window.dispatchEvent(new CustomEvent('dg-dock-open-links'));
            return;
          }
          window.location.href = `mailto:${userConfig.contact.email}`;
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
        action: () => openNotesHelpSection('notes-principles'),
      },
      {
        label: 'Terminal Command Guide',
        icon: <IoHelpCircle size={16} />,
        action: () => openTerminalGuide(),
      },
      {
        label: 'Navigation Tips',
        icon: <IoDocumentText size={16} />,
        action: () => openNotesHelpSection('notes-quick-actions'),
      },
      {
        label: 'About DG-Labs OS',
        icon: <IoHelpCircle size={16} />,
        action: () => setShowAbout(true),
      },
    ],
  };

  const terminalMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'Set Mode: Concise',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalAction('set_mode', { mode: 'concise' }),
      },
      {
        label: 'Set Mode: Explainer',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalAction('set_mode', { mode: 'explainer' }),
      },
      {
        label: 'Set Mode: Research',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalAction('set_mode', { mode: 'research' }),
      },
      {
        label: 'Toggle Sources Footer',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalAction('toggle_sources'),
      },
    ],
    Window: [
      {
        label: 'Clear Output',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalAction('clear_output'),
      },
      {
        label: 'Verify LinkedIn Profile',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalAction('verify_profile'),
      },
      {
        label: 'Verify Project Footprint',
        icon: <IoDocumentText size={16} />,
        action: () => emitTerminalAction('verify_projects'),
      },
    ],
    Help: [
      ...commonMenus.Help,
      {
        label: 'Terminal Help',
        icon: <IoHelpCircle size={16} />,
        action: () => emitTerminalAction('set_mode', { mode: 'explainer' }),
      },
    ],
  };

  const networkMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'List Mode',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkAction('set_view', { view: 'LIST' }),
      },
      {
        label: 'Graph Mode',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNetworkAction('set_view', { view: 'GRAPH' }),
      },
      {
        label: 'Clear Search',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkAction('clear_search'),
      },
    ],
    Window: [
      {
        label: 'Filter: All',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkAction('set_filter', { filter: 'ALL' }),
      },
      {
        label: 'Filter: Education',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkAction('set_filter', { filter: 'Education' }),
      },
      {
        label: 'Filter: Research',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkAction('set_filter', { filter: 'Research' }),
      },
      {
        label: 'Filter: Projects',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkAction('set_filter', { filter: 'Projects' }),
      },
      {
        label: 'Filter: Experience',
        icon: <IoDocumentText size={16} />,
        action: () => emitNetworkAction('set_filter', { filter: 'Experience' }),
      },
    ],
    Help: [
      ...commonMenus.Help,
      {
        label: 'Find: Human Agency',
        icon: <IoHelpCircle size={16} />,
        action: () => emitNetworkAction('apply_query', { query: 'human agency empowerment' }),
      },
    ],
  };

  const workbenchMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'Open Workbench',
        icon: <IoCodeSlash size={16} />,
        action: () => openDesktopOrNavigate('projects', '/apps/projects'),
      },
      {
        label: 'Research Systems',
        icon: <IoCodeSlash size={16} />,
        action: () =>
          emitWorkbenchAction('jump_section', { sectionId: 'workbench-research-systems' }),
      },
      {
        label: 'Platforms',
        icon: <IoCodeSlash size={16} />,
        action: () => emitWorkbenchAction('jump_section', { sectionId: 'workbench-platforms' }),
      },
      {
        label: 'Writing',
        icon: <IoDocumentText size={16} />,
        action: () => emitWorkbenchAction('jump_section', { sectionId: 'workbench-writing' }),
      },
      {
        label: 'Hackathons',
        icon: <IoHelpCircle size={16} />,
        action: () => emitWorkbenchAction('jump_section', { sectionId: 'workbench-hackathons' }),
      },
    ],
    Window: [
      {
        label: 'Back to Top',
        icon: <IoDocumentText size={16} />,
        action: () => emitWorkbenchAction('scroll_top'),
      },
    ],
  };

  const notesMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'Principles',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesAction('jump_section', { sectionId: 'notes-principles' }),
      },
      {
        label: 'Quick Actions',
        icon: <IoHelpCircle size={16} />,
        action: () => emitNotesAction('jump_section', { sectionId: 'notes-quick-actions' }),
      },
      {
        label: 'Pinned Deep Dives',
        icon: <IoCodeSlash size={16} />,
        action: () => emitNotesAction('jump_section', { sectionId: 'notes-deep-dives' }),
      },
      {
        label: 'News Analysis',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesAction('jump_section', { sectionId: 'notes-news-analysis' }),
      },
    ],
    Window: [
      {
        label: 'Back to Top',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesAction('scroll_top'),
      },
      {
        label: 'Open AI News Hub',
        icon: <IoDocumentText size={16} />,
        action: () => emitNotesAction('open_news_hub'),
      },
    ],
  };

  const resumeMenus: typeof commonMenus = {
    ...commonMenus,
    View: [
      {
        label: 'Summary',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeAction('jump_section', { sectionId: 'resume-summary' }),
      },
      {
        label: 'Downloads',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeAction('jump_section', { sectionId: 'resume-downloads' }),
      },
      {
        label: 'Resume Body',
        icon: <IoCodeSlash size={16} />,
        action: () => emitResumeAction('jump_section', { sectionId: 'resume-body' }),
      },
    ],
    Window: [
      {
        label: 'Download PDF',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeAction('download', { format: 'pdf' }),
      },
      {
        label: 'Download DOCX',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeAction('download', { format: 'docx' }),
      },
      {
        label: 'Download Markdown',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeAction('download', { format: 'markdown' }),
      },
      {
        label: 'Back to Top',
        icon: <IoDocumentText size={16} />,
        action: () => emitResumeAction('scroll_top'),
      },
    ],
  };

  const resolvedAppId = focusedAppId ?? activeAppId;

  const menus =
    resolvedAppId === 'terminal'
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
          <span className="font-semibold text-white/90">{userConfig.name}</span>
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
    </>
  );
}
