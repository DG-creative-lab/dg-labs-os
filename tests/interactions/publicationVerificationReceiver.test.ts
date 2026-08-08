import { describe, expect, it } from 'vitest';
import { resolveActiveProfile } from '../../src/profiles';
import {
  isPublicationVerificationApiEnvelopeV1,
  type PublicationBundleV1,
} from '../../src/publication';
import { verifyPublicationForReceiver } from '../../src/publication/receiver/service';
import {
  createPublicationVerificationTrustStore,
  createPublicationVerificationTrustStoreFromJson,
  type PublicationTrustedKeyConfig,
} from '../../src/publication/receiver/trustStore';
import {
  createPublicationVerificationPostHandler,
  PUBLICATION_VERIFICATION_MAX_BODY_BYTES,
} from '../../src/pages/api/publications/verify';
import { isApiErrorEnvelope } from '../../src/utils/apiContracts';
import {
  publicationBundleV1Fixture,
  publicationBundleV1FixturePublicKey,
} from '../fixtures/contracts/publicationBundleV1';
import { verifiedPublicationReceiptV1Fixture } from '../fixtures/contracts/publicationVerificationV1';

const trustedKeyConfig = {
  workspaceId: publicationBundleV1Fixture.workspaceId,
  profileId: publicationBundleV1Fixture.target.profileId,
  handle: publicationBundleV1Fixture.target.handle,
  approvedByUserId: publicationBundleV1Fixture.approval.approvedByUserId,
  keyId: publicationBundleV1Fixture.integrity.keyId,
  publicKeyPem: publicationBundleV1FixturePublicKey,
} as const satisfies PublicationTrustedKeyConfig;

const createTrustStore = () => createPublicationVerificationTrustStore([trustedKeyConfig]);

const requestFor = (body: string, contentType = 'application/json') =>
  new Request('http://localhost/api/publications/verify', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });

const contextFor = (request: Request) =>
  ({ request }) as Parameters<ReturnType<typeof createPublicationVerificationPostHandler>>[0];

describe('publication verification receiver boundary', () => {
  it('returns a versioned receipt for a bundle signed by the exact trusted identity', () => {
    expect(verifyPublicationForReceiver(publicationBundleV1Fixture, createTrustStore())).toEqual(
      verifiedPublicationReceiptV1Fixture
    );
  });

  it('rejects cross-workspace and cross-approver key use before signature trust', () => {
    const wrongWorkspace: PublicationBundleV1 = {
      ...publicationBundleV1Fixture,
      workspaceId: 'workspace_other',
    };
    const wrongApprover: PublicationBundleV1 = {
      ...publicationBundleV1Fixture,
      approval: {
        ...publicationBundleV1Fixture.approval,
        approvedByUserId: 'user_other',
      },
    };

    for (const candidate of [wrongWorkspace, wrongApprover]) {
      const receipt = verifyPublicationForReceiver(candidate, createTrustStore());
      expect(receipt).toMatchObject({
        status: 'rejected',
        code: 'UNTRUSTED_SIGNING_KEY',
      });
      expect(receipt).not.toHaveProperty('subject');
    }
  });

  it('distinguishes cryptographic failure from an untrusted identity', () => {
    const signature = publicationBundleV1Fixture.integrity.signature;
    const tamperedSignature = `${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
    const candidate = {
      ...publicationBundleV1Fixture,
      integrity: { ...publicationBundleV1Fixture.integrity, signature: tamperedSignature },
    };

    expect(verifyPublicationForReceiver(candidate, createTrustStore())).toMatchObject({
      status: 'rejected',
      code: 'CRYPTOGRAPHIC_VERIFICATION_FAILED',
      issues: [{ path: 'integrity.signature', message: 'Bundle signature is invalid.' }],
    });
  });

  it('rejects malformed trust configuration, private keys, and duplicate bindings', () => {
    expect(() => createPublicationVerificationTrustStoreFromJson(undefined)).toThrow(
      'missing or too large'
    );
    expect(() =>
      createPublicationVerificationTrustStore([
        {
          ...trustedKeyConfig,
          publicKeyPem: `-----BEGIN ${['PRIVATE', 'KEY'].join(' ')}-----\nprivate\n-----END ${['PRIVATE', 'KEY'].join(' ')}-----`,
        },
      ])
    ).toThrow('public key only');
    expect(() =>
      createPublicationVerificationTrustStore([trustedKeyConfig, trustedKeyConfig])
    ).toThrow('duplicates an existing identity binding');
  });

  it('verifies through the API without mutating the active public profile', async () => {
    const before = resolveActiveProfile('dessi');
    const beforeSnapshot = JSON.stringify(before);
    const handler = createPublicationVerificationPostHandler({
      checkRateLimit: async () => ({ allowed: true, reason: 'allowed' }),
      getTrustStore: createTrustStore,
    });
    const response = await handler(
      contextFor(requestFor(JSON.stringify({ bundle: publicationBundleV1Fixture })))
    );
    const body = (await response.json()) as unknown;

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(isPublicationVerificationApiEnvelopeV1(body)).toBe(true);
    expect(body).toMatchObject({ ok: true, verification: verifiedPublicationReceiptV1Fixture });
    expect(resolveActiveProfile('dessi')).toBe(before);
    expect(JSON.stringify(resolveActiveProfile('dessi'))).toBe(beforeSnapshot);
  });

  it('rejects invalid transport envelopes and oversized bodies before verification', async () => {
    const handler = createPublicationVerificationPostHandler({
      checkRateLimit: async () => ({ allowed: true, reason: 'allowed' }),
      getTrustStore: createTrustStore,
    });
    const cases = [
      {
        request: requestFor('{bad json'),
        status: 400,
        code: 'INVALID_JSON',
      },
      {
        request: requestFor(JSON.stringify({ bundle: publicationBundleV1Fixture }), 'text/plain'),
        status: 415,
        code: 'UNSUPPORTED_MEDIA_TYPE',
      },
      {
        request: requestFor(JSON.stringify({ notBundle: publicationBundleV1Fixture })),
        status: 400,
        code: 'INVALID_REQUEST',
      },
      {
        request: requestFor(
          JSON.stringify({ padding: 'x'.repeat(PUBLICATION_VERIFICATION_MAX_BODY_BYTES) })
        ),
        status: 413,
        code: 'PAYLOAD_TOO_LARGE',
      },
    ];

    for (const testCase of cases) {
      const response = await handler(contextFor(testCase.request));
      const body = (await response.json()) as unknown;
      expect(response.status).toBe(testCase.status);
      expect(isApiErrorEnvelope(body)).toBe(true);
      if (isApiErrorEnvelope(body)) expect(body.code).toBe(testCase.code);
    }
  });

  it('fails closed when rate limiting or trust configuration is unavailable', async () => {
    const request = requestFor(JSON.stringify({ bundle: publicationBundleV1Fixture }));
    const rateLimited = createPublicationVerificationPostHandler({
      checkRateLimit: async () => ({ allowed: false, reason: 'rate_limited' }),
      getTrustStore: createTrustStore,
    });
    const unavailableRateLimit = createPublicationVerificationPostHandler({
      checkRateLimit: async () => ({ allowed: false, reason: 'unavailable' }),
      getTrustStore: createTrustStore,
    });
    const unavailableTrust = createPublicationVerificationPostHandler({
      checkRateLimit: async () => ({ allowed: true, reason: 'allowed' }),
      getTrustStore: () => {
        throw new Error('sensitive configuration detail');
      },
    });

    await expect(rateLimited(contextFor(request.clone()))).resolves.toMatchObject({ status: 429 });
    await expect(unavailableRateLimit(contextFor(request.clone()))).resolves.toMatchObject({
      status: 503,
    });
    const response = await unavailableTrust(contextFor(request.clone()));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('sensitive configuration detail');
  });
});
