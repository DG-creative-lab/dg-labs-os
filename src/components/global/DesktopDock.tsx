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
  onClick: () => void;
  glyph: React.ComponentProps<typeof DockGlyph>['name'];
  glyphClassName?: string;
  color: string;
  active: boolean;
};

const DesktopDock = ({ activeApps }: DesktopDockProps) => {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [showLinksPopup, setShowLinksPopup] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [desktopOpen, setDesktopOpen] = useState({
    terminal: false,
    notes: false,
    projects: false,
    resume: false,
    news: false,
    network: false,
  });
  const dockRef = useRef<HTMLDivElement>(null);
  const dockNavRef = useRef<HTMLElement>(null);
  const linksPopupRef = useRef<HTMLDivElement>(null);

  const handleLinksClick = () => {
    setShowLinksPopup(!showLinksPopup);
  };

  const normalizedPath =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/';
  const isDesktopShell = normalizedPath === '/desktop';
  const isPathActive = (...paths: string[]) =>
    paths.some((path) => {
      const normalized = path.replace(/\/+$/, '') || '/';
      return normalized === normalizedPath;
    });

  const toggleDesktopWindow = (
    appId: 'terminal' | 'notes' | 'projects' | 'resume' | 'news' | 'network'
  ) => {
    dispatchDesktopToggleWindow(window, appId);
  };

  const getLinkGlyph = (id: string): React.ComponentProps<typeof DockGlyph>['name'] => {
    if (id.includes('linkedin')) return 'network';
    if (id.includes('github')) return 'workbench';
    if (id === 'email' || id === 'call') return 'contact';
    return 'links';
  };

  useEffect(() => {
    markDesktopReady(window, 'dock');
    return () => clearDesktopReady(window, 'dock');
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (linksPopupRef.current && !linksPopupRef.current.contains(event.target as Node)) {
        setShowLinksPopup(false);
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        if (e.clientY >= rect.top - 50 && e.clientY <= rect.bottom + 50) {
          setMouseX(e.clientX);
        } else {
          setMouseX(null);
        }
      }
    };

    const handleMouseLeave = () => {
      setMouseX(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onDesktopState(window, ({ open }) => {
      if (!open) return;
      setDesktopOpen((prev) => ({
        terminal: open.terminal ?? prev.terminal,
        notes: open.notes ?? prev.notes,
        projects: open.projects ?? prev.projects,
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
    const onOpenLinks = () => setShowLinksPopup(true);
    const onCloseLinks = () => setShowLinksPopup(false);
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

  const calculateScale = (iconIndex: number, totalIcons: number) => {
    if (mouseX === null || !dockRef.current) return 1;
    const rect = dockRef.current.getBoundingClientRect();
    const iconWidth = rect.width / totalIcons;
    const iconCenter = rect.left + iconIndex * iconWidth + iconWidth / 2;
    const distance = Math.abs(mouseX - iconCenter);
    const maxDistance = iconWidth * 2;
    if (distance > maxDistance) return 1;
    const proximity = 1 - distance / maxDistance;
    return 1 + proximity * 0.4; // Scale up to 1.4x
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
      {text}
    </div>
  );

  const LinksPopup = () => (
    <div
      ref={linksPopupRef}
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800/90 w-30 backdrop-blur-sm rounded-lg p-4 shadow-xl"
    >
      <div className="grid grid-cols-1 gap-y-2">
        {dockLinks.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target={item.url.startsWith('http') ? '_blank' : undefined}
            rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <span className="h-5 w-5 text-gray-300">
              <DockGlyph name={getLinkGlyph(item.id)} className="h-5 w-5" />
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );

  const icons: DockItem[] = [
    {
      id: 'workbench',
      label: 'Workbench',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('projects');
          return;
        }
        window.location.href = '/apps/projects';
      },
      glyph: 'workbench',
      color: 'from-slate-900 to-slate-700',
      active: isDesktopShell
        ? desktopOpen.projects
        : activeApps.github || isPathActive('/apps/projects'),
    },
    {
      id: 'notes',
      label: 'Lab Notes',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('notes');
          return;
        }
        window.location.href = '/apps/notes';
      },
      glyph: 'notes',
      color: 'from-amber-500 to-yellow-300',
      active: isDesktopShell ? desktopOpen.notes : activeApps.notes || isPathActive('/apps/notes'),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('resume');
          return;
        }
        window.location.href = '/apps/resume';
      },
      glyph: 'timeline',
      color: 'from-rose-600 to-rose-400',
      active: isDesktopShell
        ? desktopOpen.resume
        : activeApps.resume || isPathActive('/apps/resume'),
    },
    {
      id: 'news',
      label: 'News Hub',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('news');
          return;
        }
        window.location.href = '/apps/news';
      },
      glyph: 'news',
      color: 'from-sky-600 to-indigo-700',
      active: isDesktopShell ? desktopOpen.news : isPathActive('/apps/news'),
    },
    {
      id: 'network',
      label: 'Network',
      onClick: () => {
        if (isDesktopShell) {
          toggleDesktopWindow('network');
          return;
        }
        window.location.href =
          window.location.pathname === '/apps/network' ? '/desktop' : '/apps/network';
      },
      glyph: 'network',
      color: 'from-indigo-600 to-fuchsia-700',
      active: isDesktopShell ? desktopOpen.network : isPathActive('/apps/network'),
    },
    {
      id: 'links',
      label: 'Links',
      onClick: handleLinksClick,
      glyph: 'links',
      color: 'from-slate-800 to-slate-600',
      active: showLinksPopup,
    },
    {
      id: 'terminal',
      label: 'Agents',
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
      glyphClassName: 'text-emerald-300',
      color: 'from-slate-950 to-slate-800',
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
          ref={dockRef}
          data-desktop-surface="dock"
          className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] border border-white/10"
        >
          <div className="flex space-x-2" role="menubar">
            {icons.map((item, index) => {
              const scale = calculateScale(index, icons.length);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setHoveredIcon(null);
                    item.onClick();
                  }}
                  aria-label={item.label}
                  aria-haspopup={item.id === 'links' ? 'menu' : undefined}
                  aria-expanded={item.id === 'links' ? showLinksPopup : undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  onMouseEnter={() => setHoveredIcon(item.id)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className="relative group outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  style={{
                    transform: `scale(${scale})`,
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <div
                    className={`relative w-12 h-12 rounded-[14px] bg-gradient-to-b ${item.color} flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.35)] overflow-hidden active:scale-95 ${item.active ? 'ring-2 ring-white/50' : ''}`}
                  >
                    <span
                      className="absolute inset-x-1 top-1 h-4 rounded-full bg-white/25 blur-[1px]"
                      aria-hidden="true"
                    />
                    <DockGlyph
                      name={item.glyph}
                      className={`h-8 w-8 drop-shadow-sm text-white ${item.glyphClassName ?? ''}`}
                    />
                    {item.active && (
                      <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {hoveredIcon === item.id && !showLinksPopup && <Tooltip text={item.label} />}
                  {item.id === 'links' && showLinksPopup && <LinksPopup />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default DesktopDock;
