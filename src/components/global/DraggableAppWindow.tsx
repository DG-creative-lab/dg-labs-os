import type { ReactNode } from 'react';
import DraggableWindow from './DraggableWindow';

interface DraggableAppWindowProps {
  title: string;
  closeHref?: string;
  initialSize?: { width: number; height: number };
  initialPosition?: { x: number; y: number };
  className?: string;
  children: ReactNode;
}

export default function DraggableAppWindow({
  title,
  closeHref = '/desktop',
  initialSize = { width: 980, height: 680 },
  initialPosition = { x: 80, y: 80 },
  className = '',
  children,
}: DraggableAppWindowProps) {
  return (
    <DraggableWindow
      title={title}
      onClose={() => {
        window.location.href = closeHref;
      }}
      initialSize={initialSize}
      initialPosition={initialPosition}
      centerOnMount={true}
      className={className}
    >
      <div className="h-full overflow-auto p-4 text-white">{children}</div>
    </DraggableWindow>
  );
}
