import CreativeMachineMonitor from './CreativeMachineMonitor';
import DraggableWindow from './DraggableWindow';
import type { ActiveProfileRuntime } from '../../profiles';
import PlatformHome from './PlatformHome';

type CreativeBrowserWindowProps = {
  profile: ActiveProfileRuntime;
  profiles: readonly ActiveProfileRuntime[];
  surface: 'platform' | 'profile';
  onClose: () => void;
};

export default function CreativeBrowserWindow({
  profile,
  profiles,
  surface,
  onClose,
}: CreativeBrowserWindowProps) {
  const isPlatform = surface === 'platform';
  const tabTitle = isPlatform ? 'DG-OS / Public Profiles' : 'Creative Machine Monitor';
  const address = isPlatform ? 'dg-os.com / profiles' : `dg-os.com / @${profile.handle} / cortex`;

  return (
    <DraggableWindow
      title="DG-OS Browser"
      onClose={onClose}
      initialSize={{ width: 1320, height: 720 }}
      initialPosition={{ x: 60, y: 60 }}
      centerOnMount
      hideHeader
      viewportFit={{ widthRatio: 0.94, heightRatio: 0.96 }}
      className="bg-[#090b0f]"
    >
      <div className="flex h-full min-h-0 flex-col bg-[#090b0f]">
        <div className="window-header shrink-0 border-b border-white/10 bg-[#171719]">
          <div className="flex h-9 items-end gap-3 px-3">
            <div className="flex h-full items-center gap-2 pr-1">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close browser"
                className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Hide browser"
                className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              />
              <span
                className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/20"
                aria-hidden="true"
              />
            </div>

            <div className="flex h-8 min-w-0 w-64 items-center gap-2 rounded-t-lg border border-b-0 border-white/10 bg-[#242427] px-3 text-[11px] text-white/72">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/15 font-mono text-[8px] text-sky-200">
                DG
              </span>
              <span className="truncate">{tabTitle}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${tabTitle} tab`}
                className="ml-auto text-base leading-none text-white/35 transition hover:text-white/75 focus-visible:outline-none focus-visible:text-white"
              >
                ×
              </button>
            </div>

            <span className="pb-2 text-base leading-none text-white/34" aria-hidden="true">
              +
            </span>
          </div>

          <div className="flex h-10 items-center gap-2 bg-[#242427] px-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isPlatform}
                onClick={() => {
                  window.location.href = '/';
                }}
                aria-label={isPlatform ? 'Back unavailable' : 'Back to DG-OS home'}
                title={isPlatform ? 'Already at DG-OS home' : 'Back to DG-OS home'}
                className="grid h-7 w-7 place-items-center rounded-md text-white/48 transition hover:bg-white/[0.05] hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300 disabled:cursor-default disabled:text-white/18 disabled:hover:bg-transparent"
              >
                ←
              </button>
              <span className="grid h-7 w-7 place-items-center text-white/18" aria-hidden="true">
                →
              </span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              aria-label={`Reload ${tabTitle}`}
              className="grid h-7 w-7 place-items-center rounded-md text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white/75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300"
            >
              ↻
            </button>
            <div
              className="flex h-7 min-w-0 flex-1 items-center rounded-md border border-white/10 bg-[#111113] px-3 font-mono text-[10px] text-white/55"
              aria-label="Browser address"
            >
              <span className="mr-2 text-sky-300" aria-hidden="true">
                ◇
              </span>
              <span className="truncate">{address}</span>
            </div>
            <div className="hidden items-center gap-2 font-mono text-[8px] tracking-[0.12em] text-white/30 uppercase sm:flex">
              <span>{isPlatform ? `${profiles.length} profile live` : 'Private sources off'}</span>
              <span className="h-1.5 w-1.5 bg-emerald-300/80" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-[#070b12]">
          {isPlatform ? (
            <PlatformHome profiles={profiles} embedded />
          ) : (
            <CreativeMachineMonitor profile={profile} embedded />
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
