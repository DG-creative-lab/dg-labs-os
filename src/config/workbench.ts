import { dessiProfileModules } from '../profiles/modules';

export type { WorkbenchCategory, WorkbenchItem } from '../profiles/modules';

export const workbenchCategories = dessiProfileModules.workbench.categories;
export const workbenchCategoryDescriptions = dessiProfileModules.workbench.categoryDescriptions;
export const workbench = dessiProfileModules.workbench.items;
