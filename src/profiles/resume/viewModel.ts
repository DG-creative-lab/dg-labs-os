import type { PublicProfileModules } from '../modules/contracts';
import type { ActiveProfileRuntime } from '../runtime';
import type { PublicResumeModule } from './contracts';
import { validatePublicResumeModule } from './validation';
import { validateResumeReferences } from './referenceValidation';

export type ResumeViewModel = {
  profileId: string;
  handle: string;
  projectionVersion: number;
  resumeVersion: number;
  displayName: string;
  roleTitle: string;
  location: string;
  summary: string;
  contact: readonly { label: string; url: string }[];
  focusAreas: readonly { label: string; detail: string }[];
  selectedSystems: readonly {
    id: string;
    title: string;
    classification: string;
    link: { label: string; url: string };
    bullets: readonly string[];
  }[];
  experience: readonly {
    id: string;
    title: string;
    organisation: string;
    location: string;
    startedAt: string;
    endedAt: string | null;
    bullets: readonly string[];
  }[];
  education: readonly {
    id: string;
    qualification: string;
    institution: string;
    startedAt: string;
    endedAt: string;
  }[];
  publication: PublicResumeModule['publication'];
};

export function buildResumeViewModel(
  profile: ActiveProfileRuntime,
  modules: PublicProfileModules,
  resume: PublicResumeModule
): ResumeViewModel {
  const issues = [
    ...validatePublicResumeModule(resume),
    ...validateResumeReferences(resume, profile, modules),
  ];
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Cannot build invalid Resume view:\n${summary}`);
  }

  const links = new Map(profile.links.map((link) => [link.id, link]));
  const contact = resume.contact.map((reference) => {
    if (reference.kind === 'public-email') {
      return { label: profile.contact.publicEmail, url: `mailto:${profile.contact.publicEmail}` };
    }
    if (reference.kind === 'website') {
      return { label: reference.label, url: profile.contact.website };
    }
    const link = links.get(reference.linkId);
    if (!link) throw new Error(`Unknown profile link: ${reference.linkId}`);
    return { label: link.label, url: link.url };
  });

  const workbench = new Map(modules.workbench.items.map((item) => [item.id, item]));
  const claims = new Map(
    modules.evidenceEvolution.claims.map((claim) => [claim.id, claim.statement])
  );
  const selectedSystems = resume.selectedSystems.map((selection) => {
    const item = workbench.get(selection.workbenchItemId);
    if (!item) throw new Error(`Unknown Workbench item: ${selection.workbenchItemId}`);
    const url = item.links[selection.primaryLink];
    if (!url) throw new Error(`Missing Workbench link: ${selection.primaryLink}`);
    return {
      id: item.id,
      title: item.title,
      classification: item.classification,
      link: { label: selection.linkLabel, url },
      bullets: [
        ...selection.evidenceClaimIds.map((claimId) => {
          const statement = claims.get(claimId);
          if (!statement) throw new Error(`Unknown evidence claim: ${claimId}`);
          return statement;
        }),
        ...selection.workbenchHighlightIndexes.map((index) => item.highlights[index]!),
      ],
    };
  });
  const experience = resume.experience.map((item) => ({
    id: item.id,
    title: item.title,
    organisation: item.organisation,
    location: item.location,
    startedAt: item.startedAt,
    endedAt: item.endedAt,
    bullets: [
      ...item.highlights,
      ...item.evidenceClaimIds.map((claimId) => {
        const statement = claims.get(claimId);
        if (!statement) throw new Error(`Unknown evidence claim: ${claimId}`);
        return statement;
      }),
      ...(item.boundary ? [item.boundary] : []),
    ],
  }));

  return {
    profileId: profile.profileId,
    handle: profile.handle,
    projectionVersion: profile.projectionVersion,
    resumeVersion: resume.resumeVersion,
    displayName: profile.identity.displayName,
    roleTitle: resume.roleTitle,
    location: profile.identity.location,
    summary: resume.summary,
    contact,
    focusAreas: resume.focusAreas,
    selectedSystems,
    experience,
    education: resume.education,
    publication: resume.publication,
  };
}
