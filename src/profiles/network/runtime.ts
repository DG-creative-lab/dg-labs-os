import { publicProfileRegistry, type PublicProfileRegistry } from '../runtime';
import type { PublicNetworkModule } from './contracts';
import { dessiNetworkModule } from './dessi';
import { validatePublicNetworkModule } from './validation';

export type PublicNetworkModuleRegistry = {
  list: () => readonly PublicNetworkModule[];
  find: (handle: string) => PublicNetworkModule | undefined;
  resolve: (handle: string) => PublicNetworkModule;
};

export function createPublicNetworkModuleRegistry(
  networkModules: readonly PublicNetworkModule[],
  profiles: PublicProfileRegistry = publicProfileRegistry
): PublicNetworkModuleRegistry {
  const registered = new Map<string, PublicNetworkModule>();

  for (const network of networkModules) {
    const issues = validatePublicNetworkModule(network);
    if (issues.length) {
      const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
      throw new Error(`Cannot register invalid public Network module:\n${summary}`);
    }
    if (registered.has(network.handle)) {
      throw new Error(`Duplicate public Network handle: ${network.handle}`);
    }

    const profile = profiles.find(network.handle);
    if (!profile) {
      throw new Error(`Public Network has no published profile: ${network.handle}`);
    }
    if (profile.profileId !== network.profileId) {
      throw new Error(`Public Network identity does not match profile: ${network.handle}`);
    }
    if (profile.projectionVersion !== network.projectionVersion) {
      throw new Error(
        `Public Network projection version does not match profile: ${network.handle}`
      );
    }
    registered.set(network.handle, network);
  }

  return {
    list: () => [...registered.values()],
    find: (handle) => registered.get(handle),
    resolve: (handle) => {
      const network = registered.get(handle);
      if (!network) throw new Error(`Published Network module not found: ${handle}`);
      return network;
    },
  };
}

export const publicNetworkModuleRegistry = createPublicNetworkModuleRegistry([dessiNetworkModule]);

export function findPublicNetworkModule(handle: string): PublicNetworkModule | undefined {
  return publicNetworkModuleRegistry.find(handle);
}

export function resolvePublicNetworkModule(handle: string): PublicNetworkModule {
  return publicNetworkModuleRegistry.resolve(handle);
}

export const activeNetworkModule = resolvePublicNetworkModule('dessi');
