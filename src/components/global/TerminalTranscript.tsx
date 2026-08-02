import { useState } from 'react';
import type { Dispatch, FormEvent, KeyboardEvent, RefObject, SetStateAction } from 'react';
import { FiArrowUp, FiPaperclip, FiSquare } from 'react-icons/fi';
import { confidenceBadgeText, normalizeTerminalNarrativeAnswer } from '../../utils/terminalLlm';
import type { LastAnswerMeta, TerminalEntry } from '../../services/terminalTypes';

type TerminalTranscriptProps = {
  outputRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  history: TerminalEntry[];
  isLlmBusy: boolean;
  streamingAnswer: string;
  streamingStatus: string;
  lastAnswerMeta: LastAnswerMeta | null;
  evidenceCount: number;
  profileName: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  advancedMode: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onStarterQuestion: (question: string) => Promise<void>;
  onOpenEvidence: () => void;
  onOpenConnection: () => void;
  onStartOver: () => void;
  onCancel: () => void;
};

type TranscriptGroup = {
  id: number;
  kind: TerminalEntry['kind'];
  lines: string[];
};

const STARTER_QUESTIONS = [
  'What has Dessi built?',
  'Which work demonstrates agent reliability?',
  'What kind of problems is Dessi best suited to solve?',
] as const;

function StarterQuestionList({ onSelect }: { onSelect: (question: string) => Promise<void> }) {
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {STARTER_QUESTIONS.map((question, index) => (
        <button
          key={question}
          type="button"
          onClick={() => void onSelect(question)}
          className="group grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 py-2.5 text-left text-sm text-white/72 transition hover:text-white"
        >
          <span className="font-mono text-[10px] text-sky-300/55">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span>{question}</span>
          <span className="translate-x-0 text-white/25 transition group-hover:translate-x-1 group-hover:text-sky-300">
            →
          </span>
        </button>
      ))}
    </div>
  );
}

const groupEntries = (history: readonly TerminalEntry[]): TranscriptGroup[] => {
  const groups: TranscriptGroup[] = [];

  for (const entry of history) {
    const previous = groups[groups.length - 1];
    if (previous && previous.kind === entry.kind && entry.kind !== 'command') {
      previous.lines.push(entry.text);
      continue;
    }
    groups.push({ id: entry.id, kind: entry.kind, lines: [entry.text] });
  }

  return groups;
};

const cleanQuestion = (line: string): string => {
  const separator = line.indexOf('$ ');
  return separator >= 0 ? line.slice(separator + 2) : line;
};

export function TerminalTranscript({
  outputRef,
  inputRef,
  history,
  isLlmBusy,
  streamingAnswer,
  streamingStatus,
  lastAnswerMeta,
  evidenceCount,
  profileName,
  input,
  setInput,
  advancedMode,
  onSubmit,
  onStarterQuestion,
  onOpenEvidence,
  onOpenConnection,
  onStartOver,
  onCancel,
}: TerminalTranscriptProps) {
  const [showStarterQuestions, setShowStarterQuestions] = useState(false);
  const visibleHistory = advancedMode
    ? history
    : history.filter((entry) => entry.kind !== 'system');
  const groups = groupEntries(visibleHistory);
  const hasConversation = groups.some((group) => group.kind !== 'system');
  const citationCount = lastAnswerMeta?.chips.length ?? 0;

  const renderAnswerText = (line: string) =>
    line.split(/(\[evidence:[^\]]+\])/g).map((part, index) => {
      if (!/^\[evidence:[^\]]+\]$/.test(part)) return part;
      return (
        <button
          key={`${part}-${index}`}
          type="button"
          onClick={onOpenEvidence}
          title={part.slice(1, -1)}
          className="ml-1 align-baseline font-mono text-[9px] uppercase tracking-[0.1em] text-sky-300/72 hover:text-sky-200"
        >
          [evidence]
        </button>
      );
    });

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleStarterQuestion = async (question: string) => {
    setShowStarterQuestions(false);
    await onStarterQuestion(question);
  };

  const handleStartOver = () => {
    setShowStarterQuestions(false);
    onStartOver();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#080c12]">
      <div
        ref={outputRef}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        aria-live="polite"
      >
        {!hasConversation ? (
          <div className="mx-auto flex min-h-full max-w-3xl flex-col [justify-content:safe_center]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-300/75">
              Reviewed public profile
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
              Ask what {profileName} has built, learned, or can support with evidence.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/56">
              Profile Agent answers from reviewed public material. It can identify patterns, but it
              cannot speak on {profileName}&apos;s behalf.
            </p>
            <div className="mt-5">
              <StarterQuestionList onSelect={handleStarterQuestion} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {groups.map((group) => {
              if (group.kind === 'command') {
                return (
                  <div key={group.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-[1.15rem_1.15rem_0.3rem_1.15rem] bg-white px-4 py-3 text-sm leading-6 text-[#101318]">
                      {cleanQuestion(group.lines[0])}
                    </div>
                  </div>
                );
              }

              if (group.kind === 'system') {
                return (
                  <div
                    key={group.id}
                    className="border-l border-sky-300/25 pl-3 font-mono text-[10px] leading-5 text-white/38"
                  >
                    {group.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                );
              }

              return (
                <div key={group.id} className="max-w-[92%] text-sm leading-6 text-white/78">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sky-300/68">
                    Profile Agent
                  </p>
                  <div className="space-y-1 whitespace-pre-wrap">
                    {group.lines.map((line, index) => (
                      <p key={`${group.id}-${index}`}>{renderAnswerText(line)}</p>
                    ))}
                  </div>
                </div>
              );
            })}

            {isLlmBusy ? (
              <div className="max-w-[92%] text-sm leading-6 text-white/78">
                <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sky-300/68">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-300" />
                  {streamingStatus || 'Reading the profile evidence'}
                </p>
                {streamingAnswer ? (
                  <p className="whitespace-pre-wrap">
                    {renderAnswerText(normalizeTerminalNarrativeAnswer(streamingAnswer))}
                  </p>
                ) : (
                  <p className="text-white/35">Preparing an evidence-backed answer...</p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-[#0b0f15] px-4 py-3 sm:px-6">
        {hasConversation && !isLlmBusy ? (
          <div className="mx-auto mb-3 max-w-3xl">
            <div className="flex items-center gap-4 text-[11px]">
              <button
                type="button"
                onClick={() => setShowStarterQuestions((visible) => !visible)}
                aria-expanded={showStarterQuestions}
                className="text-sky-300/80 transition hover:text-sky-200"
              >
                {showStarterQuestions ? 'Hide suggested questions' : 'Ask another question'}
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-white/38 transition hover:text-white/65"
              >
                Start over
              </button>
            </div>
            {showStarterQuestions ? (
              <div className="mt-3">
                <StarterQuestionList onSelect={handleStarterQuestion} />
              </div>
            ) : null}
          </div>
        ) : null}

        {lastAnswerMeta && hasConversation ? (
          <div className="mx-auto mb-2 flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/45">
            <span>{confidenceBadgeText(lastAnswerMeta.confidence)} evidence</span>
            <button
              type="button"
              onClick={onOpenEvidence}
              className="inline-flex items-center gap-1.5 text-sky-300/80 transition hover:text-sky-200"
            >
              <FiPaperclip aria-hidden="true" />
              {evidenceCount} reviewed record{evidenceCount === 1 ? '' : 's'}
              {citationCount > 0
                ? ` · ${citationCount} public link${citationCount === 1 ? '' : 's'}`
                : ''}
            </button>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl items-end gap-3">
          <div className="min-w-0 flex-1 border-b border-white/18 pb-1 focus-within:border-sky-300/65">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="max-h-28 min-h-10 w-full resize-none bg-transparent py-2 text-sm leading-5 text-white outline-none placeholder:text-white/28"
              placeholder={`Ask about ${profileName}'s work, evidence, or experience`}
              autoComplete="off"
              spellCheck="true"
              aria-label={`Ask ${profileName}'s public profile`}
            />
          </div>
          {isLlmBusy ? (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Stop response"
              className="mb-1 grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/65 transition hover:border-white/30 hover:text-white"
            >
              <FiSquare size={13} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send question"
              className="mb-1 grid h-9 w-9 place-items-center rounded-full bg-sky-300 text-[#071019] transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
            >
              <FiArrowUp size={16} aria-hidden="true" />
            </button>
          )}
        </form>
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between gap-4 text-[10px] text-white/30">
          <span>Enter to send · Shift + Enter for a new line</span>
          <button type="button" onClick={onOpenConnection} className="hover:text-white/60">
            AI connection
          </button>
        </div>
      </div>
    </div>
  );
}
