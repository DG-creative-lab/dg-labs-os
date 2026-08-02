import {
  PUBLIC_NETWORK_SCHEMA_VERSION,
  type NetworkNode,
  type NetworkPath,
  type NetworkRelationship,
  type PublicNetworkModule,
} from './contracts';

export type PublicNetworkIssue = {
  path: string;
  message: string;
};

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const PRIVATE_PATH_PATTERNS = [
  /file:\/\/[^\s"'<>]+/i,
  /(?:^|[\s([{"'=,:;])\/(?:Users|home|src|scripts)\//i,
  /(?:^|[\s([{"'=,:;])[A-Za-z]:\\/i,
] as const;
const SECRET_KEY_PATTERN =
  /(?:password|secret|private[_-]?key|access[_-]?token|refresh[_-]?token)/i;
const INTERNAL_SOURCE_KEY_PATTERN =
  /^(?:sourcePath|source_path|internalPath|internal_path|internalSource|internal_source)$/i;
const NODE_KINDS = new Set(['Foundation', 'Career', 'Practice', 'System', 'Evidence']);
const NODE_EVIDENCE = new Set([
  'Background',
  'Professional context',
  'Public artifact',
  'Practice',
]);
const NODE_CONFIDENCE = new Set(['verified', 'self-reported', 'inferred']);
const NODE_EVIDENCE_VISIBILITY = new Set(['public', 'private-employer']);
const EVIDENCE_VISIBILITY = new Set(['public', 'private-employer', 'mixed']);
const RELATIONS = new Set([
  'informed',
  'led to',
  'built during',
  'applied in',
  'supports',
  'documented by',
  'presented by',
  'shares pattern with',
]);
const RELATIONSHIP_CONFIDENCE = new Set(['direct', 'supported', 'interpretive']);

const isNonEmpty = (value: string): boolean => value.trim().length > 0;
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
  issues: PublicNetworkIssue[]
): void {
  if (typeof value === 'string') {
    if (PRIVATE_PATH_PATTERNS.some((pattern) => pattern.test(value))) {
      issues.push({ path, message: 'Public Network data cannot contain local filesystem paths.' });
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

function validateNode(node: NetworkNode, index: number, ids: Set<string>): PublicNetworkIssue[] {
  const path = `nodes[${index}]`;
  const issues: PublicNetworkIssue[] = [];

  if (!ID_PATTERN.test(node.id) || ids.has(node.id)) {
    issues.push({ path: `${path}.id`, message: 'Network node IDs must be stable and unique.' });
  }
  ids.add(node.id);
  if (!NODE_KINDS.has(node.kind)) {
    issues.push({ path: `${path}.kind`, message: 'Unsupported Network node kind.' });
  }
  if (!NODE_EVIDENCE.has(node.evidence)) {
    issues.push({ path: `${path}.evidence`, message: 'Unsupported node evidence class.' });
  }
  if (!NODE_CONFIDENCE.has(node.evidenceConfidence)) {
    issues.push({ path: `${path}.evidenceConfidence`, message: 'Unsupported node confidence.' });
  }
  if (!NODE_EVIDENCE_VISIBILITY.has(node.evidenceVisibility)) {
    issues.push({
      path: `${path}.evidenceVisibility`,
      message: 'Unsupported evidence visibility.',
    });
  }
  for (const [field, value] of Object.entries({
    title: node.title,
    subtitle: node.subtitle,
    provenance: node.provenance,
    boundary: node.boundary,
  })) {
    if (!isNonEmpty(value)) {
      issues.push({ path: `${path}.${field}`, message: `${field} is required.` });
    }
  }
  if (!node.tags.length || node.tags.some((tag) => !isNonEmpty(tag))) {
    issues.push({ path: `${path}.tags`, message: 'Node tags must be non-empty.' });
  }
  if (!node.bullets.length || node.bullets.some((bullet) => !isNonEmpty(bullet))) {
    issues.push({ path: `${path}.bullets`, message: 'Node bullets must be non-empty.' });
  }
  if (!Number.isInteger(node.map.column) || node.map.column < 0 || node.map.column > 3) {
    issues.push({
      path: `${path}.map.column`,
      message: 'Map columns must be integers from 0 to 3.',
    });
  }
  if (!Number.isFinite(node.map.row) || node.map.row < 0) {
    issues.push({ path: `${path}.map.row`, message: 'Map rows must be non-negative numbers.' });
  }
  for (const [kind, url] of Object.entries(node.links ?? {})) {
    if (url && !isWebUrl(url)) {
      issues.push({ path: `${path}.links.${kind}`, message: 'Node links must be HTTP(S) URLs.' });
    }
  }
  return issues;
}

function validateRelationship(
  relationship: NetworkRelationship,
  index: number,
  nodeIds: ReadonlySet<string>,
  relationshipIds: Set<string>
): PublicNetworkIssue[] {
  const path = `relationships[${index}]`;
  const issues: PublicNetworkIssue[] = [];

  if (!ID_PATTERN.test(relationship.id) || relationshipIds.has(relationship.id)) {
    issues.push({
      path: `${path}.id`,
      message: 'Network relationship IDs must be stable and unique.',
    });
  }
  relationshipIds.add(relationship.id);
  if (!nodeIds.has(relationship.from)) {
    issues.push({ path: `${path}.from`, message: `Unknown source node: ${relationship.from}.` });
  }
  if (!nodeIds.has(relationship.to)) {
    issues.push({ path: `${path}.to`, message: `Unknown target node: ${relationship.to}.` });
  }
  if (relationship.from === relationship.to) {
    issues.push({ path, message: 'Self-referential Network relationships are forbidden.' });
  }
  if (!RELATIONS.has(relationship.relation)) {
    issues.push({ path: `${path}.relation`, message: 'Unsupported relationship type.' });
  }
  if (!isNonEmpty(relationship.evidence)) {
    issues.push({ path: `${path}.evidence`, message: 'Relationship provenance is required.' });
  }
  if (!RELATIONSHIP_CONFIDENCE.has(relationship.confidence)) {
    issues.push({ path: `${path}.confidence`, message: 'Unsupported relationship confidence.' });
  }
  if (!EVIDENCE_VISIBILITY.has(relationship.evidenceVisibility)) {
    issues.push({
      path: `${path}.evidenceVisibility`,
      message: 'Unsupported relationship evidence visibility.',
    });
  }
  return issues;
}

function validatePath(
  path: NetworkPath,
  index: number,
  pathIds: Set<string>,
  nodeIds: ReadonlySet<string>,
  relationships: ReadonlyMap<string, NetworkRelationship>
): PublicNetworkIssue[] {
  const base = `paths[${index}]`;
  const issues: PublicNetworkIssue[] = [];

  if (!ID_PATTERN.test(path.id) || pathIds.has(path.id)) {
    issues.push({ path: `${base}.id`, message: 'Network path IDs must be stable and unique.' });
  }
  pathIds.add(path.id);
  if (!isNonEmpty(path.question) || !isNonEmpty(path.answer)) {
    issues.push({ path: base, message: 'Guided paths require a question and answer.' });
  }
  if (!path.nodeIds.length || new Set(path.nodeIds).size !== path.nodeIds.length) {
    issues.push({
      path: `${base}.nodeIds`,
      message: 'Path node IDs must be non-empty and unique.',
    });
  }
  for (const nodeId of path.nodeIds) {
    if (!nodeIds.has(nodeId)) {
      issues.push({ path: `${base}.nodeIds`, message: `Unknown path node: ${nodeId}.` });
    }
  }
  if (
    !path.relationshipIds.length ||
    new Set(path.relationshipIds).size !== path.relationshipIds.length
  ) {
    issues.push({
      path: `${base}.relationshipIds`,
      message: 'Path relationship IDs must be non-empty and unique.',
    });
  }
  for (const relationshipId of path.relationshipIds) {
    const relationship = relationships.get(relationshipId);
    if (!relationship) {
      issues.push({
        path: `${base}.relationshipIds`,
        message: `Unknown path relationship: ${relationshipId}.`,
      });
      continue;
    }
    if (!path.nodeIds.includes(relationship.from) || !path.nodeIds.includes(relationship.to)) {
      issues.push({
        path: `${base}.relationshipIds`,
        message: `Path relationship endpoints must appear in nodeIds: ${relationshipId}.`,
      });
    }
  }
  return issues;
}

export function validatePublicNetworkModule(module: PublicNetworkModule): PublicNetworkIssue[] {
  const issues: PublicNetworkIssue[] = [];

  if (module.schemaVersion !== PUBLIC_NETWORK_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', message: 'Unsupported public Network schema.' });
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
    issues.push({ path: 'status', message: 'Only published Network modules can be registered.' });
  }
  for (const [path, version] of [
    ['projectionVersion', module.projectionVersion],
    ['networkVersion', module.networkVersion],
  ] as const) {
    if (!Number.isInteger(version) || version < 1) {
      issues.push({ path, message: 'Versions must be positive integers.' });
    }
  }
  if (!isNonEmpty(module.title) || !isNonEmpty(module.description)) {
    issues.push({ path: 'title', message: 'Network title and description are required.' });
  }
  if (!module.nodes.length) {
    issues.push({ path: 'nodes', message: 'A published Network cannot be empty.' });
  }

  const nodeIds = new Set<string>();
  module.nodes.forEach((node, index) => issues.push(...validateNode(node, index, nodeIds)));
  const relationshipIds = new Set<string>();
  module.relationships.forEach((relationship, index) =>
    issues.push(...validateRelationship(relationship, index, nodeIds, relationshipIds))
  );
  const relationships = new Map(module.relationships.map((item) => [item.id, item]));
  const pathIds = new Set<string>();
  module.paths.forEach((path, index) =>
    issues.push(...validatePath(path, index, pathIds, nodeIds, relationships))
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
      message: 'Public Network modules must explicitly exclude private sources.',
    });
  }
  if (!isNonEmpty(module.publication.sourcePolicy)) {
    issues.push({ path: 'publication.sourcePolicy', message: 'A source policy is required.' });
  }

  inspectForPrivateMaterial(module, '', issues);
  return issues;
}

export function definePublicNetworkModule<const T extends PublicNetworkModule>(module: T): T {
  const issues = validatePublicNetworkModule(module);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid public Network module:\n${summary}`);
  }
  return module;
}
