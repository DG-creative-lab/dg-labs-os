import { useState, useEffect, useRef } from 'react';
import { dockLinks } from '../../config/links';
import {
  dispatchDesktopToggleWindow,
  onDesktopState,
  onDockCloseLinks,
  onDockOpenLinks,
} from '../../services/desktopEvents';
import { clearDesktopReady, markDesktopReady } from '../../services/desktopReady';
import DockGlyph from './DockGlyph';

interface DesktopDockProps {
  activeApps: {
    terminal: boolean;
    notes: boolean;
    github: boolean;
    resume: boolean;
  };
}

type DockItem = {
  id: string;
  label: string;
  shortLabel: string;
  onClick: () => void;
  glyph: React.ComponentProps<typeof DockGlyph>['name'];
  active: boolean;
  utility?: boolean;
};

const DesktopDock = ({ activeApps }: DesktopDockProps) => {
  const [showConnectMenu, setShowConnectMenu] = useState(false);
  const [normalizedPath, setNormalizedPath] = useState('');
  const [desktopOpen, setDesktopOpen] = useState({
    terminal: false,
    notes: false,
    projects: false,
    evolution: false,
    resume: false,
    news: false,
    network: false,
  });
  const dockNavRef = useRef<HTMLElement>(null);
  const connectMenuRef = useRef<HTMLDivElement>(null);

  const handleConnectClick = () => {
    setShowConnectMenu(!showConnectMenu);
  };

  const isDesktopShell = normalizedPath === '/desktop';
  const isPathActive = (...paths: string[]) =>
    paths.some((path) => {
      const normalized = path.replace(/\/+$/, '') || '/';
      return normalized === normalizedPath;
    });

  const toggleDesktopWindow = (
    appId: 'terminal' | 'notes' | 'projects' | 'evolution' | 'resume' | 'news' | 'network'
  ) => {
    dispatchDesktopToggleWindow(window, appId);
  };

  const getLinkGlyph = (id: string): React.ComponentProps<typeof DockGlyph>['name'] => {
    if (id.includes('linkedin')) return 'linkedin';
    if (id.includes('github')) return 'github';
    if (id === 'email' || id === 'call') return 'mail';
    return 'links';
  };

  useEffect(() => {
    markDesktopReady(window, 'dock');
    setNormalizedPath(window.location.pathname.replace(/\/+$/, '') || '/');
    return () => clearDesktopReady(window, 'dock');
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (connectMenuRef.current && !connectMenuRef.current.contains(event.target as Node)) {
        setShowConnectMenu(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowConnectMenu(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onDesktopState(window, ({ open }) => {
      if (!open) return;
      setDesktopOpen((prev) => ({
        terminal: open.terminal ?? prev.terminal,
        notes: open.notes ?? prev.notes,
        projects: open.projects ?? prev.projects,
        evolution: open.evolution ?? prev.evolution,
        resume: open.resume ?? prev.resume,
        news: open.news ?? prev.news,
        network: open.network ?? prev.network,
      }));
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onOpenLinks = () => setShowConnectMenu(true);
    const onCloseLinks = () => setShowConnectMenu(false);
    const unsubscribeOpen = onDockOpenLinks(window, onOpenLinks);
    const unsubscribeClose = onDockCloseLinks(window, onCloseLinks);
    return () => {
      unsubscribeOpen();
      unsubscribeClose();
    };
  }, []);

  useEffect(() => {
    const setDockInsetVar = () => {
      if (typeof window === 'undefined') return;
      const nav = dockNavRef.current;
      if (!nav) return;
      const rect = nav.getBoundingClientRect();
      // Pixels from dock top to viewport bottom, plus a small safety margin.
      const safeBottom = Math.max(96, Math.ceil(window.innerHeight - rect.top + 8));
      document.documentElement.style.setProperty('--dg-dock-safe-bottom', `${safeBottom}px`);
    };

    setDockInsetVar();
    window.addEventListener('resize', setDockInsetVar);
    const ro = new ResizeObserver(() => setDockInsetVar());
    if (dockNavRef.current) ro.observe(dockNavRef.current);
    return () => {
      window.removeEventListener('resize', setDockInsetVar);
      ro.disconnect();
    };
  }, []);

  const ConnectMenu = () => (
    <div
      id="dock-connect-menu"
      role="dialog"
      aria-label="Connect"
      className="absolute right-0 bottom-[calc(100%+12px)] w-56 overflow-hidden rounded-xl border border-white/15 bg-[#111113] text-left"
    >
      <div className="px-3 py-2.5">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-sky-200">
          Connect
        </p>
        <p className="mt-1 text-[11px] text-white/46">Public profiles and direct contact.</p>
      </div>
      <div className="border-t border-white/12">
        {dockLinks.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target={item.url.startsWith('http') ? '_blank' : undefined}
            rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            onClick={() => setShowConnectMenu(false)}
            className="flex items-center gap-3 border-b border-white/8 px-3 py-2.5 text-white/66 transition-colors last:border-b-0 hover:bg-white/[0.04] hover:text-white focus-visible:bg-white/[0.04] focus-visible:text-sky-100 focus-visible:outline-none"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/12 text-white/54">
              <DockGlyph name={getLinkGlyph(item.id)} className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-medium">{item.label}</span>
            <span className="ml-auto font-mono text-[9px] text-white/28" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </div>
    </div>
  );

  const icons: DockItem[] = [
    {
      id: 'workbench',
      label: 'Workbench',
      shortLabel: 'Workbench',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('projects');
          return;
        }
        window.location.href = '/apps/projects';
      },
      glyph: 'workbench',
      active: isDesktopShell
        ? desktopOpen.projects
        : activeApps.github || isPathActive('/apps/projects'),
    },
    {
      id: 'writing',
      label: 'Technical Writing',
      shortLabel: 'Writing',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('notes');
          return;
        }
        window.location.href = '/apps/notes';
      },
      glyph: 'notes',
      active: isDesktopShell ? desktopOpen.notes : activeApps.notes || isPathActive('/apps/notes'),
    },
    {
      id: 'evolution',
      label: 'Evidence & Evolution',
      shortLabel: 'Evolution',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('evolution');
          return;
        }
        window.location.href = '/apps/evolution';
      },
      glyph: 'evolution',
      active: isDesktopShell
        ? desktopOpen.evolution
        : isPathActive('/apps/evolution', '/apply/openai-codex'),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      shortLabel: 'Timeline',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('resume');
          return;
        }
        window.location.href = '/apps/resume';
      },
      glyph: 'timeline',
      active: isDesktopShell
        ? desktopOpen.resume
        : activeApps.resume || isPathActive('/apps/resume'),
    },
    {
      id: 'network',
      label: 'System Map',
      shortLabel: 'Map',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('network');
          return;
        }
        window.location.href =
          window.location.pathname === '/apps/network' ? '/desktop' : '/apps/network';
      },
      glyph: 'network',
      active: isDesktopShell ? desktopOpen.network : isPathActive('/apps/network'),
    },
    {
      id: 'links',
      label: 'Connect',
      shortLabel: 'Connect',
      onClick: handleConnectClick,
      glyph: 'contact',
      active: showConnectMenu,
      utility: true,
    },
    {
      id: 'terminal',
      label: 'Agents',
      shortLabel: 'Agents',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('terminal');
          return;
        }
        const path = window.location.pathname;
        const isTerminal = path === '/apps/terminal' || path === '/apps/terminal/';
        window.location.href = isTerminal ? '/desktop' : '/apps/terminal';
      },
      glyph: 'agents',
      active: isDesktopShell
        ? desktopOpen.terminal
        : activeApps.terminal || isPathActive('/apps/terminal'),
    },
  ];

  return (
    <>
      <nav
        ref={dockNavRef}
        aria-label="Dock"
        data-desktop-surface="dock"
        className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 z-50"
      >
        <div
          data-desktop-surface="dock"
          className="rounded-xl border border-white/15 bg-[#111113] p-1"
        >
          <div className="flex items-stretch">
            {icons.map((item) => (
              <div
                key={item.id}
                ref={item.id === 'links' ? connectMenuRef : undefined}
                className={`relative ${item.utility ? 'ml-1 border-l border-white/14 pl-1' : ''}`}
              >
                <button
                  onClick={() => {
                    item.onClick();
                  }}
                  aria-label={item.label}
                  aria-haspopup={item.id === 'links' ? 'dialog' : undefined}
                  aria-expanded={item.id === 'links' ? showConnectMenu : undefined}
                  aria-controls={item.id === 'links' ? 'dock-connect-menu' : undefined}
                  aria-pressed={item.active}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={`group relative flex h-14 min-w-[66px] flex-col items-center justify-center gap-1 rounded-lg px-2 transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300 ${
                    item.active
                      ? 'bg-white/[0.06] text-sky-200 after:absolute after:inset-x-2 after:bottom-0 after:h-px after:bg-sky-300'
                      : 'text-white/64 hover:bg-white/[0.035] hover:text-white'
                  }`}
                >
                  <DockGlyph
                    name={item.glyph}
                    className="h-[22px] w-[22px] transition-transform duration-150 group-active:scale-95"
                  />
                  <span className="font-mono text-[10px] font-medium uppercase leading-none tracking-[0.06em]">
                    {item.shortLabel}
                  </span>
                </button>
                {item.id === 'links' && showConnectMenu && <ConnectMenu />}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default DesktopDock;
