import DraggableWindow from './DraggableWindow';

interface AboutDGWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMoreInfo: () => void;
}

export default function AboutDGWindow({ isOpen, onClose, onMoreInfo }: AboutDGWindowProps) {
  if (!isOpen) return null;

  return (
    <DraggableWindow
      title="About DG-Labs Pro"
      onClose={onClose}
      initialSize={{ width: 420, height: 560 }}
      className="bg-[#2b2b2c]"
      showTitle={false}
      centerOnMount={true}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 px-10 py-8 text-center text-white">
        <div className="w-44 h-28 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-inner flex items-center justify-center">
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-sky-500/20 to-slate-900/60 border border-white/10" />
        </div>
        <div>
          <h2 className="text-4xl font-semibold">DG-Labs Pro</h2>
          <p className="text-sm text-white/60">Human-grade workstation</p>
        </div>
        <div className="w-full space-y-2 text-left text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Chip</span>
            <span>Human Cortex X</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Memory</span>
            <span>~2.5 PB (est.)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Serial number</span>
            <span>HOMO-SAPIENS-300K</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">DG-Labs</span>
            <span>1.0</span>
          </div>
        </div>
        <button
          onClick={onMoreInfo}
          className="mt-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white shadow hover:bg-white/20 transition"
        >
          More Info...
        </button>
        <p className="mt-4 text-xs text-white/40">DG-Labs OS prototype interface.</p>
      </div>
    </DraggableWindow>
  );
}
