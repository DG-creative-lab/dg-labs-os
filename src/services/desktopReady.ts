export type DesktopReadyPart = 'workspace' | 'toolbar' | 'dock';

declare global {
  interface Window {
    __dgDesktopReadyState?: Partial<Record<DesktopReadyPart, boolean>>;
  }
}

const READY_PARTS: DesktopReadyPart[] = ['workspace', 'toolbar', 'dock'];

const updateDocumentFlag = (target: Window) => {
  const state = target.__dgDesktopReadyState ?? {};
  const isReady = READY_PARTS.every((part) => state[part]);
  if (isReady) {
    target.document.documentElement.dataset.desktopReady = 'true';
    return;
  }
  delete target.document.documentElement.dataset.desktopReady;
};

export const markDesktopReady = (target: Window, part: DesktopReadyPart) => {
  target.__dgDesktopReadyState = {
    ...(target.__dgDesktopReadyState ?? {}),
    [part]: true,
  };
  updateDocumentFlag(target);
};

export const clearDesktopReady = (target: Window, part: DesktopReadyPart) => {
  target.__dgDesktopReadyState = {
    ...(target.__dgDesktopReadyState ?? {}),
    [part]: false,
  };
  updateDocumentFlag(target);
};
