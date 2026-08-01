/**
 * Application configuration (Resume, etc.)
 */

import type { ResumeConfig } from '../types';
import { dessiProfileProjection } from '../profiles';

const primaryCv = dessiProfileProjection.cv.primary;

export const resume: ResumeConfig = {
  pdf: primaryCv.files.pdf,
  docx: primaryCv.files.docx,
  markdown: primaryCv.files.markdown,
  sourcePath: primaryCv.sourcePath,
};
