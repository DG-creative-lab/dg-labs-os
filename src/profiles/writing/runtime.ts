import { publicProfileRegistry, type PublicProfileRegistry } from '../runtime';
import type { PublicWritingModule } from './contracts';
import { dessiWritingModule } from './dessi';
import { validatePublicWritingModule } from './validation';

export type PublicWritingModuleRegistry = {
  list: () => readonly PublicWritingModule[];
  find: (handle: string) => PublicWritingModule | undefined;
  resolve: (handle: string) => PublicWritingModule;
};

export function createPublicWritingModuleRegistry(
  writingModules: readonly PublicWritingModule[],
  profiles: PublicProfileRegistry = publicProfileRegistry
): PublicWritingModuleRegistry {
  const registered = new Map<string, PublicWritingModule>();

  for (const writing of writingModules) {
    const issues = validatePublicWritingModule(writing);
    if (issues.length) {
      const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
      throw new Error(`Cannot register invalid public writing module:\n${summary}`);
    }
    if (registered.has(writing.handle)) {
      throw new Error(`Duplicate public writing handle: ${writing.handle}`);
    }

    const profile = profiles.find(writing.handle);
    if (!profile) {
      throw new Error(`Public writing has no published profile: ${writing.handle}`);
    }
    if (profile.profileId !== writing.profileId) {
      throw new Error(`Public writing identity does not match profile: ${writing.handle}`);
    }
    if (profile.projectionVersion !== writing.projectionVersion) {
      throw new Error(
        `Public writing projection version does not match profile: ${writing.handle}`
      );
    }
    registered.set(writing.handle, writing);
  }

  return {
    list: () => [...registered.values()],
    find: (handle) => registered.get(handle),
    resolve: (handle) => {
      const writing = registered.get(handle);
      if (!writing) throw new Error(`Published writing module not found: ${handle}`);
      return writing;
    },
  };
}

export const publicWritingModuleRegistry = createPublicWritingModuleRegistry([dessiWritingModule]);

export function findPublicWritingModule(handle: string): PublicWritingModule | undefined {
  return publicWritingModuleRegistry.find(handle);
}

export function resolvePublicWritingModule(handle: string): PublicWritingModule {
  return publicWritingModuleRegistry.resolve(handle);
}

export const activeWritingModule = resolvePublicWritingModule('dessi');
