import type { ApplicationCaseStudy, ApplicationClaim, EvolutionEntry } from './applicationProfile';

export type ApplicationValidationIssue = {
  scope: 'claim' | 'case-study' | 'evolution';
  id: string;
  message: string;
};

const isAbsoluteUrl = (value: string) => /^https:\/\//i.test(value);
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const validateApplicationProfile = ({
  claims,
  caseStudies,
  evolution,
}: {
  claims: readonly ApplicationClaim[];
  caseStudies: readonly ApplicationCaseStudy[];
  evolution: readonly EvolutionEntry[];
}): ApplicationValidationIssue[] => {
  const issues: ApplicationValidationIssue[] = [];
  const claimIds = new Set<string>();

  for (const claim of claims) {
    if (!claim.id.trim() || claimIds.has(claim.id)) {
      issues.push({ scope: 'claim', id: claim.id, message: 'Claim id must be unique.' });
    }
    claimIds.add(claim.id);
    if (!claim.statement.trim()) {
      issues.push({ scope: 'claim', id: claim.id, message: 'Claim statement is required.' });
    }
    if (!isDate(claim.lastVerified)) {
      issues.push({ scope: 'claim', id: claim.id, message: 'lastVerified must be YYYY-MM-DD.' });
    }
    if (claim.confidence === 'verified' && claim.evidence.length === 0) {
      issues.push({
        scope: 'claim',
        id: claim.id,
        message: 'Verified claims require direct evidence.',
      });
    }
    if (
      (claim.visibility === 'private-employer' || claim.confidence !== 'verified') &&
      !claim.boundary?.trim()
    ) {
      issues.push({
        scope: 'claim',
        id: claim.id,
        message: 'Private or non-verified claims require an explicit boundary.',
      });
    }
    for (const link of claim.evidence) {
      if (!link.label.trim() || !isAbsoluteUrl(link.url)) {
        issues.push({
          scope: 'claim',
          id: claim.id,
          message: 'Evidence links require labels and absolute HTTPS URLs.',
        });
      }
    }
  }

  const caseStudyIds = new Set<string>();
  for (const study of caseStudies) {
    if (!study.id.trim() || caseStudyIds.has(study.id)) {
      issues.push({
        scope: 'case-study',
        id: study.id,
        message: 'Case-study id must be unique.',
      });
    }
    caseStudyIds.add(study.id);
    for (const [field, value] of Object.entries({
      title: study.title,
      classification: study.classification,
      contribution: study.contribution,
      problem: study.problem,
      intervention: study.intervention,
      evaluation: study.evaluation,
      result: study.result,
      limitation: study.limitation,
    })) {
      if (!value.trim()) {
        issues.push({
          scope: 'case-study',
          id: study.id,
          message: `${field} is required.`,
        });
      }
    }
    if (study.evidence.length === 0) {
      issues.push({
        scope: 'case-study',
        id: study.id,
        message: 'Case studies require evidence.',
      });
    }
  }

  for (const entry of evolution) {
    if (!isDate(entry.date)) {
      issues.push({
        scope: 'evolution',
        id: entry.title,
        message: 'Evolution date must be YYYY-MM-DD.',
      });
    }
    for (const evidenceId of entry.evidenceIds) {
      if (!claimIds.has(evidenceId)) {
        issues.push({
          scope: 'evolution',
          id: entry.title,
          message: `Unknown evidence id: ${evidenceId}.`,
        });
      }
    }
  }

  return issues;
};
