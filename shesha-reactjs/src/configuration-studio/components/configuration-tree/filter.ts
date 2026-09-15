import { getTitleWithHighlight } from "@/configuration-studio/filter-utils";
import { isConfigItemTreeNode, isFolderTreeNode, isNodeWithChildren, TreeNode, TreeNodeType } from "@/configuration-studio/models";
import { renderCsTreeNode } from "@/configuration-studio/tree-utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { useMemo } from "react";

const emptyNodes: TreeNode[] = [];
const emptyItemTypes: string[] = [];

// Keeps children.length > 0 so rc-tree treats an empty folder as a real drop target instead of a leaf.
const createPlaceholderNode = (parent: TreeNode): TreeNode => ({
  id: `${parent.id}__empty-placeholder`,
  key: `${parent.id}__empty-placeholder`,
  parentId: parent.id,
  moduleId: parent.moduleId,
  name: '',
  label: '',
  title: 'Empty',
  nodeType: TreeNodeType.Placeholder,
  selectable: false,
  checkable: false,
  disabled: true,
  isLeaf: true,
  className: 'sha-cs-tree-empty-placeholder',
});

const withPlaceholderIfEmpty = (node: TreeNode, children: TreeNode[]): TreeNode[] =>
  children.length > 0 ? children : [createPlaceholderNode(node)];

export const useFilteredTreeNodes = (treeNodes: TreeNode[], quickSearch?: string, itemTypeFilter: string[] = emptyItemTypes): TreeNode[] => {
  const filteredTreeNodes = useMemo<TreeNode[]>(() => {
    if (treeNodes.length === 0)
      return emptyNodes;

    const hasQuickSearch = !isNullOrWhiteSpace(quickSearch);
    // An empty filter means "show everything" rather than "show nothing".
    const hasTypeFilter = itemTypeFilter.length > 0;
    const allowedTypes = hasTypeFilter ? new Set(itemTypeFilter) : undefined;

    const loop = (data: TreeNode[]): TreeNode[] => {
      const result: TreeNode[] = [];
      data.forEach((node) => {
        if (isConfigItemTreeNode(node)) {
          if (isDefined(allowedTypes) && !allowedTypes.has(node.itemType))
            return;

          if (!hasQuickSearch) {
            result.push(node);
            return;
          }
          const newTitle = getTitleWithHighlight(node, quickSearch);
          if (isDefined(newTitle))
            result.push({
              ...node,
              title: renderCsTreeNode(node, newTitle),
            });
          return;
        }

        if (isNodeWithChildren(node)) {
          const nodeChildren = loop(node.children);

          if (!hasQuickSearch) {
            // While a type filter is active, a folder/module that ends up with no matching
            // item is noise - drop it instead of showing an "Empty" placeholder.
            if (hasTypeFilter && nodeChildren.length === 0)
              return;

            result.push({
              ...node,
              children: withPlaceholderIfEmpty(node, nodeChildren),
            });
            return;
          }

          // Folders are first-class searchable items: surface a folder whenever its own
          // name matches the query, regardless of whether any child matched. A folder that
          // only matches by name is still hidden while a type filter narrows the tree.
          const folderTitle = isFolderTreeNode(node) && !hasTypeFilter
            ? getTitleWithHighlight(node, quickSearch)
            : undefined;

          if (nodeChildren.length > 0 || isDefined(folderTitle))
            result.push({
              ...node,
              ...(isDefined(folderTitle) ? { title: renderCsTreeNode(node, folderTitle) } : {}),
              children: withPlaceholderIfEmpty(node, nodeChildren),
            });
          return;
        }

        // Other node types (e.g. the special Home/Settings entries) aren't searchable, but must still pass through unfiltered.
        if (!hasQuickSearch && !hasTypeFilter)
          result.push(node);
      });
      return result;
    };

    return loop(treeNodes);
  }, [treeNodes, quickSearch, itemTypeFilter]);

  return filteredTreeNodes;
};
