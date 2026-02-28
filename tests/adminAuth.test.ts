import { describe, expect, it } from 'vitest';
import {
  createAdminSessionToken,
  safeCredentialMatch,
  verifyAdminSessionToken,
} from '../src/utils/adminAuth';

describe('admin auth helpers', () => {
  const secret = 'test-secret-value';

  it('creates and verifies a valid token', () => {
    const token = createAdminSessionToken('admin', secret);
    const payload = verifyAdminSessionToken(token, secret);
    expect(payload?.u).toBe('admin');
    expect(typeof payload?.exp).toBe('number');
  });

  it('rejects token signed with different secret', () => {
    const token = createAdminSessionToken('admin', secret);
    const payload = verifyAdminSessionToken(token, 'wrong-secret');
    expect(payload).toBeNull();
  });

  it('uses timing-safe credential match helper', () => {
    expect(safeCredentialMatch('abc123', 'abc123')).toBe(true);
    expect(safeCredentialMatch('abc123', 'abc124')).toBe(false);
  });
});
