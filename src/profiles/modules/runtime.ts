import { publicProfileRegistry, type PublicProfileRegistry } from '../runtime';
import type { PublicProfileModules } from './contracts';
import { dessiProfileModules } from './dessi';
import { validatePublicProfileModules } from './validation';

export type PublicProfileModuleRegistry = {
  list: () => readonly PublicProfileModules[];
  find: (handle: string) => PublicProfileModules | undefined;
  resolve: (handle: string) => PublicProfileModules;
};

export function createPublicProfileModuleRegistry(
  bundles: readonly PublicProfileModules[],
  profiles: PublicProfileRegistry = publicProfileRegistry
): PublicProfileModuleRegistry {
  const modules = new Map<string, PublicProfileModules>();

  for (const bundle of bundles) {
    const issues = validatePublicProfileModules(bundle);
    if (issues.length) {
      const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
      throw new Error(`Cannot register invalid public profile modules:\n${summary}`);
    }
    if (modules.has(bundle.handle)) {
      throw new Error(`Duplicate profile module handle: ${bundle.handle}`);
    }

    const profile = profiles.find(bundle.handle);
    if (!profile) {
      throw new Error(`Profile modules have no published profile: ${bundle.handle}`);
    }
    if (profile.profileId !== bundle.profileId) {
      throw new Error(`Profile module identity does not match profile: ${bundle.handle}`);
    }
    if (profile.projectionVersion !== bundle.projectionVersion) {
      throw new Error(`Profile module projection version does not match profile: ${bundle.handle}`);
    }
    modules.set(bundle.handle, bundle);
  }

  return {
    list: () => [...modules.values()],
    find: (handle) => modules.get(handle),
    resolve: (handle) => {
      const bundle = modules.get(handle);
      if (!bundle) throw new Error(`Published profile modules not found: ${handle}`);
      return bundle;
    },
  };
}

export const publicProfileModuleRegistry = createPublicProfileModuleRegistry([dessiProfileModules]);

export function findPublicProfileModules(handle: string): PublicProfileModules | undefined {
  return publicProfileModuleRegistry.find(handle);
}

export function resolvePublicProfileModules(handle: string): PublicProfileModules {
  return publicProfileModuleRegistry.resolve(handle);
}

export const activeProfileModules = resolvePublicProfileModules('dessi');
