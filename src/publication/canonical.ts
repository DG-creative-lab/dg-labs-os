import canonicalize from 'canonicalize';
import {
  PUBLICATION_CANONICALIZATION,
  PUBLICATION_DIGEST_ALGORITHM,
  PUBLICATION_SIGNATURE_ALGORITHM,
  type PublicationBundlePayloadV1,
  type PublicationBundleSigningDocument,
  type PublicationIntegrityMetadata,
} from './contracts';

export function createPublicationIntegrityMetadata(keyId: string): PublicationIntegrityMetadata {
  return {
    canonicalization: PUBLICATION_CANONICALIZATION,
    digestAlgorithm: PUBLICATION_DIGEST_ALGORITHM,
    signatureAlgorithm: PUBLICATION_SIGNATURE_ALGORITHM,
    keyId,
  };
}

export function createPublicationSigningDocument(
  payload: PublicationBundlePayloadV1,
  integrity: PublicationIntegrityMetadata
): PublicationBundleSigningDocument {
  return { ...payload, integrity };
}

export function canonicalizePublicationSigningDocument(
  document: PublicationBundleSigningDocument
): string {
  const canonical = canonicalize(document);
  if (canonical === undefined) {
    throw new Error('Publication signing document cannot be canonicalized.');
  }
  return canonical;
}
