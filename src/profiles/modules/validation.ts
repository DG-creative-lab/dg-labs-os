import { validateApplicationProfile } from './applicationValidation';
import {
  PROFILE_MODULES_SCHEMA_VERSION,
  type PublicProfileModules,
  type WorkbenchItem,
} from './contracts';

export type ProfileModuleIssue = {
  path: string;
  message: string;
};

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const PRIVATE_PATH_PATTERN = /(?:^file:\/\/|^\/(?:Users|home|src|scripts)\/|^[A-Za-z]:\\Users\\)/i;
const SECRET_KEY_PATTERN =
  /(?:password|secret|private[_-]?key|access[_-]?token|refresh[_-]?token)/i;
const INTERNAL_SOURCE_KEY_PATTERN =
  /^(?:sourcePath|source_path|internalPath|internal_path|internalSource|internal_source)$/i;

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
  issues: ProfileModuleIssue[]
): void {
  if (typeof value === 'string') {
    if (PRIVATE_PATH_PATTERN.test(value)) {
      issues.push({ path, message: 'Public modules cannot contain local filesystem paths.' });
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

function validateWorkbenchItem(
  item: WorkbenchItem,
  index: number,
  categories: ReadonlySet<string>,
  ids: Set<string>
): ProfileModuleIssue[] {
  const path = `workbench.items[${index}]`;
  const issues: ProfileModuleIssue[] = [];
  if (!ID_PATTERN.test(item.id) || ids.has(item.id)) {
    issues.push({ path: `${path}.id`, message: 'Workbench item IDs must be stable and unique.' });
  }
  ids.add(item.id);
  if (!categories.has(item.category)) {
    issues.push({ path: `${path}.category`, message: 'Workbench category is not registered.' });
  }
  for (const [field, value] of Object.entries({
    classification: item.classification,
    title: item.title,
    subtitle: item.subtitle,
    summary: item.summary,
  })) {
    if (!value.trim()) issues.push({ path: `${path}.${field}`, message: `${field} is required.` });
  }
  if (!item.stack.length || item.stack.some((value) => !value.trim())) {
    issues.push({ path: `${path}.stack`, message: 'Stack entries must be non-empty.' });
  }
  if (!item.highlights.length || item.highlights.some((value) => !value.trim())) {
    issues.push({ path: `${path}.highlights`, message: 'Highlights must be non-empty.' });
  }
  for (const [kind, url] of Object.entries(item.links)) {
    if (url && !isWebUrl(url)) {
      issues.push({
        path: `${path}.links.${kind}`,
        message: 'Links must be absolute HTTP(S) URLs.',
      });
    }
  }
  return issues;
}

export function validatePublicProfileModules(bundle: PublicProfileModules): ProfileModuleIssue[] {
  const issues: ProfileModuleIssue[] = [];

  if (bundle.schemaVersion !== PROFILE_MODULES_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', message: 'Unsupported profile modules schema.' });
  }
  if (!ID_PATTERN.test(bundle.profileId)) {
    issues.push({
      path: 'profileId',
      message: 'Profile ID must be a stable lowercase identifier.',
    });
  }
  if (!HANDLE_PATTERN.test(bundle.handle)) {
    issues.push({ path: 'handle', message: 'Handle must be a URL-safe lowercase slug.' });
  }
  if (bundle.status !== 'published') {
    issues.push({ path: 'status', message: 'Only published profile modules can be registered.' });
  }
  for (const [path, version] of [
    ['projectionVersion', bundle.projectionVersion],
    ['modulesVersion', bundle.modulesVersion],
    ['workbench.moduleVersion', bundle.workbench.moduleVersion],
    ['evidenceEvolution.moduleVersion', bundle.evidenceEvolution.moduleVersion],
  ] as const) {
    if (!Number.isInteger(version) || version < 1) {
      issues.push({ path, message: 'Versions must be positive integers.' });
    }
  }
  if (bundle.workbench.moduleId !== 'workbench') {
    issues.push({ path: 'workbench.moduleId', message: 'Unexpected module identifier.' });
  }
  if (bundle.evidenceEvolution.moduleId !== 'evidence-evolution') {
    issues.push({ path: 'evidenceEvolution.moduleId', message: 'Unexpected module identifier.' });
  }

  const categorySet = new Set(bundle.workbench.categories);
  if (!categorySet.size || categorySet.size !== bundle.workbench.categories.length) {
    issues.push({
      path: 'workbench.categories',
      message: 'Categories must be non-empty and unique.',
    });
  }
  for (const category of bundle.workbench.categories) {
    if (!category.trim()) {
      issues.push({ path: 'workbench.categories', message: 'Category labels cannot be empty.' });
    }
    if (!bundle.workbench.categoryDescriptions[category]?.trim()) {
      issues.push({
        path: `workbench.categoryDescriptions.${category}`,
        message: 'Each category requires a description.',
      });
    }
  }
  const itemIds = new Set<string>();
  bundle.workbench.items.forEach((item, index) => {
    issues.push(...validateWorkbenchItem(item, index, categorySet, itemIds));
  });

  const evidenceIssues = validateApplicationProfile({
    claims: bundle.evidenceEvolution.claims,
    caseStudies: bundle.evidenceEvolution.caseStudies,
    evolution: bundle.evidenceEvolution.entries,
  });
  issues.push(
    ...evidenceIssues.map((issue) => ({
      path: `evidenceEvolution.${issue.scope}.${issue.id}`,
      message: issue.message,
    }))
  );
  if (
    !bundle.evidenceEvolution.boundaries.length ||
    bundle.evidenceEvolution.boundaries.some((boundary) => !boundary.trim())
  ) {
    issues.push({
      path: 'evidenceEvolution.boundaries',
      message: 'Evidence boundaries must be non-empty.',
    });
  }

  if (bundle.publication.approvedBy !== 'owner') {
    issues.push({
      path: 'publication.approvedBy',
      message: 'Publication requires owner approval.',
    });
  }
  if (!isIsoTimestamp(bundle.publication.reviewedAt)) {
    issues.push({
      path: 'publication.reviewedAt',
      message: 'Review time must be an ISO UTC timestamp.',
    });
  }
  if (!isIsoTimestamp(bundle.publication.publishedAt)) {
    issues.push({
      path: 'publication.publishedAt',
      message: 'Publication time must be an ISO UTC timestamp.',
    });
  }
  if (!bundle.publication.privateSourcesExcluded) {
    issues.push({
      path: 'publication.privateSourcesExcluded',
      message: 'Public modules must explicitly exclude private sources.',
    });
  }
  if (!bundle.publication.sourcePolicy.trim()) {
    issues.push({ path: 'publication.sourcePolicy', message: 'A source policy is required.' });
  }

  inspectForPrivateMaterial(bundle, '', issues);
  return issues;
}

export function definePublicProfileModules<const T extends PublicProfileModules>(bundle: T): T {
  const issues = validatePublicProfileModules(bundle);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid public profile modules:\n${summary}`);
  }
  return bundle;
}
