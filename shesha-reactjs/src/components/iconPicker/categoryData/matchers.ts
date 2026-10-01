// Finds the shared name prefix within a family (e.g. all Material Design icons start with "Md").
export const computeCommonPrefix = (names: string[]): string => {
  if (names.length === 0) return '';
  let prefix = names[0] ?? '';
  for (let i = 1; i < names.length && prefix.length > 0; i++) {
    const name = names[i] ?? '';
    let j = 0;
    while (j < prefix.length && j < name.length && prefix[j] === name[j]) j++;
    prefix = prefix.slice(0, j);
  }
  return prefix;
};

// "3dRotation" -> "3d-rotation", "AccountBalanceWallet" -> "account-balance-wallet".
const pascalToKebabCase = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const buildReverseIndex = (categories: Record<string, string[]>): Map<string, string> => {
  const index = new Map<string, string>();
  for (const category of Object.keys(categories)) {
    for (const name of categories[category] ?? []) index.set(name, category);
  }
  return index;
};

// Dynamically imported so a page that never opens the picker never pays to load this static data.
// A rejected import is evicted so a later call retries instead of replaying the same rejection.
let materialDesignIndex: Map<string, string> | undefined;
let materialDesignIndexPromise: Promise<Map<string, string>> | undefined;
export const ensureMaterialDesignIndexLoaded = (): Promise<Map<string, string>> => {
  if (!materialDesignIndexPromise) {
    materialDesignIndexPromise = import('./materialDesignCategories').then((mod) => {
      materialDesignIndex = buildReverseIndex(mod.MATERIAL_DESIGN_CATEGORIES);
      return materialDesignIndex;
    }).catch((error: unknown) => {
      materialDesignIndexPromise = undefined;
      throw error;
    });
  }
  return materialDesignIndexPromise;
};

let fontAwesome6Index: Map<string, string> | undefined;
let fontAwesome6IndexPromise: Promise<Map<string, string>> | undefined;
export const ensureFontAwesome6IndexLoaded = (): Promise<Map<string, string>> => {
  if (!fontAwesome6IndexPromise) {
    fontAwesome6IndexPromise = import('./fontAwesome6Categories').then((mod) => {
      fontAwesome6Index = buildReverseIndex(mod.FONT_AWESOME_6_CATEGORIES);
      return fontAwesome6Index;
    }).catch((error: unknown) => {
      fontAwesome6IndexPromise = undefined;
      throw error;
    });
  }
  return fontAwesome6IndexPromise;
};

// Synchronous: callers must await `ensureMaterialDesignIndexLoaded()` first; returns undefined otherwise.
export const materialDesignCategoryFor = (exportName: string, commonPrefix: string): string | undefined => {
  if (!materialDesignIndex) return undefined;
  const rest = exportName.slice(commonPrefix.length);
  const isOutline = rest.startsWith('Outline');
  const base = isOutline ? rest.slice('Outline'.length) : rest;
  const kebabName = `${isOutline ? 'outline' : 'baseline'}-${pascalToKebabCase(base)}`;
  return materialDesignIndex.get(kebabName);
};

export const fontAwesome6CategoryFor = (exportName: string, commonPrefix: string): string | undefined => {
  if (!fontAwesome6Index) return undefined;
  const rest = exportName.slice(commonPrefix.length);
  const kebabName = pascalToKebabCase(rest);
  return fontAwesome6Index.get(kebabName);
};
