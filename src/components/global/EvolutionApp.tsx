import {
  applicationClaims,
  currentBoundaries,
  evolutionEntries,
} from '../../config/applicationProfile';
import type { ActiveProfileRuntime } from '../../profiles';

const stateLabel = {
  observed: 'Observed',
  active: 'Active question',
  reviewed: 'Reviewed revision',
} as const;

type EvolutionAppProps = {
  profile: ActiveProfileRuntime;
};

export default function EvolutionApp({ profile }: EvolutionAppProps) {
  const claimsById = new Map(applicationClaims.map((claim) => [claim.id, claim]));

  return (
    <section className="text-white">
      <header className="grid grid-cols-4 gap-x-4 gap-y-5 border-b border-white/12 pb-6 md:grid-cols-12">
        <div className="col-span-4 md:col-span-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
            04 / Learning record
          </p>
          <p className="mt-2 font-mono text-[10px] text-white/40">
            {evolutionEntries.length} reviewed entries
          </p>
        </div>
        <div className="col-span-4 md:col-span-9">
          <h1 className="max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">
            Evidence &amp; Evolution
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            DG-OS is a record of work in motion. This panel traces how{' '}
            {profile.identity.possessiveName} ideas, systems, and questions change over time: what
            prompted a revision, which evidence supports it, and what remains open.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Behind it is {profile.identity.preferredName} Space, a private review environment built
            from principles explored in Learning Foundry. It observes approved work and learning
            sources, keeps evidence, reflection, and agent interpretation separate, and prepares
            selected public entries for DG-OS.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Approved entries join the System Map, where connections between projects, experience,
            questions, and ideas can reveal recurring patterns and possible directions for new work.
          </p>
          <p className="mt-4 border-l border-sky-300/40 pl-3 text-xs leading-5 text-sky-100/75">
            Only reviewed, public-safe entries appear here. Private sources and repository activity
            remain private.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="evolution-loop-title"
        className="grid gap-x-6 gap-y-5 border-b border-white/12 py-6 lg:grid-cols-12"
      >
        <div className="lg:col-span-3">
          <h2
            id="evolution-loop-title"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75"
          >
            How the loop works
          </h2>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
            Private observation → public projection
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-3 lg:col-span-9 lg:gap-0">
          <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 sm:block sm:pr-5">
            <span className="font-mono text-xs text-sky-300">01</span>
            <div>
              <h3 className="text-sm font-semibold text-white sm:mt-3">Observe</h3>
              <p className="mt-1 text-xs leading-5 text-white/58">
                {profile.identity.preferredName} Space records bounded evidence from approved
                projects and learning sources.
              </p>
            </div>
          </li>
          <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-white/10 sm:block sm:border-l sm:px-5">
            <span className="font-mono text-xs text-sky-300">02</span>
            <div>
              <h3 className="text-sm font-semibold text-white sm:mt-3">Understand</h3>
              <p className="mt-1 text-xs leading-5 text-white/58">
                Learning Foundry principles keep evidence, interpretation, questions, and agent
                synthesis distinct.
              </p>
            </div>
          </li>
          <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-white/10 sm:block sm:border-l sm:pl-5">
            <span className="font-mono text-xs text-sky-300">03</span>
            <div>
              <h3 className="text-sm font-semibold text-white sm:mt-3">Project</h3>
              <p className="mt-1 text-xs leading-5 text-white/58">
                {profile.identity.preferredName} reviews what can become public. Approved entries
                enter DG-OS and the System Map.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <div className="grid gap-x-6 gap-y-8 py-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex items-end justify-between gap-4 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
              Ideas in motion
            </h2>
            <span className="font-mono text-[10px] text-white/35">Newest first</span>
          </div>

          <ol className="border-t border-white/18">
            {evolutionEntries.map((entry, index) => (
              <li
                key={`${entry.date}-${entry.title}`}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-white/10 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_7rem] sm:gap-x-4"
              >
                <span className="font-mono text-xs text-sky-300">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <article>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                      {entry.kind}
                    </p>
                    <time className="font-mono text-[10px] text-white/38 sm:hidden">
                      {entry.date}
                    </time>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug">{entry.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{entry.summary}</p>

                  <details className="group mt-4 border-t border-white/10 pt-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs text-white/55 transition hover:text-sky-100">
                      <span>Inspect supporting claims</span>
                      <span
                        aria-hidden="true"
                        className="font-mono text-sky-300 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <ul className="mt-3 border-l border-sky-300/30 pl-3 text-xs leading-5 text-white/58">
                      {entry.evidenceIds.map((id) => (
                        <li
                          key={id}
                          className="grid gap-1 border-b border-white/8 py-2 last:border-b-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-3"
                        >
                          <span className="font-mono text-sky-200/80">{id}</span>
                          <span>{claimsById.get(id)?.statement}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </article>

                <div className="hidden text-right sm:block">
                  <time className="font-mono text-[10px] text-white/38">{entry.date}</time>
                  <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.1em] text-white/48">
                    {stateLabel[entry.state]}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="border-t border-white/12 pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex items-end justify-between gap-4 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
              Current boundaries
            </h2>
            <span className="font-mono text-[10px] text-white/35">
              {String(currentBoundaries.length).padStart(2, '0')}
            </span>
          </div>
          <ol className="border-t border-white/18">
            {currentBoundaries.map((boundary, index) => (
              <li
                key={boundary}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-white/10 py-4 text-xs leading-5"
              >
                <span className="font-mono text-sky-300">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-white/62">{boundary}</span>
              </li>
            ))}
          </ol>
          <a
            href="/systems"
            className="mt-6 inline-flex rounded-sm border border-sky-300/35 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/20"
          >
            Open Systems &amp; Evidence →
          </a>
        </aside>
      </div>
    </section>
  );
}
