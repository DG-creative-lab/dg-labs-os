import { useState, useEffect, useRef } from 'react';
import { MdWifi } from 'react-icons/md';
import { FaApple, FaGithub, FaLinkedin, FaEnvelope, FaWindowRestore } from 'react-icons/fa';
import {
  IoBatteryHalfOutline,
  IoCellular,
  IoDocumentText,
  IoCodeSlash,
  IoMail,
  IoCall,
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
}

export default function MacToolbar({
  onOpenContact,
}: MacToolbarProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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

    return `${weekday} ${month} ${day} ${hour.replace(
      /\s?[AP]M/,
      ''
    )}:${minute} ${period}`;
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

  const menus: Record<string, MenuItem[]> = {
    Apple: [
      {
        label: 'About DG-Labs Pro',
        icon: <FaWindowRestore size={16} />,
        action: () => setShowAbout(true),
      },
      {
        label: 'System Settings...',
        icon: <IoDocumentText size={16} />,
        action: () => { window.location.href = '/apps/notes'; },
      },
    ],
    File: [
      {
        label: 'Resume',
        icon: <IoDocumentText size={16} />,
        action: () => { window.location.href = '/apps/resume'; },
      },
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => { window.location.href = '/apps/projects'; },
      },
      {
        label: 'Admin Dashboard',
        icon: <FaWindowRestore size={16} />,
        action: () => { window.location.href = '/admin'; },
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
      {
        label: 'Copy Phone',
        icon: <IoCall size={16} />,
        action: () => {
          navigator.clipboard.writeText(userConfig.contact.phone);
          alert('Phone number copied to clipboard!');
        },
      },
    ],
    View: [
      {
        label: 'Projects',
        icon: <IoCodeSlash size={16} />,
        action: () => { window.location.href = '/apps/projects'; },
      },
      {
        label: 'Notes',
        icon: <IoDocumentText size={16} />,
        action: () => { window.location.href = '/apps/notes'; },
      },
      {
        label: 'Terminal',
        icon: <IoHelpCircle size={16} />,
        action: () => { window.location.href = '/apps/terminal'; },
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
        label: 'Email',
        icon: <FaEnvelope size={16} />,
        action: () => { window.location.href = `mailto:${userConfig.contact.email}`; },
      },
      {
        label: 'Schedule a Call',
        icon: <IoCall size={16} />,
        action: () => window.open(userConfig.contact.calendly, '_blank'),
      },
    ],
    Window: [
      {
        label: 'Contact...',
        icon: <IoMail size={16} />,
        action: () => onOpenContact ? onOpenContact() : (window.location.href = '/#contact'),
      },
    ],
    Help: [
      {
        label: 'Keyboard Shortcuts',
        icon: <IoHelpCircle size={16} />,
        action: () => {},
      },
    ],
  };

  const menuOrder = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

  const renderMenu = (menuItems: MenuItem[]) => (
    <div className="absolute top-full left-0 mt-1 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl py-1 min-w-[200px]" role="menu">
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
            <div className="absolute left-full top-0 ml-1 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl py-1 min-w-[200px]" role="menu">
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
      <div className='sticky top-0 z-50 md:hidden bg-transparent text-white h-12 px-8 flex items-center justify-between text-base font-medium'>
        <span className='font-semibold'>
          {formatIPhoneTime(currentDateTime)}
        </span>
        <div className='flex items-center gap-1.5'>
          <IoCellular size={20} />
          <MdWifi size={20} />
          <IoBatteryHalfOutline size={24} />
        </div>
      </div>

      <div className='sticky top-0 z-50 hidden md:flex bg-black/20 backdrop-blur-md text-white h-6 px-4 items-center justify-between text-sm' role="menubar" aria-label="Application menu bar">
        <div className='flex items-center space-x-4' ref={menuRef}>
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
            {activeMenu === 'Apple' && (
              <div id="menu-Apple">
                {renderMenu(menus.Apple)}
              </div>
            )}
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
              {activeMenu === menu && (
                <div id={`menu-${menu}`}>
                  {renderMenu(menus[menu])}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className='flex items-center space-x-4'>
          <VscVscode
            size={16}
            className='cursor-pointer hover:opacity-80 transition-opacity'
            onClick={handleVSCodeClick}
            title='Open in VSCode'
          />
          <MdWifi size={16} />
          <span className='cursor-default'>
            {formatMacDate(currentDateTime)}
          </span>
        </div>
      </div>
      <AboutDGWindow
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        onMoreInfo={() => { window.location.href = '/apps/notes'; }}
      />
    </>
  );
}
