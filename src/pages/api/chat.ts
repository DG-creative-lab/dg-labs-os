import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseChatRequestInput } from '../../utils/requestSchemas';
import { runChatService, type ChatServiceErrorCode } from '../../services/chatService';

type ErrorCode = 'INVALID_JSON' | 'INVALID_MESSAGES' | ChatServiceErrorCode;

const err = (code: ErrorCode, message: string, status: number) =>
  errorResponse(code, message, status);

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

  const result = await runChatService(parsed);
  if (!result.ok) return err(result.code, result.message, result.status);
  return jsonResponse(result.payload, result.status);
};
