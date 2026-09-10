import { GroupNode, isGroupNode, QueryNode, QueryTree } from './types';

export interface NodeLocation {
  node: QueryNode;
  parent: GroupNode | undefined;
  index: number;
}

export const findNode = (root: QueryTree, id: string): NodeLocation | undefined => {
  if (root.id === id) return { node: root, parent: undefined, index: 0 };

  const visit = (group: GroupNode): NodeLocation | undefined => {
    for (let index = 0; index < group.children.length; index++) {
      const child = group.children[index];
      if (!child) continue;
      if (child.id === id) return { node: child, parent: group, index };
      if (isGroupNode(child)) {
        const found = visit(child);
        if (found) return found;
      }
    }
    return undefined;
  };
  return visit(root);
};

/** Ids from the root down to (and including) the node, or an empty array when the id is unknown. */
export const getNodePath = (root: QueryTree, id: string): string[] => {
  const visit = (group: GroupNode, trail: string[]): string[] | undefined => {
    if (group.id === id) return [...trail, group.id];
    for (const child of group.children) {
      if (child.id === id) return [...trail, group.id, child.id];
      if (isGroupNode(child)) {
        const found = visit(child, [...trail, group.id]);
        if (found) return found;
      }
    }
    return undefined;
  };
  return visit(root, []) ?? [];
};

export const isDescendant = (root: QueryTree, ancestorId: string, id: string): boolean => {
  const path = getNodePath(root, id);
  return path.length > 0 && path.slice(0, -1).includes(ancestorId);
};

/** Returns a new tree with the node of the given id replaced by `update(node)`. Untouched branches keep identity. */
export const updateNode = (root: QueryTree, id: string, update: (node: QueryNode) => QueryNode): QueryTree => {
  const visit = (node: QueryNode): QueryNode => {
    if (node.id === id) return update(node);
    if (!isGroupNode(node)) return node;
    const children = node.children.map(visit);
    const changed = children.some((child, index) => child !== node.children[index]);
    return changed ? { ...node, children } : node;
  };
  const next = visit(root);
  return isGroupNode(next) ? next : root;
};

export const removeNode = (root: QueryTree, id: string): QueryTree => {
  if (root.id === id) return root;
  const visit = (group: GroupNode): GroupNode => {
    const filtered = group.children.filter((child) => child.id !== id);
    const children = filtered.map((child) => isGroupNode(child) ? visit(child) : child);
    const changed = filtered.length !== group.children.length || children.some((child, index) => child !== filtered[index]);
    return changed ? { ...group, children } : group;
  };
  return visit(root);
};

export const insertChild = (root: QueryTree, groupId: string, child: QueryNode, index?: number): QueryTree =>
  updateNode(root, groupId, (node) => {
    if (!isGroupNode(node)) return node;
    const children = [...node.children];
    children.splice(index === undefined ? children.length : index, 0, child);
    return { ...node, children };
  });

/** Depth of a group counted from the root: the root is 0, its child groups are 1. */
export const getGroupDepth = (root: QueryTree, id: string): number => Math.max(0, getNodePath(root, id).length - 1);

export const getSubtreeGroupDepth = (node: QueryNode): number =>
  isGroupNode(node) ? 1 + node.children.reduce((max, child) => Math.max(max, getSubtreeGroupDepth(child)), 0) : 0;
