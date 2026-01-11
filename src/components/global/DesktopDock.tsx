import { useState, useEffect, useRef } from 'react';
import { BsGithub, BsFilePdf, BsStickyFill, BsLinkedin, BsCalendar } from 'react-icons/bs';
import { IoIosCall, IoIosMail } from 'react-icons/io';
import { FaLink } from 'react-icons/fa';
import { userConfig } from '../../config/index';

interface DesktopDockProps {
  onTerminalClick: () => void;
  onNotesClick: () => void;
  onGitHubClick: () => void;
  onContactClick: () => void;
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
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  active: boolean;
};

const DesktopDock = ({ onTerminalClick, onNotesClick, onGitHubClick, onContactClick, activeApps }: DesktopDockProps) => {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [showLinksPopup, setShowLinksPopup] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const linksPopupRef = useRef<HTMLDivElement>(null);

  const handleLinksClick = () => {
    setShowLinksPopup(!showLinksPopup);
  };

  const handleCalendarClick = () => {
    window.open(userConfig.contact.calendly, '_blank');
  };

  // Email is handled via Contact widget now; direct mail link remains in Links popup

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
        <a
          href={userConfig.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <BsLinkedin size={20} />
          <span>LinkedIn</span>
        </a>
        <a
          href={userConfig.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <BsGithub size={20} />
          <span>GitHub</span>
        </a>
        <a
          href={`mailto:${userConfig.contact.email}`}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <IoIosMail size={20} />
          <span>Email</span>
        </a>
        <a
          href={`tel:${userConfig.contact.phone}`}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <IoIosCall size={20} />
          <span>Call</span>
        </a>
      </div>
    </div>
  );

  const icons: DockItem[] = [
    { id: 'github', label: 'Projects', onClick: onGitHubClick, icon: BsGithub, color: 'from-slate-900 to-slate-700', active: activeApps.github },
    { id: 'notes', label: 'Notes', onClick: onNotesClick, icon: BsStickyFill, color: 'from-amber-500 to-yellow-300', active: activeApps.notes },
    { id: 'resume', label: 'Resume', onClick: () => { window.location.href = '/apps/resume'; }, icon: BsFilePdf, color: 'from-rose-600 to-rose-400', active: activeApps.resume },
    { id: 'calendar', label: 'Schedule a Call', onClick: handleCalendarClick, icon: BsCalendar, color: 'from-blue-600 to-sky-400', active: false },
    { id: 'email', label: 'Contact', onClick: onContactClick, icon: IoIosMail, color: 'from-sky-600 to-sky-400', active: false },
    { id: 'links', label: 'Links', onClick: handleLinksClick, icon: FaLink, color: 'from-indigo-500 to-indigo-300', active: false },
    { id: 'terminal', label: 'iTerm', onClick: onTerminalClick, color: 'from-slate-950 to-slate-800', active: activeApps.terminal },
  ];

  return (
    <>
      <nav aria-label="Dock" className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 z-50">
        <div ref={dockRef} className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] border border-white/10">
          <div className="flex space-x-2" role="menubar">
            {icons.map((item, index) => {
              const scale = calculateScale(index, icons.length);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  aria-label={item.label}
                  aria-haspopup={item.id === 'links' ? 'menu' : undefined}
                  aria-expanded={item.id === 'links' ? showLinksPopup : undefined}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.onClick(); } }}
                  onMouseEnter={() => setHoveredIcon(item.id)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className="relative group"
                  style={{ transform: `scale(${scale})`, transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                  <div
                    className={`relative w-12 h-12 rounded-[14px] bg-gradient-to-b ${item.color} flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.35)] overflow-hidden active:scale-95 ${item.active ? 'ring-2 ring-white/50' : ''}`}
                  >
                    <span className="absolute inset-x-1 top-1 h-4 rounded-full bg-white/25 blur-[1px]" aria-hidden="true" />
                    {Icon ? (
                      <Icon size={item.id === 'email' ? 36 : item.id === 'calendar' || item.id === 'links' ? 28 : 32} className="text-white drop-shadow-sm" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-green-400">
                        <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-black/80 to-purple-950/70 border border-white/10 flex items-center justify-center">
                          <span className="text-lg font-semibold leading-none">$</span>
                          <span className="ml-0.5 h-5 w-1 bg-green-400/80" />
                        </div>
                      </div>
                    )}
                    {item.active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" aria-hidden="true" />}
                  </div>
                  {hoveredIcon === item.id && <Tooltip text={item.label} />}
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
