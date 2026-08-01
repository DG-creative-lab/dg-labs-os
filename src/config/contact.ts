/**
 * Contact information configuration
 * Update with your contact details
 */

import type { ContactInfo } from '../types';
import { dessiProfileProjection } from '../profiles';

export const contact: ContactInfo = {
  email: dessiProfileProjection.contact.publicEmail,
};
