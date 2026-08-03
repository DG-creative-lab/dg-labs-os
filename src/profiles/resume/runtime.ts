import { publicProfileModuleRegistry, type PublicProfileModuleRegistry } from '../modules/runtime';
import { publicProfileRegistry, type PublicProfileRegistry } from '../runtime';
import type { PublicResumeModule } from './contracts';
import { dessiResumeModule } from './dessi';
import { validatePublicResumeModule, validateResumeReferences } from './validation';

export type PublicResumeModuleRegistry = {
  list: () => readonly PublicResumeModule[];
  find: (handle: string) => PublicResumeModule | undefined;
  resolve: (handle: string) => PublicResumeModule;
};

export function createPublicResumeModuleRegistry(
  resumes: readonly PublicResumeModule[],
  profiles: PublicProfileRegistry = publicProfileRegistry,
  moduleRegistry: PublicProfileModuleRegistry = publicProfileModuleRegistry
): PublicResumeModuleRegistry {
  const registered = new Map<string, PublicResumeModule>();

  for (const resume of resumes) {
    const issues = validatePublicResumeModule(resume);
    const profile = profiles.find(resume.handle);
    const modules = moduleRegistry.find(resume.handle);
    if (!profile) {
      issues.push({
        path: 'handle',
        message: `Resume has no published profile: ${resume.handle}.`,
      });
    }
    if (!modules) {
      issues.push({
        path: 'handle',
        message: `Resume has no published evidence modules: ${resume.handle}.`,
      });
    }
    if (profile && modules) issues.push(...validateResumeReferences(resume, profile, modules));
    if (registered.has(resume.handle)) {
      issues.push({ path: 'handle', message: `Duplicate Resume handle: ${resume.handle}.` });
    }
    if (issues.length) {
      const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
      throw new Error(`Cannot register invalid public Resume module:\n${summary}`);
    }
    registered.set(resume.handle, resume);
  }

  return {
    list: () => [...registered.values()],
    find: (handle) => registered.get(handle),
    resolve: (handle) => {
      const resume = registered.get(handle);
      if (!resume) throw new Error(`Published Resume module not found: ${handle}`);
      return resume;
    },
  };
}

export const publicResumeModuleRegistry = createPublicResumeModuleRegistry([dessiResumeModule]);

export function findPublicResumeModule(handle: string): PublicResumeModule | undefined {
  return publicResumeModuleRegistry.find(handle);
}

export function resolvePublicResumeModule(handle: string): PublicResumeModule {
  return publicResumeModuleRegistry.resolve(handle);
}

export const activeResumeModule = resolvePublicResumeModule('dessi');
