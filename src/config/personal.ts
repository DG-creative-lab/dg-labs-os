/**
 * Personal information configuration
 * Update this file with your personal details
 */

import type { PersonalInfo } from '../types';
import { dessiProfileProjection } from '../profiles';

const { identity, contact } = dessiProfileProjection;

export const personal: PersonalInfo = {
  name: identity.displayName,
  ownerName: identity.ownerName,
  aliases: identity.aliases,
  role: identity.role,
  location: identity.location,
  email: contact.publicEmail,
  website: contact.website,
  roleFocus: identity.roleFocus,
};
