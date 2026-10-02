import { getTitleWithHighlight } from "@/configuration-studio/filter-utils";
import { FOLDER_DRAFT_NODE_KEY, FolderDraft, isConfigItemTreeNode, isFolderTreeNode, isNodeWithChildren, TreeNode, TreeNodeType } from "@/configuration-studio/models";
import { renderCsTreeNode, renderFolderDraftIcon, renderFolderDraftNode } from "@/configuration-studio/tree-utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { useMemo } from "react";

const emptyNodes: TreeNode[] = [];
const emptyItemTypes: string[] = [];
const emptyPinnedIds: ReadonlySet<string> = new Set<string>();

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

/** Synthetic node hosting the inline folder-name editor (issue #4783). */
const createFolderDraftNode = (draft: FolderDraft): TreeNode => ({
  id: FOLDER_DRAFT_NODE_KEY,
  key: FOLDER_DRAFT_NODE_KEY,
  parentId: draft.parentFolderId,
  moduleId: draft.moduleId,
  name: draft.initialName,
  label: draft.initialName,
  title: renderFolderDraftNode(draft.initialName),
  icon: renderFolderDraftIcon(),
  nodeType: TreeNodeType.FolderDraft,
  selectable: false,
  checkable: false,
  isLeaf: true,
  className: 'sha-cs-tree-folder-draft',
});

/**
 * Insert the draft row into its container. When renaming, the draft replaces the folder being
 * renamed; when creating, it is appended to the target container's children. The container is
 * addressed by folder id, or by module id when creating at the module root.
 */
const insertFolderDraft = (nodes: TreeNode[], draft: FolderDraft): TreeNode[] => {
  const draftNode = createFolderDraftNode(draft);
  const containerId = draft.parentFolderId ?? draft.moduleId;

  const loop = (data: TreeNode[]): TreeNode[] => data.map((node) => {
    // Rename: swap the target folder for the editor row.
    if (draft.kind === 'rename' && node.id === draft.folderId)
      return draftNode;

    if (!isNodeWithChildren(node))
      return node;

    if (node.id === containerId && draft.kind === 'create') {
      // Drop the "Empty" placeholder - the draft row now occupies the folder.
      const realChildren = node.children.filter((c: TreeNode) => c.nodeType !== TreeNodeType.Placeholder);
      return { ...node, children: [...loop(realChildren), draftNode] };
    }

    return { ...node, children: loop(node.children) };
  });

  return loop(nodes);
};

/**
 * Ids that must survive the search/type filter: nodes pinned after being created or renamed, plus the
 * draft's container (and the folder being renamed) so the inline editor always has somewhere to render.
 * Their ancestors survive too, since a container with a surviving child is never dropped.
 */
const getKeptNodeIds = (pinnedNodeIds: ReadonlySet<string>, folderDraft: FolderDraft | undefined): ReadonlySet<string> => {
  if (!isDefined(folderDraft))
    return pinnedNodeIds;
  const ids = new Set(pinnedNodeIds);
  ids.add(folderDraft.parentFolderId ?? folderDraft.moduleId);
  if (folderDraft.kind === 'rename')
    ids.add(folderDraft.folderId);
  return ids;
};

export const useFilteredTreeNodes = (
  treeNodes: TreeNode[],
  quickSearch?: string,
  itemTypeFilter: string[] = emptyItemTypes,
  folderDraft?: FolderDraft | undefined,
  pinnedNodeIds: ReadonlySet<string> = emptyPinnedIds,
): TreeNode[] => {
  const keptIds = useMemo(() => getKeptNodeIds(pinnedNodeIds, folderDraft), [pinnedNodeIds, folderDraft]);

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
        const isKept = keptIds.has(node.id);

        if (isConfigItemTreeNode(node)) {
          if (isDefined(allowedTypes) && !allowedTypes.has(node.itemType) && !isKept)
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
          else if (isKept)
            result.push(node);
          return;
        }

        if (isNodeWithChildren(node)) {
          const nodeChildren = loop(node.children);

          if (!hasQuickSearch) {
            // While a type filter is active, a folder/module that ends up with no matching
            // item is noise - drop it instead of showing an "Empty" placeholder.
            if (hasTypeFilter && nodeChildren.length === 0 && !isKept)
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

          if (nodeChildren.length > 0 || isDefined(folderTitle) || isKept)
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
  }, [treeNodes, quickSearch, itemTypeFilter, keptIds]);

  // Applied after filtering so the editor row is never filtered out of its own container.
  return useMemo<TreeNode[]>(
    () => isDefined(folderDraft) ? insertFolderDraft(filteredTreeNodes, folderDraft) : filteredTreeNodes,
    [filteredTreeNodes, folderDraft],
  );
};
