import { labNotes } from '../config/labNotes';
import { networkNodes } from '../config/network';
import { workbench } from '../config/workbench';
import { getKnowledgeEntries, type KnowledgeEntry } from '../knowledge';
import { findActiveProfile, type ActiveProfileRuntime } from './runtime';

export type ProfileAgentEvidence = {
  workbench: typeof workbench;
  notes: typeof labNotes;
  network: typeof networkNodes;
  brain: readonly KnowledgeEntry[];
};

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
      workbench,
      notes: labNotes,
      network: networkNodes,
      brain: getKnowledgeEntries(),
    },
  ],
]);

export function findProfileAgentContext(handle: string): ProfileAgentContext | undefined {
  const profile = findActiveProfile(handle);
  const evidence = evidenceByProfileHandle.get(handle);
  if (!profile || !evidence) return undefined;
  return { profile, evidence };
}
