import type { APIRoute } from 'astro';
import { verifySuccess } from '../../utils/apiContracts';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseVerifyInput } from '../../utils/requestSchemas';
import { performWebVerify } from '../../utils/webVerify';

type ErrorCode = 'INVALID_JSON' | 'INVALID_QUERY' | 'TIMEOUT' | 'UPSTREAM_ERROR' | 'INTERNAL_ERROR';

const err = (code: ErrorCode, message: string, status: number) =>
  errorResponse(code, message, status);

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('INVALID_JSON', 'Invalid request format', 400);
  }

  const parsed = parseVerifyInput(body);
  if (!parsed) {
    return err('INVALID_QUERY', 'Query is required and must be at least 2 characters', 400);
  }

  try {
    const result = await performWebVerify(parsed.query, 8000);
    return jsonResponse(verifySuccess(parsed.query, result.summary, result.sources), 200);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return err('TIMEOUT', 'Verification request timed out', 504);
    }
    if (error instanceof Error && error.message === 'UPSTREAM_ERROR') {
      return err('UPSTREAM_ERROR', 'Search provider request failed', 502);
    }
    return err('INTERNAL_ERROR', 'Unexpected verification error', 500);
  }
};
