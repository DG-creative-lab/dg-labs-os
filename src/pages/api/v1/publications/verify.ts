import type { APIRoute } from 'astro';
import type { PublicationVerificationApiEnvelopeV1 } from '../../../../publication';
import { verifyPublicationForReceiver } from '../../../../publication/receiver/service';
import {
  createPublicationVerificationTrustStoreFromJson,
  type PublicationVerificationTrustStore,
} from '../../../../publication/receiver/trustStore';
import { checkPublicationVerificationRateLimit } from '../../../../utils/apiRateLimit';
import { errorResponse, jsonResponse } from '../../../../utils/apiResponse';
import { getServerEnv } from '../../../../utils/serverEnv';

export const PUBLICATION_VERIFICATION_MAX_BODY_BYTES = 262_144;
export const PUBLICATION_VERIFICATION_KEYS_ENV = 'PUBLICATION_VERIFICATION_KEYS_JSON';

type RateLimitDecision = Awaited<ReturnType<typeof checkPublicationVerificationRateLimit>>;

type PublicationVerificationDependencies = {
  checkRateLimit: (request: Request) => Promise<RateLimitDecision>;
  getTrustStore: () => PublicationVerificationTrustStore;
};

type BodyReadResult =
  | { ok: true; value: unknown }
  | { ok: false; code: 'INVALID_JSON' | 'PAYLOAD_TOO_LARGE'; message: string; status: number };

const parseContentLength = (value: string | null): number | undefined => {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
};

async function readBoundedJson(request: Request): Promise<BodyReadResult> {
  const declaredLength = parseContentLength(request.headers.get('content-length'));
  if (declaredLength !== undefined && declaredLength > PUBLICATION_VERIFICATION_MAX_BODY_BYTES) {
    return {
      ok: false,
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Publication verification payload is too large.',
      status: 413,
    };
  }
  if (!request.body) {
    return {
      ok: false,
      code: 'INVALID_JSON',
      message: 'A JSON request body is required.',
      status: 400,
    };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > PUBLICATION_VERIFICATION_MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return {
          ok: false,
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Publication verification payload is too large.',
          status: 413,
        };
      }
      chunks.push(value);
    }
  } catch {
    return {
      ok: false,
      code: 'INVALID_JSON',
      message: 'Request body could not be read.',
      status: 400,
    };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, code: 'INVALID_JSON', message: 'Invalid JSON request body.', status: 400 };
  }
}

const parseVerificationRequest = (value: unknown): unknown | undefined => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  return keys.length === 1 && keys[0] === 'bundle' ? record.bundle : undefined;
};

const createDefaultTrustStoreLoader = (): (() => PublicationVerificationTrustStore) => {
  let cachedRaw: string | undefined;
  let cachedStore: PublicationVerificationTrustStore | undefined;
  return () => {
    const raw = getServerEnv(PUBLICATION_VERIFICATION_KEYS_ENV);
    if (!cachedStore || raw !== cachedRaw) {
      cachedStore = createPublicationVerificationTrustStoreFromJson(raw);
      cachedRaw = raw;
    }
    return cachedStore;
  };
};

export function createPublicationVerificationPostHandler(
  dependencies: Partial<PublicationVerificationDependencies> = {}
): APIRoute {
  const checkRateLimit = dependencies.checkRateLimit ?? checkPublicationVerificationRateLimit;
  const getTrustStore = dependencies.getTrustStore ?? createDefaultTrustStoreLoader();

  return async ({ request }) => {
    const rateLimit = await checkRateLimit(request);
    if (rateLimit.reason === 'rate_limited') {
      return errorResponse('RATE_LIMITED', 'Too many verification requests.', 429, true);
    }
    if (rateLimit.reason === 'unavailable') {
      return errorResponse(
        'RATE_LIMIT_UNAVAILABLE',
        'Publication verification protection is unavailable.',
        503,
        true
      );
    }

    const mediaType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
    if (mediaType !== 'application/json') {
      return errorResponse(
        'UNSUPPORTED_MEDIA_TYPE',
        'Publication verification requires application/json.',
        415,
        true
      );
    }

    const body = await readBoundedJson(request);
    if (!body.ok) return errorResponse(body.code, body.message, body.status, true);
    const bundle = parseVerificationRequest(body.value);
    if (bundle === undefined) {
      return errorResponse(
        'INVALID_REQUEST',
        'Request body must contain exactly one bundle field.',
        400,
        true
      );
    }

    let trustStore: PublicationVerificationTrustStore;
    try {
      trustStore = getTrustStore();
    } catch {
      return errorResponse(
        'VERIFICATION_UNAVAILABLE',
        'Publication verification trust configuration is unavailable.',
        503,
        true
      );
    }

    const payload: PublicationVerificationApiEnvelopeV1 = {
      ok: true,
      verification: verifyPublicationForReceiver(bundle, trustStore),
    };
    return jsonResponse(payload, 200, true);
  };
}

export const POST = createPublicationVerificationPostHandler();
