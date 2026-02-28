import { describe, expect, it } from 'vitest';
import { errorResponse, jsonResponse } from '../src/utils/apiResponse';

describe('apiResponse helpers', () => {
  it('builds success response with json content-type', async () => {
    const response = jsonResponse({ ok: true, value: 1 }, 200);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const body = (await response.json()) as { ok: boolean; value: number };
    expect(body.ok).toBe(true);
    expect(body.value).toBe(1);
  });

  it('builds normalized error response', async () => {
    const response = errorResponse('TEST_ERROR', 'Something failed', 500, true);
    expect(response.status).toBe(500);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = (await response.json()) as {
      ok: boolean;
      code: string;
      message: string;
      error: string;
      timestamp: string;
    };
    expect(body.ok).toBe(false);
    expect(body.code).toBe('TEST_ERROR');
    expect(body.message).toBe('Something failed');
    expect(body.error).toBe('Something failed');
    expect(typeof body.timestamp).toBe('string');
  });
});
