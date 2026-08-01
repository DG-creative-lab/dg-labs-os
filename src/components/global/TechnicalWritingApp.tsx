import { useEffect } from 'react';
import { labNotes } from '../../config/labNotes';
import {
  handleNotesMenuAction,
  type NotesMenuEventDetail,
} from '../../services/menuActionHandlers';
import type { ActiveProfileRuntime } from '../../profiles';

const archiveUrl = 'https://ai-news-hub.performics-labs.com/analysis';

type TechnicalWritingAppProps = {
  profile: ActiveProfileRuntime;
};

export default function TechnicalWritingApp({ profile }: TechnicalWritingAppProps) {
  useEffect(() => {
    const onWritingMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<NotesMenuEventDetail>;
      handleNotesMenuAction(customEvent.detail, {
        jumpToSection: (sectionId) => {
          const element = document.getElementById(sectionId);
          if (!element) return;
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        openNewsHub: () => {
          window.open(archiveUrl, '_blank', 'noopener,noreferrer');
        },
        scrollTop: () => {
          document
            .getElementById('writing-provenance')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
      });
    };

    window.addEventListener('dg-notes-menu-action', onWritingMenuAction as EventListener);
    return () => {
      window.removeEventListener('dg-notes-menu-action', onWritingMenuAction as EventListener);
    };
  }, []);

  return (
    <section className="text-white">
      <header
        id="writing-provenance"
        className="grid grid-cols-4 gap-x-4 gap-y-5 border-b border-white/12 pb-6 md:grid-cols-12"
      >
        <div className="col-span-4 md:col-span-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
            05 / Selected writing
          </p>
          <p className="mt-2 font-mono text-[10px] text-white/40">
            {labNotes.length} technical pieces
          </p>
        </div>
        <div className="col-span-4 md:col-span-9">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Technical Writing</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            Selected analysis developed through Performics Labs and connected to systems{' '}
            {profile.identity.preferredName} has built or investigated. These pieces show technical
            synthesis and design judgement. They are professional writing, not independent academic
            research.
          </p>
        </div>
      </header>

      <section id="writing-selected" className="py-6" aria-labelledby="writing-selected-title">
        <div className="flex items-end justify-between gap-4 pb-3">
          <h2
            id="writing-selected-title"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75"
          >
            Selected analysis
          </h2>
          <span className="font-mono text-[10px] text-white/35">Newest first</span>
        </div>

        <ol className="border-t border-white/18">
          {labNotes.map((note, index) => (
            <li
              key={note.id}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-white/10 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_7rem] sm:gap-x-4"
            >
              <span className="font-mono text-xs text-sky-300">
                {String(index + 1).padStart(2, '0')}
              </span>

              <article>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                    {note.kind}
                  </p>
                  <time className="font-mono text-[10px] text-white/38 sm:hidden">
                    {note.published}
                  </time>
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug">
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-sky-100"
                  >
                    {note.title} ↗
                  </a>
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{note.subtitle}</p>
                <p className="mt-3 text-xs leading-5 text-white/48">
                  <span className="text-white/70">Connected system:</span> {note.relatedSystem}
                </p>

                <details className="group mt-4 border-t border-white/10 pt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs text-white/55 transition hover:text-sky-100">
                    <span>Scope and limitation</span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-sky-300 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 border-l border-sky-300/30 pl-3 text-xs leading-5 text-white/58">
                    {note.boundary}
                  </p>
                </details>
              </article>

              <div className="hidden text-right sm:block">
                <time className="font-mono text-[10px] text-white/38">{note.published}</time>
                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-white/45">
                  {note.readingTime}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer id="writing-archive" className="border-t border-white/12 pt-5">
        <p className="max-w-2xl text-xs leading-5 text-white/50">
          The complete Performics Labs archive also includes timely industry coverage and earlier
          conceptual essays. Those pieces remain available without being treated as portfolio
          evidence.
        </p>
        <a
          href={archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-sm border border-sky-300/35 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/20"
        >
          Open the full archive ↗
        </a>
      </footer>
    </section>
  );
}
