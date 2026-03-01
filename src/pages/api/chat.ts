import type { APIRoute } from 'astro';
import { OpenRouter } from '@openrouter/sdk';
import { chatSuccess } from '../../utils/apiContracts';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseChatRequestInput, type ChatMessageInput } from '../../utils/requestSchemas';
import { getServerEnv, isServerDev } from '../../utils/serverEnv';
import {
  classifyKnowledgeQuery,
  getKnowledgeById,
  searchKnowledge,
  type KnowledgeHit,
} from '../../knowledge';

type ErrorCode =
  | 'CONFIG_ERROR'
  | 'INVALID_JSON'
  | 'INVALID_MESSAGES'
  | 'INVALID_RESPONSE'
  | 'AI_SERVICE_ERROR'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR';

const err = (code: ErrorCode, message: string, status: number) =>
  errorResponse(code, message, status);

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

const buildAgentJsonResponse = (query: string, hits: readonly KnowledgeHit[]) => {
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
    ok: true as const,
    message: answer,
    mode: 'agent_json' as const,
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

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('INVALID_JSON', 'Invalid request format', 400);
  }

  const parsed = parseChatRequestInput(body);
  if (!parsed) {
    return err('INVALID_MESSAGES', 'Messages array is required and must not be empty', 400);
  }

  const { messages, responseMode } = parsed;
  const query = latestUserQuery(messages);
  const localHits = query ? searchKnowledge(query, 6) : [];

  if (responseMode === 'agent_json') {
    return jsonResponse(buildAgentJsonResponse(query, localHits), 200);
  }

  const openRouterApiKey = getServerEnv('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    console.error('[Chat API] Missing OPENROUTER_API_KEY');
    return err(
      'CONFIG_ERROR',
      'Chat service is not configured. Please contact the site administrator.',
      503
    );
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
      return err('INVALID_RESPONSE', 'Received invalid response from AI service', 500);
    }

    return jsonResponse(chatSuccess(content), 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error('[Chat API] OpenRouter error:', message);
    if (message.includes('timeout')) {
      return err('TIMEOUT', 'Request timed out. Please try again.', 504);
    }

    return err(
      'INTERNAL_ERROR',
      isServerDev() ? message : 'An unexpected error occurred. Please try again later.',
      500
    );
  }
};
