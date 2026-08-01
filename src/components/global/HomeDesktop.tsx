import { useEffect, useState } from 'react';
import { dispatchHomeBrowserState, onHomeBrowserToggle } from '../../services/homeBrowserEvents';
import type { ActiveProfileRuntime } from '../../profiles';
import CreativeBrowserWindow from './CreativeBrowserWindow';

type HomeDesktopProps = {
  profile: ActiveProfileRuntime;
  profiles?: readonly ActiveProfileRuntime[];
  surface?: 'platform' | 'profile';
};

export default function HomeDesktop({
  profile,
  profiles = [profile],
  surface = 'profile',
}: HomeDesktopProps) {
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
    <CreativeBrowserWindow
      profile={profile}
      profiles={profiles}
      surface={surface}
      onClose={() => setIsBrowserOpen(false)}
    />
  ) : null;
}
