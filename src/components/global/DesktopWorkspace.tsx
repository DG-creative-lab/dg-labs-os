import { useEffect, useReducer } from 'react';
import { networkIdeaEdges, networkNodes, networkPaths } from '../../config/network';
import type { ActiveProfileRuntime } from '../../profiles';
import type { PublicProfileModules } from '../../profiles/modules';
import {
  dispatchDesktopAppFocus,
  dispatchDesktopState,
  onDesktopAppFocus,
  onDesktopOpenWindow,
  onDesktopToggleWindow,
} from '../../services/desktopEvents';
import { clearDesktopReady, markDesktopReady } from '../../services/desktopReady';
import {
  desktopShellReducer,
  INITIAL_DESKTOP_SHELL_STATE,
} from '../../services/desktopShellReducer';
import {
  handleWorkbenchMenuAction,
  type WorkbenchMenuEventDetail,
} from '../../services/menuActionHandlers';
import { DESKTOP_APPS } from '../../services/desktopAppRegistry';
import { type DesktopAppId } from '../../services/desktopWindowService';
import NetworkApp from '../network/NetworkApp';
import AgentsTerminal from './AgentsTerminal';
import DraggableAppWindow from './DraggableAppWindow';
import EvolutionApp from './EvolutionApp';
import ResumeApp from './ResumeApp';
import TechnicalWritingApp from './TechnicalWritingApp';

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

export function ProjectsPanel({
  profile,
  workbench,
}: {
  profile: ActiveProfileRuntime;
  workbench: PublicProfileModules['workbench'];
}) {
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
        Selected systems {profile.identity.preferredName} can show, explain, and bound with
        evidence.
      </p>
      <div className="mt-8 space-y-10">
        {workbench.categories.map((cat) => {
          const items = workbench.items.filter((x) => x.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} id={toWorkbenchSectionId(cat)}>
              <div className="flex items-end justify-between gap-6 border-b border-white/15 pb-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/85">
                    {cat}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    {workbench.categoryDescriptions[cat]}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  {String(items.length).padStart(2, '0')}
                </span>
              </div>
              <div className="divide-y divide-white/10">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-5 py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                        {item.classification}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{item.subtitle}</p>
                      <p className="mt-4 text-sm leading-relaxed text-white/75">{item.summary}</p>
                    </div>
                    <div className="md:border-l md:border-white/10 md:pl-6">
                      <ul className="space-y-2 text-sm leading-relaxed text-white/70">
                        {item.highlights.slice(0, 3).map((highlight) => (
                          <li className="grid grid-cols-[0.75rem_1fr] gap-2" key={highlight}>
                            <span className="text-white/30">-</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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

export default function DesktopWorkspace({
  profile,
  modules,
}: {
  profile: ActiveProfileRuntime;
  modules: PublicProfileModules;
}) {
  const [state, dispatch] = useReducer(desktopShellReducer, INITIAL_DESKTOP_SHELL_STATE);
  const { open, focusedAppId } = state;

  const closeWindow = (appId: DesktopAppId) => {
    dispatch({ type: 'CLOSE_WINDOW', appId });
  };

  useEffect(() => {
    markDesktopReady(window, 'workspace');
    return () => clearDesktopReady(window, 'workspace');
  }, []);

  useEffect(() => {
    dispatchDesktopState(window, state.open, state.focusedAppId);
  }, [state]);

  useEffect(() => {
    const handleBackgroundMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('[data-desktop-surface="window"]')) return;
      if (target.closest('[data-desktop-surface="dock"]')) return;
      if (target.closest('[data-desktop-surface="menubar"]')) return;
      if (target.closest('[role="menu"]')) return;
      dispatchDesktopAppFocus(window, 'home');
    };

    document.addEventListener('mousedown', handleBackgroundMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleBackgroundMouseDown);
    };
  }, []);

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

  const projectsWindow = DESKTOP_APPS.projects.window;
  const notesWindow = DESKTOP_APPS.notes.window;
  const evolutionWindow = DESKTOP_APPS.evolution.window;
  const resumeWindow = DESKTOP_APPS.resume.window;
  const networkWindow = DESKTOP_APPS.network.window;
  const terminalWindow = DESKTOP_APPS.terminal.window;

  return (
    <>
      {open.projects ? (
        <DraggableAppWindow
          appId="projects"
          title={projectsWindow.title}
          onClose={() => closeWindow('projects')}
          initialSize={{ width: projectsWindow.width, height: projectsWindow.height }}
          initialPosition={{ x: projectsWindow.x, y: projectsWindow.y }}
          isFocused={focusedAppId === 'projects'}
        >
          <ProjectsPanel profile={profile} workbench={modules.workbench} />
        </DraggableAppWindow>
      ) : null}

      {open.notes ? (
        <DraggableAppWindow
          appId="notes"
          title={notesWindow.title}
          onClose={() => closeWindow('notes')}
          initialSize={{ width: notesWindow.width, height: notesWindow.height }}
          initialPosition={{ x: notesWindow.x, y: notesWindow.y }}
          isFocused={focusedAppId === 'notes'}
        >
          <TechnicalWritingApp profile={profile} />
        </DraggableAppWindow>
      ) : null}

      {open.evolution ? (
        <DraggableAppWindow
          appId="evolution"
          title={evolutionWindow.title}
          onClose={() => closeWindow('evolution')}
          initialSize={{ width: evolutionWindow.width, height: evolutionWindow.height }}
          initialPosition={{ x: evolutionWindow.x, y: evolutionWindow.y }}
          isFocused={focusedAppId === 'evolution'}
        >
          <EvolutionApp profile={profile} evidenceEvolution={modules.evidenceEvolution} />
        </DraggableAppWindow>
      ) : null}

      {open.resume ? (
        <DraggableAppWindow
          appId="resume"
          title={resumeWindow.title}
          onClose={() => closeWindow('resume')}
          initialSize={{ width: resumeWindow.width, height: resumeWindow.height }}
          initialPosition={{ x: resumeWindow.x, y: resumeWindow.y }}
          isFocused={focusedAppId === 'resume'}
        >
          <ResumeApp profile={profile} />
        </DraggableAppWindow>
      ) : null}

      {open.network ? (
        <DraggableAppWindow
          appId="network"
          title={networkWindow.title}
          onClose={() => closeWindow('network')}
          initialSize={{ width: networkWindow.width, height: networkWindow.height }}
          initialPosition={{ x: networkWindow.x, y: networkWindow.y }}
          isFocused={focusedAppId === 'network'}
          contentClassName="h-full overflow-auto no-scrollbar p-4 text-white"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                Connections / Curated projection
              </p>
              <h1 className="mt-2 text-2xl font-semibold">System Map</h1>
              <p className="mt-2 text-white/70">
                How career experience, engineering practices, systems, and public evidence connect.
              </p>
            </div>
            <div className="hidden text-right text-xs text-white/50 md:block">
              <p>DG-Labs OS</p>
              <p>Module: Connections</p>
            </div>
          </div>
          <NetworkApp nodes={networkNodes} ideas={networkIdeaEdges} paths={networkPaths} />
        </DraggableAppWindow>
      ) : null}

      {open.terminal ? (
        <DraggableAppWindow
          appId="terminal"
          title={terminalWindow.title}
          onClose={() => closeWindow('terminal')}
          initialSize={{ width: terminalWindow.width, height: terminalWindow.height }}
          initialPosition={{ x: terminalWindow.x, y: terminalWindow.y }}
          isFocused={focusedAppId === 'terminal'}
          viewportFit={{ widthRatio: 0.84, heightRatio: 0.94 }}
          contentClassName="h-full min-h-0 flex flex-col overflow-hidden text-white"
        >
          <AgentsTerminal profile={profile} />
        </DraggableAppWindow>
      ) : null}
    </>
  );
}
