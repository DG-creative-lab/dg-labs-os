import { contact } from './contact';
import { social } from './social';

export type PublicLinkKind = 'profile' | 'code' | 'publication' | 'platform' | 'contact';
export type LinkTrust = 'high' | 'medium' | 'low';

export type PublicLink = {
  id: string;
  label: string;
  url: string;
  kind: PublicLinkKind;
  tags: readonly string[];
  trust: LinkTrust;
  inDockLinks: boolean;
  verifyEligible: boolean;
};

export const publicLinks: readonly PublicLink[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: social.linkedin,
    kind: 'profile',
    tags: ['linkedin', 'profile', 'experience', 'education', 'identity'],
    trust: 'high',
    inDockLinks: true,
    verifyEligible: true,
  },
  {
    id: 'github-personal',
    label: 'GitHub',
    url: social.github,
    kind: 'code',
    tags: ['github', 'repositories', 'projects', 'portfolio'],
    trust: 'high',
    inDockLinks: true,
    verifyEligible: true,
  },
  {
    id: 'github-org',
    label: 'ai-knowledge-hub',
    url: 'https://github.com/ai-knowledge-hub',
    kind: 'code',
    tags: ['github', 'org', 'research', 'projects', 'ai-knowledge-hub'],
    trust: 'high',
    inDockLinks: false,
    verifyEligible: true,
  },
  {
    id: 'news-hub',
    label: 'AI News Hub',
    url: 'https://ai-news-hub.performics-labs.com/',
    kind: 'publication',
    tags: ['articles', 'writing', 'research', 'ai-news-hub'],
    trust: 'high',
    inDockLinks: false,
    verifyEligible: true,
  },
  {
    id: 'skills-hub',
    label: 'AI Skills Platform',
    url: 'https://skills.ai-knowledge-hub.org/',
    kind: 'platform',
    tags: ['skills', 'agents', 'tooling', 'platform'],
    trust: 'high',
    inDockLinks: false,
    verifyEligible: true,
  },
  {
    id: 'email',
    label: 'Email',
    url: `mailto:${contact.email}`,
    kind: 'contact',
    tags: ['email', 'contact'],
    trust: 'high',
    inDockLinks: true,
    verifyEligible: false,
  },
  {
    id: 'call',
    label: 'Call',
    url: `tel:${contact.phone}`,
    kind: 'contact',
    tags: ['call', 'phone', 'contact'],
    trust: 'high',
    inDockLinks: true,
    verifyEligible: false,
  },
];

export const dockLinks = publicLinks.filter((item) => item.inDockLinks);
export const verificationLinks = publicLinks.filter(
  (item) => item.verifyEligible && /^https?:\/\//i.test(item.url)
);
