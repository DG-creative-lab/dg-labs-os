import { useState, useRef, useEffect, useId, useLayoutEffect } from 'react';
import { dispatchDesktopAppFocus } from '../../services/desktopEvents';

// Global z-index counter
let globalZIndex = 10;

// Minimum window dimensions
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const TOP_INSET = 56;
const SIDE_INSET = 8;
const DEFAULT_BOTTOM_INSET = 118; // Keep windows clear of desktop dock.

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
const getBottomInset = () => {
  if (typeof window === 'undefined') return DEFAULT_BOTTOM_INSET;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--dg-dock-safe-bottom')
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BOTTOM_INSET;
};

const getWindowBounds = (
  initialPosition: { x: number; y: number },
  initialSize: { width: number; height: number },
  centerOnMount: boolean
) => {
  if (typeof window === 'undefined') {
    return { position: initialPosition, size: initialSize };
  }

  const bottomInset = getBottomInset();
  const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - SIDE_INSET * 2);
  const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - TOP_INSET - bottomInset);
  const width = clamp(initialSize.width, MIN_WIDTH, maxWidth);
  const height = clamp(initialSize.height, MIN_HEIGHT, maxHeight);

  if (!centerOnMount || window.innerWidth < 768) {
    const maxX = Math.max(SIDE_INSET, window.innerWidth - width - SIDE_INSET);
    const maxY = Math.max(TOP_INSET, window.innerHeight - bottomInset - height);
    return {
      size: { width, height },
      position: {
        x: clamp(initialPosition.x, SIDE_INSET, maxX),
        y: clamp(initialPosition.y, TOP_INSET, maxY),
      },
    };
  }

  return {
    size: { width, height },
    position: {
      x: clamp(
        Math.round((window.innerWidth - width) / 2),
        SIDE_INSET,
        Math.max(SIDE_INSET, window.innerWidth - width - SIDE_INSET)
      ),
      y: clamp(
        Math.round((window.innerHeight - TOP_INSET - bottomInset - height) / 2) + TOP_INSET,
        TOP_INSET,
        Math.max(TOP_INSET, window.innerHeight - bottomInset - height)
      ),
    },
  };
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface DraggableWindowProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  appId?: 'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news';
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  className?: string;
  showTitle?: boolean;
  hideHeader?: boolean;
  centerOnMount?: boolean;
  isFocused?: boolean;
}

export default function DraggableWindow({
  title,
  onClose,
  children,
  appId,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 400, height: 300 },
  className = '',
  showTitle = true,
  hideHeader = false,
  centerOnMount = false,
  isFocused = true,
}: DraggableWindowProps) {
  const titleId = useId();
  const [position, setPosition] = useState(
    () => getWindowBounds(initialPosition, initialSize, centerOnMount).position
  );
  const [size, setSize] = useState(
    () => getWindowBounds(initialPosition, initialSize, centerOnMount).size
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<
    'bottom' | 'right' | 'bottom-right' | 'left' | 'bottom-left' | null
  >(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(globalZIndex);
  const [isMobile, setIsMobile] = useState(false);
  const hasAppliedInitialCenterRef = useRef(false);
  const windowRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!centerOnMount) return;
    if (window.innerWidth < 768) return;
    const bounds = getWindowBounds(initialPosition, initialSize, true);
    setSize(bounds.size);
    setPosition(bounds.position);
    hasAppliedInitialCenterRef.current = true;
  }, [centerOnMount, initialPosition, initialSize]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply centered geometry once on desktop mount. Do not keep reapplying on
  // every parent render or the window will snap back after manual resizing.
  useEffect(() => {
    if (isMobile || !centerOnMount || hasAppliedInitialCenterRef.current) return;
    const bounds = getWindowBounds(initialPosition, initialSize, centerOnMount);
    setSize(bounds.size);
    setPosition(bounds.position);
    hasAppliedInitialCenterRef.current = true;
  }, [centerOnMount, initialPosition, initialSize, isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    hasAppliedInitialCenterRef.current = false;
  }, [isMobile]);

  // Keep existing windows visible if viewport size changes.
  useEffect(() => {
    if (isMobile) return;
    const clampInViewport = () => {
      const bottomInset = getBottomInset();
      setSize((prev) => {
        const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - SIDE_INSET * 2);
        const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - TOP_INSET - bottomInset);
        const width = clamp(prev.width, MIN_WIDTH, maxWidth);
        const height = clamp(prev.height, MIN_HEIGHT, maxHeight);
        return width === prev.width && height === prev.height ? prev : { width, height };
      });
      setPosition((prev) => {
        const maxX = Math.max(SIDE_INSET, window.innerWidth - size.width - SIDE_INSET);
        const maxY = Math.max(TOP_INSET, window.innerHeight - bottomInset - size.height);
        const x = clamp(prev.x, SIDE_INSET, maxX);
        const y = clamp(prev.y, TOP_INSET, maxY);
        return x === prev.x && y === prev.y ? prev : { x, y };
      });
    };
    window.addEventListener('resize', clampInViewport);
    clampInViewport();
    return () => window.removeEventListener('resize', clampInViewport);
  }, [isMobile, size.width, size.height]);

  const bringToFront = () => {
    globalZIndex += 1;
    setZIndex(globalZIndex);
    if (appId && typeof window !== 'undefined') {
      dispatchDesktopAppFocus(window, appId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;

    if (e.target instanceof HTMLElement) {
      bringToFront();

      if (e.target.closest('.window-header')) {
        // Keep header controls (close/minimize etc.) clickable; only drag from empty header space.
        if (e.target.closest('button, a, input, textarea, select, [role="button"]')) {
          return;
        }
        setIsDragging(true);
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
          setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
        e.preventDefault();
      } else if (e.target.closest('.resize-handle')) {
        setIsResizing(true);
        setResizeDirection(
          e.target.getAttribute('data-direction') as
            | 'bottom'
            | 'right'
            | 'bottom-right'
            | 'left'
            | 'bottom-left'
        );
        e.preventDefault();
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isMobile) return;

    if (isDragging) {
      const bottomInset = getBottomInset();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const windowWidth = windowRef.current?.offsetWidth || 0;
      const windowHeight = windowRef.current?.offsetHeight || 0;

      const maxX = Math.max(SIDE_INSET, window.innerWidth - windowWidth - SIDE_INSET);
      const maxY = Math.max(TOP_INSET, window.innerHeight - bottomInset - windowHeight);

      setPosition({
        x: clamp(newX, SIDE_INSET, maxX),
        y: clamp(newY, TOP_INSET, maxY),
      });
    } else if (isResizing) {
      const bottomInset = getBottomInset();
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        const newSize = { ...size };
        const newPosition = { ...position };
        const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - newPosition.x - SIDE_INSET);
        const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - bottomInset - newPosition.y);

        if (resizeDirection?.includes('right')) {
          newSize.width = clamp(e.clientX - rect.left, MIN_WIDTH, maxWidth);
        }

        if (resizeDirection?.includes('left')) {
          const boundedLeft = clamp(e.clientX, SIDE_INSET, rect.right - MIN_WIDTH);
          const newWidth = Math.max(MIN_WIDTH, rect.right - boundedLeft);
          newSize.width = newWidth;
          newPosition.x = clamp(rect.right - newWidth, SIDE_INSET, rect.right - MIN_WIDTH);
        }

        if (resizeDirection?.includes('bottom')) {
          newSize.height = clamp(e.clientY - rect.top, MIN_HEIGHT, maxHeight);
        }

        if (resizeDirection?.includes('bottom-left')) {
          const boundedLeft = clamp(e.clientX, SIDE_INSET, rect.right - MIN_WIDTH);
          const newWidth = Math.max(MIN_WIDTH, rect.right - boundedLeft);
          newSize.width = newWidth;
          newPosition.x = clamp(rect.right - newWidth, SIDE_INSET, rect.right - MIN_WIDTH);
          newSize.height = clamp(e.clientY - rect.top, MIN_HEIGHT, maxHeight);
        }

        setSize(newSize);
        setPosition(newPosition);
      }
    }
  };

  const handleMouseUp = () => {
    if (isMobile) return;
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  useEffect(() => {
    bringToFront();
    if (isMobile) return;

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, resizeDirection, dragOffset, isMobile]);

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-desktop-surface="window"
      className={`${
        isMobile ? 'fixed inset-0 m-4 rounded-xl' : 'fixed rounded-xl'
      } overflow-hidden border p-0 ${
        isFocused
          ? 'border-white/12 bg-[#1d1d1f] shadow-[0_24px_60px_rgba(0,0,0,0.42)]'
          : 'border-white/8 bg-[#1a1a1c]/96 shadow-[0_16px_38px_rgba(0,0,0,0.28)]'
      } ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      } outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${className}`}
      style={{
        ...(isMobile
          ? {}
          : {
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
            }),
        zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {!hideHeader && (
        <div
          className={`window-header h-6 flex items-center space-x-2 px-4 rounded-t-xl sticky top-0 left-0 right-0 z-10 ${
            isFocused ? 'bg-slate-800 text-gray-300' : 'bg-slate-900/90 text-gray-400'
          }`}
        >
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            title="Close"
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          {showTitle && (
            <span
              id={titleId}
              className={`text-sm flex-grow text-center font-semibold ${
                isFocused ? 'text-gray-300' : 'text-gray-400'
              }`}
            >
              {title}
            </span>
          )}
        </div>
      )}
      <div className="relative h-[calc(100%-1.5rem)]">
        {children}
        {!isMobile && (
          <>
            <div
              className="resize-handle absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize z-20"
              data-direction="bottom"
            />
            <div
              className="resize-handle absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize z-20"
              data-direction="right"
            />
            <div
              className="resize-handle absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-20"
              data-direction="left"
            />
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20"
              data-direction="bottom-right"
            />
            <div
              className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-20"
              data-direction="bottom-left"
            />
          </>
        )}
      </div>
    </div>
  );
}
