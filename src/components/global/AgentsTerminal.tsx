import { useMemo, useRef, useState } from 'react';
import { userConfig } from '../../config';
import { labNotes } from '../../config/labNotes';
import { networkNodes } from '../../config/network';
import { workbench } from '../../config/workbench';
import { executeTerminalCommand, type TerminalAction } from '../../utils/terminalCommands';

type TerminalEntry = {
  id: number;
  kind: 'command' | 'output' | 'system';
  text: string;
};

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
  const [history, setHistory] = useState<TerminalEntry[]>([
    { id: 1, kind: 'system', text: 'DG-Labs Agents Runtime v1' },
    { id: 2, kind: 'system', text: 'Type "help" to view available commands.' },
  ]);
  const nextIdRef = useRef(3);
  const outputRef = useRef<HTMLDivElement | null>(null);

  const prompt = useMemo(() => `${userConfig.name}:~$`, []);

  const pushLine = (kind: TerminalEntry['kind'], text: string): TerminalEntry => ({
    id: nextIdRef.current++,
    kind,
    text,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;

    const response = executeTerminalCommand(command, {
      user: userConfig,
      workbench,
      notes: labNotes,
      network: networkNodes,
    });

    if (response.action.type === 'clear') {
      setHistory([
        pushLine('system', 'DG-Labs Agents Runtime v1'),
        pushLine('system', 'Type "help" to view available commands.'),
      ]);
      setInput('');
      return;
    }

    const newEntries = [pushLine('command', `${prompt} ${command}`)];
    for (const line of response.lines) {
      newEntries.push(pushLine('output', line));
    }

    setHistory((prev) => [...prev, ...newEntries]);
    setInput('');
    runAction(response.action);
  };

  return (
    <div className="rounded-xl border border-emerald-300/20 bg-black/60 shadow-[0_14px_60px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="border-b border-emerald-400/20 px-4 py-2 text-xs text-emerald-300/80">
        Runtime: deterministic commands | LLM bridge: planned
      </div>

      <div
        ref={outputRef}
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
            placeholder="Try: help, projects, search intent, open network"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </label>
      </form>
    </div>
  );
}
