import type { Course, Education } from '../types';

export const education: readonly Education[] = [
  {
    degree: 'MA Applied Human Rights',
    institution: 'University of York',
    location: 'York, UK',
    year: '2009-2011',
    description:
      'Applied ethics, policy reasoning, and the institutional conditions that protect human agency.',
  },
  {
    degree: 'BA Philosophy',
    major: 'Philosophy of Science',
    institution: 'Sofia University',
    location: 'Sofia, Bulgaria',
    year: '2003-2007',
    description: 'Epistemology, philosophy of mind, scientific method, and ethics.',
  },
] as const;

export const courses: readonly Course[] = [];
