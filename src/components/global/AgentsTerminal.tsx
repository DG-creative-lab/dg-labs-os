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
import { retrieveKnowledge } from '../../utils/terminalKnowledge';
import {
  defaultTerminalSettings,
  parseTerminalSettings,
  serializeTerminalSettings,
  terminalSettingsSummary,
  TERMINAL_SETTINGS_KEY,
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

const LLM_COUNT_KEY = 'dg_labs_terminal_llm_count';
const ROUTER_CONFIDENCE_THRESHOLD = 0.8;

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
    case 'none':
    default:
      break;
  }
};

export default function AgentsTerminal() {
  const [input, setInput] = useState('');
  const [isLlmBusy, setIsLlmBusy] = useState(false);
  const [settings, setSettings] = useState<TerminalSettings>(defaultTerminalSettings);
  const [llmHistory, setLlmHistory] = useState<LlmHistoryMessage[]>([]);
  const [history, setHistory] = useState<TerminalEntry[]>([
    { id: 1, kind: 'system', text: 'DG-Labs Agents Runtime v2' },
    { id: 2, kind: 'system', text: 'Type "help" for commands or "ask <question>" for LLM mode.' },
  ]);
  const nextIdRef = useRef(3);

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
            grounding
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
      const sourceSummary =
        grounding.length > 0
          ? `Sources used: ${grounding.map((item) => `${item.source}:${item.title}`).join(' | ')}`
          : 'Sources used: none matched; response based on general terminal context.';
      if (settings.showLlmSources) {
        setHistory((prev) => [
          ...prev,
          pushLine('output', message),
          pushLine('system', sourceSummary),
        ]);
      } else {
        setHistory((prev) => [...prev, pushLine('output', message)]);
      }
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

    const newEntries: TerminalEntry[] = [];
    for (const line of response.lines) {
      newEntries.push(pushLine('output', line));
    }

    setHistory((prev) => [...prev, ...newEntries]);
    runAction(response.action);
  };

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

      <div
        className="h-[340px] overflow-y-auto px-4 py-4 font-mono text-sm leading-6 text-emerald-200"
        aria-live="polite"
      >
        {history.map((entry) => (
          <p
            key={entry.id}
            className={
              entry.kind === 'command'
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
