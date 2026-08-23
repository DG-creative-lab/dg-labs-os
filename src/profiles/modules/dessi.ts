import { dessiProfileProjection } from '../dessi';
import { PROFILE_MODULES_SCHEMA_VERSION } from './contracts';
import {
  applicationCaseStudies,
  applicationClaims,
  currentBoundaries,
  evolutionEntries,
} from './dessiEvidenceEvolution';
import { workbench, workbenchCategories, workbenchCategoryDescriptions } from './dessiWorkbench';
import { definePublicProfileModules } from './validation';

export const dessiProfileModules = definePublicProfileModules({
  schemaVersion: PROFILE_MODULES_SCHEMA_VERSION,
  profileId: dessiProfileProjection.profileId,
  handle: dessiProfileProjection.handle,
  projectionVersion: dessiProfileProjection.projectionVersion,
  modulesVersion: 4,
  status: 'published',
  workbench: {
    moduleId: 'workbench',
    moduleVersion: 4,
    categories: workbenchCategories,
    categoryDescriptions: workbenchCategoryDescriptions,
    items: workbench,
  },
  evidenceEvolution: {
    moduleId: 'evidence-evolution',
    moduleVersion: 4,
    claims: applicationClaims,
    caseStudies: applicationCaseStudies,
    boundaries: currentBoundaries,
    entries: evolutionEntries,
  },
  publication: {
    approvedBy: dessiProfileProjection.publication.approvedBy,
    reviewedAt: '2026-08-23T00:00:00Z',
    publishedAt: '2026-08-23T00:00:00Z',
    privateSourcesExcluded: dessiProfileProjection.publication.privateSourcesExcluded,
    sourcePolicy: dessiProfileProjection.publication.sourcePolicy,
  },
});
