import { dessiProfileProjection, resolvePublicProfileCv } from '../profiles';
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
const openAiCodexCv = resolvePublicProfileCv('dessi', 'openai-codex').cv;

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
  role: 'OpenAI engineering roles in London',
  location: systemsEvidenceProfile.location,
  roleUrl: 'https://openai.com/careers/search/?l=fca11f90-4dac-47b6-80e0-752cfeab792b',
  headline:
    'I build AI systems that can use tools, complete real work, and recover when something fails.',
  introduction:
    'I work out what information the system needs, which actions it may take, how each result will be checked, and when a person should step in. Then I build and test the full workflow. My experience spans open source agent products, enterprise platforms, data systems, and advertising technology.',
  targetRoles: [
    {
      label: 'Applied AI Engineer',
      url: 'https://openai.com/careers/applied-ai-engineer-london-uk/',
    },
    {
      label: 'Applied AI Engineer, Codex Core Agent',
      url: 'https://openai.com/careers/applied-ai-engineer-codex-core-agent-san-francisco/',
    },
    {
      label: 'Software Engineer, Codex Core Agents',
      url: 'https://openai.com/careers/software-engineer-codex-core-agents-san-francisco/',
    },
    {
      label: 'Solutions Engineer, Ads',
      url: 'https://openai.com/careers/solutions-engineer-ads-london-uk/',
    },
    {
      label: 'Software Engineer, Privacy Engineering',
      url: 'https://openai.com/careers/software-engineer-privacy-engineering-%28lawful-access%29-london-uk/',
    },
    {
      label: 'Protection Scientist Engineer, Integrity',
      url: 'https://openai.com/careers/protection-scientist-engineer-integrity-london-uk/',
    },
  ],
  profileHandle: 'dessi',
  cvVariantId: openAiCodexCv.id,
  applicationCv: openAiCodexCv.files,
} as const;
