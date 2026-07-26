import type { Dispatch, SetStateAction } from 'react';
import {
  defaultTerminalSettings,
  type TerminalBrainMode,
  type TerminalLlmProvider,
  type TerminalResponseMode,
  type TerminalSettings,
} from '../../utils/terminalSettings';
import type {
  EvidenceState,
  ProviderHealth,
  TerminalPanelTab,
  ToolName,
  ToolUsage,
} from '../../services/terminalTypes';
import { VERIFY_SESSION_CAP } from '../../services/terminalTypes';

type TerminalControlPanelsProps = {
  activePanelTab: TerminalPanelTab;
  setActivePanelTab: Dispatch<SetStateAction<TerminalPanelTab>>;
  settings: TerminalSettings;
  setSettings: Dispatch<SetStateAction<TerminalSettings>>;
  byokApiKey: string;
  setByokApiKey: Dispatch<SetStateAction<string>>;
  rememberByok: boolean;
  setRememberByok: Dispatch<SetStateAction<boolean>>;
  providerHealth: ProviderHealth;
  toolUsage: ToolUsage;
  lastEvidence: EvidenceState | null;
  activeQuickAction: string | null;
  onResetLlmCounter: () => void;
  onRunQuickAction: (key: string, action: () => Promise<void>) => Promise<void>;
  onRunToolCall: (tool: ToolName, input?: Record<string, unknown>) => Promise<void>;
  onRunVerify: (query: string) => Promise<void>;
};

const quickButtonClass =
  'rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/90 hover:bg-white/20';

export function TerminalControlPanels({
  activePanelTab,
  setActivePanelTab,
  settings,
  setSettings,
  byokApiKey,
  setByokApiKey,
  rememberByok,
  setRememberByok,
  providerHealth,
  toolUsage,
  lastEvidence,
  activeQuickAction,
  onResetLlmCounter,
  onRunQuickAction,
  onRunToolCall,
  onRunVerify,
}: TerminalControlPanelsProps) {
  const panelTabClass = (tab: Exclude<TerminalPanelTab, null>) =>
    `rounded-full border px-2.5 py-1 text-[11px] transition ${
      activePanelTab === tab
        ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100'
        : 'border-white/15 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white/85'
    }`;
  const getQuickButtonClass = (key: string) =>
    activeQuickAction === key
      ? 'rounded border border-emerald-300/70 bg-emerald-400/20 px-2 py-1 text-xs text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]'
      : quickButtonClass;
  const healthBadgeClass =
    providerHealth.status === 'healthy'
      ? 'text-emerald-200 bg-emerald-400/15 border-emerald-300/40'
      : providerHealth.status === 'missing_key'
        ? 'text-amber-200 bg-amber-400/15 border-amber-300/40'
        : providerHealth.status === 'timeout'
          ? 'text-orange-200 bg-orange-400/15 border-orange-300/40'
          : providerHealth.status === 'checking'
            ? 'text-cyan-200 bg-cyan-400/15 border-cyan-300/40'
            : 'text-rose-200 bg-rose-400/15 border-rose-300/40';

  return (
    <div className="border-b border-emerald-400/20 px-3 py-2 text-[11px] text-white/70 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['session', 'tools', 'evidence'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActivePanelTab((previous) => (previous === tab ? null : tab))}
            className={panelTabClass(tab)}
            aria-pressed={activePanelTab === tab}
          >
            {tab === 'session'
              ? 'Session'
              : tab === 'tools'
                ? 'Tools'
                : `Evidence${lastEvidence ? '' : ' (empty)'}`}
          </button>
        ))}
      </div>
      {activePanelTab === 'session' ? (
        <div className="mt-3 space-y-3 rounded border border-white/10 bg-white/5 p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <input
                type="checkbox"
                checked={settings.llmFallbackForUnknown}
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    llmFallbackForUnknown: event.target.checked,
                  }))
                }
              />
              <span>Use the LLM for natural input by default</span>
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <input
                type="checkbox"
                checked={settings.providerFallbackAllowed}
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    providerFallbackAllowed: event.target.checked,
                  }))
                }
              />
              <span>Allow provider fallback when selected provider fails</span>
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <span>Brain mode</span>
              <select
                value={settings.brainMode}
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    brainMode: event.target.value as TerminalBrainMode,
                  }))
                }
                className="rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
              >
                <option value="concise">concise</option>
                <option value="explainer">explainer</option>
                <option value="research">research</option>
              </select>
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <span>LLM response</span>
              <select
                value={settings.responseMode}
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    responseMode: event.target.value as TerminalResponseMode,
                  }))
                }
                className="rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
              >
                <option value="narrative">narrative</option>
                <option value="agent_json">agent_json</option>
              </select>
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <span>Provider</span>
              <select
                value={settings.llmProvider}
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    llmProvider: event.target.value as TerminalLlmProvider,
                  }))
                }
                className="rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
              >
                <option value="openrouter">openrouter</option>
                <option value="openai">openai</option>
                <option value="anthropic">anthropic</option>
                <option value="gemini">gemini</option>
              </select>
              <span className={`rounded border px-2 py-0.5 text-[10px] ${healthBadgeClass}`}>
                {providerHealth.status}
                {typeof providerHealth.latencyMs === 'number'
                  ? ` · ${providerHealth.latencyMs}ms`
                  : ''}
              </span>
            </label>
            <label className="flex flex-col items-start gap-2 md:col-span-2 sm:flex-row sm:items-center">
              <span>Model</span>
              <input
                type="text"
                value={settings.llmModel}
                onChange={(event) =>
                  setSettings((previous) => ({ ...previous, llmModel: event.target.value }))
                }
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
                placeholder="openai/gpt-oss-120b"
              />
            </label>
            <label className="flex flex-col items-start gap-2 md:col-span-2 sm:flex-row sm:items-center">
              <span>BYOK key</span>
              <input
                type="password"
                value={byokApiKey}
                onChange={(event) => setByokApiKey(event.target.value)}
                className="w-full rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
                placeholder="Bring your own key"
              />
            </label>
            <label className="flex items-start gap-2 md:col-span-3">
              <input
                type="checkbox"
                checked={rememberByok}
                onChange={(event) => setRememberByok(event.target.checked)}
              />
              <span>Remember BYOK key in this browser (localStorage)</span>
            </label>
            <p className="md:col-span-3 text-[10px] text-amber-200/90">
              Security note: persisted BYOK keys are stored in browser localStorage and are readable
              by scripts on this origin. Keep this off on shared devices.
            </p>
            <p className="md:col-span-3 text-[10px] text-white/70">
              Provider status: {providerHealth.message}
            </p>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <input
                type="checkbox"
                checked={settings.routerDebug}
                onChange={(event) =>
                  setSettings((previous) => ({ ...previous, routerDebug: event.target.checked }))
                }
              />
              <span>Show router debug traces</span>
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <input
                type="checkbox"
                checked={settings.showLlmSources}
                onChange={(event) =>
                  setSettings((previous) => ({ ...previous, showLlmSources: event.target.checked }))
                }
              />
              <span>Show LLM source footer</span>
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <input
                type="checkbox"
                checked={settings.strictEvidenceMode}
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    strictEvidenceMode: event.target.checked,
                  }))
                }
              />
              <span>Strict evidence mode</span>
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <span>Timeout (seconds)</span>
              <input
                type="number"
                min={3}
                max={120}
                value={Math.round(settings.llmTimeoutMs / 1000)}
                onChange={(event) => {
                  const seconds = parseInt(event.target.value || '15', 10);
                  const next = Number.isNaN(seconds) ? 45 : Math.min(120, Math.max(3, seconds));
                  setSettings((previous) => ({ ...previous, llmTimeoutMs: next * 1000 }));
                }}
                className="w-16 rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
              />
            </label>
            <label className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <span>Session cap</span>
              <input
                type="number"
                min={1}
                max={100}
                value={settings.llmSessionCap}
                onChange={(event) => {
                  const next = parseInt(event.target.value || '24', 10);
                  setSettings((previous) => ({
                    ...previous,
                    llmSessionCap: Number.isNaN(next) ? 24 : Math.min(100, Math.max(1, next)),
                  }));
                }}
                className="w-16 rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
              />
            </label>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setSettings(defaultTerminalSettings)}
              className={quickButtonClass}
            >
              Reset defaults
            </button>
            <button type="button" onClick={onResetLlmCounter} className={quickButtonClass}>
              Reset session counter
            </button>
          </div>
          <div className="rounded border border-white/10 bg-black/20 p-2 text-[11px] text-white/65">
            <p className="text-emerald-300/90">Guide</p>
            <p className="mt-1">
              Talk naturally for LLM mode. Use direct commands when you want deterministic control:{' '}
              <code>help</code>, <code>open network</code>, <code>search intent</code>,{' '}
              <code>verify LinkedIn profile</code>, <code>brief top 3 projects</code>,{' '}
              <code>cv current role</code>.
            </p>
          </div>
        </div>
      ) : null}
      {activePanelTab === 'tools' ? (
        <div className="mt-3 space-y-3 rounded border border-white/10 bg-white/5 p-3">
          <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
            <p>
              <span className="text-emerald-300">local_context</span>: retrieve local
              profile/project context ({toolUsage.local_context})
            </p>
            <p>
              <span className="text-emerald-300">web_verify</span>: web citations with source list (
              {toolUsage.web_verify}/{VERIFY_SESSION_CAP})
            </p>
            <p>
              <span className="text-emerald-300">open_app</span>: resolve app target to route (
              {toolUsage.open_app})
            </p>
            <p>
              <span className="text-emerald-300">list_projects</span>: enumerate workbench projects
              ({toolUsage.list_projects})
            </p>
            <p>
              <span className="text-emerald-300">retrieve</span>: ranked local evidence retrieval (
              {toolUsage.retrieve})
            </p>
            <p>
              <span className="text-emerald-300">cite</span>: claim {'->'} evidence verdict (
              {toolUsage.cite})
            </p>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            <QuickActionGroup title="Context">
              <QuickAction
                label="Current projects"
                actionKey="ctx-projects"
                onRun={onRunQuickAction}
                action={() => onRunToolCall('local_context', { query: 'dessi current projects' })}
                className={getQuickButtonClass('ctx-projects')}
              />
              <QuickAction
                label="Profile summary"
                actionKey="ctx-profile"
                onRun={onRunQuickAction}
                action={() => onRunToolCall('local_context', { query: 'dessi profile summary' })}
                className={getQuickButtonClass('ctx-profile')}
              />
              <QuickAction
                label="List projects"
                actionKey="ctx-list-projects"
                onRun={onRunQuickAction}
                action={() => onRunToolCall('list_projects')}
                className={getQuickButtonClass('ctx-list-projects')}
              />
            </QuickActionGroup>
            <QuickActionGroup
              title={`Web Verify (${Math.max(0, VERIFY_SESSION_CAP - toolUsage.web_verify)} left)`}
            >
              <QuickAction
                label="Verify LinkedIn profile"
                actionKey="verify-mcp"
                onRun={onRunQuickAction}
                action={() =>
                  onRunVerify('Dessi Georgieva LinkedIn profile work experience education')
                }
                className={getQuickButtonClass('verify-mcp')}
              />
              <QuickAction
                label="Verify project footprint"
                actionKey="verify-openrouter"
                onRun={onRunQuickAction}
                action={() =>
                  onRunVerify(
                    'Dessi Georgieva projects DG-creative-lab ai-knowledge-hub AI News Hub skills ai-knowledge-hub'
                  )
                }
                className={getQuickButtonClass('verify-openrouter')}
              />
            </QuickActionGroup>
            <QuickActionGroup title="Open App" className="md:col-span-2">
              <QuickAction
                label="Network"
                actionKey="open-network"
                onRun={onRunQuickAction}
                action={() => onRunToolCall('open_app', { target: 'network' })}
                className={getQuickButtonClass('open-network')}
              />
              <QuickAction
                label="Projects"
                actionKey="open-projects"
                onRun={onRunQuickAction}
                action={() => onRunToolCall('open_app', { target: 'projects' })}
                className={getQuickButtonClass('open-projects')}
              />
              <QuickAction
                label="Writing"
                actionKey="open-writing"
                onRun={onRunQuickAction}
                action={() => onRunToolCall('open_app', { target: 'writing' })}
                className={getQuickButtonClass('open-writing')}
              />
              <QuickAction
                label="Terminal"
                actionKey="open-terminal"
                onRun={onRunQuickAction}
                action={() => onRunToolCall('open_app', { target: 'terminal' })}
                className={getQuickButtonClass('open-terminal')}
              />
            </QuickActionGroup>
          </div>
          {activeQuickAction ? (
            <p className="mt-2 text-[11px] text-emerald-300/80">
              Running action: <span className="font-mono">{activeQuickAction}</span> (click another
              button to switch)
            </p>
          ) : null}
          <p className="mt-2 text-white/50">
            Commands: <code>tools</code> | <code>brief top 3 projects</code> |{' '}
            <code>cv latest role</code> | <code>projects intent systems</code> |{' '}
            <code>tool local_context intent modeling</code> |{' '}
            <code>tool web_verify Dessi Georgieva LinkedIn projects</code> |{' '}
            <code>tool list_projects</code> | <code>tool retrieve intent recognition projects</code>{' '}
            | <code>tool cite Dessi built intent recognition systems</code>
          </p>
        </div>
      ) : null}
      {activePanelTab === 'evidence' ? (
        <div className="mt-3 rounded border border-white/10 bg-white/5 p-3">
          {lastEvidence ? (
            <>
              <p className="text-emerald-300/90">
                Evidence: {lastEvidence.query} | class={lastEvidence.classification} | verdict=
                {lastEvidence.verdict} | cache={lastEvidence.fromCache ? 'hit' : 'miss'}
              </p>
              <ul className="mt-1 space-y-1 text-white/80">
                {lastEvidence.hits.slice(0, 6).map((hit) => (
                  <li key={hit.id} className="leading-5">
                    <span className="text-emerald-200">
                      [{hit.source}] {hit.title}
                    </span>{' '}
                    <span className="text-white/50">(score={hit.score})</span>
                    {hit.url ? (
                      <>
                        {' '}
                        <a
                          href={hit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-300 hover:text-cyan-200 underline"
                        >
                          source
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-white/50">
              No evidence snapshot yet. Run a verify, retrieve, cite, or LLM request first.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function QuickActionGroup({
  title,
  className = '',
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded border border-white/10 bg-white/5 p-2 ${className}`}>
      <p className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300/90">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function QuickAction({
  label,
  actionKey,
  onRun,
  action,
  className,
}: {
  label: string;
  actionKey: string;
  onRun: (key: string, action: () => Promise<void>) => Promise<void>;
  action: () => Promise<void>;
  className: string;
}) {
  return (
    <button type="button" onClick={() => void onRun(actionKey, action)} className={className}>
      {label}
    </button>
  );
}
