import { chatSuccess } from '../utils/apiContracts';
import type { ChatMessageInput, ChatRequestInput } from '../utils/requestSchemas';
import { getServerEnv, isServerDev } from '../utils/serverEnv';
import { runLlmGateway } from './llmGateway';
import { defaultModelForProvider } from './llmProviderDefaults';
import {
  classifyKnowledgeQuery,
  getKnowledgeById,
  searchKnowledge,
  type KnowledgeHit,
} from '../knowledge';

export type ChatServiceErrorCode =
  | 'CONFIG_ERROR'
  | 'INVALID_RESPONSE'
  | 'INTERNAL_ERROR'
  | 'TIMEOUT'
  | 'NOT_IMPLEMENTED';

type AgentJsonResponse = {
  ok: true;
  message: string;
  mode: 'agent_json';
  data: {
    query: string;
    classification: ReturnType<typeof classifyKnowledgeQuery>;
    chunks: Array<{
      id: string;
      type: KnowledgeHit['type'];
      title: string;
      confidence: KnowledgeHit['confidence'];
      score: number;
      sources: readonly string[];
      related: readonly string[];
    }>;
    sources: string[];
    suggestedFollowUp: string[];
  };
};

export type ChatServiceSuccess = ReturnType<typeof chatSuccess> | AgentJsonResponse;

export type ChatServiceResult =
  | { ok: true; status: number; payload: ChatServiceSuccess }
  | {
      ok: false;
      status: number;
      code: ChatServiceErrorCode;
      message: string;
    };

const latestUserQuery = (messages: readonly ChatMessageInput[]): string =>
  [...messages]
    .reverse()
    .find((message) => message.role === 'user')
    ?.content.trim() ?? '';

const buildKnowledgeGrounding = (query: string, hits: readonly KnowledgeHit[]): string => {
  if (!query || hits.length === 0) return '';
  const lines = [
    'Grounding context (knowledge index):',
    `query: ${query}`,
    ...hits
      .slice(0, 6)
      .map(
        (hit, index) =>
          `${index + 1}. [${hit.type}] ${hit.title} :: ${hit.content.slice(0, 260).replace(/\s+/g, ' ')}`
      ),
  ];
  return lines.join('\n');
};

const expandRelated = (seed: readonly KnowledgeHit[], limit = 8): KnowledgeHit[] => {
  const out: KnowledgeHit[] = [];
  const seen = new Set<string>();
  for (const item of seed) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
    if (out.length >= limit) break;
    for (const relId of item.related) {
      const rel = getKnowledgeById(relId);
      if (!rel || seen.has(rel.id)) continue;
      seen.add(rel.id);
      out.push({ ...rel, score: Math.max(1, item.score - 1) });
      if (out.length >= limit) break;
    }
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
};

const buildAgentJsonResponse = (
  query: string,
  hits: readonly KnowledgeHit[]
): AgentJsonResponse => {
  const classification = classifyKnowledgeQuery(query);
  const chunks = expandRelated(hits, 8);
  const sources = Array.from(new Set(chunks.flatMap((chunk) => chunk.sources))).slice(0, 12);
  const answer =
    chunks.length === 0
      ? 'No matching knowledge chunks found for this query. Try a narrower project, research, or experience question.'
      : `Matched ${chunks.length} knowledge chunk(s) for ${classification}. Top signals: ${chunks
          .slice(0, 3)
          .map((chunk) => chunk.title)
          .join(' | ')}.`;

  return {
    ok: true,
    message: answer,
    mode: 'agent_json',
    data: {
      query,
      classification,
      chunks: chunks.map((chunk) => ({
        id: chunk.id,
        type: chunk.type,
        title: chunk.title,
        confidence: chunk.confidence,
        score: chunk.score,
        sources: chunk.sources,
        related: chunk.related,
      })),
      sources,
      suggestedFollowUp: [
        'Ask for evidence by specific claim (role, project, publication).',
        'Request comparison between two projects or research themes.',
        'Request structured summary grouped by experience/projects/research.',
      ],
    },
  };
};

export const runChatService = async ({
  messages,
  responseMode,
  provider,
  model,
  byokApiKey,
}: ChatRequestInput): Promise<ChatServiceResult> => {
  const query = latestUserQuery(messages);
  const localHits = query ? searchKnowledge(query, 6) : [];

  if (responseMode === 'agent_json') {
    return {
      ok: true,
      status: 200,
      payload: buildAgentJsonResponse(query, localHits),
    };
  }

  const serverKeys = {
    openrouter: getServerEnv('OPENROUTER_API_KEY'),
    openai: getServerEnv('OPENAI_API_KEY'),
    anthropic: getServerEnv('ANTHROPIC_API_KEY'),
    gemini: getServerEnv('GEMINI_API_KEY'),
  } as const;

  try {
    const knowledgeGrounding = buildKnowledgeGrounding(query, localHits);
    const requestMessages = knowledgeGrounding
      ? [{ role: 'system' as const, content: knowledgeGrounding }, ...messages]
      : messages;

    const gateway = await runLlmGateway({
      provider,
      model: model || defaultModelForProvider(provider),
      messages: requestMessages,
      apiKey: byokApiKey || serverKeys[provider],
    });

    if (!gateway.ok) {
      const code = gateway.code;
      if (code === 'CONFIG_ERROR') {
        console.error('[Chat API] Missing provider API key for', provider);
        return {
          ok: false,
          status: 503,
          code: 'CONFIG_ERROR',
          message: 'Chat service is not configured. Please contact the site administrator.',
        };
      }
      if (code === 'NOT_IMPLEMENTED') {
        return {
          ok: false,
          status: 501,
          code: 'NOT_IMPLEMENTED',
          message: gateway.message,
        };
      }
      if (code === 'INVALID_RESPONSE') {
        console.error('[Chat API] Invalid response from provider', provider);
        return {
          ok: false,
          status: 500,
          code: 'INVALID_RESPONSE',
          message: 'Received invalid response from AI service',
        };
      }
      if (code === 'TIMEOUT') {
        return {
          ok: false,
          status: 504,
          code: 'TIMEOUT',
          message: gateway.message,
        };
      }
      return {
        ok: false,
        status: 500,
        code: 'INTERNAL_ERROR',
        message: isServerDev()
          ? gateway.message
          : 'An unexpected error occurred. Please try again later.',
      };
    }

    return {
      ok: true,
      status: 200,
      payload: chatSuccess(gateway.message),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Chat API] OpenRouter error:', errorMessage);

    if (errorMessage.includes('timeout')) {
      return {
        ok: false,
        status: 504,
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
      };
    }

    return {
      ok: false,
      status: 500,
      code: 'INTERNAL_ERROR',
      message: isServerDev()
        ? errorMessage
        : 'An unexpected error occurred. Please try again later.',
    };
  }
};
