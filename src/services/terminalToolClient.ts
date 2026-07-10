import {
  isRetrievedHit,
  type CiteResult,
  type RetrieveResult,
  type ToolName,
} from './terminalTypes';

export const normalizeTerminalCacheKey = (value: string) => value.trim().toLowerCase();

export const trimTerminalCache = (cache: Map<string, unknown>, max = 40) => {
  while (cache.size > max) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
};

export const fetchRetrieveTool = async (
  query: string,
  signal?: AbortSignal,
  limit = 6
): Promise<Omit<RetrieveResult, 'fromCache'> | null> => {
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
  return { query: resolvedQuery, classification, hits };
};

export const fetchCiteTool = async (
  claim: string,
  signal?: AbortSignal
): Promise<Omit<CiteResult, 'fromCache'> | null> => {
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
  return { claim: resolvedClaim, verdict, evidence };
};

export type GenericToolPayload =
  | {
      ok?: boolean;
      tool?: string;
      result?: Record<string, unknown>;
      message?: string;
    }
  | undefined;

export const fetchTerminalTool = async (
  tool: ToolName,
  input?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<{ response: Response; payload: GenericToolPayload }> => {
  const response = await fetch('/api/tools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, input }),
    signal,
  });
  const payload = (await response.json().catch(() => ({}))) as GenericToolPayload;
  return { response, payload };
};
