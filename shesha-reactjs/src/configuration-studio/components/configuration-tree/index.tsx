/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { Dropdown, GetRef, Input, MenuProps, Spin, Tree, TreeProps } from 'antd';
import { FC, useCallback, useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import * as React from 'react';
import { MoveNodePayload } from '../../apis';
import { FOLDER_DRAFT_NODE_KEY, FolderDraft, isConfigItemTreeNode, isFolderTreeNode, isModuleTreeNode, isNodeWithChildren, isTreeNode, TreeNode, TreeNodeType } from '../../models';
import { CaretDownOutlined } from '@ant-design/icons';
import { ValidationErrors } from '@/components/validationErrors';
import { useCsTree, useCsTreeDnd } from '../../cs/hooks';
import { useConfigurationStudio } from '../../cs/contexts';
import { buildNodeContextMenu } from '../../menu-utils';
import { useStyles } from '../../styles';
import { useFilteredTreeNodes } from './filter';
import { DndPreview } from './dndPreview';
import { TreeFilterButton } from '../tree-filter-button';
import { isDefined } from '@/utils/nullables';
import { useConfigurationStudioEnvironment } from '@/configuration-studio/cs-environment/contexts';

export interface IConfigurationTreeProps {
  debugDnd?: boolean;
}
type OnSelectHandler = TreeProps<TreeNode>['onSelect'];
type IsDraggable = TreeProps<TreeNode>['draggable'];
type AllowDrop = TreeProps<TreeNode>['allowDrop'];
type OnDrop = TreeProps<TreeNode>['onDrop'];
type OnRightClick = TreeProps<TreeNode>['onRightClick'];
type MenuItems = Required<MenuProps>['items'];
type OnDragStart = TreeProps<TreeNode>['onDragStart'];
type OnDragEnd = TreeProps<TreeNode>['onDragEnd'];
type OnExpand = Required<TreeProps<TreeNode>>['onExpand'];

const isNodeDraggable: IsDraggable = (node): boolean => {
  // Also gates onDragEnter/onDragOver/onDrop, so the placeholder (filter.ts) must return true here to receive drops.
  return isConfigItemTreeNode(node) || isFolderTreeNode(node) || (isTreeNode(node) && node.nodeType === TreeNodeType.Placeholder);
};

/** Expand/collapse choices made while a type filter is active, plus the draft/pinned state last applied to them. */
type FilterExpansionState = {
  /** The filter's contents, so re-reading the same saved filter (a new array) doesn't count as a change. */
  itemTypeFilterKey: string | undefined;
  folderDraft: FolderDraft | undefined;
  pinnedNodeIds: ReadonlySet<string> | undefined;
  overrides: ReadonlyMap<React.Key, boolean>;
};
const EMPTY_FILTER_EXPANSION: FilterExpansionState = { itemTypeFilterKey: undefined, folderDraft: undefined, pinnedNodeIds: undefined, overrides: new Map() };

type DndState = {
  dragNode: TreeNode;
  dropNode: TreeNode;
  dropPosition: number;
  allowed: boolean;
};

export const ConfigurationTree: FC<IConfigurationTreeProps> = ({ debugDnd = false }) => {
  const cs = useConfigurationStudio();
  const { getDocumentDefinition } = useConfigurationStudioEnvironment();
  const { treeNodes, treeLoadingState, expandedKeys, selectedKeys, selectedNodes, onNodeExpand, quickSearch, setQuickSearch, itemTypeFilter, getTreeNodeById, folderDraft, pinnedNodeIds } = useCsTree();
  const { isDragging, setIsDragging } = useCsTreeDnd();
  // Anchor for shift+click/shift+arrow range selection: the last node clicked without shift.
  const lastClickedKeyRef = useRef<React.Key | null>(null);
  // End of the shift-selection range; also drives Tree's controlled `activeKey` (null = uncontrolled).
  const [shiftFocusKey, setShiftFocusKey] = useState<React.Key | null>(null);
  const [contextNode, setContextNode] = useState<TreeNode | null>(null);
  const { styles, prefixCls, theme } = useStyles();
  const [dndState, setDndState] = useState<DndState>();

  const filteredTreeNodes = useFilteredTreeNodes(treeNodes, quickSearch, itemTypeFilter, folderDraft, pinnedNodeIds);

  // While a type filter is active, matching items usually sit inside collapsed folders, so every
  // surviving container is shown expanded. This is display-only: expanding/collapsing under the filter
  // is tracked here rather than in the user's persisted expansion state, so clearing the filter
  // restores exactly what they had open. Changing the filter starts afresh; starting a folder draft or
  // revealing a new node only reopens the containers needed to show it, keeping the user's other choices.
  const isTypeFiltered = itemTypeFilter.length > 0;
  const [filterExpansionState, setFilterExpansionState] = useState<FilterExpansionState>(EMPTY_FILTER_EXPANSION);
  const itemTypeFilterKey = itemTypeFilter.join('\n');
  let currentFilterExpansion = filterExpansionState;
  if (filterExpansionState.itemTypeFilterKey !== itemTypeFilterKey) {
    currentFilterExpansion = { itemTypeFilterKey, folderDraft, pinnedNodeIds, overrides: EMPTY_FILTER_EXPANSION.overrides };
  } else if (filterExpansionState.folderDraft !== folderDraft || filterExpansionState.pinnedNodeIds !== pinnedNodeIds) {
    // Containers to reopen: the new draft's container, and the parents of newly pinned nodes.
    const revealFrom: (string | undefined)[] = [];
    if (isDefined(folderDraft) && folderDraft !== filterExpansionState.folderDraft)
      revealFrom.push(folderDraft.parentFolderId ?? folderDraft.moduleId);
    pinnedNodeIds.forEach((id) => {
      if (filterExpansionState.pinnedNodeIds?.has(id) !== true)
        revealFrom.push(getTreeNodeById(id)?.parentId);
    });
    const overrides = new Map(filterExpansionState.overrides);
    for (const start of revealFrom) {
      // Walk up to the module; the seen-set guards against a malformed parent chain.
      const seen = new Set<string>();
      for (let id = start; isDefined(id) && !seen.has(id); id = getTreeNodeById(id)?.parentId) {
        seen.add(id);
        overrides.delete(id);
      }
    }
    currentFilterExpansion = { itemTypeFilterKey, folderDraft, pinnedNodeIds, overrides };
  }
  // Adjusting state while rendering (React's documented pattern for deriving state from props).
  if (currentFilterExpansion !== filterExpansionState)
    setFilterExpansionState(currentFilterExpansion);
  const filterExpansion = currentFilterExpansion.overrides;

  const effectiveExpandedKeys = useMemo<React.Key[]>(() => {
    const userKeys = expandedKeys ?? [];
    if (!isTypeFiltered)
      return userKeys;

    const keys: React.Key[] = [];
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        if (isNodeWithChildren(node)) {
          if (filterExpansion.get(node.key) ?? true)
            keys.push(node.key);
          walk(node.children as TreeNode[]);
        }
      }
    };
    walk(filteredTreeNodes);
    return keys;
  }, [filteredTreeNodes, expandedKeys, isTypeFiltered, filterExpansion]);
  const effectiveExpandedKeySet = useMemo(() => new Set<React.Key>(effectiveExpandedKeys), [effectiveExpandedKeys]);

  const setNodeExpanded = useCallback((key: React.Key, expanded: boolean): void => {
    if (isTypeFiltered) {
      setFilterExpansionState({ itemTypeFilterKey, folderDraft, pinnedNodeIds, overrides: new Map(filterExpansion).set(key, expanded) });
      return;
    }
    const userKeys = expandedKeys ?? [];
    cs.onTreeNodeExpand(expanded ? [...userKeys, key] : userKeys.filter((k) => k !== key));
  }, [isTypeFiltered, expandedKeys, cs, itemTypeFilterKey, folderDraft, pinnedNodeIds, filterExpansion]);

  // antd hands back the whole displayed key set; under the filter that includes the forced keys, so
  // apply only the node that was toggled.
  const handleExpand: OnExpand = (keys, info) => {
    if (isTypeFiltered)
      setNodeExpanded(info.node.key, info.expanded);
    else
      onNodeExpand(keys, info);
  };

  // Auto-expand a collapsed folder hovered during a drag, bypassing antd Tree's own gated drag events.
  useEffect(() => {
    if (!isDragging)
      return undefined;

    let hoveredNodeId: string | null = null;
    let expandTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearPending = (): void => {
      hoveredNodeId = null;
      if (expandTimeout !== null) {
        clearTimeout(expandTimeout);
        expandTimeout = null;
      }
    };

    const handleNativeDragOver = (event: DragEvent): void => {
      const target = event.target instanceof Element ? event.target : null;
      const nodeId = target?.closest<HTMLElement>('[data-node-id]')?.dataset['nodeId'] ?? null;

      if (nodeId === hoveredNodeId)
        return;

      clearPending();
      if (nodeId === null)
        return;

      const node = getTreeNodeById(nodeId);
      if (!isDefined(node) || !isNodeWithChildren(node) || effectiveExpandedKeySet.has(node.key))
        return;

      hoveredNodeId = nodeId;
      expandTimeout = setTimeout(() => {
        expandTimeout = null;
        setNodeExpanded(node.key, true);
      }, 500);
    };

    // A null relatedTarget means the cursor left the whole page, not just moved between rows.
    const handleDocumentDragLeave = (event: DragEvent): void => {
      if (!(event.relatedTarget instanceof Element))
        clearPending();
    };
    const handleWindowBlur = (): void => {
      clearPending();
    };

    document.addEventListener('dragover', handleNativeDragOver, true);
    document.addEventListener('dragleave', handleDocumentDragLeave, true);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('dragover', handleNativeDragOver, true);
      document.removeEventListener('dragleave', handleDocumentDragLeave, true);
      window.removeEventListener('blur', handleWindowBlur);
      clearPending();
    };
  }, [isDragging, effectiveExpandedKeySet, getTreeNodeById, setNodeExpanded]);

  const flatVisibleNodes = useMemo<TreeNode[]>(() => {
    const result: TreeNode[] = [];
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        if (node.nodeType !== TreeNodeType.Placeholder && node.nodeType !== TreeNodeType.FolderDraft)
          result.push(node);
        if (isNodeWithChildren(node) && effectiveExpandedKeySet.has(node.key))
          walk(node.children as TreeNode[]);
      }
    };
    walk(filteredTreeNodes);
    return result;
  }, [filteredTreeNodes, effectiveExpandedKeySet]);

  const handleSelect: OnSelectHandler = (keys, info) => {
    const isCtrl = info.nativeEvent.ctrlKey || info.nativeEvent.metaKey;
    const isShift = info.nativeEvent.shiftKey;
    const clickedKey = info.node.key;

    if (isShift && lastClickedKeyRef.current !== null) {
      // Range selection: select all visible nodes between the anchor and the clicked node.
      const anchorIdx = flatVisibleNodes.findIndex((n) => n.key === lastClickedKeyRef.current);
      const clickedIdx = flatVisibleNodes.findIndex((n) => n.key === clickedKey);
      if (anchorIdx >= 0 && clickedIdx >= 0) {
        const [lo, hi] = anchorIdx <= clickedIdx ? [anchorIdx, clickedIdx] : [clickedIdx, anchorIdx];
        const rangeKeys = flatVisibleNodes.slice(lo, hi + 1).map((n) => n.key.toString());
        setShiftFocusKey(clickedKey);
        void cs.setMultiSelection(rangeKeys);
      }
    } else if (isCtrl) {
      // Ctrl+click: antd already toggled the item in `keys`; persist the new set.
      void cs.setMultiSelection(keys.map((k) => k.toString()));
      lastClickedKeyRef.current = clickedKey;
      setShiftFocusKey(clickedKey);
    } else {
      // Plain click: single selection + navigation.
      lastClickedKeyRef.current = clickedKey;
      setShiftFocusKey(clickedKey);
      if (keys.length > 0)
        void cs.selectTreeNode(info.node);
    }
  };

  // VS Code-style drop target: a folder/module is its own target; anything else (an item, the "Empty"
  // placeholder) drops into the container holding it. Where on the row the cursor is doesn't matter.
  const getDropContainer = (node: TreeNode): TreeNode | undefined =>
    isFolderTreeNode(node) || isModuleTreeNode(node)
      ? node
      : isDefined(node.parentId) ? getTreeNodeById(node.parentId) : undefined;

  const canDropInto = (dragNode: TreeNode, container: TreeNode | undefined): container is TreeNode => {
    if (!isDefined(container) || dragNode.moduleId !== container.moduleId || dragNode.parentId === container.id)
      return false;
    // A folder can't be moved into itself or its own subtree.
    const seen = new Set<string>();
    for (let id: string | undefined = container.id; isDefined(id) && !seen.has(id); id = getTreeNodeById(id)?.parentId) {
      if (id === dragNode.id)
        return false;
      seen.add(id);
    }
    return true;
  };

  // The container highlighted (with its visible contents) while dragging over it.
  const [dropTargetId, setDropTargetId] = useState<string>();

  const handleNodeDrop: OnDrop = (info) => {
    setDropTargetId(undefined);
    const dragNode = info.dragNode;
    const container = getDropContainer(info.node);
    if (!canDropInto(dragNode, container))
      return;

    // When the dragged node is part of a multi-selection, move all selected nodes that are
    // valid for this drop target. Otherwise fall back to moving just the dragged node.
    const dragKeyStr = dragNode.key.toString();
    const isMultiDrag = (selectedKeys ?? []).includes(dragKeyStr) && selectedNodes.length > 1;
    const nodesToMove: TreeNode[] = isMultiDrag
      ? selectedNodes.filter((n) => canDropInto(n, container))
      : [dragNode];

    const payloads: MoveNodePayload[] = nodesToMove.map((n) => ({
      nodeType: n.nodeType,
      nodeId: n.id,
      folderId: isFolderTreeNode(container) ? container.id : undefined,
    }));

    // Moves the nodes in the tree immediately, then syncs with the server (errors are reported there).
    void cs.moveTreeNodesAsync(payloads);
  };

  const handleNodeRightClick: OnRightClick = ({ event, node }) => {
    event.preventDefault();
    if (node.nodeType === TreeNodeType.Placeholder || node.nodeType === TreeNodeType.FolderDraft) {
      // preventDefault() alone doesn't stop this from bubbling to the wrapping Dropdown.
      event.stopPropagation();
      return;
    }
    setContextNode(node);
  };

  const nodeContextMenuItems = useMemo<MenuItems>(() => {
    if (!contextNode)
      return [];

    return buildNodeContextMenu({
      node: contextNode,
      configurationStudio: cs,
      getDocumentDefinition,
    });
  }, [contextNode, cs, getDocumentDefinition]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setQuickSearch(value);
  };

  const handleDragStart: OnDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd: OnDragEnd = () => {
    setIsDragging(false);
    setDropTargetId(undefined);
  };

  // Leaving the tree altogether clears the highlight (moving between rows doesn't).
  const handleTreeDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget))
      setDropTargetId(undefined);
  };

  // Intercepted in the capture phase so rc-tree's own arrow-key focus handling never runs for this event.
  const handleTreeKeyDownCapture: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const isRangeArrow = e.shiftKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp');

    if (!isRangeArrow) {
      if (e.key !== 'Shift' && shiftFocusKey !== null) setShiftFocusKey(null);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const currentKeys = selectedKeys ?? [];
    if (currentKeys.length === 0) return;

    const anchorKey = lastClickedKeyRef.current ?? currentKeys[0];
    const anchorIdx = flatVisibleNodes.findIndex((n) => n.key === anchorKey);
    if (anchorIdx < 0) return;

    const focusKey = shiftFocusKey ?? anchorKey;
    const focusIdx = flatVisibleNodes.findIndex((n) => n.key === focusKey);
    if (focusIdx < 0) return;

    const nextFocusIdx = e.key === 'ArrowDown' ? focusIdx + 1 : focusIdx - 1;
    if (nextFocusIdx < 0 || nextFocusIdx >= flatVisibleNodes.length) return;

    const nextFocusNode = flatVisibleNodes[nextFocusIdx];
    if (!nextFocusNode) return;
    setShiftFocusKey(nextFocusNode.key);

    const [lo, hi] = anchorIdx <= nextFocusIdx ? [anchorIdx, nextFocusIdx] : [nextFocusIdx, anchorIdx];
    const rangeKeys = flatVisibleNodes.slice(lo, hi + 1).map((n) => n.key.toString());
    void cs.setMultiSelection(rangeKeys);
  };

  const allowNodeDropWrapper: AllowDrop = ({ dragNode, dropNode, dropPosition }) => {
    const container = getDropContainer(dropNode);
    const allowed = canDropInto(dragNode, container);
    setDropTargetId(allowed ? container.id : undefined);
    if (debugDnd) {
      setDndState({
        dragNode: dragNode,
        dropNode: dropNode,
        dropPosition: dropPosition,
        allowed,
      });
    }
    return allowed;
  };

  // Rows to highlight while dragging: the target container and everything visible inside it. Matched by
  // data-node-id, so only rows the virtual list has actually rendered are affected.
  const dropHighlightCss = useMemo<string>(() => {
    const target = isDefined(dropTargetId) ? getTreeNodeById(dropTargetId) : undefined;
    if (!isDefined(target))
      return '';
    const ids: string[] = [];
    const visit = (node: TreeNode): void => {
      ids.push(node.id);
      if (isNodeWithChildren(node) && effectiveExpandedKeySet.has(node.key)) {
        ids.push(`${node.id}__empty-placeholder`);
        node.children.forEach(visit);
      }
    };
    visit(target);
    const selectors = ids.map((id) => `.${styles.csNavPanelTree} [data-node-id="${id.replace(/["\\]/g, '\\$&')}"]`);
    return `${selectors.join(',\n')} { background-color: ${theme.colorPrimaryBg}; }`;
  }, [dropTargetId, getTreeNodeById, effectiveExpandedKeySet, styles.csNavPanelTree, theme.colorPrimaryBg]);

  // A reload after creating/moving/renaming keeps the current tree mounted under the spinner: unmounting
  // it while the request is in flight would remount it scrolled back to the top.
  const showTree = isDefined(treeNodes) && (
    treeLoadingState.status === 'ready' || (treeLoadingState.status === 'loading' && treeNodes.length > 0)
  );

  // antd's Tree only virtualizes when given a pixel height. Without it every visible node re-renders
  // on each expand/collapse, which gets slow once a few folders are open - so size the tree to its panel.
  const treeRef = useRef<GetRef<typeof Tree>>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [treeHeight, setTreeHeight] = useState(0);
  useLayoutEffect(() => {
    const container = treeContainerRef.current;
    if (!showTree || !container)
      return undefined;
    const updateHeight = (): void => setTreeHeight(Math.floor(container.clientHeight));
    updateHeight();
    if (typeof ResizeObserver === 'undefined')
      return undefined;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);
    return () => observer.disconnect();
  }, [showTree]);

  // The virtual list draws its own scrollbar (overflow hidden), so the browser no longer auto-scrolls
  // while dragging near an edge - scroll it ourselves so items can be dragged to off-screen folders.
  useEffect(() => {
    if (!isDragging)
      return undefined;
    const EDGE_SIZE = 32;
    const SCROLL_STEP = 16;
    const handleDragOver = (event: DragEvent): void => {
      const container = treeContainerRef.current;
      const holder = container?.querySelector<HTMLElement>(`.${prefixCls}-tree-list-holder`);
      if (!container || !holder)
        return;
      const rect = container.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right)
        return;
      const delta = event.clientY < rect.top + EDGE_SIZE
        ? -SCROLL_STEP
        : event.clientY > rect.bottom - EDGE_SIZE ? SCROLL_STEP : 0;
      if (delta !== 0)
        treeRef.current?.scrollTo({ top: holder.scrollTop + delta });
    };
    document.addEventListener('dragover', handleDragOver, true);
    return () => document.removeEventListener('dragover', handleDragOver, true);
  }, [isDragging, prefixCls]);

  // Bring the inline folder editor into view; focusing it can't scroll a virtual list.
  useEffect(() => {
    if (isDefined(folderDraft))
      treeRef.current?.scrollTo({ key: FOLDER_DRAFT_NODE_KEY, align: 'auto' });
  }, [folderDraft]);

  return (
    <Spin
      spinning={treeLoadingState.status === 'loading'}
      classNames={{ root: styles.csNavPanelSpinner }}
    >
      {showTree && (
        <div className={styles.csNavPanelContent}>
          <div className={styles.csNavPanelHeader}>
            <Input.Search
              placeholder="Search"
              value={quickSearch}
              onChange={onSearchChange}
              allowClear
              size="small"
            />
            <TreeFilterButton />
          </div>
          <div ref={treeContainerRef} className={styles.csNavPanelTree} onKeyDownCapture={handleTreeKeyDownCapture} onDragLeave={handleTreeDragLeave}>
            {dropHighlightCss !== '' && <style>{dropHighlightCss}</style>}
            <Dropdown
              menu={{ items: nodeContextMenuItems }}
              trigger={["contextMenu"]}
              getPopupContainer={() => document.body}
            >
              <Tree<TreeNode>
                /* Connector lines removed - the filter button supersedes them (issue #4783). */
                showIcon
                multiple
                ref={treeRef}
                {...(treeHeight > 0 ? { height: treeHeight } : {})}
                /* antd rotates the switcher icon -90deg on collapsed nodes (without showLine), so a single
                   down caret reads as right when collapsed and down when expanded. */
                switcherIcon={<CaretDownOutlined />}

                treeData={filteredTreeNodes}
                blockNode /* required for correct dragging*/

                draggable={isNodeDraggable}
                allowDrop={allowNodeDropWrapper}
                onDrop={handleNodeDrop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onRightClick={handleNodeRightClick}
                expandedKeys={effectiveExpandedKeys}

                onSelect={handleSelect}
                selectedKeys={selectedKeys ?? []}
                onExpand={handleExpand}
                {...(shiftFocusKey !== null ? { activeKey: shiftFocusKey } : {})}
                tabIndex={0}
              />
            </Dropdown>
            {debugDnd && (
              <div>
                {dndState && (
                  <DndPreview
                    dragNode={dndState.dragNode}
                    dropNode={dndState.dropNode}
                    dropPosition={dndState.dropPosition}
                    allowed={dndState.allowed}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {treeLoadingState.status === 'failed' && (
        <ValidationErrors
          error={treeLoadingState.error}
          defaultMessage={treeLoadingState.hint}
        />
      )}
    </Spin>
  );
};
