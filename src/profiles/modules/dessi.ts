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
  modulesVersion: 1,
  status: 'published',
  workbench: {
    moduleId: 'workbench',
    moduleVersion: 1,
    categories: workbenchCategories,
    categoryDescriptions: workbenchCategoryDescriptions,
    items: workbench,
  },
  evidenceEvolution: {
    moduleId: 'evidence-evolution',
    moduleVersion: 1,
    claims: applicationClaims,
    caseStudies: applicationCaseStudies,
    boundaries: currentBoundaries,
    entries: evolutionEntries,
  },
  publication: {
    approvedBy: dessiProfileProjection.publication.approvedBy,
    reviewedAt: dessiProfileProjection.publication.reviewedAt,
    publishedAt: dessiProfileProjection.publication.publishedAt,
    privateSourcesExcluded: dessiProfileProjection.publication.privateSourcesExcluded,
    sourcePolicy: dessiProfileProjection.publication.sourcePolicy,
  },
});
