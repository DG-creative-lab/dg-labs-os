import { useEffect, useState } from 'react';
import type { ActiveProfileRuntime } from '../../profiles';

type MonitorMode = 'understand' | 'imagine' | 'build';

type CortexNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

const MODES: Record<
  MonitorMode,
  {
    index: string;
    label: string;
    command: string;
    description: string;
    input: string;
    process: string;
    output: string;
    activeNodes: readonly string[];
  }
> = {
  understand: {
    index: '01',
    label: 'Understand',
    command: 'trace --sources --uncertainty',
    description: 'Trace what is known, where it came from, and what remains uncertain.',
    input: 'evidence + experience',
    process: 'test assumptions',
    output: 'revised understanding',
    activeNodes: ['evidence', 'experience', 'question', 'revision', 'cortex'],
  },
  imagine: {
    index: '02',
    label: 'Imagine',
    command: 'associate --across-domains',
    description: 'Bring science, art, systems, and lived experience into contact.',
    input: 'distant ideas',
    process: 'form associations',
    output: 'possible worlds',
    activeNodes: ['experience', 'question', 'association', 'imagination', 'creation', 'cortex'],
  },
  build: {
    index: '03',
    label: 'Build',
    command: 'experiment --evaluate --publish',
    description: 'Turn a promising association into an experiment with evidence and boundaries.',
    input: 'chosen possibility',
    process: 'make + evaluate',
    output: 'inspectable system',
    activeNodes: ['evidence', 'association', 'experiment', 'revision', 'creation', 'cortex'],
  },
};

const MODE_ORDER = Object.keys(MODES) as MonitorMode[];

const CORTEX_NODES: readonly CortexNode[] = [
  { id: 'evidence', label: 'EVIDENCE', x: 88, y: 100 },
  { id: 'experience', label: 'EXPERIENCE', x: 82, y: 354 },
  { id: 'question', label: 'QUESTION', x: 236, y: 64 },
  { id: 'association', label: 'ASSOCIATION', x: 414, y: 96 },
  { id: 'imagination', label: 'IMAGINATION', x: 536, y: 212 },
  { id: 'experiment', label: 'EXPERIMENT', x: 464, y: 384 },
  { id: 'revision', label: 'REVISION', x: 264, y: 438 },
  { id: 'creation', label: 'CREATION', x: 102, y: 252 },
  { id: 'cortex', label: 'CREATIVE CORTEX', x: 310, y: 252 },
] as const;

const CORTEX_EDGES = [
  ['evidence', 'question'],
  ['experience', 'question'],
  ['question', 'association'],
  ['association', 'imagination'],
  ['imagination', 'experiment'],
  ['experiment', 'revision'],
  ['revision', 'evidence'],
  ['association', 'creation'],
  ['creation', 'experiment'],
  ['evidence', 'cortex'],
  ['experience', 'cortex'],
  ['question', 'cortex'],
  ['association', 'cortex'],
  ['imagination', 'cortex'],
  ['experiment', 'cortex'],
  ['revision', 'cortex'],
  ['creation', 'cortex'],
] as const;

const LOOP_STEPS = ['Observe', 'Connect', 'Question', 'Imagine', 'Build', 'Review'] as const;

const BOOT_LINES = [
  ['01', 'source boundary', 'enforced'],
  ['02', 'association engine', 'ready'],
  ['03', 'pattern substrate', 'human-authored'],
  ['04', 'human control', 'present'],
] as const;

const getNode = (id: string) => CORTEX_NODES.find((node) => node.id === id);

type CreativeMachineMonitorProps = {
  profile: ActiveProfileRuntime;
  embedded?: boolean;
};

export default function CreativeMachineMonitor({
  profile,
  embedded = false,
}: CreativeMachineMonitorProps) {
  const [mode, setMode] = useState<MonitorMode>('understand');
  const [bootLineCount, setBootLineCount] = useState(0);
  const [activeLoopStep, setActiveLoopStep] = useState(0);
  const activeMode = MODES[mode];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setBootLineCount(BOOT_LINES.length);
      return;
    }

    const timers = BOOT_LINES.map((_, index) =>
      window.setTimeout(() => setBootLineCount(index + 1), 260 + index * 190)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const timer = window.setInterval(
      () => setActiveLoopStep((current) => (current + 1) % LOOP_STEPS.length),
      1600
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const nextMode = MODE_ORDER[Number(event.key) - 1];
      if (nextMode) setMode(nextMode);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const activeNodeIds = new Set(activeMode.activeNodes);

  return (
    <section
      aria-labelledby="creative-machine-title"
      className={`creative-monitor h-full overflow-y-auto text-white ${
        embedded ? 'is-embedded' : ''
      }`}
    >
      <div
        className={`mx-auto flex min-h-full w-full max-w-[1600px] flex-col px-5 sm:px-8 lg:px-12 ${
          embedded ? 'pt-5 pb-7' : 'pt-8 pb-[var(--dg-dock-safe-bottom,7rem)]'
        } monitor-inner`}
      >
        <header className="monitor-header monitor-enter flex items-center justify-between gap-5 border-b border-white/14 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-1.5 w-1.5 shrink-0 bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.8)]" />
            <p className="truncate font-mono text-[9px] font-semibold tracking-[0.2em] text-sky-200 uppercase sm:text-[10px]">
              DG-OS / Creative Machine Monitor
            </p>
          </div>
          <dl className="monitor-status hidden items-center gap-7 font-mono text-[9px] uppercase lg:flex">
            <div className="flex gap-2">
              <dt className="text-white/35">State</dt>
              <dd className="text-white/75">Learning</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-white/35">Control</dt>
              <dd className="text-sky-200">Human present</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-white/35">Memory</dt>
              <dd className="text-white/75">Reviewed</dd>
            </div>
          </dl>
          <span className="monitor-live font-mono text-[9px] text-white/35 lg:hidden">
            LIVE / 00
          </span>
        </header>

        <div className="monitor-layout grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(480px,1.18fr)] lg:gap-10 xl:gap-16">
          <div className="monitor-copy monitor-enter monitor-enter-delay relative z-10 max-w-2xl">
            <p className="font-mono text-[9px] tracking-[0.18em] text-white/45 uppercase">
              Constructive intelligence / v0.1
            </p>
            <h1
              id="creative-machine-title"
              className="mt-4 max-w-[13ch] text-[clamp(2.8rem,5.2vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.055em]"
            >
              A human becoming a machine that can imagine.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
              {profile.identity.possessiveName} practice is becoming computational. Projects,
              readings, questions, decisions, and failures become traceable patterns, material that
              can be revisited, recombined, and used to build what comes next.
            </p>

            <div className="monitor-processes mt-8 border-t border-white/14">
              <p className="py-3 font-mono text-[9px] tracking-[0.16em] text-white/38 uppercase">
                One pattern substrate / select a process / keys 1-3
              </p>
              <div className="grid border-t border-white/10 sm:grid-cols-3">
                {MODE_ORDER.map((modeId) => {
                  const item = MODES[modeId];
                  const isActive = modeId === mode;
                  return (
                    <button
                      key={modeId}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setMode(modeId)}
                      className={`group flex min-h-14 items-center gap-3 border-b border-white/10 py-3 text-left transition sm:border-r sm:px-3 sm:last:border-r-0 ${
                        isActive
                          ? 'bg-sky-300/[0.08] text-white'
                          : 'text-white/45 hover:bg-white/[0.03] hover:text-white/75'
                      }`}
                    >
                      <span
                        className={`font-mono text-[9px] ${
                          isActive ? 'text-sky-300' : 'text-white/28'
                        }`}
                      >
                        {item.index}
                      </span>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="monitor-command mt-5 min-h-[7.5rem] border-l border-sky-300/45 pl-4"
              aria-live="polite"
            >
              <p className="font-mono text-[10px] text-sky-200">
                {profile.handle}@dg-os:~$ {activeMode.command}
              </p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/68">
                {activeMode.description}
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-3 font-mono text-[8px] uppercase sm:text-[9px]">
                <div>
                  <dt className="text-white/28">Input</dt>
                  <dd className="mt-1 text-white/58">{activeMode.input}</dd>
                </div>
                <div>
                  <dt className="text-white/28">Process</dt>
                  <dd className="mt-1 text-white/58">{activeMode.process}</dd>
                </div>
                <div>
                  <dt className="text-white/28">Output</dt>
                  <dd className="mt-1 text-white/58">{activeMode.output}</dd>
                </div>
              </dl>
            </div>
          </div>

          <figure className="monitor-figure monitor-enter monitor-enter-visual relative mx-auto w-full max-w-[760px]">
            <div className="flex items-center justify-between border-b border-white/12 pb-2 font-mono text-[8px] tracking-[0.15em] uppercase">
              <span className="text-white/35">Cortex / pattern field</span>
              <span className="text-sky-200">Mode: {activeMode.label}</span>
            </div>
            <div className="monitor-cortex-canvas relative aspect-[1.2/1] min-h-[300px] overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(125,211,252,0.08), transparent 47%)',
                }}
              />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 620 500"
                role="img"
                aria-labelledby="cortex-title cortex-description"
              >
                <title id="cortex-title">Creative cortex association map</title>
                <desc id="cortex-description">
                  A changing network linking evidence, experience, questions, associations,
                  imagination, experiments, revisions, and creation.
                </desc>

                <circle className="monitor-orbit" cx="310" cy="252" r="182" />
                <circle
                  className="monitor-orbit monitor-orbit-secondary"
                  cx="310"
                  cy="252"
                  r="118"
                />
                <path
                  className="monitor-scan"
                  d="M62 252 C155 188 220 316 310 252 S466 184 558 252"
                />

                {CORTEX_EDGES.map(([fromId, toId]) => {
                  const from = getNode(fromId);
                  const to = getNode(toId);
                  if (!from || !to) return null;
                  const isActive = activeNodeIds.has(fromId) && activeNodeIds.has(toId);
                  return (
                    <line
                      key={`${fromId}-${toId}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      className={`monitor-edge ${isActive ? 'is-active' : ''}`}
                    />
                  );
                })}

                {CORTEX_NODES.map((node, index) => {
                  const isActive = activeNodeIds.has(node.id);
                  const isCore = node.id === 'cortex';
                  return (
                    <g
                      key={node.id}
                      className={`monitor-node ${isActive ? 'is-active' : ''} ${
                        isCore ? 'is-core' : ''
                      }`}
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      {isActive ? (
                        <circle className="monitor-node-pulse" cx={node.x} cy={node.y} r="14" />
                      ) : null}
                      <circle
                        className="monitor-node-point"
                        cx={node.x}
                        cy={node.y}
                        r={isCore ? 8 : 4}
                      />
                      <text
                        className="monitor-node-label"
                        x={node.x}
                        y={node.y + (isCore ? 28 : 20)}
                        textAnchor="middle"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <figcaption className="grid grid-cols-2 border-t border-white/12 font-mono text-[8px] uppercase sm:grid-cols-4">
              {BOOT_LINES.map(([index, label, value], lineIndex) => (
                <div
                  key={index}
                  className={`border-b border-white/10 py-3 transition sm:border-r sm:px-3 sm:last:border-r-0 ${
                    lineIndex < bootLineCount ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="text-sky-300">{index}</span>
                  <p className="mt-1 text-white/35">{label}</p>
                  <p className="mt-0.5 text-white/68">{value}</p>
                </div>
              ))}
            </figcaption>
          </figure>
        </div>

        <footer className="monitor-footer monitor-enter monitor-enter-footer grid gap-5 border-t border-white/14 pt-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-[8px] tracking-[0.16em] text-white/35 uppercase">
              Constructive loop / continuous
            </p>
            <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
              {LOOP_STEPS.map((step, index) => (
                <li
                  key={step}
                  className={`flex items-center gap-2 font-mono text-[9px] uppercase transition ${
                    index === activeLoopStep ? 'text-sky-200' : 'text-white/38'
                  }`}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                  {index < LOOP_STEPS.length - 1 ? (
                    <span className="ml-1 text-white/18" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="mt-3 max-w-2xl text-[10px] leading-4 text-white/34">
              Conceptual lens:{' '}
              <a
                className="monitor-citation"
                href="https://www.gregegan.net/PERMUTATION/Permutation.html"
                target="_blank"
                rel="noreferrer"
              >
                Greg Egan’s <cite>Permutation City</cite>
              </a>
              . Pattern is a design metaphor; Dessi remains the author and reviewer.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs" aria-label="Monitor destinations">
            <a className="monitor-link" href="/desktop">
              Enter workspace <span aria-hidden="true">→</span>
            </a>
            <a className="monitor-link" href="/systems">
              Inspect evidence <span aria-hidden="true">→</span>
            </a>
            <a className="monitor-link" href={`/@${profile.handle}/evolution`}>
              Follow evolution <span aria-hidden="true">→</span>
            </a>
          </nav>
        </footer>
      </div>

      <style>{`
        .creative-monitor {
          scrollbar-width: none;
        }
        .creative-monitor::-webkit-scrollbar {
          display: none;
        }
        .monitor-enter {
          animation: monitor-enter 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .monitor-enter-delay {
          animation-delay: 90ms;
        }
        .monitor-enter-visual {
          animation-delay: 180ms;
        }
        .monitor-enter-footer {
          animation-delay: 270ms;
        }
        .monitor-orbit {
          fill: none;
          stroke: rgba(255, 255, 255, 0.09);
          stroke-dasharray: 2 8;
          transform-origin: 310px 252px;
          animation: monitor-rotate 44s linear infinite;
        }
        .monitor-orbit-secondary {
          animation-direction: reverse;
          animation-duration: 32s;
          stroke: rgba(125, 211, 252, 0.12);
        }
        .monitor-scan {
          fill: none;
          stroke: rgba(125, 211, 252, 0.22);
          stroke-width: 1;
          stroke-dasharray: 6 12;
          animation: monitor-dash 7s linear infinite;
        }
        .monitor-edge {
          stroke: rgba(255, 255, 255, 0.08);
          stroke-width: 1;
          transition:
            stroke 320ms ease,
            stroke-width 320ms ease;
        }
        .monitor-edge.is-active {
          stroke: rgba(125, 211, 252, 0.52);
          stroke-width: 1.25;
        }
        .monitor-node {
          opacity: 0.45;
          transition: opacity 320ms ease;
        }
        .monitor-node.is-active {
          opacity: 1;
        }
        .monitor-node-point {
          fill: #94a3b8;
          transition:
            fill 320ms ease,
            transform 320ms ease;
          transform-box: fill-box;
          transform-origin: center;
        }
        .monitor-node.is-active .monitor-node-point {
          fill: #7dd3fc;
          transform: scale(1.25);
        }
        .monitor-node.is-core .monitor-node-point {
          fill: #f8fafc;
        }
        .monitor-node-label {
          fill: rgba(226, 232, 240, 0.58);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 8px;
          letter-spacing: 0.12em;
        }
        .monitor-node.is-active .monitor-node-label {
          fill: rgba(224, 242, 254, 0.92);
        }
        .monitor-node-pulse {
          fill: none;
          stroke: rgba(125, 211, 252, 0.42);
          transform-box: fill-box;
          transform-origin: center;
          animation: monitor-pulse 2.4s ease-out infinite;
        }
        .monitor-link {
          color: rgba(255, 255, 255, 0.62);
          text-decoration: none;
          transition: color 160ms ease;
        }
        .monitor-link:hover,
        .monitor-link:focus-visible {
          color: #bae6fd;
          outline: none;
        }
        .monitor-citation {
          color: rgba(186, 230, 253, 0.72);
          text-decoration: underline;
          text-decoration-color: rgba(125, 211, 252, 0.28);
          text-underline-offset: 0.2em;
          transition:
            color 160ms ease,
            text-decoration-color 160ms ease;
        }
        .monitor-citation:hover,
        .monitor-citation:focus-visible {
          color: #bae6fd;
          text-decoration-color: rgba(125, 211, 252, 0.72);
          outline: none;
        }
        @keyframes monitor-enter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes monitor-rotate {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes monitor-dash {
          to {
            stroke-dashoffset: -108;
          }
        }
        @keyframes monitor-pulse {
          0% {
            opacity: 0.8;
            transform: scale(0.35);
          }
          75%,
          100% {
            opacity: 0;
            transform: scale(1.65);
          }
        }
        @media (max-height: 780px) and (min-width: 1024px) {
          .creative-monitor h1 {
            font-size: clamp(2.7rem, 4.6vw, 4.6rem);
          }
          .creative-monitor figure {
            max-width: 620px;
          }
        }
        .creative-monitor.is-embedded {
          container-name: creative-monitor;
          container-type: size;
          scrollbar-color: rgba(125, 211, 252, 0.28) transparent;
          scrollbar-width: thin;
        }
        .creative-monitor.is-embedded::-webkit-scrollbar {
          display: block;
          width: 5px;
        }
        .creative-monitor.is-embedded::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(125, 211, 252, 0.24);
        }
        .creative-monitor.is-embedded h1 {
          font-size: clamp(2.35rem, 5cqw, 4.8rem);
        }
        .creative-monitor.is-embedded > div > div {
          padding-top: 1.25rem;
          padding-bottom: 1.25rem;
        }
        .creative-monitor.is-embedded figure {
          max-width: min(640px, 54cqw);
        }
        @container creative-monitor (max-width: 920px) {
          .creative-monitor.is-embedded .monitor-status {
            display: none;
          }
          .creative-monitor.is-embedded .monitor-live {
            display: inline;
          }
          .creative-monitor.is-embedded .monitor-layout {
            grid-template-columns: minmax(0, 1fr);
            align-items: start;
          }
          .creative-monitor.is-embedded .monitor-copy {
            max-width: none;
          }
          .creative-monitor.is-embedded .monitor-figure {
            max-width: 680px;
          }
          .creative-monitor.is-embedded .monitor-footer {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @container creative-monitor (max-height: 560px) {
          .creative-monitor.is-embedded .monitor-header {
            padding-bottom: 0.55rem;
          }
          .creative-monitor.is-embedded .monitor-layout {
            align-items: start;
            padding-top: 0.85rem;
            padding-bottom: 0.85rem;
          }
          .creative-monitor.is-embedded .monitor-copy h1 {
            margin-top: 0.65rem;
            font-size: clamp(2.15rem, 4.4cqw, 4rem);
          }
          .creative-monitor.is-embedded .monitor-copy > p:nth-of-type(2) {
            margin-top: 1rem;
          }
          .creative-monitor.is-embedded .monitor-processes {
            margin-top: 1.25rem;
          }
          .creative-monitor.is-embedded .monitor-command {
            margin-top: 1rem;
          }
          .creative-monitor.is-embedded .monitor-cortex-canvas {
            min-height: 250px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .monitor-enter,
          .monitor-orbit,
          .monitor-scan,
          .monitor-node-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
