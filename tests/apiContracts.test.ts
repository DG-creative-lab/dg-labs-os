import { describe, expect, it } from 'vitest';
import {
  adminLoginSuccess,
  adminMessagesSuccess,
  chatSuccess,
  healthSuccess,
  isAdminLoginSuccessEnvelope,
  isAdminMessagesSuccessEnvelope,
  isApiErrorEnvelope,
  isChatSuccessEnvelope,
  isHealthSuccessEnvelope,
  isToolSuccessEnvelope,
  isVerifySuccessEnvelope,
  toolSuccess,
  verifySuccess,
} from '../src/utils/apiContracts';
import { errorResponse } from '../src/utils/apiResponse';

describe('api contracts', () => {
  it('builds success envelopes with the expected shape', () => {
    expect(isHealthSuccessEnvelope(healthSuccess())).toBe(true);
    expect(isChatSuccessEnvelope(chatSuccess('hi'))).toBe(true);
    expect(
      isVerifySuccessEnvelope(
        verifySuccess('llm agents', 'summary', [
          { title: 'Doc', url: 'https://example.com', snippet: 'Snippet text' },
        ])
      )
    ).toBe(true);
    expect(isToolSuccessEnvelope(toolSuccess('local_context', { hits: [] }))).toBe(true);
    expect(isAdminLoginSuccessEnvelope(adminLoginSuccess())).toBe(true);
    expect(isAdminMessagesSuccessEnvelope(adminMessagesSuccess([], 0, 50, 0))).toBe(true);
  });

  it('recognizes normalized error envelope', async () => {
    const response = errorResponse('ERR', 'failed', 400);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
  });
});
