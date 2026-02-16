import { describe, expect, it } from 'vitest';
import { isMobileUserAgent } from '../src/utils/deviceDetection';

describe('isMobileUserAgent', () => {
  it('returns true for mobile user agents', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    expect(isMobileUserAgent(ua)).toBe(true);
  });

  it('returns false for desktop user agents', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    expect(isMobileUserAgent(ua)).toBe(false);
  });

  it('returns false for null input', () => {
    expect(isMobileUserAgent(null)).toBe(false);
  });
});
