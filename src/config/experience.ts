import type { Experience } from '../types';

export const experience: readonly Experience[] = [
  {
    title: 'Engineer',
    company: 'Publicis Media',
    location: 'London, UK',
    period: 'November 2023 - November 2026',
    description:
      'Architected a production agent platform with typed tools, tenant controls, human approvals, and evaluation. Built the ad-platform connectors, Databricks pipelines, and serving APIs that supported it.',
    technologies: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Amazon S3',
      'Databricks',
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
      'Turned recurring marketing reporting into reusable analytics datasets and decision-support services, with API ingestion connectors and ELT pipelines.',
    technologies: ['Python', 'SQL', 'API integration', 'ELT'],
  },
  {
    title: 'Business Intelligence Manager',
    company: 'Jellyfish',
    location: 'London, UK',
    period: 'January 2021 - March 2023',
    description:
      'Built enterprise analytics applications and decision-support systems backed by ingestion connectors, AWS data pipelines, and marketing data lakes.',
    technologies: ['Python', 'R', 'SQL', 'AWS', 'ELT', 'Shiny'],
  },
  {
    title: 'Data Consultant, SQL Developer, and Data Analyst',
    company: 'Selected consulting and contract roles',
    location: 'London, UK',
    period: '2017 - 2020',
    description:
      'Delivered CRM, segmentation, experimentation, and analytics systems across agencies, startups, and media organisations, with ingestion connectors and ELT pipelines.',
    technologies: ['SQL', 'Python', 'R', 'CRM', 'ELT'],
  },
] as const;
