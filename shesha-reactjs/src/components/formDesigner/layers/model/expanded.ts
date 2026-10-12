import type { ConfigurableItemIdentifier } from '@/interfaces/configurableItems';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { ILayersIndex } from './types';
import { getAncestorIds } from './visibleRows';

const EXPANDED_STORAGE_PREFIX = 'shaDesigner.toolbox.layers.expanded.';

/** `shaDesigner.toolbox.layers.expanded.<form id>`, with `module/name` (or just `name`) for forms identified by name */
export const getExpandedStorageKey = (formId: ConfigurableItemIdentifier | undefined): string | undefined => {
  if (!isDefined(formId))
    return undefined;
  if (typeof formId === 'string')
    return isNullOrWhiteSpace(formId) ? undefined : `${EXPANDED_STORAGE_PREFIX}${formId}`;
  return `${EXPANDED_STORAGE_PREFIX}${isNullOrWhiteSpace(formId.module) ? formId.name : `${formId.module}/${formId.name}`}`;
};

export const readExpanded = (storageKey: string | undefined): ReadonlySet<string> | undefined => {
  if (!isDefined(storageKey))
    return undefined;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null)
      return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed))
      return undefined;
    const ids: unknown[] = parsed;
    return new Set(ids.filter((id): id is string => typeof id === 'string'));
  } catch {
    return undefined;
  }
};

export const writeExpanded = (storageKey: string | undefined, expanded: ReadonlySet<string>): void => {
  if (!isDefined(storageKey))
    return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...expanded]));
  } catch {
    // storage can be full, blocked or unavailable; remembering expansion is only a convenience
  }
};

/** First open of a form: the top level, plus the path to the selected component */
export const getDefaultExpanded = (index: ILayersIndex, selectedId: string | undefined): ReadonlySet<string> =>
  new Set([...index.rootIds, ...getPathTo(index, selectedId)]);

export const getAllExpandable = (index: ILayersIndex): ReadonlySet<string> => {
  const ids = new Set<string>();
  index.nodes.forEach((node) => {
    if (node.childIds.length > 0)
      ids.add(node.id);
  });
  return ids;
};

/** Ancestors of a row (what must be open to see it) */
export const getPathTo = (index: ILayersIndex, id: string | undefined): ReadonlySet<string> =>
  new Set(isDefined(id) && index.nodes.has(id) ? getAncestorIds(index, id) : []);

const getExpandableSubtree = (index: ILayersIndex, id: string): string[] => {
  const result: string[] = [];
  const visited = new Set<string>();
  const stack = [id];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!isDefined(current) || visited.has(current))
      continue;
    visited.add(current);
    const node = index.nodes.get(current);
    if (!isDefined(node) || node.childIds.length === 0)
      continue;
    result.push(current);
    stack.push(...node.childIds);
  }
  return result;
};

/** Toggles one row, or (Alt+click) the row and everything under it */
export const toggleExpanded = (expanded: ReadonlySet<string>, index: ILayersIndex, id: string, withSubtree: boolean): ReadonlySet<string> => {
  const next = new Set(expanded);
  const ids = withSubtree ? getExpandableSubtree(index, id) : [id];
  if (expanded.has(id))
    ids.forEach((x) => next.delete(x));
  else
    ids.forEach((x) => next.add(x));
  return next;
};

/** Opens the path to a row; returns the same set when nothing changes, so React skips the render */
export const withPathTo = (expanded: ReadonlySet<string>, index: ILayersIndex, id: string): ReadonlySet<string> => {
  const missing = getAncestorIds(index, id).filter((x) => !expanded.has(x));
  return missing.length === 0 ? expanded : new Set([...expanded, ...missing]);
};
