import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseChatRequestInput } from '../../utils/requestSchemas';
import { runChatService, type ChatServiceErrorCode } from '../../services/chatService';
import { consumeApiRateLimit } from '../../utils/apiRateLimit';

type ErrorCode = 'INVALID_JSON' | 'INVALID_MESSAGES' | 'RATE_LIMITED' | ChatServiceErrorCode;

const err = (code: ErrorCode, message: string, status: number, meta?: Record<string, unknown>) =>
  errorResponse(code, message, status, false, meta);

export const POST: APIRoute = async ({ request }) => {
  const rateLimit = consumeApiRateLimit(request, 'profile-agent-chat');
  if (!rateLimit.allowed) {
    const response = err('RATE_LIMITED', 'Too many requests. Please try again shortly.', 429);
    response.headers.set('Retry-After', String(rateLimit.retryAfterSeconds));
    return response;
  }

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

  const result = await runChatService(parsed);
  if (!result.ok) return err(result.code, result.message, result.status, result.meta);
  return jsonResponse(result.payload, result.status);
};
