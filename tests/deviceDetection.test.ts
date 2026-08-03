import { describe, expect, it } from 'vitest';
import { isMobileUserAgent } from '../src/utils/deviceDetection';
import {
  getPublicProfileModuleCanonicalUrl,
  getPublicProfileModulePath,
  isPotentialPublicProfilePath,
  isPublicProfileModuleId,
  isPublicProfilePath,
  matchPublicProfilePathShape,
} from '../src/utils/profileRoutes';

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

describe('isPublicProfilePath', () => {
  it('recognises canonical handle routes with or without a trailing slash', () => {
    expect(isPublicProfilePath('/@dessi')).toBe(true);
    expect(isPublicProfilePath('/@dessi/')).toBe(true);
    expect(isPublicProfilePath('/@fixture-person')).toBe(true);
    expect(isPublicProfilePath('/@dessi/workbench')).toBe(true);
    expect(isPublicProfilePath('/@dessi/writing/')).toBe(true);
    expect(isPublicProfilePath('/@dessi/evolution')).toBe(true);
    expect(isPublicProfilePath('/@dessi/network')).toBe(true);
    expect(isPublicProfilePath('/@dessi/resume')).toBe(true);
  });

  it('does not treat unknown or malformed paths as canonical profiles', () => {
    expect(isPublicProfilePath('/mobile/@dessi')).toBe(false);
    expect(isPublicProfilePath('/@Dessi')).toBe(false);
    expect(isPublicProfilePath('/@dessi/apps')).toBe(false);
    expect(isPublicProfilePath('/@dessi/network/extra')).toBe(false);
  });

  it('recognises potential profile route shapes independently from supported modules', () => {
    expect(isPotentialPublicProfilePath('/@dessi/unknown-module')).toBe(true);
    expect(isPotentialPublicProfilePath('/@dessi/Unknown_Module')).toBe(true);
    expect(matchPublicProfilePathShape('/@fixture-person/unknown-module/')).toEqual({
      handle: 'fixture-person',
      moduleId: 'unknown-module',
    });
    expect(isPotentialPublicProfilePath('/@dessi/network/extra')).toBe(false);
    expect(isPotentialPublicProfilePath('/@Dessi/unknown-module')).toBe(false);
  });

  it('builds canonical paths only for supported public modules', () => {
    expect(isPublicProfileModuleId('network')).toBe(true);
    expect(isPublicProfileModuleId('resume')).toBe(true);
    expect(getPublicProfileModulePath('dessi', 'writing')).toBe('/@dessi/writing');
    expect(
      getPublicProfileModuleCanonicalUrl(
        { handle: 'dessi', contact: { website: 'https://dg-os.com/' } },
        'network'
      )
    ).toBe('https://dg-os.com/@dessi/network');
  });
});
