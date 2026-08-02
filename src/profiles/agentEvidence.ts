import { getKnowledgeEntries, type KnowledgeEntry } from '../knowledge';
import { dessiProfileModules, type PublicProfileModules } from './modules';
import { dessiNetworkModule, type PublicNetworkModule } from './network';
import { findActiveProfile, type ActiveProfileRuntime } from './runtime';
import { dessiWritingModule, type PublicWritingModule } from './writing';

export type ProfileAgentEvidence = {
  workbench: PublicProfileModules['workbench']['items'];
  evidenceEvolution: PublicProfileModules['evidenceEvolution'];
  writing: PublicWritingModule['entries'];
  network: PublicNetworkModule['nodes'];
  brain: readonly KnowledgeEntry[];
  currentFocus: readonly string[];
};

const estimateTokens = (text: string): number =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).length * 0.75));

export function buildProfileModuleKnowledgeEntries(
  modules: PublicProfileModules
): readonly KnowledgeEntry[] {
  const workbenchEntries = modules.workbench.items.map((item) => {
    const content = [item.subtitle, item.summary, ...item.highlights].join(' ');
    return {
      id: `module-workbench-${item.id}`,
      type: 'project' as const,
      title: item.title,
      tags: [item.category, ...item.stack],
      confidence: item.links.repo ? ('verified' as const) : ('self-reported' as const),
      sources: Object.values(item.links).filter((value): value is string => Boolean(value)),
      lastVerified: modules.publication.reviewedAt.slice(0, 10),
      related: [],
      content,
      tokenEstimate: estimateTokens(content),
      file: 'profile-module:workbench',
    };
  });

  const claimEntries = modules.evidenceEvolution.claims.map((claim) => {
    const content = [claim.statement, claim.boundary].filter(Boolean).join(' Boundary: ');
    return {
      id: `module-claim-${claim.id}`,
      type: 'capability' as const,
      title: claim.statement,
      tags: [claim.visibility, claim.confidence],
      confidence: claim.confidence,
      sources: claim.evidence.map((link) => link.url),
      lastVerified: claim.lastVerified,
      related: [],
      content,
      tokenEstimate: estimateTokens(content),
      file: 'profile-module:evidence-evolution',
    };
  });

  const caseStudyEntries = modules.evidenceEvolution.caseStudies.map((study) => {
    const content = [
      `Contribution: ${study.contribution}`,
      `Failure surface: ${study.problem}`,
      `Intervention: ${study.intervention}`,
      `Evaluation: ${study.evaluation}`,
      `Result: ${study.result}`,
      `Limitation: ${study.limitation}`,
    ].join(' ');
    return {
      id: `module-case-study-${study.id}`,
      type: 'project' as const,
      title: study.title,
      tags: ['case study', study.classification, ...study.roleSignals],
      confidence: 'self-reported' as const,
      sources: study.evidence.map((link) => link.url),
      lastVerified: modules.publication.reviewedAt.slice(0, 10),
      related: [],
      content,
      tokenEstimate: estimateTokens(content),
      file: 'profile-module:evidence-evolution',
    };
  });

  const boundaryEntries = modules.evidenceEvolution.boundaries.map((boundary, index) => ({
    id: `module-boundary-${String(index + 1).padStart(2, '0')}`,
    type: 'meta' as const,
    title: `Current evidence boundary ${String(index + 1).padStart(2, '0')}`,
    tags: ['boundary', 'limitation', 'evidence scope'],
    confidence: 'self-reported' as const,
    sources: [],
    lastVerified: modules.publication.reviewedAt.slice(0, 10),
    related: [],
    content: boundary,
    tokenEstimate: estimateTokens(boundary),
    file: 'profile-module:evidence-evolution',
  }));

  const evolutionEntries = modules.evidenceEvolution.entries.map((entry) => {
    const supportingClaims = modules.evidenceEvolution.claims.filter((claim) =>
      entry.evidenceIds.includes(claim.id)
    );
    const content = `${entry.summary} State: ${entry.state}.`;
    return {
      id: `module-evolution-${entry.date}-${entry.kind}-${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      type: 'research' as const,
      title: entry.title,
      tags: [entry.kind, entry.state],
      confidence: entry.kind === 'question' ? ('inferred' as const) : ('self-reported' as const),
      sources: Array.from(
        new Set(supportingClaims.flatMap((claim) => claim.evidence.map((link) => link.url)))
      ),
      lastVerified: entry.date,
      related: entry.evidenceIds.map((id) => `module-claim-${id}`),
      content,
      tokenEstimate: estimateTokens(content),
      file: 'profile-module:evidence-evolution',
    };
  });

  return [
    ...workbenchEntries,
    ...claimEntries,
    ...caseStudyEntries,
    ...boundaryEntries,
    ...evolutionEntries,
  ];
}

export function buildWritingModuleKnowledgeEntries(
  writing: PublicWritingModule
): readonly KnowledgeEntry[] {
  return writing.entries.map((entry) => {
    const content = [
      entry.subtitle,
      `Published by: ${entry.authorship.byline}.`,
      `Profile contribution: ${entry.authorship.contribution}`,
      `Connected system: ${entry.relatedSystem}.`,
      `Boundary: ${entry.boundary}`,
    ].join(' ');
    return {
      id: `writing-${entry.id}`,
      type: 'research' as const,
      title: entry.title,
      tags: [entry.kind, ...entry.topics],
      confidence: entry.authorship.contributionConfidence,
      sources: entry.evidence.map((source) => source.url),
      lastVerified: entry.reviewedOn,
      related: [],
      content,
      tokenEstimate: estimateTokens(content),
      file: 'profile-module:writing',
    };
  });
}

export function buildNetworkModuleKnowledgeEntries(
  network: PublicNetworkModule
): readonly KnowledgeEntry[] {
  return network.nodes.map((node) => {
    const relationships = network.relationships.filter(
      (relationship) => relationship.from === node.id || relationship.to === node.id
    );
    const relatedNodeIds = relationships.map((relationship) =>
      relationship.from === node.id ? relationship.to : relationship.from
    );
    const content = [
      node.subtitle,
      ...node.bullets,
      `Provenance: ${node.provenance}`,
      `Evidence confidence: ${node.evidenceConfidence}.`,
      `Evidence visibility: ${node.evidenceVisibility}.`,
      `Boundary: ${node.boundary}`,
      ...relationships.map(
        (relationship) =>
          `Relationship ${relationship.relation} ${relationship.from === node.id ? relationship.to : relationship.from}: ${relationship.evidence} Confidence: ${relationship.confidence}. Evidence visibility: ${relationship.evidenceVisibility}.`
      ),
    ].join(' ');

    return {
      id: `network-${node.id}`,
      type: node.kind === 'System' ? ('project' as const) : ('research' as const),
      title: node.title,
      tags: [node.kind, node.evidence, ...node.tags],
      confidence: node.evidenceConfidence,
      sources: Object.values(node.links ?? {}).filter((value): value is string => Boolean(value)),
      lastVerified: network.publication.reviewedAt.slice(0, 10),
      related: relatedNodeIds.map((id) => `network-${id}`),
      content,
      tokenEstimate: estimateTokens(content),
      file: 'profile-module:network',
    };
  });
}

export type ProfileAgentContext = {
  profile: ActiveProfileRuntime;
  evidence: ProfileAgentEvidence;
};

/*
 * Evidence is registered explicitly per published profile. A profile that has
 * no entry here has no Profile Agent, which prevents it from inheriting
 * another person's public corpus by default.
 */
const evidenceByProfileHandle = new Map<string, ProfileAgentEvidence>([
  [
    'dessi',
    {
      workbench: dessiProfileModules.workbench.items,
      evidenceEvolution: dessiProfileModules.evidenceEvolution,
      writing: dessiWritingModule.entries,
      network: dessiNetworkModule.nodes,
      brain: [
        ...buildProfileModuleKnowledgeEntries(dessiProfileModules),
        ...buildWritingModuleKnowledgeEntries(dessiWritingModule),
        ...buildNetworkModuleKnowledgeEntries(dessiNetworkModule),
        ...getKnowledgeEntries(),
      ],
      currentFocus: dessiProfileModules.evidenceEvolution.entries
        .filter((entry) => entry.state === 'active')
        .map((entry) => entry.title),
    },
  ],
]);

export function findProfileAgentContext(handle: string): ProfileAgentContext | undefined {
  const profile = findActiveProfile(handle);
  const evidence = evidenceByProfileHandle.get(handle);
  if (!profile || !evidence) return undefined;
  return { profile, evidence };
}
