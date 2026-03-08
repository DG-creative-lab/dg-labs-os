import { useMemo, type ReactNode } from 'react';
import DraggableWindow, { getWindowBounds } from './DraggableWindow';

interface DraggableAppWindowProps {
  title: string;
  appId?: 'home' | 'terminal' | 'network' | 'projects' | 'notes' | 'resume' | 'news';
  onClose?: () => void;
  closeHref?: string;
  initialSize?: { width: number; height: number };
  initialPosition?: { x: number; y: number };
  className?: string;
  contentClassName?: string;
  isFocused?: boolean;
  children: ReactNode;
}

export default function DraggableAppWindow({
  title,
  appId,
  onClose,
  closeHref = '/desktop',
  initialSize = { width: 980, height: 680 },
  initialPosition = { x: 80, y: 80 },
  className = '',
  contentClassName = 'h-full overflow-auto no-scrollbar p-4 text-white',
  isFocused = true,
  children,
}: DraggableAppWindowProps) {
  const openingGeometry = useMemo(
    () => getWindowBounds(initialPosition, initialSize, true),
    [initialPosition, initialSize]
  );

  return (
    <DraggableWindow
      title={title}
      appId={appId}
      onClose={
        onClose ??
        (() => {
          window.location.href = closeHref;
        })
      }
      initialSize={openingGeometry.size}
      initialPosition={openingGeometry.position}
      centerOnMount={false}
      isFocused={isFocused}
      className={className}
    >
      <div className={contentClassName}>{children}</div>
    </DraggableWindow>
  );
}
