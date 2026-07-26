import { describe, expect, it } from 'vitest';
import {
  applicationCaseStudies,
  applicationClaims,
  evolutionEntries,
} from '../src/config/applicationProfile';
import { validateApplicationProfile } from '../src/config/applicationValidation';

describe('application evidence profile', () => {
  it('contains only bounded, evidenced public claims', () => {
    expect(
      validateApplicationProfile({
        claims: applicationClaims,
        caseStudies: applicationCaseStudies,
        evolution: evolutionEntries,
      })
    ).toEqual([]);
  });

  it('rejects unsupported verified and private claims', () => {
    const unsupported = [
      {
        ...applicationClaims[0],
        id: 'unsupported-public',
        evidence: [],
      },
      {
        ...applicationClaims[0],
        id: 'unsupported-private',
        confidence: 'self-reported' as const,
        visibility: 'private-employer' as const,
        evidence: [],
        boundary: '',
      },
    ];

    const issues = validateApplicationProfile({
      claims: unsupported,
      caseStudies: [],
      evolution: [],
    });

    expect(
      issues.some((issue) => issue.message === 'Verified claims require direct evidence.')
    ).toBe(true);
    expect(
      issues.some(
        (issue) => issue.message === 'Private or non-verified claims require an explicit boundary.'
      )
    ).toBe(true);
  });
});
