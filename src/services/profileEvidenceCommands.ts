import type { ProfileAgentContext } from '../profiles/agentEvidence';
import { getKnowledgeSourceStats, retrieveKnowledge } from '../utils/terminalKnowledge';

export type ProfileEvidenceCommand =
  | 'projects'
  | 'project'
  | 'now'
  | 'network'
  | 'search'
  | 'sources'
  | 'context';

export const isProfileEvidenceCommand = (value: string): value is ProfileEvidenceCommand =>
  value === 'projects' ||
  value === 'project' ||
  value === 'now' ||
  value === 'network' ||
  value === 'search' ||
  value === 'sources' ||
  value === 'context';

export function executeProfileEvidenceCommand(
  command: ProfileEvidenceCommand,
  args: string,
  { profile, evidence }: ProfileAgentContext
): string[] {
  const knowledgeContext = {
    user: {
      name: profile.identity.displayName,
      ownerName: profile.identity.ownerName,
      aliases: profile.identity.aliases,
      role: profile.identity.role,
      roleFocus: profile.identity.roleFocus,
      location: profile.identity.location,
      website: profile.contact.website,
    },
    workbench: evidence.workbench,
    writing: evidence.writing,
    network: evidence.network,
    brain: evidence.brain,
  };

  if (command === 'projects') {
    return [
      'Workbench projects:',
      ...evidence.workbench.map((item) => `- ${item.id}: ${item.title}`),
    ];
  }

  if (command === 'project') {
    const item = evidence.workbench.find(
      (candidate) => candidate.id.trim().toLowerCase() === args.trim().toLowerCase()
    );
    if (!item) {
      return [`Project "${args}" not found. Run "projects" to list valid ids.`];
    }
    const link = item.links.site ?? item.links.repo ?? item.links.article ?? item.links.demo;
    return [
      `${item.title} (${item.id})`,
      item.subtitle,
      item.summary,
      `Stack: ${item.stack.slice(0, 6).join(', ')}`,
      ...(link ? [`Primary link: ${link}`] : []),
    ];
  }

  if (command === 'now') {
    return ['Active focus:', ...evidence.currentFocus.map((focus) => `- ${focus}`)];
  }

  if (command === 'network') {
    return [
      `System Map nodes: ${evidence.network.length}`,
      `Systems: ${evidence.network.filter((node) => node.kind === 'System').length}`,
      `Practices: ${evidence.network.filter((node) => node.kind === 'Practice').length}`,
      `Career eras: ${evidence.network.filter((node) => node.kind === 'Career').length}`,
      `Evidence surfaces: ${evidence.network.filter((node) => node.kind === 'Evidence').length}`,
      'Use "open map" to explore the guided relationships.',
    ];
  }

  if (command === 'sources') {
    const stats = getKnowledgeSourceStats(knowledgeContext);
    return [
      'Indexed sources:',
      `- personal: ${stats.personal}`,
      `- workbench: ${stats.workbench}`,
      `- writing: ${stats.writing}`,
      `- network: ${stats.network}`,
      `- brain: ${stats.brain}`,
    ];
  }

  const hits = retrieveKnowledge(args, knowledgeContext, command === 'search' ? 12 : 5);
  if (hits.length === 0) {
    return [command === 'search' ? `No results for "${args}".` : `No context hits for "${args}".`];
  }

  if (command === 'search') {
    return [
      `Results for "${args}" (${hits.length}):`,
      ...hits.map((hit) => `- [${hit.source}] ${hit.title}`),
    ];
  }

  const lines: string[] = [`Context hits for "${args}" (${hits.length}):`];
  for (const [index, hit] of hits.entries()) {
    lines.push(`${index + 1}. [${hit.source}] ${hit.title}`);
    lines.push(`   ${hit.snippet}`);
    if (hit.url) lines.push(`   source: ${hit.url}`);
  }
  return lines;
}
