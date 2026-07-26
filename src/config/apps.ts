/**
 * Application configuration (Resume, etc.)
 */

import type { ResumeConfig } from '../types';

export const resume: ResumeConfig = {
  pdf: '/cv/Dessi_Georgieva_CV.pdf',
  docx: '/cv/Dessi_Georgieva_CV.docx',
  markdown: '/cv/Dessi_Georgieva_CV.md',
  sourcePath: '/src/data/resume/cv.md',
  targeted: {
    label: 'OpenAI Codex application CV',
    pdf: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.pdf',
    docx: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.docx',
    markdown: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.md',
  },
};
