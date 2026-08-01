import {
  PROFILE_PROJECTION_SCHEMA_VERSION,
  type ProfileLink,
  type ProfileProjection,
} from './contracts';

export type ProfileProjectionIssue = {
  path: string;
  message: string;
};

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRIVATE_PATH_PATTERN = /(?:file:\/\/|\/(?:Users|home)\/|[A-Za-z]:\\Users\\)/i;
const SECRET_KEY_PATTERN =
  /(?:password|secret|private[_-]?key|access[_-]?token|refresh[_-]?token)/i;

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function isIsoTimestamp(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateLink(link: ProfileLink, index: number): ProfileProjectionIssue[] {
  const path = `links[${index}]`;
  const issues: ProfileProjectionIssue[] = [];

  if (!ID_PATTERN.test(link.id)) {
    issues.push({ path: `${path}.id`, message: 'Link IDs must use stable lowercase identifiers.' });
  }
  if (!isNonEmpty(link.label)) {
    issues.push({ path: `${path}.label`, message: 'Link labels cannot be empty.' });
  }

  const validContactLink = link.kind === 'contact' && link.url.startsWith('mailto:');
  if (!validContactLink && !isWebUrl(link.url)) {
    issues.push({
      path: `${path}.url`,
      message: 'Links must use an absolute HTTP(S) URL or a mailto URL for contact links.',
    });
  }
  if (link.surfaces.includes('verification') && !isWebUrl(link.url)) {
    issues.push({
      path: `${path}.surfaces`,
      message: 'Verification links must resolve to an HTTP(S) source.',
    });
  }

  return issues;
}

function inspectForPrivateMaterial(
  value: unknown,
  path: string,
  issues: ProfileProjectionIssue[]
): void {
  if (typeof value === 'string') {
    if (PRIVATE_PATH_PATTERN.test(value)) {
      issues.push({ path, message: 'Public projections cannot contain local filesystem paths.' });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectForPrivateMaterial(item, `${path}[${index}]`, issues));
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (SECRET_KEY_PATTERN.test(key) && child !== null && child !== undefined && child !== '') {
      issues.push({ path: childPath, message: 'Secret-bearing fields are forbidden.' });
    }
    inspectForPrivateMaterial(child, childPath, issues);
  }
}

export function validateProfileProjection(projection: ProfileProjection): ProfileProjectionIssue[] {
  const issues: ProfileProjectionIssue[] = [];

  if (projection.schemaVersion !== PROFILE_PROJECTION_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', message: 'Unsupported profile projection schema.' });
  }
  if (!ID_PATTERN.test(projection.profileId)) {
    issues.push({
      path: 'profileId',
      message: 'Profile IDs must use stable lowercase identifiers.',
    });
  }
  if (!HANDLE_PATTERN.test(projection.handle)) {
    issues.push({ path: 'handle', message: 'Profile handles must be URL-safe lowercase slugs.' });
  }
  if (!Number.isInteger(projection.projectionVersion) || projection.projectionVersion < 1) {
    issues.push({
      path: 'projectionVersion',
      message: 'Projection versions must be positive integers.',
    });
  }

  const requiredIdentityFields = [
    ['identity.displayName', projection.identity.displayName],
    ['identity.preferredName', projection.identity.preferredName],
    ['identity.ownerName', projection.identity.ownerName],
    ['identity.role', projection.identity.role],
    ['identity.location', projection.identity.location],
    ['identity.roleFocus', projection.identity.roleFocus],
    ['identity.headline', projection.identity.headline],
    ['identity.introduction', projection.identity.introduction],
  ] as const;
  for (const [path, value] of requiredIdentityFields) {
    if (!isNonEmpty(value)) issues.push({ path, message: 'Identity fields cannot be empty.' });
  }

  const aliases = projection.identity.aliases.map((alias) => alias.trim()).filter(Boolean);
  if (
    aliases.length !== projection.identity.aliases.length ||
    new Set(aliases).size !== aliases.length
  ) {
    issues.push({ path: 'identity.aliases', message: 'Aliases must be non-empty and unique.' });
  }

  if (!EMAIL_PATTERN.test(projection.contact.publicEmail)) {
    issues.push({ path: 'contact.publicEmail', message: 'Public email is invalid.' });
  }
  if (!isWebUrl(projection.contact.website)) {
    issues.push({ path: 'contact.website', message: 'Website must be an absolute HTTP(S) URL.' });
  }

  const linkIds = new Set<string>();
  projection.links.forEach((link, index) => {
    issues.push(...validateLink(link, index));
    if (linkIds.has(link.id)) {
      issues.push({ path: `links[${index}].id`, message: 'Link IDs must be unique.' });
    }
    linkIds.add(link.id);
  });

  const cvEntries = [projection.cv.primary, ...projection.cv.variants];
  const cvIds = new Set<string>();
  cvEntries.forEach((entry, index) => {
    const path = index === 0 ? 'cv.primary' : `cv.variants[${index - 1}]`;
    if (!ID_PATTERN.test(entry.id) || cvIds.has(entry.id)) {
      issues.push({ path: `${path}.id`, message: 'CV IDs must be stable and unique.' });
    }
    cvIds.add(entry.id);
    if (!entry.files.pdf.endsWith('.pdf')) {
      issues.push({ path: `${path}.files.pdf`, message: 'PDF assets must end in .pdf.' });
    }
    if (!entry.files.docx.endsWith('.docx')) {
      issues.push({ path: `${path}.files.docx`, message: 'DOCX assets must end in .docx.' });
    }
    if (!entry.files.markdown.endsWith('.md')) {
      issues.push({ path: `${path}.files.markdown`, message: 'Markdown assets must end in .md.' });
    }
  });

  if (!isNonEmpty(projection.seo.title) || !isNonEmpty(projection.seo.description)) {
    issues.push({ path: 'seo', message: 'SEO title and description cannot be empty.' });
  }
  const keywords = projection.seo.keywords.map((keyword) => keyword.trim()).filter(Boolean);
  if (!keywords.length || keywords.length !== new Set(keywords).size) {
    issues.push({ path: 'seo.keywords', message: 'SEO keywords must be non-empty and unique.' });
  }

  if (projection.status === 'published') {
    if (projection.publication.visibility !== 'public') {
      issues.push({
        path: 'publication.visibility',
        message: 'Published projections must be public.',
      });
    }
    if (projection.publication.approvedBy !== 'owner') {
      issues.push({
        path: 'publication.approvedBy',
        message: 'Publication requires owner approval.',
      });
    }
  }
  if (!isIsoTimestamp(projection.publication.reviewedAt)) {
    issues.push({
      path: 'publication.reviewedAt',
      message: 'Review time must be an ISO UTC timestamp.',
    });
  }
  if (!isIsoTimestamp(projection.publication.publishedAt)) {
    issues.push({
      path: 'publication.publishedAt',
      message: 'Publication time must be an ISO UTC timestamp.',
    });
  }
  if (!projection.publication.privateSourcesExcluded) {
    issues.push({
      path: 'publication.privateSourcesExcluded',
      message: 'Public projections must explicitly exclude private sources.',
    });
  }
  if (!isNonEmpty(projection.publication.sourcePolicy)) {
    issues.push({ path: 'publication.sourcePolicy', message: 'A source policy is required.' });
  }

  inspectForPrivateMaterial(projection, '', issues);
  return issues;
}

export function defineProfileProjection<const T extends ProfileProjection>(projection: T): T {
  const issues = validateProfileProjection(projection);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid profile projection:\n${summary}`);
  }
  return projection;
}
