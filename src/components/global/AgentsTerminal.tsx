import { useEffect, useMemo, useRef, useState } from 'react';
import { userConfig } from '../../config';
import { labNotes } from '../../config/labNotes';
import { networkNodes } from '../../config/network';
import { workbench } from '../../config/workbench';
import {
  executeTerminalCommand,
  isDeterministicTerminalCommand,
  type TerminalAction,
} from '../../utils/terminalCommands';
import { routeNaturalLanguageCommand } from '../../utils/terminalRouter';
import {
  buildLlmMessages,
  isLlmQuery,
  normalizeLlmQuery,
  readChatMessage,
} from '../../utils/terminalLlm';
import { buildAskEnvelopeLines, buildVerifyEnvelopeLines } from '../../utils/terminalEnvelope';
import { retrieveKnowledge } from '../../utils/terminalKnowledge';
import type { VerifySource } from '../../utils/apiContracts';
import {
  defaultTerminalSettings,
  parseTerminalSettings,
  serializeTerminalSettings,
  terminalSettingsSummary,
  TERMINAL_SETTINGS_KEY,
  type TerminalBrainMode,
  type TerminalSettings,
} from '../../utils/terminalSettings';

type TerminalEntry = {
  id: number;
  kind: 'command' | 'output' | 'system';
  text: string;
};

type LlmHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ToolName = 'local_context' | 'web_verify' | 'open_app' | 'list_projects';

type ToolUsage = Record<ToolName, number>;

type LastWebVerifyContext = {
  query: string;
  summary: string;
  sources: VerifySource[];
};

const INITIAL_TOOL_USAGE: ToolUsage = {
  local_context: 0,
  web_verify: 0,
  open_app: 0,
  list_projects: 0,
};

const LLM_COUNT_KEY = 'dg_labs_terminal_llm_count';
const VERIFY_COUNT_KEY = 'dg_labs_terminal_verify_count';
const ROUTER_CONFIDENCE_THRESHOLD = 0.8;
const VERIFY_SESSION_CAP = 12;

const runAction = (action: TerminalAction) => {
  if (typeof window === 'undefined') return;
  switch (action.type) {
    case 'navigate':
      window.location.href = action.href;
      break;
    case 'external':
      window.open(action.href, '_blank', 'noopener,noreferrer');
      break;
    case 'mailto':
      window.location.href = action.href;
      break;
    case 'tel':
      window.location.href = action.href;
      break;
    case 'clear':
    case 'set_mode':
    case 'verify':
    case 'list_tools':
    case 'tool_call':
    case 'none':
    default:
      break;
  }
};

export default function AgentsTerminal() {
  const [input, setInput] = useState('');
  const [isLlmBusy, setIsLlmBusy] = useState(false);
  const [settings, setSettings] = useState<TerminalSettings>(defaultTerminalSettings);
  const [toolUsage, setToolUsage] = useState<ToolUsage>(INITIAL_TOOL_USAGE);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [lastWebVerifyContext, setLastWebVerifyContext] = useState<LastWebVerifyContext | null>(
    null
  );
  const [llmHistory, setLlmHistory] = useState<LlmHistoryMessage[]>([]);
  const [history, setHistory] = useState<TerminalEntry[]>([
    { id: 1, kind: 'system', text: 'DG-Labs Agents Runtime v2' },
    {
      id: 2,
      kind: 'system',
      text: 'Type "help" for commands or "ask <question>" for LLM mode.',
    },
  ]);
  const nextIdRef = useRef(3);
  const toolAbortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);

  const prompt = useMemo(() => `${userConfig.name}:~$`, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(TERMINAL_SETTINGS_KEY);
    setSettings(parseTerminalSettings(raw));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TERMINAL_SETTINGS_KEY, serializeTerminalSettings(settings));
  }, [settings]);

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTo({
      top: outputRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [history]);

  const pushLine = (kind: TerminalEntry['kind'], text: string): TerminalEntry => ({
    id: nextIdRef.current++,
    kind,
    text,
  });

  const getAndIncrementLlmCount = () => {
    if (typeof window === 'undefined') return 0;
    const current = parseInt(sessionStorage.getItem(LLM_COUNT_KEY) || '0', 10);
    const next = Number.isNaN(current) ? 1 : current + 1;
    sessionStorage.setItem(LLM_COUNT_KEY, String(next));
    return next;
  };

  const resetLlmCounter = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(LLM_COUNT_KEY, '0');
    setHistory((prev) => [...prev, pushLine('system', 'LLM session counter reset.')]);
  };

  const getAndIncrementVerifyCount = () => {
    if (typeof window === 'undefined') return 0;
    const current = parseInt(sessionStorage.getItem(VERIFY_COUNT_KEY) || '0', 10);
    const next = Number.isNaN(current) ? 1 : current + 1;
    sessionStorage.setItem(VERIFY_COUNT_KEY, String(next));
    return next;
  };

  const incrementToolUsage = (tool: ToolName) => {
    setToolUsage((prev) => ({ ...prev, [tool]: prev[tool] + 1 }));
  };

  const toolStatusLines = (): string[] => [
    'Tool status:',
    `- local_context: used ${toolUsage.local_context} time(s)`,
    `- web_verify: used ${toolUsage.web_verify} time(s), cap ${VERIFY_SESSION_CAP}`,
    `- open_app: used ${toolUsage.open_app} time(s)`,
    `- list_projects: used ${toolUsage.list_projects} time(s)`,
  ];

  const askLlm = async (rawQuery: string) => {
    const query = normalizeLlmQuery(rawQuery);
    if (!query) {
      setHistory((prev) => [...prev, pushLine('output', 'Usage: ask <question>')]);
      return;
    }

    const sessionCount = getAndIncrementLlmCount();
    if (sessionCount > settings.llmSessionCap) {
      setHistory((prev) => [
        ...prev,
        pushLine(
          'output',
          `LLM session cap reached (${settings.llmSessionCap}). Use deterministic commands (help/projects/search/open).`
        ),
      ]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), settings.llmTimeoutMs);

    setIsLlmBusy(true);
    try {
      const grounding = retrieveKnowledge(query, {
        user: userConfig,
        workbench,
        notes: labNotes,
        network: networkNodes,
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildLlmMessages(
            query,
            { user: userConfig, workbench, notes: labNotes, network: networkNodes },
            llmHistory,
            grounding,
            lastWebVerifyContext,
            settings.brainMode
          ),
        }),
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => ({}))) as unknown;
      const message = readChatMessage(payload);

      if (!response.ok || !message) {
        const fallback =
          'LLM request failed. Try again, or use deterministic commands with "help".';
        setHistory((prev) => [...prev, pushLine('output', fallback)]);
        return;
      }

      setLlmHistory((prev) => [
        ...prev,
        { role: 'user', content: query },
        { role: 'assistant', content: message },
      ]);
      const envelopeLines = buildAskEnvelopeLines(
        grounding,
        settings.showLlmSources,
        lastWebVerifyContext
      );
      setHistory((prev) => [
        ...prev,
        pushLine('output', message),
        ...envelopeLines.map((line) => pushLine('system', line)),
      ]);
    } catch (error) {
      const timeoutMessage =
        error instanceof DOMException && error.name === 'AbortError'
          ? `LLM timed out after ${Math.round(settings.llmTimeoutMs / 1000)}s.`
          : 'LLM request failed unexpectedly.';
      setHistory((prev) => [...prev, pushLine('output', timeoutMessage)]);
    } finally {
      clearTimeout(timeout);
      setIsLlmBusy(false);
    }
  };

  const runToolCall = async (
    tool: ToolName,
    input?: Record<string, unknown>,
    suppressRunningBanner = false
  ) => {
    if (tool === 'web_verify') {
      const verifyCount = getAndIncrementVerifyCount();
      if (verifyCount > VERIFY_SESSION_CAP) {
        setHistory((prev) => [
          ...prev,
          pushLine(
            'output',
            `Verify session cap reached (${VERIFY_SESSION_CAP}). Use local context commands or refresh session.`
          ),
        ]);
        return;
      }
    }

    if (toolAbortRef.current) {
      toolAbortRef.current.abort();
      toolAbortRef.current = null;
    }
    const controller = new AbortController();
    toolAbortRef.current = controller;

    if (!suppressRunningBanner) {
      const banner =
        tool === 'web_verify' ? `verify: searching web...` : `tool: executing ${tool}...`;
      setHistory((prev) => [...prev, pushLine('system', banner)]);
    }

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, input }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => ({}))) as
        | {
            ok?: boolean;
            tool?: string;
            result?: Record<string, unknown>;
            message?: string;
          }
        | undefined;

      if (!response.ok || !payload?.ok || payload.tool !== tool || !payload.result) {
        const message =
          typeof payload?.message === 'string' ? payload.message : `Tool ${tool} failed.`;
        setHistory((prev) => [...prev, pushLine('output', message)]);
        return;
      }

      incrementToolUsage(tool);

      if (tool === 'web_verify') {
        const result = payload.result as {
          query?: unknown;
          summary?: unknown;
          sources?: unknown;
        };
        const sources = (Array.isArray(result.sources) ? result.sources : [])
          .filter(
            (source): source is { title: string; url: string; snippet: string } =>
              !!source &&
              typeof source === 'object' &&
              typeof (source as { title?: unknown }).title === 'string' &&
              typeof (source as { url?: unknown }).url === 'string' &&
              typeof (source as { snippet?: unknown }).snippet === 'string'
          )
          .slice(0, 5);
        const summary =
          typeof result.summary === 'string' ? result.summary : 'Verification complete.';
        const verifiedQuery = typeof result.query === 'string' ? result.query : '';
        const lines = buildVerifyEnvelopeLines(summary, sources);
        setLastWebVerifyContext({
          query: verifiedQuery || 'verify',
          summary,
          sources,
        });
        setHistory((prev) => [...prev, ...lines.map((line) => pushLine('output', line))]);
        return;
      }

      if (tool === 'local_context') {
        const result = payload.result as { query?: unknown; hits?: unknown };
        const query = typeof result.query === 'string' ? result.query : 'query';
        const hits = Array.isArray(result.hits)
          ? result.hits.filter(
              (hit): hit is { source: string; title: string; snippet: string; url?: string } =>
                !!hit &&
                typeof hit === 'object' &&
                typeof (hit as { source?: unknown }).source === 'string' &&
                typeof (hit as { title?: unknown }).title === 'string' &&
                typeof (hit as { snippet?: unknown }).snippet === 'string'
            )
          : [];
        const lines: string[] = [
          '[local_context]',
          `- query: ${query}`,
          `- hits: ${hits.length}`,
          '[web_context]',
          '- not used in local_context tool',
        ];
        for (const [index, hit] of hits.slice(0, 8).entries()) {
          lines.push(`${index + 1}. [${hit.source}] ${hit.title}`);
          lines.push(`   ${hit.snippet}`);
          if (hit.url) lines.push(`   ${hit.url}`);
        }
        setHistory((prev) => [...prev, ...lines.map((line) => pushLine('output', line))]);
        return;
      }

      if (tool === 'open_app') {
        const result = payload.result as { target?: unknown; href?: unknown };
        const target = typeof result.target === 'string' ? result.target : 'app';
        const href = typeof result.href === 'string' ? result.href : '';
        if (href) {
          setHistory((prev) => [...prev, pushLine('output', `Opening ${target} -> ${href}`)]);
          runAction({ type: 'navigate', href });
        } else {
          setHistory((prev) => [...prev, pushLine('output', 'open_app returned no href.')]);
        }
        return;
      }

      const result = payload.result as { count?: unknown; projects?: unknown };
      const projects = Array.isArray(result.projects)
        ? result.projects.filter(
            (project): project is { id: string; title: string; subtitle: string } =>
              !!project &&
              typeof project === 'object' &&
              typeof (project as { id?: unknown }).id === 'string' &&
              typeof (project as { title?: unknown }).title === 'string' &&
              typeof (project as { subtitle?: unknown }).subtitle === 'string'
          )
        : [];
      const count = typeof result.count === 'number' ? result.count : projects.length;
      const lines = [`Tool list_projects returned ${count} project(s):`];
      for (const project of projects.slice(0, 12)) {
        lines.push(`- ${project.id}: ${project.title} (${project.subtitle})`);
      }
      setHistory((prev) => [...prev, ...lines.map((line) => pushLine('output', line))]);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      setHistory((prev) => [...prev, pushLine('output', `Tool ${tool} failed unexpectedly.`)]);
    } finally {
      if (toolAbortRef.current === controller) {
        toolAbortRef.current = null;
        setActiveQuickAction(null);
      }
    }
  };

  const runVerify = async (query: string) => {
    setHistory((prev) => [...prev, pushLine('system', `verify: searching web for "${query}"...`)]);
    await runToolCall('web_verify', { query }, true);
  };

  const runQuickAction = async (key: string, action: () => Promise<void>) => {
    setActiveQuickAction(key);
    await action();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = input.trim();
    if (!command || isLlmBusy) return;

    setHistory((prev) => [...prev, pushLine('command', `${prompt} ${command}`)]);
    setInput('');

    let commandToRun = command;
    const isDeterministic = isDeterministicTerminalCommand(commandToRun);

    if (!isDeterministic && !/^ask\s+/i.test(commandToRun)) {
      const routed = routeNaturalLanguageCommand(commandToRun);
      if (routed && routed.confidence >= ROUTER_CONFIDENCE_THRESHOLD) {
        commandToRun = routed.command;
        if (settings.routerDebug) {
          setHistory((prev) => [
            ...prev,
            pushLine(
              'system',
              `router: "${command}" -> "${commandToRun}" (${Math.round(routed.confidence * 100)}%)`
            ),
          ]);
        }
      }
    }

    const isDeterministicAfterRouting = isDeterministicTerminalCommand(commandToRun);
    const llmRoute = settings.llmFallbackForUnknown
      ? isLlmQuery(commandToRun, isDeterministicAfterRouting)
      : /^ask\s+/i.test(commandToRun);
    if (llmRoute) {
      await askLlm(commandToRun);
      return;
    }

    const response = executeTerminalCommand(commandToRun, {
      user: userConfig,
      workbench,
      notes: labNotes,
      network: networkNodes,
    });

    if (response.action.type === 'clear') {
      setHistory([
        pushLine('system', 'DG-Labs Agents Runtime v2'),
        pushLine('system', 'Type "help" for commands or "ask <question>" for LLM mode.'),
      ]);
      return;
    }

    if (response.action.type === 'set_mode') {
      const mode: TerminalBrainMode = response.action.mode;
      setSettings((prev) => ({ ...prev, brainMode: mode }));
    }

    if (response.action.type === 'verify') {
      await runVerify(response.action.query);
      return;
    }

    if (response.action.type === 'list_tools') {
      const lines = toolStatusLines();
      setHistory((prev) => [...prev, ...lines.map((line) => pushLine('output', line))]);
      return;
    }

    if (response.action.type === 'tool_call') {
      await runToolCall(response.action.tool, response.action.input);
      return;
    }

    const newEntries: TerminalEntry[] = [];
    for (const line of response.lines) {
      newEntries.push(pushLine('output', line));
    }

    setHistory((prev) => [...prev, ...newEntries]);
    runAction(response.action);
  };

  const quickButtonClass =
    'rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/90 hover:bg-white/20';
  const getQuickButtonClass = (key: string) =>
    activeQuickAction === key
      ? 'rounded border border-emerald-300/70 bg-emerald-400/20 px-2 py-1 text-xs text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]'
      : quickButtonClass;

  return (
    <div className="rounded-xl border border-emerald-300/20 bg-black/60 shadow-[0_14px_60px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="border-b border-emerald-400/20 px-4 py-2 text-xs text-emerald-300/80">
        Runtime: deterministic commands + LLM (`ask`) | {terminalSettingsSummary(settings)}
      </div>
      <details className="border-b border-emerald-400/20 px-4 py-2 text-xs text-white/70">
        <summary className="cursor-pointer select-none text-emerald-300/90">
          Terminal Settings
        </summary>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.llmFallbackForUnknown}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  llmFallbackForUnknown: event.target.checked,
                }))
              }
            />
            <span>LLM fallback on unknown input</span>
          </label>
          <label className="flex items-center gap-2">
            <span>Brain mode</span>
            <select
              value={settings.brainMode}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
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
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.routerDebug}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  routerDebug: event.target.checked,
                }))
              }
            />
            <span>Show router debug traces</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showLlmSources}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  showLlmSources: event.target.checked,
                }))
              }
            />
            <span>Show LLM source footer</span>
          </label>
          <label className="flex items-center gap-2">
            <span>Timeout (seconds)</span>
            <input
              type="number"
              min={3}
              max={60}
              value={Math.round(settings.llmTimeoutMs / 1000)}
              onChange={(event) => {
                const seconds = parseInt(event.target.value || '15', 10);
                const next = Number.isNaN(seconds) ? 15 : Math.min(60, Math.max(3, seconds));
                setSettings((prev) => ({ ...prev, llmTimeoutMs: next * 1000 }));
              }}
              className="w-16 rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Session cap</span>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.llmSessionCap}
              onChange={(event) => {
                const next = parseInt(event.target.value || '24', 10);
                setSettings((prev) => ({
                  ...prev,
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
            className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/90 hover:bg-white/20"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={resetLlmCounter}
            className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/90 hover:bg-white/20"
          >
            Reset session counter
          </button>
        </div>
      </details>
      <details className="border-b border-emerald-400/20 px-4 py-2 text-xs text-white/70">
        <summary className="cursor-pointer select-none text-emerald-300/90">Tools Panel</summary>
        <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
          <p>
            <span className="text-emerald-300">local_context</span>: retrieve local profile/project
            context ({toolUsage.local_context})
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
            <span className="text-emerald-300">list_projects</span>: enumerate workbench projects (
            {toolUsage.list_projects})
          </p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded border border-white/10 bg-white/5 p-2">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300/90">Context</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('ctx-projects', () =>
                    runToolCall('local_context', { query: 'dessi current projects' })
                  )
                }
                className={getQuickButtonClass('ctx-projects')}
              >
                Current projects
              </button>
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('ctx-profile', () =>
                    runToolCall('local_context', { query: 'dessi profile summary' })
                  )
                }
                className={getQuickButtonClass('ctx-profile')}
              >
                Profile summary
              </button>
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('ctx-list-projects', () => runToolCall('list_projects'))
                }
                className={getQuickButtonClass('ctx-list-projects')}
              >
                List projects
              </button>
            </div>
          </div>
          <div className="rounded border border-white/10 bg-white/5 p-2">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300/90">
              Web Verify ({Math.max(0, VERIFY_SESSION_CAP - toolUsage.web_verify)} left)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('verify-mcp', () =>
                    runVerify('Dessi Georgieva LinkedIn profile work experience education')
                  )
                }
                className={getQuickButtonClass('verify-mcp')}
              >
                Verify LinkedIn profile
              </button>
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('verify-openrouter', () =>
                    runVerify(
                      'Dessi Georgieva projects DG-creative-lab ai-knowledge-hub AI News Hub skills ai-knowledge-hub'
                    )
                  )
                }
                className={getQuickButtonClass('verify-openrouter')}
              >
                Verify project footprint
              </button>
            </div>
          </div>
          <div className="rounded border border-white/10 bg-white/5 p-2 md:col-span-2">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300/90">Open App</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('open-network', () =>
                    runToolCall('open_app', { target: 'network' })
                  )
                }
                className={getQuickButtonClass('open-network')}
              >
                Network
              </button>
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('open-projects', () =>
                    runToolCall('open_app', { target: 'projects' })
                  )
                }
                className={getQuickButtonClass('open-projects')}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('open-notes', () =>
                    runToolCall('open_app', { target: 'notes' })
                  )
                }
                className={getQuickButtonClass('open-notes')}
              >
                Notes
              </button>
              <button
                type="button"
                onClick={() =>
                  void runQuickAction('open-terminal', () =>
                    runToolCall('open_app', { target: 'terminal' })
                  )
                }
                className={getQuickButtonClass('open-terminal')}
              >
                Terminal
              </button>
            </div>
          </div>
        </div>
        {activeQuickAction ? (
          <p className="mt-2 text-[11px] text-emerald-300/80">
            Running action: <span className="font-mono">{activeQuickAction}</span> (click another
            button to switch)
          </p>
        ) : null}
        <p className="mt-2 text-white/50">
          Commands: <code>tools</code> | <code>tool local_context intent modeling</code> |{' '}
          <code>tool web_verify Dessi Georgieva LinkedIn projects</code> |{' '}
          <code>tool list_projects</code>
        </p>
      </details>

      <div
        ref={outputRef}
        className="h-[340px] overflow-y-auto px-4 py-4 font-mono text-sm leading-6 text-emerald-200 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        aria-live="polite"
      >
        {history.map((entry) => (
          <p
            key={entry.id}
            className={
              /^\[(local_context|web_context)\]$/.test(entry.text)
                ? 'mt-1 text-[11px] uppercase tracking-[0.12em] text-cyan-300/85 border-b border-cyan-300/20'
                : entry.kind === 'command'
                  ? 'text-emerald-300'
                  : entry.kind === 'system'
                    ? 'text-white/50'
                    : 'text-white/80'
            }
          >
            {entry.text}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-emerald-400/20 px-4 py-3">
        <label className="flex items-center gap-2 font-mono text-sm">
          <span className="text-emerald-300">{prompt}</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full bg-transparent text-emerald-100 outline-none placeholder:text-emerald-200/30"
            placeholder='Try: help, open network, search intent, ask "Explain DG-Labs OS"'
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={isLlmBusy}
            aria-label="Terminal command input"
          />
        </label>
      </form>
    </div>
  );
}
