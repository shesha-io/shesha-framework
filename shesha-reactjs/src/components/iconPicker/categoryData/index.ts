import { ensureFontAwesome6IndexLoaded, ensureMaterialDesignIndexLoaded, fontAwesome6CategoryFor, materialDesignCategoryFor } from './matchers';
import { heuristicCategoryFor } from './heuristicCategorizer';

export { computeCommonPrefix } from './matchers';

const UNCATEGORIZED = 'Uncategorized';

/** Dynamically loads whatever real category dataset a family needs, before any synchronous categorization for it is attempted. A no-op (resolves immediately) for families without real data. */
export const ensureCategoryDataLoaded = (familyKey: string): Promise<unknown> => {
  switch (familyKey) {
    case 'md': return ensureMaterialDesignIndexLoaded();
    case 'fa6': return ensureFontAwesome6IndexLoaded();
    default: return Promise.resolve();
  }
};

// Families without published category data fall back to the keyword heuristic.
const categoryResolverFor = (familyKey: string): ((exportName: string, commonPrefix: string) => string | undefined) => {
  switch (familyKey) {
    case 'md': return materialDesignCategoryFor;
    case 'fa6': return fontAwesome6CategoryFor;
    default: return heuristicCategoryFor;
  }
};

/** Groups a family's icon names into categories, with an "Uncategorized" bucket for anything unmatched (appended last, only if non-empty). */
export const getFamilyCategories = (familyKey: string, names: string[], commonPrefix: string): Map<string, string[]> => {
  const resolveCategory = categoryResolverFor(familyKey);
  const buckets = new Map<string, string[]>();

  for (const name of names) {
    const category = resolveCategory(name, commonPrefix) ?? UNCATEGORIZED;
    const bucket = buckets.get(category);
    if (bucket) bucket.push(name);
    else buckets.set(category, [name]);
  }

  // Keep insertion order stable except for pushing Uncategorized to the end.
  const uncategorized = buckets.get(UNCATEGORIZED);
  if (uncategorized) {
    buckets.delete(UNCATEGORIZED);
    buckets.set(UNCATEGORIZED, uncategorized);
  }

  return buckets;
};
