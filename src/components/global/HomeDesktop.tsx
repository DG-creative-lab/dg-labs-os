import { useEffect, useState } from 'react';
import { dispatchHomeBrowserState, onHomeBrowserToggle } from '../../services/homeBrowserEvents';
import CreativeBrowserWindow from './CreativeBrowserWindow';

export default function HomeDesktop() {
  const [isBrowserOpen, setIsBrowserOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onHomeBrowserToggle(window, () => {
      setIsBrowserOpen((current) => !current);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    dispatchHomeBrowserState(window, isBrowserOpen);
  }, [isBrowserOpen]);

  return isBrowserOpen ? <CreativeBrowserWindow onClose={() => setIsBrowserOpen(false)} /> : null;
}
