import {
  PUBLIC_WRITING_SCHEMA_VERSION,
  type PublicWritingEntry,
  type PublicWritingModule,
} from './contracts';

export type PublicWritingIssue = {
  path: string;
  message: string;
};

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PRIVATE_PATH_PATTERN = /(?:^file:\/\/|^\/(?:Users|home|src|scripts)\/|^[A-Za-z]:\\Users\\)/i;
const SECRET_KEY_PATTERN =
  /(?:password|secret|private[_-]?key|access[_-]?token|refresh[_-]?token)/i;
const INTERNAL_SOURCE_KEY_PATTERN =
  /^(?:sourcePath|source_path|internalPath|internal_path|internalSource|internal_source)$/i;
const WRITING_KINDS = new Set([
  'Build note',
  'Implementation guide',
  'Reference architecture',
  'Technical analysis',
]);
const CONTRIBUTION_CONFIDENCE = new Set(['verified', 'self-reported']);
const EVIDENCE_KINDS = new Set(['article', 'archive', 'repository', 'site']);

const isNonEmpty = (value: string): boolean => value.trim().length > 0;

const isIsoDate = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isIsoTimestamp = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
  !Number.isNaN(Date.parse(value));

const isWebUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

function inspectForPrivateMaterial(
  value: unknown,
  path: string,
  issues: PublicWritingIssue[]
): void {
  if (typeof value === 'string') {
    if (PRIVATE_PATH_PATTERN.test(value)) {
      issues.push({ path, message: 'Public writing cannot contain local filesystem paths.' });
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
    if (
      INTERNAL_SOURCE_KEY_PATTERN.test(key) &&
      child !== null &&
      child !== undefined &&
      child !== ''
    ) {
      issues.push({ path: childPath, message: 'Internal source metadata is forbidden.' });
    }
    inspectForPrivateMaterial(child, childPath, issues);
  }
}

function validateEntry(
  entry: PublicWritingEntry,
  index: number,
  ids: Set<string>
): PublicWritingIssue[] {
  const path = `entries[${index}]`;
  const issues: PublicWritingIssue[] = [];

  if (!ID_PATTERN.test(entry.id) || ids.has(entry.id)) {
    issues.push({ path: `${path}.id`, message: 'Writing entry IDs must be stable and unique.' });
  }
  ids.add(entry.id);

  if (!WRITING_KINDS.has(entry.kind)) {
    issues.push({ path: `${path}.kind`, message: 'Unsupported Writing kind.' });
  }

  for (const [field, value] of Object.entries({
    kind: entry.kind,
    title: entry.title,
    subtitle: entry.subtitle,
    readingTime: entry.readingTime,
    relatedSystem: entry.relatedSystem,
    boundary: entry.boundary,
  })) {
    if (!isNonEmpty(value)) {
      issues.push({ path: `${path}.${field}`, message: `${field} is required.` });
    }
  }
  if (entry.status !== 'published') {
    issues.push({ path: `${path}.status`, message: 'Only published writing can be registered.' });
  }
  if (!isIsoDate(entry.publishedOn)) {
    issues.push({ path: `${path}.publishedOn`, message: 'Publication date must use YYYY-MM-DD.' });
  }
  if (!isIsoDate(entry.reviewedOn)) {
    issues.push({ path: `${path}.reviewedOn`, message: 'Review date must use YYYY-MM-DD.' });
  } else if (isIsoDate(entry.publishedOn) && entry.reviewedOn < entry.publishedOn) {
    issues.push({
      path: `${path}.reviewedOn`,
      message: 'Review date cannot precede publication date.',
    });
  }
  if (!isWebUrl(entry.url)) {
    issues.push({ path: `${path}.url`, message: 'Writing URLs must be absolute HTTP(S) URLs.' });
  }
  if (!entry.topics.length || entry.topics.some((topic) => !isNonEmpty(topic))) {
    issues.push({ path: `${path}.topics`, message: 'Topics must be non-empty.' });
  } else if (
    new Set(entry.topics.map((topic) => topic.trim().toLowerCase())).size !== entry.topics.length
  ) {
    issues.push({ path: `${path}.topics`, message: 'Topics must be unique.' });
  }
  if (!isNonEmpty(entry.authorship.byline)) {
    issues.push({ path: `${path}.authorship.byline`, message: 'A public byline is required.' });
  }
  if (!isNonEmpty(entry.authorship.contribution)) {
    issues.push({
      path: `${path}.authorship.contribution`,
      message: 'The profile contribution must be stated.',
    });
  }
  if (!CONTRIBUTION_CONFIDENCE.has(entry.authorship.contributionConfidence)) {
    issues.push({
      path: `${path}.authorship.contributionConfidence`,
      message: 'Unsupported contribution confidence.',
    });
  }
  if (!entry.evidence.length) {
    issues.push({ path: `${path}.evidence`, message: 'At least one public source is required.' });
  }
  entry.evidence.forEach((source, sourceIndex) => {
    if (!isNonEmpty(source.label)) {
      issues.push({
        path: `${path}.evidence[${sourceIndex}].label`,
        message: 'Evidence labels cannot be empty.',
      });
    }
    if (!isWebUrl(source.url)) {
      issues.push({
        path: `${path}.evidence[${sourceIndex}].url`,
        message: 'Evidence URLs must be absolute HTTP(S) URLs.',
      });
    }
    if (!EVIDENCE_KINDS.has(source.kind)) {
      issues.push({
        path: `${path}.evidence[${sourceIndex}].kind`,
        message: 'Unsupported evidence kind.',
      });
    }
  });
  if (!entry.evidence.some((source) => source.url === entry.url)) {
    issues.push({
      path: `${path}.evidence`,
      message: 'Published writing must cite its canonical article URL.',
    });
  }

  return issues;
}

export function validatePublicWritingModule(module: PublicWritingModule): PublicWritingIssue[] {
  const issues: PublicWritingIssue[] = [];

  if (module.schemaVersion !== PUBLIC_WRITING_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', message: 'Unsupported public writing schema.' });
  }
  if (!ID_PATTERN.test(module.profileId)) {
    issues.push({
      path: 'profileId',
      message: 'Profile ID must be a stable lowercase identifier.',
    });
  }
  if (!HANDLE_PATTERN.test(module.handle)) {
    issues.push({ path: 'handle', message: 'Handle must be a URL-safe lowercase slug.' });
  }
  if (module.status !== 'published') {
    issues.push({ path: 'status', message: 'Only published writing modules can be registered.' });
  }
  for (const [path, version] of [
    ['projectionVersion', module.projectionVersion],
    ['writingVersion', module.writingVersion],
  ] as const) {
    if (!Number.isInteger(version) || version < 1) {
      issues.push({ path, message: 'Versions must be positive integers.' });
    }
  }
  if (!isNonEmpty(module.title) || !isNonEmpty(module.description)) {
    issues.push({ path: 'title', message: 'Writing title and description are required.' });
  }
  if (!module.entries.length) {
    issues.push({ path: 'entries', message: 'A published writing module cannot be empty.' });
  }
  const ids = new Set<string>();
  module.entries.forEach((entry, index) => issues.push(...validateEntry(entry, index, ids)));

  if (!isNonEmpty(module.archive.label) || !isWebUrl(module.archive.url)) {
    issues.push({ path: 'archive', message: 'The archive requires a label and HTTP(S) URL.' });
  }
  if (!isNonEmpty(module.archive.boundary)) {
    issues.push({ path: 'archive.boundary', message: 'The archive boundary is required.' });
  }
  if (module.publication.approvedBy !== 'owner') {
    issues.push({
      path: 'publication.approvedBy',
      message: 'Publication requires owner approval.',
    });
  }
  if (!isIsoTimestamp(module.publication.reviewedAt)) {
    issues.push({
      path: 'publication.reviewedAt',
      message: 'Review time must be an ISO UTC timestamp.',
    });
  }
  if (!isIsoTimestamp(module.publication.publishedAt)) {
    issues.push({
      path: 'publication.publishedAt',
      message: 'Publication time must be an ISO UTC timestamp.',
    });
  }
  if (
    isIsoTimestamp(module.publication.reviewedAt) &&
    isIsoTimestamp(module.publication.publishedAt) &&
    module.publication.publishedAt < module.publication.reviewedAt
  ) {
    issues.push({
      path: 'publication.publishedAt',
      message: 'Publication time cannot precede review time.',
    });
  }
  if (!module.publication.privateSourcesExcluded) {
    issues.push({
      path: 'publication.privateSourcesExcluded',
      message: 'Public writing must explicitly exclude private sources.',
    });
  }
  if (!isNonEmpty(module.publication.sourcePolicy)) {
    issues.push({ path: 'publication.sourcePolicy', message: 'A source policy is required.' });
  }

  inspectForPrivateMaterial(module, '', issues);
  return issues;
}

export function definePublicWritingModule<const T extends PublicWritingModule>(module: T): T {
  const issues = validatePublicWritingModule(module);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid public writing module:\n${summary}`);
  }
  return module;
}
