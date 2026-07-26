import type { Experience } from '../types';

export const experience: readonly Experience[] = [
  {
    title: 'Engineer',
    company: 'Performics Innovations Lab, Publicis Media',
    location: 'London, UK',
    period: 'November 2023 - Present',
    description:
      'Builds AI and data systems across agent workflows, behavioural modelling, platform controls, and production services.',
    technologies: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'AWS',
      'TypeScript',
      'React',
      'LLM systems',
      'Agent runtimes',
    ],
  },
  {
    title: 'Senior Business Intelligence Analyst',
    company: 'Publicis Media',
    location: 'London, UK',
    period: 'March 2023 - November 2023',
    description:
      'Connected marketing analytics, decision systems, and platformised intelligence workflows.',
    technologies: ['Python', 'SQL', 'Analytics engineering', 'Data products'],
  },
  {
    title: 'Business Intelligence Manager',
    company: 'Jellyfish',
    location: 'London, UK',
    period: 'January 2021 - March 2023',
    description:
      'Built enterprise analytics applications, AWS data pipelines, and decision-support systems.',
    technologies: ['Python', 'R', 'SQL', 'AWS', 'Shiny'],
  },
  {
    title: 'Data Consultant, SQL Developer, and Data Analyst',
    company: 'Selected consulting and contract roles',
    location: 'London, UK',
    period: '2017 - 2020',
    description:
      'Delivered CRM, segmentation, automation, experimentation, and analytics systems across agencies, startups, and media organisations.',
    technologies: ['SQL', 'Python', 'R', 'CRM', 'Data engineering'],
  },
] as const;
