import {
  PUBLIC_RESUME_SCHEMA_VERSION,
  type PublicResumeIssue,
  type PublicResumeModule,
  type ResumeEducation,
  type ResumeExperience,
} from './contracts';

export { validateResumeReferences } from './referenceValidation';
export type { PublicResumeIssue } from './contracts';

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const RESUME_DATE_PATTERN = /^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/;
const PRIVATE_PATH_PATTERNS = [
  /file:\/\/[^\s"'<>]+/i,
  /(?:^|[\s([{"'=,:;])\/(?:Users|home|src|scripts)\//i,
  /(?:^|[\s([{"'=,:;])[A-Za-z]:\\/i,
] as const;
const SECRET_KEY_PATTERN =
  /(?:password|secret|private[_-]?key|access[_-]?token|refresh[_-]?token)/i;
const INTERNAL_SOURCE_KEY_PATTERN =
  /^(?:sourcePath|source_path|internalPath|internal_path|internalSource|internal_source)$/i;

const isNonEmpty = (value: string): boolean => value.trim().length > 0;
const isIsoTimestamp = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
  !Number.isNaN(Date.parse(value));

function inspectForPrivateMaterial(
  value: unknown,
  path: string,
  issues: PublicResumeIssue[]
): void {
  if (typeof value === 'string') {
    if (PRIVATE_PATH_PATTERNS.some((pattern) => pattern.test(value))) {
      issues.push({ path, message: 'Public Resume data cannot contain local filesystem paths.' });
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

function validateDateRange(
  startedAt: string,
  endedAt: string | null,
  path: string,
  issues: PublicResumeIssue[]
): void {
  if (!RESUME_DATE_PATTERN.test(startedAt)) {
    issues.push({ path: `${path}.startedAt`, message: 'Resume dates must use YYYY or YYYY-MM.' });
  }
  if (endedAt !== null && !RESUME_DATE_PATTERN.test(endedAt)) {
    issues.push({ path: `${path}.endedAt`, message: 'Resume dates must use YYYY or YYYY-MM.' });
  }
  if (endedAt !== null && RESUME_DATE_PATTERN.test(startedAt) && endedAt < startedAt) {
    issues.push({ path: `${path}.endedAt`, message: 'End date cannot precede start date.' });
  }
}

function validateExperience(
  item: ResumeExperience,
  index: number,
  ids: Set<string>
): PublicResumeIssue[] {
  const path = `experience[${index}]`;
  const issues: PublicResumeIssue[] = [];
  if (!ID_PATTERN.test(item.id) || ids.has(item.id)) {
    issues.push({ path: `${path}.id`, message: 'Experience IDs must be stable and unique.' });
  }
  ids.add(item.id);
  for (const [field, value] of Object.entries({
    title: item.title,
    organisation: item.organisation,
    location: item.location,
  })) {
    if (!isNonEmpty(value))
      issues.push({ path: `${path}.${field}`, message: `${field} is required.` });
  }
  validateDateRange(item.startedAt, item.endedAt, path, issues);
  if (!item.highlights.length || item.highlights.some((highlight) => !isNonEmpty(highlight))) {
    issues.push({ path: `${path}.highlights`, message: 'Experience highlights are required.' });
  }
  if (item.boundary !== undefined && !isNonEmpty(item.boundary)) {
    issues.push({ path: `${path}.boundary`, message: 'Experience boundaries cannot be empty.' });
  }
  return issues;
}

function validateEducation(
  item: ResumeEducation,
  index: number,
  ids: Set<string>
): PublicResumeIssue[] {
  const path = `education[${index}]`;
  const issues: PublicResumeIssue[] = [];
  if (!ID_PATTERN.test(item.id) || ids.has(item.id)) {
    issues.push({ path: `${path}.id`, message: 'Education IDs must be stable and unique.' });
  }
  ids.add(item.id);
  if (!isNonEmpty(item.qualification) || !isNonEmpty(item.institution)) {
    issues.push({ path, message: 'Education qualification and institution are required.' });
  }
  validateDateRange(item.startedAt, item.endedAt, path, issues);
  return issues;
}

export function validatePublicResumeModule(module: PublicResumeModule): PublicResumeIssue[] {
  const issues: PublicResumeIssue[] = [];

  if (module.schemaVersion !== PUBLIC_RESUME_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', message: 'Unsupported public Resume schema.' });
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
    issues.push({ path: 'status', message: 'Only published Resume modules can be registered.' });
  }
  for (const [path, version] of [
    ['projectionVersion', module.projectionVersion],
    ['resumeVersion', module.resumeVersion],
  ] as const) {
    if (!Number.isInteger(version) || version < 1) {
      issues.push({ path, message: 'Versions must be positive integers.' });
    }
  }
  if (!isNonEmpty(module.roleTitle) || !isNonEmpty(module.summary)) {
    issues.push({ path: 'summary', message: 'Resume role title and summary are required.' });
  }
  if (!module.contact.length) {
    issues.push({ path: 'contact', message: 'At least one public contact reference is required.' });
  }
  module.contact.forEach((item, index) => {
    const contact = item as { kind?: unknown; label?: unknown; linkId?: unknown };
    switch (contact.kind) {
      case 'public-email':
        break;
      case 'website':
        if (typeof contact.label !== 'string' || !isNonEmpty(contact.label)) {
          issues.push({
            path: `contact[${index}].label`,
            message: 'Website labels cannot be empty.',
          });
        }
        break;
      case 'profile-link':
        if (typeof contact.linkId !== 'string' || !ID_PATTERN.test(contact.linkId)) {
          issues.push({
            path: `contact[${index}].linkId`,
            message: 'Profile link IDs must be stable.',
          });
        }
        break;
      default:
        issues.push({
          path: `contact[${index}].kind`,
          message: 'Unsupported Resume contact kind.',
        });
    }
  });
  if (!module.focusAreas.length) {
    issues.push({ path: 'focusAreas', message: 'At least one technical focus area is required.' });
  }
  module.focusAreas.forEach((area, index) => {
    if (!isNonEmpty(area.label) || !isNonEmpty(area.detail)) {
      issues.push({
        path: `focusAreas[${index}]`,
        message: 'Focus labels and details are required.',
      });
    }
  });
  if (!module.selectedSystems.length) {
    issues.push({ path: 'selectedSystems', message: 'At least one selected system is required.' });
  }
  module.selectedSystems.forEach((selection, index) => {
    const path = `selectedSystems[${index}]`;
    if (!ID_PATTERN.test(selection.workbenchItemId)) {
      issues.push({ path: `${path}.workbenchItemId`, message: 'Workbench IDs must be stable.' });
    }
    if (!selection.evidenceClaimIds.length && !selection.workbenchHighlightIndexes.length) {
      issues.push({
        path,
        message: 'Selected systems require at least one approved bullet source.',
      });
    }
    if (selection.evidenceClaimIds.some((id) => !ID_PATTERN.test(id))) {
      issues.push({
        path: `${path}.evidenceClaimIds`,
        message: 'Evidence claim IDs must be stable.',
      });
    }
    if (
      selection.workbenchHighlightIndexes.some(
        (highlightIndex) => !Number.isInteger(highlightIndex) || highlightIndex < 0
      )
    ) {
      issues.push({
        path: `${path}.workbenchHighlightIndexes`,
        message: 'Highlight indexes must be non-negative integers.',
      });
    }
    if (!isNonEmpty(selection.linkLabel)) {
      issues.push({
        path: `${path}.linkLabel`,
        message: 'Selected system link labels are required.',
      });
    }
  });

  const experienceIds = new Set<string>();
  module.experience.forEach((item, index) =>
    issues.push(...validateExperience(item, index, experienceIds))
  );
  if (!module.experience.length) {
    issues.push({ path: 'experience', message: 'A published Resume requires experience.' });
  }
  const educationIds = new Set<string>();
  module.education.forEach((item, index) =>
    issues.push(...validateEducation(item, index, educationIds))
  );

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
      message: 'Public Resume modules must explicitly exclude private sources.',
    });
  }
  if (!isNonEmpty(module.publication.sourcePolicy)) {
    issues.push({ path: 'publication.sourcePolicy', message: 'A source policy is required.' });
  }

  inspectForPrivateMaterial(module, '', issues);
  return issues;
}

export function definePublicResumeModule<const T extends PublicResumeModule>(module: T): T {
  const issues = validatePublicResumeModule(module);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid public Resume module:\n${summary}`);
  }
  return module;
}
