import type { PublicProfileModules } from '../modules/contracts';
import type { ProfileLink } from '../contracts';
import type { PublicResumeIssue, PublicResumeModule } from './contracts';

type ResumeProfileReference = {
  profileId: string;
  handle: string;
  projectionVersion: number;
  links: readonly ProfileLink[];
};

export function validateResumeReferences(
  resume: PublicResumeModule,
  profile: ResumeProfileReference,
  modules: PublicProfileModules
): PublicResumeIssue[] {
  const issues: PublicResumeIssue[] = [];

  if (resume.profileId !== profile.profileId || resume.handle !== profile.handle) {
    issues.push({ path: 'profileId', message: 'Resume identity does not match profile.' });
  }
  if (resume.projectionVersion !== profile.projectionVersion) {
    issues.push({
      path: 'projectionVersion',
      message: 'Resume projection version does not match profile.',
    });
  }
  if (modules.profileId !== profile.profileId || modules.handle !== profile.handle) {
    issues.push({ path: 'handle', message: 'Resume evidence modules do not match profile.' });
    return issues;
  }

  const profileLinks = new Set(profile.links.map((link) => link.id));
  resume.contact.forEach((reference, index) => {
    if (reference.kind === 'profile-link' && !profileLinks.has(reference.linkId)) {
      issues.push({
        path: `contact[${index}].linkId`,
        message: `Unknown profile link: ${reference.linkId}.`,
      });
    }
  });

  const workbench = new Map(modules.workbench.items.map((item) => [item.id, item]));
  const claims = new Set(modules.evidenceEvolution.claims.map((claim) => claim.id));
  resume.selectedSystems.forEach((selection, index) => {
    const item = workbench.get(selection.workbenchItemId);
    if (!item) {
      issues.push({
        path: `selectedSystems[${index}].workbenchItemId`,
        message: `Unknown Workbench item: ${selection.workbenchItemId}.`,
      });
    } else {
      if (!item.links[selection.primaryLink]) {
        issues.push({
          path: `selectedSystems[${index}].primaryLink`,
          message: `Selected Workbench link is unavailable: ${selection.primaryLink}.`,
        });
      }
      for (const highlightIndex of selection.workbenchHighlightIndexes) {
        if (highlightIndex >= item.highlights.length) {
          issues.push({
            path: `selectedSystems[${index}].workbenchHighlightIndexes`,
            message: `Unknown Workbench highlight index: ${highlightIndex}.`,
          });
        }
      }
    }
    for (const claimId of selection.evidenceClaimIds) {
      if (!claims.has(claimId)) {
        issues.push({
          path: `selectedSystems[${index}].evidenceClaimIds`,
          message: `Unknown evidence claim: ${claimId}.`,
        });
      }
    }
  });
  resume.experience.forEach((experience, index) => {
    for (const claimId of experience.evidenceClaimIds) {
      if (!claims.has(claimId)) {
        issues.push({
          path: `experience[${index}].evidenceClaimIds`,
          message: `Unknown evidence claim: ${claimId}.`,
        });
      }
    }
  });

  return issues;
}
