import type { Project } from '../types';

// The active public project catalogue lives in workbench.ts. This legacy shape is
// retained only for compatibility with UserConfig until the old template API is removed.
export const projects: readonly Project[] = [];
