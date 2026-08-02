import { useState, useEffect, useRef } from 'react';
import { MdWifi } from 'react-icons/md';
import { IoBatteryHalfOutline, IoCellular } from 'react-icons/io5';
import { VscVscode } from 'react-icons/vsc';
import {
  dispatchDesktopToggleWindow,
  onDesktopAppFocus,
  onDesktopState,
} from '../../services/desktopEvents';
import { clearDesktopReady, markDesktopReady } from '../../services/desktopReady';
import { copyTextWithFallback } from '../../services/clipboardService';
import { getAppCloseDestination } from '../../services/appOpenHandlers';
import type { ActiveProfileRuntime } from '../../profiles';
import {
  buildDesktopMenuModel,
  type MenuItem,
  type ToolbarAppId,
} from '../../services/desktopMenuModel';
import AboutDGWindow from './AboutDGWindow';
import HelpGuideWindow, { type HelpTopic } from './HelpGuideWindow';

interface MacToolbarProps {
  profile: ActiveProfileRuntime;
  platformMode?: boolean;
  onOpenContact?: () => void;
  activeAppId?: ToolbarAppId;
}

export default function MacToolbar({
  profile,
  platformMode = false,
  onOpenContact,
  activeAppId = 'home',
}: MacToolbarProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const [focusedAppId, setFocusedAppId] = useState<ToolbarAppId | null>(null);
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

  const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

  const closeApp = (appId: Exclude<ToolbarAppId, 'home'>) => {
    const path = normalizePath(window.location.pathname);
    if (path === '/desktop') {
      dispatchDesktopToggleWindow(window, appId);
      return;
    }

    window.location.href = getAppCloseDestination(path);
  };

  const resolvedAppId = focusedAppId ?? activeAppId;

  const { appMenuLabelMap, appMenuItemsMap, menus, menuOrder } = buildDesktopMenuModel({
    profile,
    platformMode,
    resolvedAppId,
    onOpenContact,
    onOpenAbout: () => setShowAbout(true),
    onOpenHelp: setHelpTopic,
    onCloseApp: closeApp,
    onCopyText: (text, label) => {
      void copyText(text, label);
    },
  });

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
              aria-label="DG-Labs system menu"
            >
              <span
                aria-hidden="true"
                className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-white/10 bg-white/5 text-[9px] font-semibold tracking-[-0.06em] text-white/95"
              >
                DG
              </span>
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
        profile={profile}
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        onMoreInfo={() => {
          window.location.href = `/@${profile.handle}/writing`;
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
