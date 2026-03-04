import { useEffect, useMemo, useReducer } from 'react';
import { labNotes, labPrinciples } from '../../config/labNotes';
import { networkIdeaEdges, networkNodes } from '../../config/network';
import { userConfig } from '../../config';
import { workbench } from '../../config/workbench';
import {
  dispatchDesktopState,
  onDesktopAppFocus,
  onDesktopOpenWindow,
  onDesktopToggleWindow,
} from '../../services/desktopEvents';
import {
  desktopShellReducer,
  INITIAL_DESKTOP_SHELL_STATE,
} from '../../services/desktopShellReducer';
import {
  handleNotesMenuAction,
  handleWorkbenchMenuAction,
  type NotesMenuEventDetail,
  type WorkbenchMenuEventDetail,
} from '../../services/menuActionHandlers';
import { type DesktopAppId } from '../../services/desktopWindowService';
import NetworkApp from '../network/NetworkApp';
import AgentsTerminal from './AgentsTerminal';
import DraggableAppWindow from './DraggableAppWindow';
import ResumeApp from './ResumeApp';

const toWorkbenchSectionId = (category: string) =>
  `workbench-${category.toLowerCase().replace(/\s+/g, '-')}`;

const jumpTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const container = el.closest('.no-scrollbar');
  if (container instanceof HTMLElement) {
    const top = Math.max(0, el.offsetTop - 8);
    container.scrollTo({ top, behavior: 'smooth' });
    return;
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function ProjectsPanel() {
  useEffect(() => {
    const onWorkbenchMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<WorkbenchMenuEventDetail>;
      handleWorkbenchMenuAction(customEvent.detail, {
        jumpToSection: jumpTo,
        scrollTop: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
    };
    window.addEventListener('dg-workbench-menu-action', onWorkbenchMenuAction as EventListener);
    return () => {
      window.removeEventListener(
        'dg-workbench-menu-action',
        onWorkbenchMenuAction as EventListener
      );
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Workbench</h1>
      <p className="mt-2 text-white/70">
        Systems and writing built around human agency: intent recognition, learning loops, and
        practical infrastructure.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4">
        {['Research Systems', 'Platforms', 'Writing', 'Hackathons'].map((cat) => {
          const items = workbench.filter((x) => x.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} id={toWorkbenchSectionId(cat)}>
              <h2 className="text-sm font-semibold tracking-wide text-white/80">{cat}</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-white/60">{item.subtitle}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {item.id}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-white/75">{item.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function NotesPanel() {
  useEffect(() => {
    const onNotesMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<NotesMenuEventDetail>;
      handleNotesMenuAction(customEvent.detail, {
        jumpToSection: jumpTo,
        openNewsHub: () => {
          window.open('https://ai-news-hub.performics-labs.com/', '_blank', 'noopener,noreferrer');
        },
        scrollTop: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
    };
    window.addEventListener('dg-notes-menu-action', onNotesMenuAction as EventListener);
    return () => {
      window.removeEventListener('dg-notes-menu-action', onNotesMenuAction as EventListener);
    };
  }, []);

  const deepDives = useMemo(() => labNotes.filter((n) => n.kind === 'Deep Dive').slice(0, 4), []);
  const newsItems = useMemo(() => labNotes.filter((n) => n.kind === 'News').slice(0, 4), []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Lab Notes</h1>
      <p className="mt-2 text-white/70">
        Research writing and engineering notes focused on intent, memory, and empowerment-first
        systems.
      </p>

      <section
        id="notes-principles"
        className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <h2 className="text-sm font-semibold tracking-wide text-white/80">Principles</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          {labPrinciples.map((p) => (
            <div key={p.label} className="flex items-start justify-between gap-4">
              <span className="text-white/50">{p.label}</span>
              <span className="text-right text-white/80">{p.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="notes-deep-dives" className="mt-4">
        <h2 className="text-sm font-semibold tracking-wide text-white/80">Pinned Deep Dives</h2>
        <div className="mt-2 space-y-2">
          {deepDives.map((note) => (
            <a
              key={note.id}
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-white/10 bg-white/5 p-3 text-white/85 transition hover:bg-white/10"
            >
              {note.title}
            </a>
          ))}
        </div>
      </section>

      <section id="notes-news-analysis" className="mt-4">
        <h2 className="text-sm font-semibold tracking-wide text-white/80">News Analysis</h2>
        <div className="mt-2 space-y-2">
          {newsItems.map((note) => (
            <a
              key={note.id}
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-white/10 bg-white/5 p-3 text-white/85 transition hover:bg-white/10"
            >
              {note.title}
            </a>
          ))}
        </div>
      </section>

      <section
        id="notes-quick-actions"
        className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <h2 className="text-sm font-semibold tracking-wide text-white/80">Quick Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/apps/projects"
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            Open Workbench Page
          </a>
          <a
            href="/apps/network"
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            Open Network Page
          </a>
        </div>
      </section>
    </div>
  );
}

function NewsPanel() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">AI News Hub</h1>
      <p className="mt-2 text-white/70">Research writing and analysis lives here.</p>
      <a
        className="mt-4 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
        href="https://ai-news-hub.performics-labs.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Site
      </a>
    </div>
  );
}

export default function DesktopWorkspace() {
  const [state, dispatch] = useReducer(desktopShellReducer, INITIAL_DESKTOP_SHELL_STATE);
  const { open } = state;

  const closeWindow = (appId: DesktopAppId) => {
    dispatch({ type: 'CLOSE_WINDOW', appId });
  };

  useEffect(() => {
    dispatchDesktopState(window, state.open, state.focusedAppId);
  }, [state]);

  useEffect(() => {
    const unsubscribeToggle = onDesktopToggleWindow(window, ({ appId }) => {
      if (!appId) return;
      dispatch({ type: 'TOGGLE_WINDOW', appId });
    });

    const unsubscribeFocus = onDesktopAppFocus(window, ({ appId }) => {
      if (!appId) return;
      dispatch({ type: 'FOCUS_APP', appId });
    });

    const unsubscribeOpen = onDesktopOpenWindow(window, ({ appId }) => {
      if (!appId) return;
      dispatch({ type: 'OPEN_WINDOW', appId });
    });

    return () => {
      unsubscribeToggle();
      unsubscribeFocus();
      unsubscribeOpen();
    };
  }, []);

  return (
    <>
      {open.projects ? (
        <DraggableAppWindow
          appId="projects"
          title="Workbench"
          onClose={() => closeWindow('projects')}
          initialSize={{ width: 980, height: 680 }}
          initialPosition={{ x: 80, y: 80 }}
        >
          <ProjectsPanel />
        </DraggableAppWindow>
      ) : null}

      {open.notes ? (
        <DraggableAppWindow
          appId="notes"
          title="Lab Notes"
          onClose={() => closeWindow('notes')}
          initialSize={{ width: 920, height: 640 }}
          initialPosition={{ x: 110, y: 95 }}
        >
          <NotesPanel />
        </DraggableAppWindow>
      ) : null}

      {open.resume ? (
        <DraggableAppWindow
          appId="resume"
          title="Resume"
          onClose={() => closeWindow('resume')}
          initialSize={{ width: 920, height: 660 }}
          initialPosition={{ x: 130, y: 110 }}
        >
          <ResumeApp resume={userConfig.resume} />
        </DraggableAppWindow>
      ) : null}

      {open.news ? (
        <DraggableAppWindow
          appId="news"
          title="AI News Hub"
          onClose={() => closeWindow('news')}
          initialSize={{ width: 780, height: 500 }}
          initialPosition={{ x: 150, y: 120 }}
        >
          <NewsPanel />
        </DraggableAppWindow>
      ) : null}

      {open.network ? (
        <DraggableAppWindow
          appId="network"
          title="Network"
          onClose={() => closeWindow('network')}
          initialSize={{ width: 1080, height: 700 }}
          initialPosition={{ x: 70, y: 70 }}
          contentClassName="h-full overflow-auto no-scrollbar p-4 text-white"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Network</h1>
              <p className="mt-2 text-white/70">
                Work graph across research, projects, experience, and education.
              </p>
            </div>
            <div className="hidden text-right text-xs text-white/50 md:block">
              <p>DG-Labs OS</p>
              <p>Module: Network</p>
            </div>
          </div>
          <NetworkApp nodes={networkNodes} ideas={networkIdeaEdges} />
        </DraggableAppWindow>
      ) : null}

      {open.terminal ? (
        <DraggableAppWindow
          appId="terminal"
          title="Agents Terminal"
          onClose={() => closeWindow('terminal')}
          initialSize={{ width: 920, height: 600 }}
          initialPosition={{ x: 80, y: 80 }}
          contentClassName="h-full min-h-0 flex flex-col overflow-auto no-scrollbar overscroll-contain p-4 text-white"
        >
          <h1 className="text-2xl font-semibold">Agents Runtime</h1>
          <p className="mt-2 text-sm text-white/65">
            Modes: <code>ask</code> (narrative), <code>brief</code> (bullets), <code>cv</code>{' '}
            (experience-first), <code>projects</code> (builds-first). Use
            <code> context &lt;query&gt;</code> for raw snippets.
          </p>
          <div className="mt-4 min-h-0 flex-1">
            <AgentsTerminal />
          </div>
        </DraggableAppWindow>
      ) : null}
    </>
  );
}
