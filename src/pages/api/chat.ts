import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseChatRequestInput, parseRequiredProfileHandle } from '../../utils/requestSchemas';
import { runChatService, type ChatServiceErrorCode } from '../../services/chatService';
import { checkProfileAgentRateLimit } from '../../utils/apiRateLimit';

type ErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_MESSAGES'
  | 'INVALID_PROFILE_HANDLE'
  | 'RATE_LIMITED'
  | 'RATE_LIMIT_UNAVAILABLE'
  | ChatServiceErrorCode;

const err = (code: ErrorCode, message: string, status: number, meta?: Record<string, unknown>) =>
  errorResponse(code, message, status, false, meta);

export const POST: APIRoute = async ({ request }) => {
  const rateLimit = await checkProfileAgentRateLimit(request);
  if (rateLimit.reason === 'rate_limited') {
    return err('RATE_LIMITED', 'Too many requests. Please try again shortly.', 429);
  }
  if (rateLimit.reason === 'unavailable') {
    return err('RATE_LIMIT_UNAVAILABLE', 'Profile Agent protection is unavailable.', 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('INVALID_JSON', 'Invalid request format', 400);
  }

  if (!parseRequiredProfileHandle(body)) {
    return err('INVALID_PROFILE_HANDLE', 'A valid profileHandle is required.', 400);
  }

  const parsed = parseChatRequestInput(body);
  if (!parsed) {
    return err('INVALID_MESSAGES', 'Messages array is required and must not be empty', 400);
  }

  const result = await runChatService(parsed);
  if (!result.ok) return err(result.code, result.message, result.status, result.meta);
  return jsonResponse(result.payload, result.status);
};
