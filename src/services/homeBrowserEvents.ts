const HOME_BROWSER_TOGGLE_EVENT = 'dg-home-browser-toggle';
const HOME_BROWSER_STATE_EVENT = 'dg-home-browser-state';

type HomeBrowserStateDetail = {
  open: boolean;
};

export const dispatchHomeBrowserToggle = (target: Window) => {
  target.dispatchEvent(new CustomEvent(HOME_BROWSER_TOGGLE_EVENT));
};

export const dispatchHomeBrowserState = (target: Window, open: boolean) => {
  target.dispatchEvent(
    new CustomEvent<HomeBrowserStateDetail>(HOME_BROWSER_STATE_EVENT, {
      detail: { open },
    })
  );
};

export const onHomeBrowserToggle = (target: Window, handler: () => void) => {
  target.addEventListener(HOME_BROWSER_TOGGLE_EVENT, handler);
  return () => target.removeEventListener(HOME_BROWSER_TOGGLE_EVENT, handler);
};

export const onHomeBrowserState = (
  target: Window,
  handler: (detail: HomeBrowserStateDetail) => void
) => {
  const listener = (event: Event) => {
    handler((event as CustomEvent<HomeBrowserStateDetail>).detail);
  };
  target.addEventListener(HOME_BROWSER_STATE_EVENT, listener);
  return () => target.removeEventListener(HOME_BROWSER_STATE_EVENT, listener);
};
