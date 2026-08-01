import { useEffect, useState } from 'react';
import type { ActiveProfileRuntime } from '../../profiles';

const PROJECTION_STEPS = [
  {
    index: '01',
    label: 'Observe privately',
    description: 'Learning, work, questions, and experiments remain inside the owner workspace.',
  },
  {
    index: '02',
    label: 'Review deliberately',
    description: 'The owner checks evidence, boundaries, interpretation, and publication scope.',
  },
  {
    index: '03',
    label: 'Project publicly',
    description: 'Only approved claims and artifacts enter a navigable public profile.',
  },
] as const;

type PlatformHomeProps = {
  profiles: readonly ActiveProfileRuntime[];
  embedded?: boolean;
};

const formatReviewDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export default function PlatformHome({ profiles, embedded = false }: PlatformHomeProps) {
  const [activeStep, setActiveStep] = useState(0);
  const pilotProfile = profiles[0];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const timer = window.setInterval(
      () => setActiveStep((current) => (current + 1) % PROJECTION_STEPS.length),
      1800
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className={`platform-home h-full overflow-y-auto bg-[#070b12] text-white ${
        embedded ? 'is-embedded' : ''
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 pb-10 pt-5 sm:px-8 lg:px-12">
        <header className="platform-enter flex items-center justify-between gap-5 border-b border-white/14 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="platform-signal h-1.5 w-1.5 shrink-0 bg-sky-300" />
            <p className="truncate font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-200 sm:text-[10px]">
              DG-OS / Public profile registry
            </p>
          </div>
          <div className="flex gap-5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/35 sm:text-[9px]">
            <span>{String(profiles.length).padStart(2, '0')} live</span>
            <span className="hidden sm:inline">Owner reviewed</span>
          </div>
        </header>

        <section className="platform-hero grid min-h-[31rem] items-center gap-10 border-b border-white/14 py-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(30rem,1.12fr)] lg:gap-16">
          <div className="platform-enter platform-enter-copy relative z-10 max-w-2xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
              Public identity infrastructure / pilot 01
            </p>
            <p className="platform-wordmark mt-5 text-[clamp(3.8rem,9vw,8.5rem)] font-semibold leading-[0.78] tracking-[-0.075em]">
              DG-OS
            </p>
            <h1 className="mt-8 max-w-[15ch] text-[clamp(2rem,3.6vw,4.15rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
              Public profiles for work that can be inspected, not merely claimed.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
              DG-OS turns owner-reviewed learning and work into a navigable public profile. Private
              activity stays private.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
              {pilotProfile ? (
                <a
                  className="platform-primary-link inline-flex items-center gap-3 border-b border-sky-300/60 pb-2 font-semibold text-sky-100"
                  href={`/@${pilotProfile.handle}`}
                >
                  Enter {pilotProfile.identity.possessiveName} OS
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
              <a className="text-white/50 transition hover:text-white" href="#projection-method">
                How public projection works
              </a>
            </div>
          </div>

          <figure className="platform-enter platform-enter-visual mx-auto w-full max-w-[760px]">
            <div className="flex items-center justify-between border-b border-white/12 pb-2 font-mono text-[8px] uppercase tracking-[0.15em]">
              <span className="text-white/35">Projection boundary / live trace</span>
              <span className="text-sky-200">Human control present</span>
            </div>
            <div className="platform-projection-graphic relative aspect-[1.35/1] min-h-[320px] overflow-hidden">
              <div className="platform-field-glow pointer-events-none absolute inset-0" />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 680 500"
                role="img"
                aria-labelledby="projection-title projection-description"
              >
                <title id="projection-title">Private-to-public profile projection</title>
                <desc id="projection-description">
                  Private work passes through owner review before selected evidence becomes a public
                  profile with systems, evolution, and artifacts.
                </desc>
                <path
                  className="platform-orbit"
                  d="M92 250 C210 72 470 72 588 250 C470 428 210 428 92 250Z"
                />
                <path className="platform-boundary" d="M338 50 V450" />
                <path
                  className="platform-flow"
                  d="M94 250 C190 250 235 250 304 250 S430 250 580 250"
                />
                <path className="platform-branch" d="M454 250 L570 142" />
                <path className="platform-branch" d="M454 250 L590 250" />
                <path className="platform-branch" d="M454 250 L570 358" />

                <g className={activeStep === 0 ? 'platform-node is-active' : 'platform-node'}>
                  <circle cx="96" cy="250" r="7" />
                  <text x="96" y="280" textAnchor="middle">
                    PRIVATE WORKSPACE
                  </text>
                </g>
                <g className={activeStep === 1 ? 'platform-node is-active' : 'platform-node'}>
                  <circle cx="338" cy="250" r="9" />
                  <circle className="platform-review-ring" cx="338" cy="250" r="25" />
                  <text x="338" y="292" textAnchor="middle">
                    OWNER REVIEW
                  </text>
                </g>
                <g className={activeStep === 2 ? 'platform-node is-active' : 'platform-node'}>
                  <circle cx="454" cy="250" r="8" />
                  <text x="454" y="285" textAnchor="middle">
                    PUBLIC PROFILE
                  </text>
                </g>
                <g className="platform-output">
                  <circle cx="570" cy="142" r="4" />
                  <text x="570" y="126" textAnchor="middle">
                    SYSTEMS
                  </text>
                  <circle cx="590" cy="250" r="4" />
                  <text x="590" y="234" textAnchor="middle">
                    EVIDENCE
                  </text>
                  <circle cx="570" cy="358" r="4" />
                  <text x="570" y="388" textAnchor="middle">
                    EVOLUTION
                  </text>
                </g>
                <circle
                  className="platform-traveller"
                  cx={activeStep === 0 ? 96 : activeStep === 1 ? 338 : 454}
                  cy="250"
                  r="13"
                />
              </svg>
            </div>
            <figcaption className="grid grid-cols-3 border-t border-white/12 font-mono text-[8px] uppercase">
              {PROJECTION_STEPS.map((step, index) => (
                <button
                  key={step.index}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`border-r border-white/10 px-3 py-3 text-left transition last:border-r-0 ${
                    activeStep === index ? 'bg-sky-300/[0.07]' : 'hover:bg-white/[0.025]'
                  }`}
                >
                  <span className={activeStep === index ? 'text-sky-300' : 'text-white/28'}>
                    {step.index}
                  </span>
                  <span className="mt-1 block text-white/60">{step.label}</span>
                </button>
              ))}
            </figcaption>
          </figure>
        </section>

        <section
          id="projection-method"
          className="grid gap-8 border-b border-white/14 py-10 lg:grid-cols-12"
        >
          <div className="platform-reveal lg:col-span-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-sky-200">
              01 / Publication method
            </p>
            <h2 className="mt-4 max-w-[12ch] text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
              The public layer is earned.
            </h2>
          </div>
          <ol className="platform-reveal grid gap-0 lg:col-span-8 lg:grid-cols-3">
            {PROJECTION_STEPS.map((step) => (
              <li
                key={step.index}
                className="border-t border-white/12 py-5 lg:border-l lg:border-t-0 lg:px-5"
              >
                <span className="font-mono text-[10px] text-sky-300">{step.index}</span>
                <h3 className="mt-4 text-sm font-semibold">{step.label}</h3>
                <p className="mt-2 text-xs leading-5 text-white/50">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-b border-white/14 py-10" aria-labelledby="live-profiles-title">
          <div className="platform-reveal flex items-end justify-between gap-5 pb-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-sky-200">
                02 / Live registry
              </p>
              <h2
                id="live-profiles-title"
                className="mt-3 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl"
              >
                One real profile before a network.
              </h2>
            </div>
            <span className="hidden font-mono text-[9px] uppercase text-white/35 sm:block">
              No ranking · No inferred score
            </span>
          </div>

          <div className="platform-reveal border-t border-white/18">
            {profiles.map((profile, index) => (
              <a
                key={profile.profileId}
                href={`/@${profile.handle}`}
                className="platform-profile-row group grid gap-5 border-b border-white/10 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(12rem,0.7fr)_auto] sm:items-center"
              >
                <span className="font-mono text-[10px] text-sky-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong className="block text-xl font-semibold tracking-[-0.02em]">
                    {profile.identity.displayName}
                  </strong>
                  <span className="mt-1 block text-xs text-white/45">
                    @{profile.handle} · {profile.identity.location}
                  </span>
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-white/28">
                    Owner reviewed {formatReviewDate(profile.publication.reviewedAt)}
                  </span>
                </span>
                <span className="text-sm leading-6 text-white/58">
                  {profile.identity.roleFocus}
                </span>
                <span className="platform-profile-arrow text-sky-200" aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </div>
        </section>

        <footer className="platform-reveal grid gap-7 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-sky-200">
              03 / Pilot boundary
            </p>
            <h2 className="mt-4 max-w-[18ch] text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
              The system is being proved in public with its creator first.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">
              A second participant enters only when the profile modules and privacy boundary can
              survive a second real person. Not before.
            </p>
          </div>
          {pilotProfile ? (
            <a
              className="platform-primary-link inline-flex items-center gap-3 border-b border-sky-300/50 pb-2 text-xs font-semibold text-sky-100"
              href={`mailto:${pilotProfile.contact.publicEmail}?subject=DG-OS%20pilot`}
            >
              Discuss a future pilot <span aria-hidden="true">→</span>
            </a>
          ) : null}
        </footer>
      </div>

      <style>{`
        .platform-home {
          container-name: platform-home;
          container-type: inline-size;
          scrollbar-color: rgba(125, 211, 252, 0.22) transparent;
          scrollbar-width: thin;
        }
        .platform-signal {
          box-shadow: 0 0 16px rgba(125, 211, 252, 0.85);
          animation: platform-signal 2.4s ease-in-out infinite;
        }
        .platform-enter {
          animation: platform-enter 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .platform-enter-copy {
          animation-delay: 80ms;
        }
        .platform-enter-visual {
          animation-delay: 170ms;
        }
        .platform-reveal {
          animation: platform-enter 600ms 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .platform-wordmark {
          color: #f8fafc;
        }
        .platform-field-glow {
          background: radial-gradient(circle at 52% 50%, rgba(125, 211, 252, 0.1), transparent 50%);
        }
        .platform-orbit,
        .platform-boundary,
        .platform-flow,
        .platform-branch {
          fill: none;
          vector-effect: non-scaling-stroke;
        }
        .platform-orbit {
          stroke: rgba(255, 255, 255, 0.08);
          stroke-dasharray: 2 9;
          animation: platform-dash 18s linear infinite;
        }
        .platform-boundary {
          stroke: rgba(125, 211, 252, 0.18);
          stroke-dasharray: 5 9;
        }
        .platform-flow {
          stroke: rgba(125, 211, 252, 0.45);
          stroke-width: 1.2;
        }
        .platform-branch {
          stroke: rgba(255, 255, 255, 0.12);
        }
        .platform-node circle {
          fill: #64748b;
          transition: fill 320ms ease, transform 320ms ease;
          transform-box: fill-box;
          transform-origin: center;
        }
        .platform-node text,
        .platform-output text {
          fill: rgba(226, 232, 240, 0.48);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 8px;
          letter-spacing: 0.12em;
        }
        .platform-node.is-active circle {
          fill: #7dd3fc;
          transform: scale(1.25);
        }
        .platform-node.is-active text {
          fill: rgba(224, 242, 254, 0.94);
        }
        .platform-node .platform-review-ring {
          fill: none;
          stroke: rgba(125, 211, 252, 0.3);
          transform: none;
        }
        .platform-output circle {
          fill: rgba(186, 230, 253, 0.68);
        }
        .platform-traveller {
          fill: none;
          stroke: rgba(125, 211, 252, 0.45);
          transition: cx 520ms cubic-bezier(0.16, 1, 0.3, 1);
          animation: platform-pulse 1.8s ease-out infinite;
        }
        .platform-primary-link,
        .platform-profile-row,
        .platform-profile-arrow {
          transition: color 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .platform-primary-link:hover,
        .platform-primary-link:focus-visible {
          border-color: #bae6fd;
          color: #e0f2fe;
          outline: none;
        }
        .platform-profile-row:hover,
        .platform-profile-row:focus-visible {
          border-color: rgba(125, 211, 252, 0.42);
          outline: none;
        }
        .platform-profile-row:hover .platform-profile-arrow,
        .platform-profile-row:focus-visible .platform-profile-arrow {
          transform: translateX(5px);
        }
        @keyframes platform-enter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes platform-signal {
          50% { opacity: 0.45; }
        }
        @keyframes platform-dash {
          to { stroke-dashoffset: -110; }
        }
        @keyframes platform-pulse {
          from { opacity: 0.8; transform: scale(0.45); transform-origin: center; }
          to { opacity: 0; transform: scale(1.8); transform-origin: center; }
        }
        @container platform-home (max-width: 900px) {
          .platform-hero {
            grid-template-columns: minmax(0, 1fr);
          }
          .platform-wordmark {
            font-size: clamp(4rem, 18cqw, 7rem);
          }
        }
        @container platform-home (max-width: 560px) {
          .platform-hero {
            min-height: auto;
            padding-top: 2.5rem;
          }
          .platform-hero figure {
            margin-top: 0.5rem;
          }
          .platform-profile-row {
            grid-template-columns: 2rem minmax(0, 1fr) auto;
          }
          .platform-profile-row > span:nth-child(3) {
            grid-column: 2 / -1;
          }
        }
        @media (max-height: 800px) and (min-width: 900px) {
          .platform-home.is-embedded > div {
            padding-top: 1rem;
          }
          .platform-home.is-embedded .platform-hero {
            min-height: auto;
            padding-block: 1.5rem;
            gap: 2rem;
          }
          .platform-home.is-embedded .platform-wordmark {
            margin-top: 0.75rem;
            font-size: clamp(3.25rem, 5vw, 5rem);
          }
          .platform-home.is-embedded h1 {
            margin-top: 1rem;
            font-size: clamp(1.7rem, 2.5vw, 2.8rem);
          }
          .platform-home.is-embedded h1 + p {
            margin-top: 1rem;
          }
          .platform-home.is-embedded h1 + p + div {
            margin-top: 0.75rem;
          }
          .platform-home.is-embedded .platform-projection-graphic {
            aspect-ratio: auto;
            height: 270px;
            min-height: 270px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .platform-enter,
          .platform-reveal,
          .platform-signal,
          .platform-orbit,
          .platform-traveller {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
