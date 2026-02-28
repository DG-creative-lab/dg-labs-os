import type { APIRoute } from 'astro';
import { OpenRouter } from '@openrouter/sdk';
import { chatSuccess } from '../../utils/apiContracts';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseChatMessagesInput } from '../../utils/requestSchemas';
import { getServerEnv, isServerDev } from '../../utils/serverEnv';

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

export const POST: APIRoute = async ({ request }) => {
  const openRouterApiKey = getServerEnv('OPENROUTER_API_KEY');

  // Fast-fail if not configured
  if (!openRouterApiKey) {
    console.error('[Chat API] Missing OPENROUTER_API_KEY');
    return err(
      'CONFIG_ERROR',
      'Chat service is not configured. Please contact the site administrator.',
      503
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('INVALID_JSON', 'Invalid request format', 400);
  }

  const messages = parseChatMessagesInput(body);
  if (!messages) {
    return err('INVALID_MESSAGES', 'Messages array is required and must not be empty', 400);
  }

  try {
    const openRouter = new OpenRouter({
      apiKey: openRouterApiKey,
    });

    const completion = await openRouter.chat.send({
      model: 'openai/gpt-oss-120b',
      messages,
      stream: false,
      temperature: 0.7,
      maxTokens: 500,
    });

    const content = completion?.choices?.[0]?.message?.content;
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
