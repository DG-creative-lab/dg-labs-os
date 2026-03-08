import type { LabNote } from './labNotes';
import type { PublicLink } from './links';
import type { NetworkIdeaEdge, NetworkNode } from './network';
import type { WorkbenchItem } from './workbench';

type ValidationIssue = {
  scope: 'workbench' | 'labNotes' | 'links' | 'network';
  id: string;
  message: string;
};

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);
const isMailtoUrl = (value: string) => /^mailto:/i.test(value);

const hasNonEmptyStrings = (values: readonly string[]) =>
  values.length > 0 && values.every((value) => value.trim().length > 0);

const validateWorkbench = (items: readonly WorkbenchItem[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (!item.id.trim()) {
      issues.push({ scope: 'workbench', id: item.id || '(missing-id)', message: 'Missing id.' });
      continue;
    }
    if (ids.has(item.id)) {
      issues.push({ scope: 'workbench', id: item.id, message: 'Duplicate id.' });
    }
    ids.add(item.id);

    if (!item.title.trim()) {
      issues.push({ scope: 'workbench', id: item.id, message: 'Missing title.' });
    }
    if (!item.subtitle.trim()) {
      issues.push({ scope: 'workbench', id: item.id, message: 'Missing subtitle.' });
    }
    if (!item.summary.trim()) {
      issues.push({ scope: 'workbench', id: item.id, message: 'Missing summary.' });
    }
    if (!hasNonEmptyStrings(item.stack)) {
      issues.push({
        scope: 'workbench',
        id: item.id,
        message: 'Stack must contain non-empty entries.',
      });
    }
    if (!hasNonEmptyStrings(item.highlights)) {
      issues.push({
        scope: 'workbench',
        id: item.id,
        message: 'Highlights must contain non-empty entries.',
      });
    }

    for (const [key, value] of Object.entries(item.links)) {
      if (!value) continue;
      if (!isHttpUrl(value)) {
        issues.push({
          scope: 'workbench',
          id: item.id,
          message: `Link "${key}" must be an absolute http(s) URL.`,
        });
      }
    }
  }

  return issues;
};

const validateLabNotes = (notes: readonly LabNote[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();

  for (const note of notes) {
    if (!note.id.trim()) {
      issues.push({ scope: 'labNotes', id: note.id || '(missing-id)', message: 'Missing id.' });
      continue;
    }
    if (ids.has(note.id)) {
      issues.push({ scope: 'labNotes', id: note.id, message: 'Duplicate id.' });
    }
    ids.add(note.id);

    if (!note.title.trim()) {
      issues.push({ scope: 'labNotes', id: note.id, message: 'Missing title.' });
    }
    if (!note.subtitle.trim()) {
      issues.push({ scope: 'labNotes', id: note.id, message: 'Missing subtitle.' });
    }
    if (!note.readingTime.trim()) {
      issues.push({ scope: 'labNotes', id: note.id, message: 'Missing reading time.' });
    }
    if (!isHttpUrl(note.url)) {
      issues.push({
        scope: 'labNotes',
        id: note.id,
        message: 'URL must be an absolute http(s) URL.',
      });
    }
    if (!hasNonEmptyStrings(note.tags)) {
      issues.push({
        scope: 'labNotes',
        id: note.id,
        message: 'Tags must contain non-empty entries.',
      });
    }
  }

  return issues;
};

const validateLinks = (
  links: readonly PublicLink[],
  dockLinkIds: readonly string[],
  verificationLinkIds: readonly string[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  const dockSet = new Set(dockLinkIds);
  const verificationSet = new Set(verificationLinkIds);

  for (const link of links) {
    if (!link.id.trim()) {
      issues.push({ scope: 'links', id: link.id || '(missing-id)', message: 'Missing id.' });
      continue;
    }
    if (ids.has(link.id)) {
      issues.push({ scope: 'links', id: link.id, message: 'Duplicate id.' });
    }
    ids.add(link.id);

    if (!link.label.trim()) {
      issues.push({ scope: 'links', id: link.id, message: 'Missing label.' });
    }
    if (!hasNonEmptyStrings(link.tags)) {
      issues.push({ scope: 'links', id: link.id, message: 'Tags must contain non-empty entries.' });
    }

    const validUrl = isHttpUrl(link.url) || isMailtoUrl(link.url);
    if (!validUrl) {
      issues.push({
        scope: 'links',
        id: link.id,
        message: 'URL must be absolute http(s) or mailto.',
      });
    }

    if (link.inDockLinks !== dockSet.has(link.id)) {
      issues.push({
        scope: 'links',
        id: link.id,
        message: 'dockLinks export is out of sync with inDockLinks flags.',
      });
    }

    const shouldVerify = link.verifyEligible && isHttpUrl(link.url);
    if (shouldVerify !== verificationSet.has(link.id)) {
      issues.push({
        scope: 'links',
        id: link.id,
        message: 'verificationLinks export is out of sync with verifyEligible/http flags.',
      });
    }
  }

  return issues;
};

const validateNetwork = (
  nodes: readonly NetworkNode[],
  edges: readonly NetworkIdeaEdge[],
  networkLinks: Record<string, string>
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();

  for (const node of nodes) {
    if (!node.id.trim()) {
      issues.push({ scope: 'network', id: node.id || '(missing-id)', message: 'Missing node id.' });
      continue;
    }
    if (ids.has(node.id)) {
      issues.push({ scope: 'network', id: node.id, message: 'Duplicate node id.' });
    }
    ids.add(node.id);

    if (!node.title.trim()) {
      issues.push({ scope: 'network', id: node.id, message: 'Missing node title.' });
    }
    if (!node.subtitle.trim()) {
      issues.push({ scope: 'network', id: node.id, message: 'Missing node subtitle.' });
    }
    if (!hasNonEmptyStrings(node.tags)) {
      issues.push({
        scope: 'network',
        id: node.id,
        message: 'Node tags must contain non-empty entries.',
      });
    }
    if (!hasNonEmptyStrings(node.bullets)) {
      issues.push({
        scope: 'network',
        id: node.id,
        message: 'Node bullets must contain non-empty entries.',
      });
    }

    for (const [key, value] of Object.entries(node.links ?? {})) {
      if (!value) continue;
      if (!isHttpUrl(value)) {
        issues.push({
          scope: 'network',
          id: node.id,
          message: `Node link "${key}" must be an absolute http(s) URL.`,
        });
      }
    }
  }

  for (const edge of edges) {
    const edgeId = `${edge.from}->${edge.to}`;
    if (!ids.has(edge.from)) {
      issues.push({
        scope: 'network',
        id: edgeId,
        message: `Edge source "${edge.from}" does not exist.`,
      });
    }
    if (!ids.has(edge.to)) {
      issues.push({
        scope: 'network',
        id: edgeId,
        message: `Edge target "${edge.to}" does not exist.`,
      });
    }
    if (!edge.idea.trim()) {
      issues.push({ scope: 'network', id: edgeId, message: 'Edge idea must be non-empty.' });
    }
  }

  for (const [key, value] of Object.entries(networkLinks)) {
    if (!isHttpUrl(value)) {
      issues.push({
        scope: 'network',
        id: key,
        message: `networkLinks "${key}" must be an absolute http(s) URL.`,
      });
    }
  }

  return issues;
};

export const validateContentConfigs = ({
  workbench,
  labNotes,
  publicLinks,
  dockLinks,
  verificationLinks,
  networkNodes,
  networkIdeaEdges,
  networkLinks,
}: {
  workbench: readonly WorkbenchItem[];
  labNotes: readonly LabNote[];
  publicLinks: readonly PublicLink[];
  dockLinks: readonly PublicLink[];
  verificationLinks: readonly PublicLink[];
  networkNodes: readonly NetworkNode[];
  networkIdeaEdges: readonly NetworkIdeaEdge[];
  networkLinks: Record<string, string>;
}): ValidationIssue[] => [
  ...validateWorkbench(workbench),
  ...validateLabNotes(labNotes),
  ...validateLinks(
    publicLinks,
    dockLinks.map((link) => link.id),
    verificationLinks.map((link) => link.id)
  ),
  ...validateNetwork(networkNodes, networkIdeaEdges, networkLinks),
];

export const formatContentValidationIssues = (issues: readonly ValidationIssue[]) =>
  issues.map((issue) => `[${issue.scope}] ${issue.id}: ${issue.message}`).join('\n');

export type { ValidationIssue };
