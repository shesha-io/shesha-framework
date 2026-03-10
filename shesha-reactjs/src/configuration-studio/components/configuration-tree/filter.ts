import { getTitleWithHighlight } from "@/configuration-studio/filter-utils";
import { isConfigItemTreeNode, isNodeWithChildren, TreeNode } from "@/configuration-studio/models";
import { renderCsTreeNode } from "@/configuration-studio/tree-utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { useMemo } from "react";

const emptyNodes: TreeNode[] = [];
export const useFilteredTreeNodes = (treeNodes: TreeNode[], quickSearch?: string): TreeNode[] => {
  const filteredTreeNodes = useMemo<TreeNode[]>(() => {
    if (treeNodes.length === 0)
      return emptyNodes;
    if (isNullOrWhiteSpace(quickSearch))
      return treeNodes;

    const loop = (data: TreeNode[]): TreeNode[] => {
      const result: TreeNode[] = [];
      data.forEach((node) => {
        if (isConfigItemTreeNode(node)) {
          const newTitle = getTitleWithHighlight(node, quickSearch);
          if (isDefined(newTitle))
            result.push({
              ...node,
              title: renderCsTreeNode(node, newTitle),
            });
        }

        if (isNodeWithChildren(node)) {
          const nodeChildren = loop(node.children);
          if (nodeChildren.length > 0)
            result.push({ ...node, children: nodeChildren });
        }
      });
      return result;
    };

    const newNodes = loop(treeNodes);
    return newNodes;
  }, [treeNodes, quickSearch]);

  return filteredTreeNodes;
};
