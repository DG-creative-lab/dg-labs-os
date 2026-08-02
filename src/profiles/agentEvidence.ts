import { labNotes } from '../config/labNotes';
import { networkNodes } from '../config/network';
import { getKnowledgeEntries, type KnowledgeEntry } from '../knowledge';
import { dessiProfileModules, type PublicProfileModules } from './modules';
import { findActiveProfile, type ActiveProfileRuntime } from './runtime';

export type ProfileAgentEvidence = {
  workbench: PublicProfileModules['workbench']['items'];
  evidenceEvolution: PublicProfileModules['evidenceEvolution'];
  notes: typeof labNotes;
  network: typeof networkNodes;
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

  return [...workbenchEntries, ...claimEntries, ...evolutionEntries];
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
      notes: labNotes,
      network: networkNodes,
      brain: [...buildProfileModuleKnowledgeEntries(dessiProfileModules), ...getKnowledgeEntries()],
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
