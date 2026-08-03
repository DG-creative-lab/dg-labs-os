import { useEffect, useReducer } from 'react';
import type {
  ActiveProfileRuntime,
  PublicNetworkModule,
  PublicProfileModules,
  PublicWritingModule,
} from '../../profiles';
import type { ResumeViewModel } from '../../profiles/resume/viewModel';
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
import { DESKTOP_APPS } from '../../services/desktopAppRegistry';
import { type DesktopAppId } from '../../services/desktopWindowService';
import NetworkApp from '../network/NetworkApp';
import AgentsTerminal from './AgentsTerminal';
import DraggableAppWindow from './DraggableAppWindow';
import EvolutionApp from './EvolutionApp';
import ResumeApp from './ResumeApp';
import TechnicalWritingApp from './TechnicalWritingApp';
import WorkbenchApp from './WorkbenchApp';

export default function DesktopWorkspace({
  profile,
  modules,
  network,
  writing,
  resume,
}: {
  profile: ActiveProfileRuntime;
  modules: PublicProfileModules;
  network: PublicNetworkModule;
  writing: PublicWritingModule;
  resume: ResumeViewModel;
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
          <WorkbenchApp profile={profile} workbench={modules.workbench} />
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
          <TechnicalWritingApp profile={profile} writing={writing} />
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
          <ResumeApp profile={profile} cv={profile.cv.primary} resume={resume} />
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
          <NetworkApp nodes={network.nodes} ideas={network.relationships} paths={network.paths} />
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
