import { dessiProfileProjection } from '../profiles';
import { dessiProfileModules } from '../profiles/modules';

export type {
  ApplicationCaseStudy,
  ApplicationClaim,
  EvidenceConfidence,
  EvidenceLink,
  EvidenceVisibility,
  EvolutionEntry,
} from '../profiles/modules';

export const applicationClaims = dessiProfileModules.evidenceEvolution.claims;
export const applicationCaseStudies = dessiProfileModules.evidenceEvolution.caseStudies;
export const currentBoundaries = dessiProfileModules.evidenceEvolution.boundaries;
export const evolutionEntries = dessiProfileModules.evidenceEvolution.entries;

export const systemsEvidenceProfile = {
  role: dessiProfileProjection.identity.role,
  location: dessiProfileProjection.identity.location,
  heading: dessiProfileProjection.identity.headline,
  introduction: dessiProfileProjection.identity.introduction,
  profileCv: {
    pdf: dessiProfileProjection.cv.primary.files.pdf,
    docx: dessiProfileProjection.cv.primary.files.docx,
    markdown: dessiProfileProjection.cv.primary.files.markdown,
  },
} as const;

export const openAiCodexApplication = {
  role: 'Applied AI Engineer, Codex Core Agent',
  location: systemsEvidenceProfile.location,
  roleUrl: 'https://openai.com/careers/applied-ai-engineer-codex-core-agent-san-francisco/',
  applicationCv: {
    pdf: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.pdf',
    docx: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.docx',
    markdown: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.md',
  },
} as const;
