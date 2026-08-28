/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { Dropdown, Input, MenuProps, Spin, Tree, TreeProps } from 'antd';
import { FC, useMemo, useRef, useState, useEffect } from 'react';
import * as React from 'react';
import { MoveNodePayload } from '../../apis';
import { isConfigItemTreeNode, isFolderTreeNode, isModuleTreeNode, isNodeWithChildren, isTreeNode, TreeNode, TreeNodeType } from '../../models';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { ValidationErrors } from '@/components/validationErrors';
import { useCsTree, useCsTreeDnd } from '../../cs/hooks';
import { useConfigurationStudio } from '../../cs/contexts';
import { buildNodeContextMenu } from '../../menu-utils';
import { useStyles } from '../../styles';
import { useFilteredTreeNodes } from './filter';
import { DndPreview } from './dndPreview';
import { DropPositions } from './models';
import { isDefined } from '@/utils/nullables';
import { useConfigurationStudioEnvironment } from '@/configuration-studio/cs-environment/contexts';

export interface IConfigurationTreeProps {
  debugDnd?: boolean;
}
type OnSelectHandler = TreeProps<TreeNode>['onSelect'];
type OnClickHandler = TreeProps<TreeNode>['onClick'];
type IsDraggable = TreeProps<TreeNode>['draggable'];
type AllowDrop = TreeProps<TreeNode>['allowDrop'];
type OnDrop = TreeProps<TreeNode>['onDrop'];
type OnRightClick = TreeProps<TreeNode>['onRightClick'];
type MenuItems = Required<MenuProps>['items'];
type OnDragStart = TreeProps<TreeNode>['onDragStart'];
type OnDragEnd = TreeProps<TreeNode>['onDragEnd'];

const isNodeDraggable: IsDraggable = (node): boolean => {
  // Also gates onDragEnter/onDragOver/onDrop, so the placeholder (filter.ts) must return true here to receive drops.
  return isConfigItemTreeNode(node) || isFolderTreeNode(node) || (isTreeNode(node) && node.nodeType === TreeNodeType.Placeholder);
};

const allowDropNode = (dragNode: TreeNode, dropNode: TreeNode, dropPosition: number): boolean => {
  switch (dropPosition) {
    case DropPositions.After:
    case DropPositions.Before:
    default: {
      return dragNode.moduleId === dropNode.moduleId &&
        dragNode.parentId !== dropNode.parentId;
    }
    case DropPositions.Inside: {
      // The empty-container placeholder (see filter.ts) stands in for its real parent folder/module.
      if (dropNode.nodeType === TreeNodeType.Placeholder)
        return dragNode.moduleId === dropNode.moduleId && dragNode.parentId !== dropNode.parentId;

      if (!isFolderTreeNode(dropNode) && !isModuleTreeNode(dropNode))
        return false;
      if (dragNode.moduleId !== dropNode.moduleId)
        return false;

      // allow to drop to another parent only
      return dragNode.parentId !== dropNode.id;
    }
  }
};

type DndState = {
  dragNode: TreeNode;
  dropNode: TreeNode;
  dropPosition: number;
  allowed: boolean;
};

export const ConfigurationTree: FC<IConfigurationTreeProps> = ({ debugDnd = false }) => {
  const cs = useConfigurationStudio();
  const { getDocumentDefinition } = useConfigurationStudioEnvironment();
  const { treeNodes, loadTreeAsync, treeLoadingState, expandedKeys, selectedKeys, selectedNodes, onNodeExpand, quickSearch, setQuickSearch, getTreeNodeById } = useCsTree();
  const { isDragging, setIsDragging } = useCsTreeDnd();
  // Anchor for shift+click/shift+arrow range selection: the last node clicked without shift.
  const lastClickedKeyRef = useRef<React.Key | null>(null);
  // End of the shift-selection range; also drives Tree's controlled `activeKey` (null = uncontrolled).
  const [shiftFocusKey, setShiftFocusKey] = useState<React.Key | null>(null);
  const [contextNode, setContextNode] = useState<TreeNode | null>(null);
  const { styles } = useStyles();
  const [dndState, setDndState] = useState<DndState>();

  const filteredTreeNodes = useFilteredTreeNodes(treeNodes, quickSearch);

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
      if (!isDefined(node) || !isNodeWithChildren(node) || (expandedKeys ?? []).includes(node.key))
        return;

      hoveredNodeId = nodeId;
      expandTimeout = setTimeout(() => {
        expandTimeout = null;
        cs.onTreeNodeExpand([...(expandedKeys ?? []), node.key]);
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
  }, [isDragging, expandedKeys, getTreeNodeById, cs]);

  const flatVisibleNodes = useMemo<TreeNode[]>(() => {
    const result: TreeNode[] = [];
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        if (node.nodeType !== TreeNodeType.Placeholder)
          result.push(node);
        if (isNodeWithChildren(node) && isDefined(expandedKeys) && expandedKeys.includes(node.key))
          walk(node.children as TreeNode[]);
      }
    };
    walk(filteredTreeNodes);
    return result;
  }, [filteredTreeNodes, expandedKeys]);

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

  const handleClick: OnClickHandler = (_, node) => {
    if (node.nodeType === TreeNodeType.Placeholder)
      return;
    cs.clickTreeNode(node);
  };

  const getNewFolderId = (dropPosition: number, dropNode: TreeNode): string | undefined => {
    switch (dropPosition) {
      case DropPositions.After:
      case DropPositions.Before: {
        const dropNodeParent = isDefined(dropNode.parentId)
          ? getTreeNodeById(dropNode.parentId)
          : undefined;

        return isFolderTreeNode(dropNodeParent) ? dropNodeParent.id : undefined;
      }
      default: {
        // Placeholders exist under empty folders and modules - only resolve to an id if the parent is a folder.
        if (dropNode.nodeType === TreeNodeType.Placeholder) {
          const parentNode = isDefined(dropNode.parentId)
            ? getTreeNodeById(dropNode.parentId)
            : undefined;
          return isFolderTreeNode(parentNode) ? parentNode.id : undefined;
        }
        return isFolderTreeNode(dropNode) ? dropNode.id : undefined;
      }
    }
  };

  const handleNodeDrop: OnDrop = (info) => {
    const dropNode = info.node;
    const dragNode = info.dragNode;

    const dropPos = info.node.pos.split("-");
    // calculate the drop position relative to the drop node, inside 0, top -1, bottom 1
    // note: it's not the same as info.dropPosition
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    if (!allowDropNode(dragNode, dropNode, dropPosition)) {
      console.error('dragNode can`t be dropped into the dropNode', { dragNode, dropNode, dropPosition: info.dropPosition });
      return;
    }

    const newFolderId = getNewFolderId(dropPosition, dropNode);

    // When the dragged node is part of a multi-selection, move all selected nodes that are
    // valid for this drop target. Otherwise fall back to moving just the dragged node.
    const dragKeyStr = dragNode.key.toString();
    const isMultiDrag = (selectedKeys ?? []).includes(dragKeyStr) && selectedNodes.length > 1;
    const nodesToMove: TreeNode[] = isMultiDrag
      ? selectedNodes.filter((n) => allowDropNode(n, dropNode, dropPosition))
      : [dragNode];

    const payloads: MoveNodePayload[] = nodesToMove.map((n) => ({
      nodeType: n.nodeType,
      nodeId: n.id,
      folderId: newFolderId,
    }));

    Promise.all(payloads.map((p) => cs.moveTreeNodeAsync(p))).then(() => {
      void loadTreeAsync();
    }).catch((error) => {
      console.error('Failed to move nodes', error);
      throw error;
    });
  };

  const handleNodeRightClick: OnRightClick = ({ event, node }) => {
    event.preventDefault();
    if (node.nodeType === TreeNodeType.Placeholder) {
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
    const allowed = allowDropNode(dragNode, dropNode, dropPosition);
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

  return (
    <Spin
      spinning={treeLoadingState.status === 'loading'}
      classNames={{ root: styles.csNavPanelSpinner }}
    >
      {treeLoadingState.status === 'ready' && isDefined(treeNodes) && (
        <div className={styles.csNavPanelContent}>
          <div className={styles.csNavPanelHeader}>
            <Input.Search
              placeholder="Search"
              value={quickSearch}
              onChange={onSearchChange}
              allowClear
            />
          </div>
          <div className={styles.csNavPanelTree} onKeyDownCapture={handleTreeKeyDownCapture}>
            <Dropdown
              menu={{ items: nodeContextMenuItems }}
              trigger={["contextMenu"]}
              getPopupContainer={() => document.body}
            >
              <Tree<TreeNode>
                showLine
                showIcon
                multiple
                virtual={false}
                switcherIcon={(node) => node.expanded === true ? <CaretDownOutlined /> : <CaretRightOutlined />}

                treeData={filteredTreeNodes}
                blockNode /* required for correct dragging*/

                draggable={isNodeDraggable}
                allowDrop={allowNodeDropWrapper}
                onDrop={handleNodeDrop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onRightClick={handleNodeRightClick}
                expandedKeys={expandedKeys ?? []}

                onSelect={handleSelect}
                onClick={handleClick}
                selectedKeys={selectedKeys ?? []}
                onExpand={onNodeExpand}
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
