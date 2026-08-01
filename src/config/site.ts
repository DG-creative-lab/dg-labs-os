/**
 * SEO and theme configuration
 */

import type { SEOConfig, ThemeConfig } from '../types';
import { dessiProfileProjection } from '../profiles';

export const seo: SEOConfig = dessiProfileProjection.seo;

export const theme: ThemeConfig = {
  primaryColor: '#38BDF8',
  secondaryColor: '#0F172A',
  accentColor: '#F97316',
};
