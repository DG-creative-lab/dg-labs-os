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
  buildCitationChips,
  consumeJsonSseStream,
  confidenceBadgeText,
  buildAgentJsonLines,
  buildLlmMessages,
  explainConfidenceLabel,
  explainVerificationGap,
  formatAnswerWithCitations,
  groupCitationChips,
  isLlmQuery,
  normalizeLlmQuery,
  normalizeTerminalNarrativeAnswer,
  parseLlmModeQuery,
  readChatErrorMeta,
  readChatMeta,
  readAgentJsonPayload,
  readChatMessage,
  resolveAnswerConfidenceLabel,
  type CitationChip,
  type LlmConfidenceLabel,
} from '../../utils/terminalLlm';
import { buildVerifyEnvelopeLines } from '../../utils/terminalEnvelope';
import { retrieveKnowledge } from '../../utils/terminalKnowledge';
import type { VerifySource } from '../../utils/apiContracts';
import {
  handleTerminalMenuAction,
  type TerminalMenuEventDetail,
} from '../../services/menuActionHandlers';
import {
  defaultTerminalSettings,
  parseTerminalSettings,
  serializeTerminalSettings,
  terminalSettingsSummary,
  TERMINAL_SETTINGS_KEY,
  type TerminalBrainMode,
  type TerminalLlmProvider,
  type TerminalResponseMode,
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

type ToolName = 'local_context' | 'web_verify' | 'open_app' | 'list_projects' | 'retrieve' | 'cite';

type ToolUsage = Record<ToolName, number>;

type LastWebVerifyContext = {
  query: string;
  summary: string;
  sources: VerifySource[];
};

type RetrievedHit = {
  id: string;
  source: string;
  title: string;
  snippet: string;
  url?: string;
  score: number;
};

type RetrieveResult = {
  query: string;
  classification: string;
  hits: RetrievedHit[];
  fromCache: boolean;
};

type CiteResult = {
  claim: string;
  verdict: string;
  evidence: RetrievedHit[];
  fromCache: boolean;
};

type EvidenceState = {
  query: string;
  classification: string;
  verdict: string;
  hits: RetrievedHit[];
  fromCache: boolean;
};

type LastAnswerMeta = {
  confidence: LlmConfidenceLabel;
  chips: CitationChip[];
  unverifiedCount?: number;
};

type ProviderHealthStatus = 'checking' | 'healthy' | 'missing_key' | 'timeout' | 'error';

type ProviderHealth = {
  provider: TerminalLlmProvider;
  status: ProviderHealthStatus;
  message: string;
  configured: boolean;
  latencyMs?: number;
};

type TerminalPanelTab = 'session' | 'tools' | 'evidence' | null;

const INITIAL_TOOL_USAGE: ToolUsage = {
  local_context: 0,
  web_verify: 0,
  open_app: 0,
  list_projects: 0,
  retrieve: 0,
  cite: 0,
};

const LLM_COUNT_KEY = 'dg_labs_terminal_llm_count';
const VERIFY_COUNT_KEY = 'dg_labs_terminal_verify_count';
const BYOK_STORAGE_KEY = 'dg_labs_terminal_byok_v1';
const ROUTER_CONFIDENCE_THRESHOLD = 0.8;
const VERIFY_SESSION_CAP = 12;

const isRetrievedHit = (value: unknown): value is RetrievedHit =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as { id?: unknown }).id === 'string' &&
  typeof (value as { source?: unknown }).source === 'string' &&
  typeof (value as { title?: unknown }).title === 'string' &&
  typeof (value as { snippet?: unknown }).snippet === 'string' &&
  typeof (value as { score?: unknown }).score === 'number' &&
  (typeof (value as { url?: unknown }).url === 'string' ||
    typeof (value as { url?: unknown }).url === 'undefined');

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
  const [thinkingFrame, setThinkingFrame] = useState(0);
  const [byokApiKey, setByokApiKey] = useState('');
  const [rememberByok, setRememberByok] = useState(false);
  const [providerHealth, setProviderHealth] = useState<ProviderHealth>({
    provider: 'openrouter',
    status: 'checking',
    message: 'Checking provider health…',
    configured: false,
  });
  const [settings, setSettings] = useState<TerminalSettings>(defaultTerminalSettings);
  const [toolUsage, setToolUsage] = useState<ToolUsage>(INITIAL_TOOL_USAGE);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [lastWebVerifyContext, setLastWebVerifyContext] = useState<LastWebVerifyContext | null>(
    null
  );
  const [llmHistory, setLlmHistory] = useState<LlmHistoryMessage[]>([]);
  const [lastEvidence, setLastEvidence] = useState<EvidenceState | null>(null);
  const [activePanelTab, setActivePanelTab] = useState<TerminalPanelTab>(null);
  const [lastAnswerMeta, setLastAnswerMeta] = useState<LastAnswerMeta | null>(null);
  const [showCitationDetails, setShowCitationDetails] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [streamingStatus, setStreamingStatus] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([
    { id: 1, kind: 'system', text: 'DG-Labs Agents Runtime v2' },
    {
      id: 2,
      kind: 'system',
      text: 'Talk naturally. Commands still work: help, open <app>, search <query>, verify <query>.',
    },
  ]);
  const nextIdRef = useRef(3);
  const toolAbortRef = useRef<AbortController | null>(null);
  const llmAbortRef = useRef<AbortController | null>(null);
  const retrieveCacheRef = useRef<Map<string, Omit<RetrieveResult, 'fromCache'>>>(new Map());
  const citeCacheRef = useRef<Map<string, Omit<CiteResult, 'fromCache'>>>(new Map());
  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const prompt = useMemo(() => `${userConfig.name}:~$`, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(TERMINAL_SETTINGS_KEY);
    setSettings(parseTerminalSettings(raw));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(BYOK_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<Record<TerminalLlmProvider, string>>;
      const existing =
        (typeof parsed.openrouter === 'string' && parsed.openrouter.trim()) ||
        (typeof parsed.openai === 'string' && parsed.openai.trim()) ||
        (typeof parsed.anthropic === 'string' && parsed.anthropic.trim()) ||
        (typeof parsed.gemini === 'string' && parsed.gemini.trim()) ||
        '';
      if (existing) {
        setRememberByok(true);
      }
    } catch {
      localStorage.removeItem(BYOK_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TERMINAL_SETTINGS_KEY, serializeTerminalSettings(settings));
  }, [settings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!rememberByok) return;
    try {
      const raw = localStorage.getItem(BYOK_STORAGE_KEY);
      const parsed = raw
        ? (JSON.parse(raw) as Partial<Record<TerminalLlmProvider, string>>)
        : ({} as Partial<Record<TerminalLlmProvider, string>>);
      const providerKey = parsed[settings.llmProvider];
      if (typeof providerKey === 'string' && providerKey.trim().length > 0) {
        setByokApiKey(providerKey);
      } else {
        setByokApiKey('');
      }
    } catch {
      localStorage.removeItem(BYOK_STORAGE_KEY);
      setByokApiKey('');
    }
  }, [rememberByok, settings.llmProvider]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!rememberByok) {
      localStorage.removeItem(BYOK_STORAGE_KEY);
      return;
    }
    try {
      const raw = localStorage.getItem(BYOK_STORAGE_KEY);
      const parsed = raw
        ? (JSON.parse(raw) as Partial<Record<TerminalLlmProvider, string>>)
        : ({} as Partial<Record<TerminalLlmProvider, string>>);
      parsed[settings.llmProvider] = byokApiKey.trim();
      localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      localStorage.removeItem(BYOK_STORAGE_KEY);
    }
  }, [rememberByok, settings.llmProvider, byokApiKey]);

  useEffect(() => {
    if (!outputRef.current) return;
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

  useEffect(() => {
    let isActive = true;
    const timer = window.setTimeout(async () => {
      setProviderHealth((prev) => ({
        ...prev,
        provider: settings.llmProvider,
        status: 'checking',
        message: 'Checking provider health…',
      }));

      try {
        const response = await fetch('/api/llm/health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: settings.llmProvider,
            model: settings.llmModel,
            byokApiKey: byokApiKey.trim().length > 0 ? byokApiKey.trim() : undefined,
            probe: true,
          }),
        });
        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          providers?: Array<{
            provider?: unknown;
            configured?: unknown;
            status?: unknown;
            message?: unknown;
            latencyMs?: unknown;
          }>;
        } | null;

        const provider = payload?.providers?.[0];
        if (!isActive || !provider) return;
        const status =
          provider.status === 'healthy' ||
          provider.status === 'missing_key' ||
          provider.status === 'timeout' ||
          provider.status === 'error'
            ? provider.status
            : 'error';
        setProviderHealth({
          provider: settings.llmProvider,
          status,
          configured: typeof provider.configured === 'boolean' ? provider.configured : false,
          message:
            typeof provider.message === 'string' && provider.message.trim().length > 0
              ? provider.message
              : 'Provider health check failed.',
          latencyMs: typeof provider.latencyMs === 'number' ? provider.latencyMs : undefined,
        });
      } catch {
        if (!isActive) return;
        setProviderHealth({
          provider: settings.llmProvider,
          status: 'error',
          configured: false,
          message: 'Health check failed. Check network or API key.',
        });
      }
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [settings.llmProvider, settings.llmModel, byokApiKey]);

  useEffect(() => {
    if (!isLlmBusy) {
      setThinkingFrame(0);
      return;
    }
    const timer = window.setInterval(() => {
      setThinkingFrame((prev) => (prev + 1) % 4);
    }, 320);
    return () => window.clearInterval(timer);
  }, [isLlmBusy]);

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

  const normalizeCacheKey = (value: string) => value.trim().toLowerCase();

  const trimCache = (cache: Map<string, unknown>, max = 40) => {
    while (cache.size > max) {
      const oldestKey = cache.keys().next().value as string | undefined;
      if (!oldestKey) break;
      cache.delete(oldestKey);
    }
  };

  const runRetrieveTool = async (
    query: string,
    signal?: AbortSignal,
    limit = 6
  ): Promise<RetrieveResult | null> => {
    const key = normalizeCacheKey(query);
    incrementToolUsage('retrieve');
    const cached = retrieveCacheRef.current.get(key);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const response = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'retrieve', input: { query, limit } }),
      signal,
    });
    const payload = (await response.json().catch(() => ({}))) as
      | {
          ok?: boolean;
          tool?: string;
          result?: { query?: unknown; classification?: unknown; hits?: unknown };
        }
      | undefined;

    if (!response.ok || !payload?.ok || payload.tool !== 'retrieve' || !payload.result) {
      return null;
    }

    const result = payload.result;
    const resolvedQuery = typeof result.query === 'string' ? result.query : query;
    const classification =
      typeof result.classification === 'string' ? result.classification : 'general';
    const hits = Array.isArray(result.hits) ? result.hits.filter(isRetrievedHit) : [];
    const materialized = { query: resolvedQuery, classification, hits };
    retrieveCacheRef.current.set(key, materialized);
    trimCache(retrieveCacheRef.current);
    return { ...materialized, fromCache: false };
  };

  const runCiteTool = async (claim: string, signal?: AbortSignal): Promise<CiteResult | null> => {
    const key = normalizeCacheKey(claim);
    incrementToolUsage('cite');
    const cached = citeCacheRef.current.get(key);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const response = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'cite', input: { claim } }),
      signal,
    });
    const payload = (await response.json().catch(() => ({}))) as
      | {
          ok?: boolean;
          tool?: string;
          result?: { claim?: unknown; verdict?: unknown; evidence?: unknown };
        }
      | undefined;

    if (!response.ok || !payload?.ok || payload.tool !== 'cite' || !payload.result) {
      return null;
    }

    const result = payload.result;
    const resolvedClaim = typeof result.claim === 'string' ? result.claim : claim;
    const verdict = typeof result.verdict === 'string' ? result.verdict : 'unknown';
    const evidence = Array.isArray(result.evidence) ? result.evidence.filter(isRetrievedHit) : [];
    const materialized = { claim: resolvedClaim, verdict, evidence };
    citeCacheRef.current.set(key, materialized);
    trimCache(citeCacheRef.current);
    return { ...materialized, fromCache: false };
  };

  const toolStatusLines = (): string[] => [
    'Tool status:',
    `- local_context: used ${toolUsage.local_context} time(s)`,
    `- web_verify: used ${toolUsage.web_verify} time(s), cap ${VERIFY_SESSION_CAP}`,
    `- open_app: used ${toolUsage.open_app} time(s)`,
    `- list_projects: used ${toolUsage.list_projects} time(s)`,
    `- retrieve: used ${toolUsage.retrieve} time(s)`,
    `- cite: used ${toolUsage.cite} time(s)`,
  ];

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
      setHistory((prev) => [
        ...prev,
        pushLine(
          'system',
          `LLM is not configured for ${settings.llmProvider}. Add a BYOK key in Terminal Settings or switch provider.`
        ),
        pushLine(
          'output',
          'Fallback options: help, search <query>, context <query>, projects, open <app>, or verify <query>.'
        ),
      ]);
      return;
    }

    const controller = new AbortController();
    llmAbortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), settings.llmTimeoutMs);

    setIsLlmBusy(true);
    setStreamingAnswer('');
    setStreamingStatus('Preparing answer…');
    try {
      const fallbackGrounding = retrieveKnowledge(
        query,
        {
          user: userConfig,
          workbench,
          notes: labNotes,
          network: networkNodes,
        },
        4
      );
      let grounding = fallbackGrounding;
      let retrievalLines: string[] = [];

      const retrieveResult = await runRetrieveTool(query, controller.signal, 6);
      if (retrieveResult) {
        const hits = retrieveResult.hits;
        if (hits.length > 0) {
          grounding = hits.map((hit) => ({
            id: hit.id,
            source: hit.source as 'personal' | 'workbench' | 'notes' | 'network' | 'brain',
            title: hit.title,
            snippet: hit.snippet,
            url: hit.url,
            score: hit.score,
            tags: [],
          }));
        }
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
          messages: buildLlmMessages(
            query,
            { user: userConfig, workbench, notes: labNotes, network: networkNodes },
            llmHistory,
            grounding,
            lastWebVerifyContext,
            settings.brainMode,
            parsed.mode
          ),
          responseMode: settings.responseMode,
          provider: settings.llmProvider,
          model: settings.llmModel,
          byokApiKey: byokApiKey.trim().length > 0 ? byokApiKey.trim() : undefined,
          providerFallbackAllowed: settings.providerFallbackAllowed,
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
      const agentPayload =
        settings.responseMode === 'agent_json' ? readAgentJsonPayload(resolvedPayload) : null;

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
      const answerText =
        settings.responseMode === 'narrative'
          ? normalizeTerminalNarrativeAnswer(message)
          : normalizeTerminalNarrativeAnswer(cited.answer);
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
      setShowCitationDetails(false);
      const confidenceGuidance = explainConfidenceLabel(confidence);
      const agentLines = agentPayload ? buildAgentJsonLines(agentPayload) : [];
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
        ...agentLines.map((line) => pushLine('output', line)),
        ...(settings.showLlmSources
          ? [
              pushLine(
                'system',
                `Grounded in ${grounding.length} local source(s)${
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
        setShowCitationDetails(false);
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

  useEffect(() => {
    const handleMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<TerminalMenuEventDetail>;
      handleTerminalMenuAction(customEvent.detail, {
        clearOutput: () => {
          setHistory([
            pushLine('system', 'DG-Labs Agents Runtime v2'),
            pushLine(
              'system',
              'Talk naturally. Commands still work: help, open <app>, search <query>, verify <query>.'
            ),
          ]);
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
            runVerify('Dessi Georgieva LinkedIn profile work experience education')
          );
        },
        verifyProjects: () => {
          void runQuickAction('verify-projects-menu', () =>
            runVerify(
              'Dessi Georgieva projects DG-creative-lab ai-knowledge-hub AI News Hub skills ai-knowledge-hub'
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = input.trim();
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

    const response = executeTerminalCommand(commandToRun, {
      user: userConfig,
      workbench,
      notes: labNotes,
      network: networkNodes,
    });

    if (response.action.type === 'clear') {
      setHistory([
        pushLine('system', 'DG-Labs Agents Runtime v2'),
        pushLine(
          'system',
          'Talk naturally. Commands still work: help, open <app>, search <query>, verify <query>.'
        ),
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

  const confidenceBadgeClass = (confidence: LlmConfidenceLabel) => {
    if (confidence === 'local+verified') {
      return 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200';
    }
    if (confidence === 'local-only') {
      return 'border-cyan-300/50 bg-cyan-400/10 text-cyan-200';
    }
    if (confidence === 'verified-only') {
      return 'border-indigo-300/50 bg-indigo-400/10 text-indigo-200';
    }
    return 'border-amber-300/50 bg-amber-400/10 text-amber-200';
  };
  const groupedCitations = groupCitationChips(lastAnswerMeta?.chips ?? []);
  const totalCitationCount = lastAnswerMeta?.chips.length ?? 0;
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
  const panelTabClass = (tab: Exclude<TerminalPanelTab, null>) =>
    `rounded-full border px-2.5 py-1 text-[11px] transition ${
      activePanelTab === tab
        ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100'
        : 'border-white/15 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white/85'
    }`;
  return (
    <div className="h-full min-h-0 rounded-xl border border-emerald-300/20 bg-black/60 shadow-[0_14px_60px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-emerald-400/20 px-4 py-2 text-[11px] text-emerald-300/75">
        <span>
          Runtime: natural language first + commands on demand | {terminalSettingsSummary(settings)}
        </span>
        {isLlmBusy ? (
          <span className="inline-flex items-center gap-2 text-emerald-200/90">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-emerald-300/40 border-t-emerald-200" />
            thinking{'.'.repeat(Math.max(1, thinkingFrame))}
          </span>
        ) : null}
      </div>
      <div className="border-b border-emerald-400/20 px-4 py-2 text-[11px] text-white/70">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePanelTab((prev) => (prev === 'session' ? null : 'session'))}
            className={panelTabClass('session')}
            aria-pressed={activePanelTab === 'session'}
          >
            Session
          </button>
          <button
            type="button"
            onClick={() => setActivePanelTab((prev) => (prev === 'tools' ? null : 'tools'))}
            className={panelTabClass('tools')}
            aria-pressed={activePanelTab === 'tools'}
          >
            Tools
          </button>
          <button
            type="button"
            onClick={() => setActivePanelTab((prev) => (prev === 'evidence' ? null : 'evidence'))}
            className={panelTabClass('evidence')}
            aria-pressed={activePanelTab === 'evidence'}
          >
            Evidence{lastEvidence ? '' : ' (empty)'}
          </button>
        </div>
        {activePanelTab === 'session' ? (
          <div className="mt-3 space-y-3 rounded border border-white/10 bg-white/5 p-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
                <span>Use the LLM for natural input by default</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.providerFallbackAllowed}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      providerFallbackAllowed: event.target.checked,
                    }))
                  }
                />
                <span>Allow provider fallback when selected provider fails</span>
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
                <span>LLM response</span>
                <select
                  value={settings.responseMode}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      responseMode: event.target.value as TerminalResponseMode,
                    }))
                  }
                  className="rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
                >
                  <option value="narrative">narrative</option>
                  <option value="agent_json">agent_json</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span>Provider</span>
                <select
                  value={settings.llmProvider}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
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
              <label className="flex items-center gap-2 md:col-span-2">
                <span>Model</span>
                <input
                  type="text"
                  value={settings.llmModel}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      llmModel: event.target.value,
                    }))
                  }
                  className="w-full rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
                  placeholder="openai/gpt-oss-120b"
                />
              </label>
              <label className="flex items-center gap-2 md:col-span-2">
                <span>BYOK key</span>
                <input
                  type="password"
                  value={byokApiKey}
                  onChange={(event) => setByokApiKey(event.target.value)}
                  className="w-full rounded border border-white/20 bg-black/40 px-2 py-1 text-white"
                  placeholder="Bring your own key"
                />
              </label>
              <label className="flex items-center gap-2 md:col-span-3">
                <input
                  type="checkbox"
                  checked={rememberByok}
                  onChange={(event) => setRememberByok(event.target.checked)}
                />
                <span>Remember BYOK key in this browser (localStorage)</span>
              </label>
              <p className="md:col-span-3 text-[10px] text-amber-200/90">
                Security note: persisted BYOK keys are stored in browser localStorage and are
                readable by scripts on this origin. Keep this off on shared devices.
              </p>
              <p className="md:col-span-3 text-[10px] text-white/70">
                Provider status: {providerHealth.message}
              </p>
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
                <input
                  type="checkbox"
                  checked={settings.strictEvidenceMode}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      strictEvidenceMode: event.target.checked,
                    }))
                  }
                />
                <span>Strict evidence mode</span>
              </label>
              <label className="flex items-center gap-2">
                <span>Timeout (seconds)</span>
                <input
                  type="number"
                  min={3}
                  max={120}
                  value={Math.round(settings.llmTimeoutMs / 1000)}
                  onChange={(event) => {
                    const seconds = parseInt(event.target.value || '15', 10);
                    const next = Number.isNaN(seconds) ? 45 : Math.min(120, Math.max(3, seconds));
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
            <div className="rounded border border-white/10 bg-black/20 p-2 text-[11px] text-white/65">
              <p className="text-emerald-300/90">Guide</p>
              <p className="mt-1">
                Talk naturally for LLM mode. Use direct commands when you want deterministic
                control:
                <code> help</code>, <code>open network</code>, <code>search intent</code>,{' '}
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
                <span className="text-emerald-300">web_verify</span>: web citations with source list
                ({toolUsage.web_verify}/{VERIFY_SESSION_CAP})
              </p>
              <p>
                <span className="text-emerald-300">open_app</span>: resolve app target to route (
                {toolUsage.open_app})
              </p>
              <p>
                <span className="text-emerald-300">list_projects</span>: enumerate workbench
                projects ({toolUsage.list_projects})
              </p>
              <p>
                <span className="text-emerald-300">retrieve</span>: ranked local evidence retrieval
                ({toolUsage.retrieve})
              </p>
              <p>
                <span className="text-emerald-300">cite</span>: claim {'->'} evidence verdict (
                {toolUsage.cite})
              </p>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded border border-white/10 bg-white/5 p-2">
                <p className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300/90">
                  Context
                </p>
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
                <p className="mb-2 text-[11px] uppercase tracking-wide text-emerald-300/90">
                  Open App
                </p>
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
                Running action: <span className="font-mono">{activeQuickAction}</span> (click
                another button to switch)
              </p>
            ) : null}
            <p className="mt-2 text-white/50">
              Commands: <code>tools</code> | <code>brief top 3 projects</code> |{' '}
              <code>cv latest role</code> | <code>projects intent systems</code> |{' '}
              <code>tool local_context intent modeling</code> |{' '}
              <code>tool web_verify Dessi Georgieva LinkedIn projects</code> |{' '}
              <code>tool list_projects</code> |{' '}
              <code>tool retrieve intent recognition projects</code> |{' '}
              <code>tool cite Dessi built intent recognition systems</code>
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

      <div
        ref={outputRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-6 text-emerald-200 [&::-webkit-scrollbar]:hidden"
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
            className={`mt-3 rounded border px-3 py-2 ${
              streamingAnswer
                ? 'border-emerald-400/25 bg-emerald-400/[0.06]'
                : 'border-cyan-400/20 bg-cyan-400/[0.05]'
            }`}
          >
            <div
              className={`mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] ${
                streamingAnswer ? 'text-emerald-300/80' : 'text-cyan-300/80'
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  streamingAnswer ? 'bg-emerald-300/80' : 'bg-cyan-300/80'
                }`}
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

      <form onSubmit={handleSubmit} className="border-t border-emerald-400/20 px-4 py-3">
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
                  onClick={() => setShowCitationDetails((prev) => !prev)}
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
        <label className="flex items-center gap-2 font-mono text-sm">
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
    </div>
  );
}
