import { useEffect, useMemo, useRef, useState } from 'react';
import type { ActiveProfileRuntime } from '../../profiles';
import {
  executeTerminalCommand,
  isDeterministicTerminalCommand,
  type TerminalAction,
} from '../../utils/terminalCommands';
import { routeNaturalLanguageCommand } from '../../utils/terminalRouter';
import {
  buildCitationChips,
  consumeJsonSseStream,
  confidenceBadgeText,
  explainConfidenceLabel,
  explainVerificationGap,
  formatAnswerWithCitations,
  isLlmQuery,
  normalizeLlmQuery,
  normalizeTerminalNarrativeAnswer,
  parseLlmModeQuery,
  readChatErrorMeta,
  readChatMeta,
  readChatMessage,
  resolveAnswerConfidenceLabel,
} from '../../utils/terminalLlm';
import { buildVerifyEnvelopeLines } from '../../utils/terminalEnvelope';
import {
  handleTerminalMenuAction,
  type TerminalMenuEventDetail,
} from '../../services/menuActionHandlers';
import {
  INITIAL_TOOL_USAGE,
  LLM_COUNT_KEY,
  ROUTER_CONFIDENCE_THRESHOLD,
  VERIFY_COUNT_KEY,
  VERIFY_SESSION_CAP,
  type CiteResult,
  type EvidenceState,
  type LastAnswerMeta,
  type LastWebVerifyContext,
  type LlmHistoryMessage,
  type RetrieveResult,
  type TerminalEntry,
  type TerminalPanelTab,
  type ToolName,
  type ToolUsage,
} from '../../services/terminalTypes';
import { useTerminalSessionSettings } from '../../services/useTerminalSessionSettings';
import { TerminalControlPanels } from './TerminalControlPanels';
import { TerminalTranscript } from './TerminalTranscript';
import {
  fetchCiteTool,
  fetchRetrieveTool,
  fetchTerminalTool,
  normalizeTerminalCacheKey,
  trimTerminalCache,
} from '../../services/terminalToolClient';
import type { TerminalBrainMode } from '../../utils/terminalSettings';

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

export default function AgentsTerminal({ profile }: { profile: ActiveProfileRuntime }) {
  const [input, setInput] = useState('');
  const [isLlmBusy, setIsLlmBusy] = useState(false);
  const { byokApiKey, setByokApiKey, settings, setSettings, providerHealth } =
    useTerminalSessionSettings();
  const [toolUsage, setToolUsage] = useState<ToolUsage>(INITIAL_TOOL_USAGE);
  const [lastWebVerifyContext, setLastWebVerifyContext] = useState<LastWebVerifyContext | null>(
    null
  );
  const [llmHistory, setLlmHistory] = useState<LlmHistoryMessage[]>([]);
  const [lastEvidence, setLastEvidence] = useState<EvidenceState | null>(null);
  const [activePanelTab, setActivePanelTab] = useState<TerminalPanelTab>(null);
  const [lastAnswerMeta, setLastAnswerMeta] = useState<LastAnswerMeta | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [streamingStatus, setStreamingStatus] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const nextIdRef = useRef(1);
  const toolAbortRef = useRef<AbortController | null>(null);
  const llmAbortRef = useRef<AbortController | null>(null);
  const retrieveCacheRef = useRef<Map<string, Omit<RetrieveResult, 'fromCache'>>>(new Map());
  const citeCacheRef = useRef<Map<string, Omit<CiteResult, 'fromCache'>>>(new Map());
  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const prompt = useMemo(() => `${profile.identity.preferredName}:~$`, [profile]);
  useEffect(() => {
    if (!outputRef.current) return;
    if (history.length === 0 && !streamingAnswer && !streamingStatus) return;
    outputRef.current.scrollTo({
      top: outputRef.current.scrollHeight,
      behavior: 'smooth',
    });
    // Keep terminal input alive after output updates.
    inputRef.current?.focus();
  }, [history, streamingAnswer, streamingStatus]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const runRetrieveTool = async (
    query: string,
    signal?: AbortSignal,
    limit = 6
  ): Promise<RetrieveResult | null> => {
    const key = `${profile.handle}:${normalizeTerminalCacheKey(query)}`;
    incrementToolUsage('retrieve');
    const cached = retrieveCacheRef.current.get(key);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const materialized = await fetchRetrieveTool(profile.handle, query, signal, limit);
    if (!materialized) return null;
    retrieveCacheRef.current.set(key, materialized);
    trimTerminalCache(retrieveCacheRef.current);
    return { ...materialized, fromCache: false };
  };

  const runCiteTool = async (claim: string, signal?: AbortSignal): Promise<CiteResult | null> => {
    const key = `${profile.handle}:${normalizeTerminalCacheKey(claim)}`;
    incrementToolUsage('cite');
    const cached = citeCacheRef.current.get(key);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const materialized = await fetchCiteTool(profile.handle, claim, signal);
    if (!materialized) return null;
    citeCacheRef.current.set(key, materialized);
    trimTerminalCache(citeCacheRef.current);
    return { ...materialized, fromCache: false };
  };

  const toolStatusLines = (): string[] => [
    'Tool status:',
    `- profile_context: used ${toolUsage.profile_context} time(s)`,
    `- local_context: used ${toolUsage.local_context} time(s)`,
    `- web_verify: used ${toolUsage.web_verify} time(s), cap ${VERIFY_SESSION_CAP}`,
    `- open_app: used ${toolUsage.open_app} time(s)`,
    `- list_projects: used ${toolUsage.list_projects} time(s)`,
    `- retrieve: used ${toolUsage.retrieve} time(s)`,
    `- cite: used ${toolUsage.cite} time(s)`,
  ];

  const answerFromProfileIndex = async (query: string) => {
    const result = await runRetrieveTool(query, undefined, 5);
    if (!result || result.hits.length === 0) {
      setHistory((previous) => [
        ...previous,
        pushLine(
          'output',
          'The reviewed profile index does not contain enough material to answer that question yet.'
        ),
      ]);
      return;
    }

    setLastEvidence({
      query: result.query,
      classification: result.classification,
      verdict: 'profile-match',
      hits: result.hits,
      fromCache: result.fromCache,
    });
    const chips = buildCitationChips(result.hits, []);
    setLastAnswerMeta({
      confidence: 'local-only',
      chips,
    });
    setHistory((previous) => [
      ...previous,
      pushLine(
        'output',
        'Generative synthesis is not connected, so I found the closest reviewed profile records instead.'
      ),
      ...result.hits.slice(0, 3).map((hit) => pushLine('output', `${hit.title}: ${hit.snippet}`)),
      pushLine('system', 'Connect an AI provider if you want these records synthesized.'),
    ]);
  };

  const askLlm = async (rawQuery: string) => {
    const parsed = parseLlmModeQuery(rawQuery);
    const query = normalizeLlmQuery(parsed.query);
    if (!query) {
      setHistory((prev) => [
        ...prev,
        pushLine('output', 'Usage: ask|brief|cv|projects <question>'),
      ]);
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

    if (!byokApiKey.trim() && providerHealth.status === 'missing_key') {
      await answerFromProfileIndex(query);
      return;
    }

    const controller = new AbortController();
    llmAbortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), settings.llmTimeoutMs);

    setIsLlmBusy(true);
    setStreamingAnswer('');
    setStreamingStatus('Preparing answer…');
    try {
      let retrievalLines: string[] = [];

      const retrieveResult = await runRetrieveTool(query, controller.signal, 6);
      if (retrieveResult) {
        const hits = retrieveResult.hits;
        const classification = retrieveResult.classification;
        retrievalLines = [
          '[evidence]',
          `- workflow: classify -> retrieve -> cite -> answer`,
          `- classification: ${classification}`,
          `- retrieved: ${hits.length}`,
          `- retrieve cache: ${retrieveResult.fromCache ? 'hit' : 'miss'}`,
        ];
      }

      const citeResult = await runCiteTool(query, controller.signal);
      if (citeResult) {
        const verdict = citeResult.verdict;
        const evidence = citeResult.evidence;
        retrievalLines.push(`- citation verdict: ${verdict}`);
        retrievalLines.push(`- evidence refs: ${evidence.length}`);
        retrievalLines.push(`- cite cache: ${citeResult.fromCache ? 'hit' : 'miss'}`);
        setLastEvidence({
          query: retrieveResult?.query ?? query,
          classification: retrieveResult?.classification ?? 'general',
          verdict,
          hits: evidence.length > 0 ? evidence : (retrieveResult?.hits ?? []),
          fromCache: (retrieveResult?.fromCache ?? false) && citeResult.fromCache,
        });
      } else if (retrieveResult) {
        setLastEvidence({
          query: retrieveResult.query,
          classification: retrieveResult.classification,
          verdict: 'unknown',
          hits: retrieveResult.hits,
          fromCache: retrieveResult.fromCache,
        });
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...llmHistory.slice(-12), { role: 'user', content: query }],
          responseMode: 'narrative',
          provider: settings.llmProvider,
          model: settings.llmModel,
          byokApiKey: byokApiKey.trim().length > 0 ? byokApiKey.trim() : undefined,
          providerFallbackAllowed: settings.providerFallbackAllowed,
          profileHandle: profile.handle,
          answerMode: parsed.mode,
          brainMode: settings.brainMode,
        }),
        signal: controller.signal,
      });
      const contentType = response.headers.get('content-type') ?? '';
      let payload: unknown = {};
      let streamErrorPayload: unknown = null;

      if (response.ok && contentType.includes('text/event-stream')) {
        await consumeJsonSseStream(response, async ({ event, payload: eventPayload }) => {
          if (event === 'status') {
            const statusMessage =
              eventPayload &&
              typeof eventPayload === 'object' &&
              typeof (eventPayload as { message?: unknown }).message === 'string'
                ? ((eventPayload as { message: string }).message as string)
                : null;
            if (statusMessage) {
              setStreamingStatus(statusMessage);
            }
            return;
          }

          if (event === 'delta') {
            const delta =
              eventPayload &&
              typeof eventPayload === 'object' &&
              typeof (eventPayload as { delta?: unknown }).delta === 'string'
                ? ((eventPayload as { delta: string }).delta as string)
                : '';
            if (delta) {
              setStreamingStatus('Streaming response…');
              setStreamingAnswer((prev) => prev + delta);
            }
            return;
          }

          if (event === 'result') {
            payload = eventPayload;
            return;
          }

          if (event === 'error') {
            streamErrorPayload = eventPayload;
          }
        });
      } else {
        payload = (await response.json().catch(() => ({}))) as unknown;
      }

      const resolvedPayload = streamErrorPayload ?? payload;
      const message = readChatMessage(resolvedPayload);
      const chatMeta = readChatMeta(resolvedPayload);
      const chatErrorMeta = readChatErrorMeta(resolvedPayload);

      if (!response.ok || streamErrorPayload || !message) {
        setStreamingAnswer('');
        setStreamingStatus('');
        const errorRecord =
          resolvedPayload && typeof resolvedPayload === 'object'
            ? (resolvedPayload as Record<string, unknown>)
            : null;
        const errorCode =
          errorRecord && typeof errorRecord.code === 'string' ? errorRecord.code : 'PROVIDER_ERROR';
        const errorMessage =
          errorRecord && typeof errorRecord.message === 'string'
            ? errorRecord.message
            : 'LLM request failed.';
        const hint =
          chatErrorMeta?.hint ||
          'Try again, switch provider, add BYOK, or use deterministic commands.';
        setHistory((prev) => [
          ...prev,
          pushLine(
            'system',
            `[provider_error] ${chatErrorMeta?.provider ?? settings.llmProvider} | class=${errorCode}${
              typeof chatErrorMeta?.fallbackAvailable === 'boolean'
                ? ` | fallback=${chatErrorMeta.fallbackAvailable ? 'available' : 'unavailable'}`
                : ''
            }`
          ),
          pushLine('output', errorMessage),
          pushLine('system', `- hint: ${hint}`),
        ]);
        return;
      }

      setLlmHistory((prev) => [
        ...prev,
        { role: 'user', content: query },
        { role: 'assistant', content: message },
      ]);

      const evidenceRefs = (citeResult?.evidence ?? retrieveResult?.hits ?? []).map((hit) => ({
        source: hit.source,
        title: hit.title,
        snippet: hit.snippet,
        url: hit.url,
        score: hit.score,
      }));
      const cited = formatAnswerWithCitations(message, evidenceRefs, settings.strictEvidenceMode);
      const answerText = normalizeTerminalNarrativeAnswer(
        settings.strictEvidenceMode ? cited.answer : message
      );
      setStreamingAnswer('');
      setStreamingStatus('');
      const confidence = resolveAnswerConfidenceLabel(
        evidenceRefs.length,
        lastWebVerifyContext?.sources.length ?? 0
      );
      const chips = buildCitationChips(evidenceRefs, lastWebVerifyContext?.sources ?? []);
      setLastAnswerMeta({
        confidence,
        chips,
        unverifiedCount: cited.unverifiedCount,
      });
      const confidenceGuidance = explainConfidenceLabel(confidence);
      setHistory((prev) => [
        ...prev,
        ...retrievalLines.map((line) => pushLine('system', line)),
        ...(chatMeta
          ? [
              pushLine(
                'system',
                `[provider] ${chatMeta.provider} | model=${chatMeta.model} | latency=${chatMeta.latencyMs}ms${
                  chatMeta.fallbackUsed && chatMeta.fallbackFrom
                    ? ` | fallback ${chatMeta.fallbackFrom} -> ${chatMeta.provider}`
                    : ''
                }`
              ),
            ]
          : []),
        pushLine('output', answerText),
        pushLine('system', `${confidenceBadgeText(confidence)} confidence • ${confidenceGuidance}`),
        ...(chips.length > 0
          ? [pushLine('system', `${chips.length} source link(s) available below.`)]
          : []),
        ...(cited.unverifiedCount > 0
          ? [
              pushLine(
                'system',
                `${cited.unverifiedCount} claim(s) are not directly evidenced in the current context.`
              ),
            ]
          : []),
        ...(settings.showLlmSources
          ? [
              pushLine(
                'system',
                `Grounded in ${evidenceRefs.length} local source(s)${
                  lastWebVerifyContext?.sources.length
                    ? ` and ${lastWebVerifyContext.sources.length} verified web source(s)`
                    : ''
                }.`
              ),
            ]
          : []),
      ]);
    } catch (error) {
      setStreamingAnswer('');
      setStreamingStatus('');
      const timeoutMessage =
        error instanceof DOMException && error.name === 'AbortError'
          ? `LLM timed out after ${Math.round(settings.llmTimeoutMs / 1000)}s.`
          : 'LLM request failed unexpectedly.';
      setHistory((prev) => [...prev, pushLine('output', timeoutMessage)]);
    } finally {
      if (llmAbortRef.current === controller) {
        llmAbortRef.current = null;
      }
      clearTimeout(timeout);
      setIsLlmBusy(false);
      setStreamingStatus('');
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
      if (tool === 'retrieve') {
        const query =
          typeof input?.query === 'string' && input.query.trim().length > 0 ? input.query : 'query';
        const limit = typeof input?.limit === 'number' ? input.limit : 6;
        const result = await runRetrieveTool(query, controller.signal, limit);
        if (!result) {
          setHistory((prev) => [...prev, pushLine('output', 'Tool retrieve failed.')]);
          return;
        }
        const lines: string[] = [
          '[retrieve]',
          `- query: ${result.query}`,
          `- classification: ${result.classification}`,
          `- hits: ${result.hits.length}`,
          `- cache: ${result.fromCache ? 'hit' : 'miss'}`,
        ];
        for (const [index, hit] of result.hits.slice(0, 8).entries()) {
          lines.push(`${index + 1}. [${hit.source}] ${hit.title} (score=${hit.score})`);
          lines.push(`   ${hit.snippet}`);
          if (hit.url) lines.push(`   ${hit.url}`);
        }
        setLastEvidence({
          query: result.query,
          classification: result.classification,
          verdict: 'unknown',
          hits: result.hits,
          fromCache: result.fromCache,
        });
        setHistory((prev) => [...prev, ...lines.map((line) => pushLine('output', line))]);
        return;
      }

      if (tool === 'cite') {
        const claim =
          typeof input?.claim === 'string' && input.claim.trim().length > 0 ? input.claim : 'claim';
        const result = await runCiteTool(claim, controller.signal);
        if (!result) {
          setHistory((prev) => [...prev, pushLine('output', 'Tool cite failed.')]);
          return;
        }
        const lines: string[] = [
          '[cite]',
          `- claim: ${result.claim}`,
          `- verdict: ${result.verdict}`,
          `- evidence: ${result.evidence.length}`,
          `- cache: ${result.fromCache ? 'hit' : 'miss'}`,
        ];
        for (const [index, hit] of result.evidence.slice(0, 5).entries()) {
          lines.push(`${index + 1}. [${hit.source}] ${hit.title} (score=${hit.score})`);
          if (hit.url) lines.push(`   ${hit.url}`);
        }
        setLastEvidence({
          query: result.claim,
          classification: 'general',
          verdict: result.verdict,
          hits: result.evidence,
          fromCache: result.fromCache,
        });
        setHistory((prev) => [...prev, ...lines.map((line) => pushLine('output', line))]);
        return;
      }

      const { response, payload } = await fetchTerminalTool(
        profile.handle,
        tool,
        input,
        controller.signal
      );

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
        const confidence = resolveAnswerConfidenceLabel(0, sources.length);
        const confidenceGuidance = explainConfidenceLabel(confidence);
        const verificationGap = explainVerificationGap(sources.length, verifiedQuery || 'verify');
        const chips = buildCitationChips([], sources);
        const lines = buildVerifyEnvelopeLines(summary, sources);
        setLastWebVerifyContext({
          query: verifiedQuery || 'verify',
          summary,
          sources,
        });
        setLastAnswerMeta({ confidence, chips });
        setHistory((prev) => [
          ...prev,
          ...lines.map((line) => pushLine('output', line)),
          pushLine('system', `[confidence] ${confidence}`),
          pushLine('system', `- ${confidenceGuidance}`),
          ...(verificationGap ? [pushLine('system', `- ${verificationGap}`)] : []),
          ...(chips.length > 0
            ? [pushLine('system', `[citations] ${chips.length} web citation(s) available below`)]
            : []),
        ]);
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

      if (tool === 'profile_context') {
        const result = payload.result as { lines?: unknown };
        const lines = Array.isArray(result.lines)
          ? result.lines.filter((line): line is string => typeof line === 'string')
          : [];
        setHistory((prev) => [
          ...prev,
          ...(lines.length > 0
            ? lines.map((line) => pushLine('output', line))
            : [pushLine('output', 'No reviewed profile context was returned.')]),
        ]);
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
      }
    }
  };

  const runVerify = async (query: string) => {
    setHistory((prev) => [...prev, pushLine('system', `verify: searching web for "${query}"...`)]);
    await runToolCall('web_verify', { query }, true);
  };

  const runQuickAction = async (key: string, action: () => Promise<void>) => {
    void key;
    await action();
  };

  useEffect(() => {
    const handleMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<TerminalMenuEventDetail>;
      handleTerminalMenuAction(customEvent.detail, {
        clearOutput: () => {
          setHistory([]);
        },
        setMode: (mode) => {
          setSettings((prev) => ({ ...prev, brainMode: mode }));
          setHistory((prev) => [...prev, pushLine('system', `Mode set to ${mode}.`)]);
        },
        toggleSources: () => {
          setSettings((prev) => {
            const next = !prev.showLlmSources;
            setHistory((historyPrev) => [
              ...historyPrev,
              pushLine('system', `LLM sources footer ${next ? 'enabled' : 'disabled'}.`),
            ]);
            return { ...prev, showLlmSources: next };
          });
        },
        verifyProfile: () => {
          void runQuickAction('verify-profile-menu', () =>
            runVerify(
              `${profile.identity.displayName} ${profile.identity.role} work experience education`
            )
          );
        },
        verifyProjects: () => {
          void runQuickAction('verify-projects-menu', () =>
            runVerify(
              `${profile.identity.displayName} projects ${profile.links
                .filter((link) => link.kind === 'code' || link.kind === 'platform')
                .map((link) => link.label)
                .join(' ')}`
            )
          );
        },
      });
    };

    window.addEventListener('dg-terminal-menu-action', handleMenuAction as EventListener);
    return () => {
      window.removeEventListener('dg-terminal-menu-action', handleMenuAction as EventListener);
    };
  }, []);

  const submitCommand = async (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) return;

    if (isLlmBusy && /^cancel$/i.test(command)) {
      llmAbortRef.current?.abort();
      llmAbortRef.current = null;
      setIsLlmBusy(false);
      setInput('');
      setHistory((prev) => [
        ...prev,
        pushLine('command', `${prompt} ${command}`),
        pushLine('system', 'Canceled in-flight LLM request.'),
      ]);
      inputRef.current?.focus();
      return;
    }

    if (isLlmBusy) {
      setHistory((prev) => [
        ...prev,
        pushLine('system', 'LLM is still running. Type "cancel" to abort current request.'),
      ]);
      inputRef.current?.focus();
      return;
    }

    setHistory((prev) => [...prev, pushLine('command', `${prompt} ${command}`)]);
    setInput('');
    inputRef.current?.focus();

    let commandToRun = command;
    const isDeterministic = isDeterministicTerminalCommand(commandToRun);

    if (!isDeterministic) {
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
      : /^(ask|brief|cv|projects)\s*:?\s+/i.test(commandToRun);
    if (llmRoute) {
      await askLlm(commandToRun);
      return;
    }

    const response = executeTerminalCommand(commandToRun, { profile });

    if (response.action.type === 'clear') {
      setHistory([]);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitCommand(input);
  };

  const cancelResponse = () => {
    if (!isLlmBusy) return;
    llmAbortRef.current?.abort();
    llmAbortRef.current = null;
    setIsLlmBusy(false);
    setStreamingAnswer('');
    setStreamingStatus('');
    setHistory((previous) => [...previous, pushLine('system', 'Response stopped.')]);
  };

  const startOver = () => {
    llmAbortRef.current?.abort();
    toolAbortRef.current?.abort();
    llmAbortRef.current = null;
    toolAbortRef.current = null;
    setIsLlmBusy(false);
    setStreamingAnswer('');
    setStreamingStatus('');
    setInput('');
    setHistory([]);
    setLlmHistory([]);
    setLastEvidence(null);
    setLastAnswerMeta(null);
    setLastWebVerifyContext(null);
    setActivePanelTab(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const openPanel = (panel: Exclude<TerminalPanelTab, null>) => {
    setActivePanelTab((previous) => (previous === panel ? null : panel));
  };

  const aiAvailable = providerHealth.configured && providerHealth.status === 'healthy';
  const statusLabel =
    providerHealth.status === 'checking'
      ? 'Checking AI availability'
      : aiAvailable
        ? 'AI answers available'
        : 'Profile search available';

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border border-white/10 bg-[#080c12] text-white shadow-[0_18px_55px_rgba(0,0,0,0.34)]">
      <header className="flex flex-col gap-3 border-b border-white/10 bg-[#0b0f15] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-[-0.01em] text-white">Profile Agent</h1>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/28">
              @{profile.handle}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/42">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                providerHealth.status === 'checking'
                  ? 'animate-pulse bg-sky-300'
                  : aiAvailable
                    ? 'bg-emerald-300'
                    : 'bg-amber-300'
              }`}
            />
            <span>{statusLabel}</span>
            <span className="text-white/18">·</span>
            <span>Reviewed public evidence only</span>
          </div>
        </div>

        <nav aria-label="Profile Agent controls" className="flex items-center gap-4 text-[11px]">
          <button
            type="button"
            onClick={() => openPanel('evidence')}
            className={`transition ${
              activePanelTab === 'evidence' ? 'text-sky-300' : 'text-white/45 hover:text-white/75'
            }`}
          >
            Evidence{lastEvidence ? ` ${lastEvidence.hits.length}` : ''}
          </button>
          <button
            type="button"
            onClick={() => openPanel('connection')}
            className={`transition ${
              activePanelTab === 'connection' ? 'text-sky-300' : 'text-white/45 hover:text-white/75'
            }`}
          >
            AI connection
          </button>
          <button
            type="button"
            onClick={() => openPanel('advanced')}
            className={`transition ${
              activePanelTab === 'advanced' ? 'text-sky-300' : 'text-white/45 hover:text-white/75'
            }`}
          >
            Advanced
          </button>
        </nav>
      </header>

      <div
        className={`grid min-h-0 flex-1 ${
          activePanelTab ? 'md:grid-cols-[minmax(0,1fr)_20rem]' : 'grid-cols-1'
        }`}
      >
        <TerminalTranscript
          outputRef={outputRef}
          inputRef={inputRef}
          history={history}
          isLlmBusy={isLlmBusy}
          streamingAnswer={streamingAnswer}
          streamingStatus={streamingStatus}
          lastAnswerMeta={lastAnswerMeta}
          evidenceCount={lastEvidence?.hits.length ?? 0}
          profileName={profile.identity.preferredName}
          input={input}
          setInput={setInput}
          advancedMode={activePanelTab === 'advanced'}
          onSubmit={handleSubmit}
          onStarterQuestion={submitCommand}
          onOpenEvidence={() => openPanel('evidence')}
          onOpenConnection={() => openPanel('connection')}
          onStartOver={startOver}
          onCancel={cancelResponse}
        />
        <TerminalControlPanels
          activePanelTab={activePanelTab}
          setActivePanelTab={setActivePanelTab}
          settings={settings}
          setSettings={setSettings}
          byokApiKey={byokApiKey}
          setByokApiKey={setByokApiKey}
          providerHealth={providerHealth}
          toolUsage={toolUsage}
          lastEvidence={lastEvidence}
          profileName={profile.identity.preferredName}
          reviewedAt={profile.publication.reviewedAt}
          onResetLlmCounter={resetLlmCounter}
          onRunToolCall={runToolCall}
        />
      </div>
    </section>
  );
}
