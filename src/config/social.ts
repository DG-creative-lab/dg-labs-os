/**
 * Social media links configuration
 * Add your social media profiles here
 */

import type { SocialLinks } from '../types';
import { dessiProfileProjection, getRequiredProfileLink } from '../profiles';

export const social: SocialLinks = {
  github: getRequiredProfileLink(dessiProfileProjection, 'github-personal').url,
  linkedin: getRequiredProfileLink(dessiProfileProjection, 'linkedin').url,
};
