import type { Dispatch, FormEvent, RefObject, SetStateAction } from 'react';
import {
  confidenceBadgeText,
  explainConfidenceLabel,
  groupCitationChips,
  normalizeTerminalNarrativeAnswer,
} from '../../utils/terminalLlm';
import type { LastAnswerMeta, TerminalEntry } from '../../services/terminalTypes';

type TerminalTranscriptProps = {
  outputRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  history: TerminalEntry[];
  isLlmBusy: boolean;
  streamingAnswer: string;
  streamingStatus: string;
  lastAnswerMeta: LastAnswerMeta | null;
  showCitationDetails: boolean;
  setShowCitationDetails: Dispatch<SetStateAction<boolean>>;
  prompt: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

const confidenceBadgeClass = (
  confidence: NonNullable<TerminalTranscriptProps['lastAnswerMeta']>['confidence']
) => {
  if (confidence === 'local+verified')
    return 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200';
  if (confidence === 'local-only') return 'border-cyan-300/50 bg-cyan-400/10 text-cyan-200';
  if (confidence === 'verified-only')
    return 'border-indigo-300/50 bg-indigo-400/10 text-indigo-200';
  return 'border-amber-300/50 bg-amber-400/10 text-amber-200';
};

export function TerminalTranscript({
  outputRef,
  inputRef,
  history,
  isLlmBusy,
  streamingAnswer,
  streamingStatus,
  lastAnswerMeta,
  showCitationDetails,
  setShowCitationDetails,
  prompt,
  input,
  setInput,
  onSubmit,
}: TerminalTranscriptProps) {
  const groupedCitations = groupCitationChips(lastAnswerMeta?.chips ?? []);
  const totalCitationCount = lastAnswerMeta?.chips.length ?? 0;

  return (
    <>
      <div
        ref={outputRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-3 font-mono text-[11px] leading-5 text-emerald-200 sm:px-4 sm:text-[12px] sm:leading-6 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        aria-live="polite"
      >
        {history.map((entry) => (
          <p
            key={entry.id}
            className={
              /^\[(local_context|web_context|citations|confidence|evidence|verification_gap)\]/.test(
                entry.text
              )
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
        {isLlmBusy && (streamingStatus || streamingAnswer) ? (
          <div
            className={`mt-3 rounded border px-3 py-2 ${streamingAnswer ? 'border-emerald-400/25 bg-emerald-400/[0.06]' : 'border-cyan-400/20 bg-cyan-400/[0.05]'}`}
          >
            <div
              className={`mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] ${streamingAnswer ? 'text-emerald-300/80' : 'text-cyan-300/80'}`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${streamingAnswer ? 'bg-emerald-300/80' : 'bg-cyan-300/80'}`}
              />
              <span>{streamingStatus || 'Streaming response…'}</span>
            </div>
            {streamingAnswer ? (
              <p className="whitespace-pre-wrap text-white/85">
                {normalizeTerminalNarrativeAnswer(streamingAnswer)}
              </p>
            ) : (
              <p className="text-white/45">Waiting for first tokens…</p>
            )}
          </div>
        ) : null}
      </div>
      <form onSubmit={onSubmit} className="border-t border-emerald-400/20 px-3 py-3 sm:px-4">
        {lastAnswerMeta ? (
          <div className="mb-2 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 ${confidenceBadgeClass(lastAnswerMeta.confidence)}`}
                title={explainConfidenceLabel(lastAnswerMeta.confidence)}
              >
                {confidenceBadgeText(lastAnswerMeta.confidence)}
              </span>
              <span className="text-white/55">
                {totalCitationCount} citation{totalCitationCount === 1 ? '' : 's'}
              </span>
              {typeof lastAnswerMeta.unverifiedCount === 'number' &&
              lastAnswerMeta.unverifiedCount > 0 ? (
                <span className="text-amber-200/90">
                  {lastAnswerMeta.unverifiedCount} unverified
                </span>
              ) : null}
              {totalCitationCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowCitationDetails((previous) => !previous)}
                  className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-white/90 hover:bg-white/20"
                >
                  {showCitationDetails ? 'Hide sources' : 'Show sources'}
                </button>
              ) : null}
            </div>
            {showCitationDetails && totalCitationCount > 0 ? (
              <div className="space-y-1">
                {groupedCitations.map((bucket) => (
                  <div key={bucket.group} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.08em] text-white/45">
                      {bucket.group}
                    </span>
                    {bucket.chips.slice(0, 3).map((chip) => (
                      <a
                        key={`${bucket.group}-${chip.url}`}
                        href={chip.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-white/80 hover:bg-white/10"
                        title={`${bucket.group}: ${chip.label}`}
                      >
                        {chip.label}
                      </a>
                    ))}
                    {bucket.chips.length > 3 ? (
                      <span className="text-white/45">+{bucket.chips.length - 3}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <label className="flex flex-col items-start gap-2 font-mono text-sm sm:flex-row sm:items-center">
          <span className="text-emerald-300">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full bg-transparent text-emerald-100 outline-none placeholder:text-emerald-200/30 caret-emerald-200"
            placeholder="Try: tell me about DG-Labs OS, brief top 3 projects, cv current role"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </label>
      </form>
    </>
  );
}
