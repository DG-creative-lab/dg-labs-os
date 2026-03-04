import { OpenRouter } from '@openrouter/sdk';
import { chatSuccess } from '../utils/apiContracts';
import type { ChatMessageInput, ChatRequestInput } from '../utils/requestSchemas';
import { getServerEnv, isServerDev } from '../utils/serverEnv';
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
  | 'TIMEOUT';

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

const normalizeAssistantContent = (content: unknown): string | null => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return null;

  const textParts = content
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const record = item as Record<string, unknown>;
      if (typeof record.text === 'string') return record.text;
      if (typeof record.content === 'string') return record.content;
      return '';
    })
    .filter(Boolean);

  if (textParts.length > 0) return textParts.join('\n').trim();
  return null;
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

  const openRouterApiKey = getServerEnv('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    console.error('[Chat API] Missing OPENROUTER_API_KEY');
    return {
      ok: false,
      status: 503,
      code: 'CONFIG_ERROR',
      message: 'Chat service is not configured. Please contact the site administrator.',
    };
  }

  try {
    const openRouter = new OpenRouter({
      apiKey: openRouterApiKey,
    });

    const knowledgeGrounding = buildKnowledgeGrounding(query, localHits);
    const requestMessages = knowledgeGrounding
      ? [{ role: 'system' as const, content: knowledgeGrounding }, ...messages]
      : messages;

    const completion = await openRouter.chat.send({
      model: 'openai/gpt-oss-120b',
      messages: requestMessages,
      stream: false,
      temperature: 0.7,
      maxTokens: 500,
    });

    const content = normalizeAssistantContent(completion?.choices?.[0]?.message?.content);
    if (!content) {
      console.error('[Chat API] Invalid response from OpenRouter');
      return {
        ok: false,
        status: 500,
        code: 'INVALID_RESPONSE',
        message: 'Received invalid response from AI service',
      };
    }

    return {
      ok: true,
      status: 200,
      payload: chatSuccess(content),
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
