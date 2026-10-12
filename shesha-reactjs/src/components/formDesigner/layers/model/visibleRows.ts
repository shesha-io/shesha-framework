import { isDefined } from '@/utils/nullables';
import { ILayerNode, ILayerRow, ILayersIndex } from './types';

/**
 * The rows to draw, top to bottom. Only expanded rows show their children. With `visibleIds` (a search), only
 * those rows are drawn, all expanded.
 */
export const getVisibleRows = (index: ILayersIndex, expanded: ReadonlySet<string>, visibleIds?: ReadonlySet<string>): ILayerRow[] => {
  const rows: ILayerRow[] = [];
  const isShown = (id: string): boolean => !isDefined(visibleIds) || visibleIds.has(id);

  const visit = (ids: readonly string[]): void => {
    const shown = ids.filter(isShown);
    shown.forEach((id, position) => {
      const node = index.nodes.get(id);
      if (!isDefined(node))
        return;
      const hasChildren = node.childIds.some(isShown);
      const isExpanded = hasChildren && (isDefined(visibleIds) || expanded.has(id));
      rows.push({ id, depth: node.depth, posInSet: position + 1, setSize: shown.length, hasChildren, isExpanded, isLastInGroup: position === shown.length - 1 });
      if (isExpanded)
        visit(node.childIds);
    });
  };

  visit(index.rootIds);
  return rows;
};

/** Ancestor ids, from the top level down to the node's parent */
export const getAncestorIds = (index: ILayersIndex, id: string): string[] => {
  const result: string[] = [];
  const visited = new Set<string>([id]);
  let current = index.nodes.get(id)?.parentId ?? null;
  while (current !== null && !visited.has(current)) {
    visited.add(current);
    result.unshift(current);
    current = index.nodes.get(current)?.parentId ?? null;
  }
  return result;
};

/** The node itself or the ancestor at the given depth */
export const getAncestorAtDepth = (index: ILayersIndex, id: string, depth: number): ILayerNode | undefined => {
  const visited = new Set<string>();
  let node = index.nodes.get(id);
  while (isDefined(node) && node.depth > depth && !visited.has(node.id)) {
    visited.add(node.id);
    node = node.parentId === null ? undefined : index.nodes.get(node.parentId);
  }
  return isDefined(node) && node.depth === depth ? node : undefined;
};
