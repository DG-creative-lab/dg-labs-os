import { useEffect, useState } from 'react';
import { dispatchHomeBrowserState, onHomeBrowserToggle } from '../../services/homeBrowserEvents';
import type { ActiveProfileRuntime } from '../../profiles';
import CreativeBrowserWindow from './CreativeBrowserWindow';

export default function HomeDesktop({ profile }: { profile: ActiveProfileRuntime }) {
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

  return isBrowserOpen ? (
    <CreativeBrowserWindow profile={profile} onClose={() => setIsBrowserOpen(false)} />
  ) : null;
}
