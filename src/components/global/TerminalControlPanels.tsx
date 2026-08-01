import type { Dispatch, SetStateAction } from 'react';
import { FiExternalLink, FiX } from 'react-icons/fi';
import {
  defaultTerminalSettings,
  type TerminalBrainMode,
  type TerminalLlmProvider,
  type TerminalSettings,
} from '../../utils/terminalSettings';
import type {
  EvidenceState,
  ProviderHealth,
  TerminalPanelTab,
  ToolName,
  ToolUsage,
} from '../../services/terminalTypes';

type TerminalControlPanelsProps = {
  activePanelTab: TerminalPanelTab;
  setActivePanelTab: Dispatch<SetStateAction<TerminalPanelTab>>;
  settings: TerminalSettings;
  setSettings: Dispatch<SetStateAction<TerminalSettings>>;
  byokApiKey: string;
  setByokApiKey: Dispatch<SetStateAction<string>>;
  providerHealth: ProviderHealth;
  toolUsage: ToolUsage;
  lastEvidence: EvidenceState | null;
  profileName: string;
  reviewedAt: string;
  onResetLlmCounter: () => void;
  onRunToolCall: (tool: ToolName, input?: Record<string, unknown>) => Promise<void>;
};

const controlClass =
  'w-full border-b border-white/15 bg-transparent px-0 py-2 text-sm text-white outline-none focus:border-sky-300/65';

const formatReviewDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));

export function TerminalControlPanels({
  activePanelTab,
  setActivePanelTab,
  settings,
  setSettings,
  byokApiKey,
  setByokApiKey,
  providerHealth,
  toolUsage,
  lastEvidence,
  profileName,
  reviewedAt,
  onResetLlmCounter,
  onRunToolCall,
}: TerminalControlPanelsProps) {
  if (!activePanelTab) return null;

  const title =
    activePanelTab === 'connection'
      ? 'AI connection'
      : activePanelTab === 'evidence'
        ? 'Supporting evidence'
        : 'Advanced terminal';

  return (
    <aside className="flex min-h-0 flex-col border-t border-white/10 bg-[#0c1118] md:border-l md:border-t-0">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-sky-300/60">
            Profile Agent
          </p>
          <h2 className="mt-1 text-sm font-medium text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => setActivePanelTab(null)}
          aria-label={`Close ${title}`}
          className="grid h-8 w-8 place-items-center rounded-full text-white/45 transition hover:bg-white/5 hover:text-white"
        >
          <FiX aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm text-white/62 [&::-webkit-scrollbar]:hidden">
        {activePanelTab === 'connection' ? (
          <ConnectionPanel
            settings={settings}
            setSettings={setSettings}
            byokApiKey={byokApiKey}
            setByokApiKey={setByokApiKey}
            providerHealth={providerHealth}
          />
        ) : null}

        {activePanelTab === 'evidence' ? (
          <EvidencePanel
            lastEvidence={lastEvidence}
            profileName={profileName}
            reviewedAt={reviewedAt}
          />
        ) : null}

        {activePanelTab === 'advanced' ? (
          <AdvancedPanel
            settings={settings}
            setSettings={setSettings}
            toolUsage={toolUsage}
            onResetLlmCounter={onResetLlmCounter}
            onRunToolCall={onRunToolCall}
          />
        ) : null}
      </div>
    </aside>
  );
}

function ConnectionPanel({
  settings,
  setSettings,
  byokApiKey,
  setByokApiKey,
  providerHealth,
}: Pick<
  TerminalControlPanelsProps,
  'settings' | 'setSettings' | 'byokApiKey' | 'setByokApiKey' | 'providerHealth'
>) {
  const isAvailable = providerHealth.configured && providerHealth.status === 'healthy';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-300' : 'bg-amber-300'}`}
          />
          <p className="text-white/80">
            {isAvailable ? 'Generative answers available' : 'Profile search remains available'}
          </p>
        </div>
        <p className="mt-2 text-xs leading-5 text-white/42">{providerHealth.message}</p>
      </div>

      <label className="block">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
          Provider
        </span>
        <select
          value={settings.llmProvider}
          onChange={(event) =>
            setSettings((previous) => ({
              ...previous,
              llmProvider: event.target.value as TerminalLlmProvider,
            }))
          }
          className={controlClass}
        >
          <option value="openrouter">OpenRouter</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
        </select>
      </label>

      <label className="block">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
          API key
        </span>
        <input
          type="password"
          value={byokApiKey}
          onChange={(event) => setByokApiKey(event.target.value)}
          className={controlClass}
          placeholder="Paste a key for this tab"
          autoComplete="off"
        />
      </label>

      <p className="border-l border-amber-300/35 pl-3 text-xs leading-5 text-amber-100/65">
        The key stays in memory for this tab. DG-OS sends it through its server to the selected
        provider and does not save it in browser storage.
      </p>

      <details className="border-t border-white/10 pt-4">
        <summary className="cursor-pointer text-xs text-white/48">Model override</summary>
        <label className="mt-4 block">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
            Model
          </span>
          <input
            type="text"
            value={settings.llmModel}
            onChange={(event) =>
              setSettings((previous) => ({ ...previous, llmModel: event.target.value }))
            }
            className={controlClass}
          />
        </label>
      </details>
    </div>
  );
}

function EvidencePanel({
  lastEvidence,
  profileName,
  reviewedAt,
}: Pick<TerminalControlPanelsProps, 'lastEvidence' | 'profileName' | 'reviewedAt'>) {
  return (
    <div>
      <p className="text-xs leading-5 text-white/45">
        Answers use {profileName}&apos;s reviewed public projection. Last profile review:{' '}
        {formatReviewDate(reviewedAt)}.
      </p>

      {lastEvidence && lastEvidence.hits.length > 0 ? (
        <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
          {lastEvidence.hits.slice(0, 6).map((hit, index) => (
            <article key={hit.id} className="py-4">
              <div className="flex gap-3">
                <span className="pt-0.5 font-mono text-[9px] text-sky-300/55">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 text-white/82">{hit.title}</p>
                  <p className="mt-1 line-clamp-3 text-xs leading-5 text-white/42">{hit.snippet}</p>
                  {hit.url ? (
                    <a
                      href={hit.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-sky-300/72 hover:text-sky-200"
                    >
                      Open public source <FiExternalLink size={11} aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="mt-2 text-[10px] text-white/28">Reviewed profile record</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 border-l border-white/15 pl-3 text-xs leading-5 text-white/38">
          Ask a question first. Supporting records will appear here when the profile index finds a
          match.
        </p>
      )}
    </div>
  );
}

function AdvancedPanel({
  settings,
  setSettings,
  toolUsage,
  onResetLlmCounter,
  onRunToolCall,
}: Pick<
  TerminalControlPanelsProps,
  'settings' | 'setSettings' | 'toolUsage' | 'onResetLlmCounter' | 'onRunToolCall'
>) {
  return (
    <div className="space-y-6">
      <p className="text-xs leading-5 text-white/42">
        Commands and runtime controls remain available for technical inspection. Normal visitors do
        not need them.
      </p>

      <label className="block">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
          Answer depth
        </span>
        <select
          value={settings.brainMode}
          onChange={(event) =>
            setSettings((previous) => ({
              ...previous,
              brainMode: event.target.value as TerminalBrainMode,
            }))
          }
          className={controlClass}
        >
          <option value="concise">Concise</option>
          <option value="explainer">Explainer</option>
          <option value="research">Research</option>
        </select>
      </label>

      <div className="space-y-3 border-y border-white/10 py-4 text-xs">
        <CheckSetting
          label="Require direct evidence"
          checked={settings.strictEvidenceMode}
          onChange={(checked) =>
            setSettings((previous) => ({ ...previous, strictEvidenceMode: checked }))
          }
        />
        <CheckSetting
          label="Allow configured provider fallback"
          checked={settings.providerFallbackAllowed}
          onChange={(checked) =>
            setSettings((previous) => ({ ...previous, providerFallbackAllowed: checked }))
          }
        />
        <CheckSetting
          label="Show runtime traces in conversation"
          checked={settings.routerDebug}
          onChange={(checked) => setSettings((previous) => ({ ...previous, routerDebug: checked }))}
        />
      </div>

      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">Commands</p>
        <p className="mt-2 font-mono text-[10px] leading-5 text-white/45">
          help · projects · resume · search &lt;query&gt; · verify &lt;query&gt; · open &lt;app&gt;
        </p>
      </div>

      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">Tools</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ActionButton onClick={() => onRunToolCall('list_projects')}>List projects</ActionButton>
          <ActionButton
            onClick={() => onRunToolCall('retrieve', { query: 'agent reliability projects' })}
          >
            Retrieve evidence
          </ActionButton>
        </div>
        <p className="mt-3 font-mono text-[9px] leading-4 text-white/28">
          retrieve {toolUsage.retrieve} · cite {toolUsage.cite} · verify {toolUsage.web_verify}
        </p>
      </div>

      <details className="border-t border-white/10 pt-4">
        <summary className="cursor-pointer text-xs text-white/48">Runtime limits</summary>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label>
            <span className="text-[10px] text-white/36">Timeout, seconds</span>
            <input
              type="number"
              min={3}
              max={120}
              value={Math.round(settings.llmTimeoutMs / 1000)}
              onChange={(event) => {
                const seconds = Number.parseInt(event.target.value || '45', 10);
                setSettings((previous) => ({
                  ...previous,
                  llmTimeoutMs: Math.min(120, Math.max(3, seconds || 45)) * 1000,
                }));
              }}
              className={controlClass}
            />
          </label>
          <label>
            <span className="text-[10px] text-white/36">Session cap</span>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.llmSessionCap}
              onChange={(event) => {
                const count = Number.parseInt(event.target.value || '24', 10);
                setSettings((previous) => ({
                  ...previous,
                  llmSessionCap: Math.min(100, Math.max(1, count || 24)),
                }));
              }}
              className={controlClass}
            />
          </label>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={() => setSettings(defaultTerminalSettings)}>
          Reset settings
        </ActionButton>
        <ActionButton onClick={onResetLlmCounter}>Reset counter</ActionButton>
      </div>
    </div>
  );
}

function CheckSetting({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 accent-sky-300"
      />
      <span>{label}</span>
    </label>
  );
}

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-white/12 px-3 py-2 text-left text-[11px] text-white/58 transition hover:border-white/24 hover:text-white"
    >
      {children}
    </button>
  );
}
