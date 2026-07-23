import { Button, Dropdown, Input, MenuProps, Spin, Tooltip, Tree, TreeProps } from 'antd';
import React, { FC, useMemo, useRef, useState } from 'react';
import { MoveNodePayload } from '../../apis';
import { isConfigItemTreeNode, isFolderTreeNode, isModuleTreeNode, isNodeWithChildren, TreeNode } from '../../models';
import { CaretDownOutlined, CaretRightOutlined, RightOutlined } from '@ant-design/icons';
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
  /** Whether the tree panel is collapsed to a thin strip. */
  collapsed?: boolean;
  /** Toggles the collapsed state of the tree panel. */
  onToggleCollapsed?: () => void;
}
type OnSelectHandler = TreeProps<TreeNode>['onSelect'];
type OnClickHandler = TreeProps<TreeNode>['onClick'];
type IsDraggable = TreeProps<TreeNode>['draggable'];
type AllowDrop = TreeProps<TreeNode>['allowDrop'];
type OnDrop = TreeProps<TreeNode>['onDrop'];
type OnRightClick = TreeProps<TreeNode>['onRightClick'];
type MenuItems = Required<MenuProps>['items'];
type OnTreeKeyDown = TreeProps<TreeNode>['onKeyDown'];
type OnDragStart = TreeProps<TreeNode>['onDragStart'];
type OnDragEnd = TreeProps<TreeNode>['onDragEnd'];

const isNodeDraggable: IsDraggable = (node): boolean => {
  return isConfigItemTreeNode(node) || isFolderTreeNode(node);
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

export const ConfigurationTree: FC<IConfigurationTreeProps> = ({ debugDnd = false, collapsed = false, onToggleCollapsed }) => {
  const cs = useConfigurationStudio();
  const { getDocumentDefinition } = useConfigurationStudioEnvironment();
  const { treeNodes, loadTreeAsync, treeLoadingState, expandedKeys, selectedKeys, selectedNodes, onNodeExpand, quickSearch, setQuickSearch, getTreeNodeById } = useCsTree();
  const { setIsDragging } = useCsTreeDnd();
  // Anchor for shift+click range selection: the last node clicked without shift
  const lastClickedKeyRef = useRef<React.Key | null>(null);
  const [contextNode, setContextNode] = useState<TreeNode | null>(null);
  const { styles } = useStyles();
  const [dndState, setDndState] = useState<DndState>();

  const filteredTreeNodes = useFilteredTreeNodes(treeNodes, quickSearch);

  // Flat DFS walk of currently visible (expanded) nodes — used for shift+click range and shift+arrow.
  const flatVisibleNodes = useMemo<TreeNode[]>(() => {
    const result: TreeNode[] = [];
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        result.push(node);
        if (isNodeWithChildren(node) && expandedKeys?.includes(node.key))
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
        void cs.setMultiSelection(rangeKeys);
      }
    } else if (isCtrl) {
      // Ctrl+click: antd already toggled the item in `keys`; persist the new set.
      void cs.setMultiSelection(keys.map((k) => k.toString()));
      lastClickedKeyRef.current = clickedKey;
    } else {
      // Plain click: single selection + navigation.
      lastClickedKeyRef.current = clickedKey;
      const selectedNode = keys.length > 0 ? info.node : undefined;
      void cs.selectTreeNode(selectedNode);
    }
  };

  const handleClick: OnClickHandler = (_, node) => {
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

  const handleKeyDown: OnTreeKeyDown = (e) => {
    if (!e.shiftKey || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp'))
      return;

    e.preventDefault();

    const currentKeys = selectedKeys ?? [];
    if (currentKeys.length === 0) return;

    // Extend selection toward the arrow direction from the last selected node.
    const anchorKey = currentKeys[currentKeys.length - 1];
    const anchorIdx = flatVisibleNodes.findIndex((n) => n.key === anchorKey);
    if (anchorIdx < 0) return;

    const nextIdx = e.key === 'ArrowDown' ? anchorIdx + 1 : anchorIdx - 1;
    if (nextIdx < 0 || nextIdx >= flatVisibleNodes.length) return;

    const nextNode = flatVisibleNodes[nextIdx];
    if (!nextNode) return;
    const nextKey = nextNode.key.toString();
    const newKeys = [...new Set([...currentKeys.map(String), nextKey])];
    void cs.setMultiSelection(newKeys);
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
        <div className={`${styles.csNavPanelContent}${collapsed ? ' collapsed' : ''}`}>
          <div className={styles.csNavPanelTitle}>
            {!collapsed && <span className={styles.csNavPanelTitleText}>Explorer</span>}
            {isDefined(onToggleCollapsed) && (
              <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
                <Button
                  className={styles.csNavPanelToggle}
                  onClick={onToggleCollapsed}
                  type="text"
                  icon={<RightOutlined rotate={collapsed ? 0 : 180} />}
                />
              </Tooltip>
            )}
          </div>
          {!collapsed && (
            <div className={styles.csNavPanelHeader}>
              <Input.Search
                placeholder="Search"
                value={quickSearch}
                onChange={onSearchChange}
                allowClear
              />
            </div>
          )}
          {!collapsed && (
            <div className={styles.csNavPanelTree}>
              <Dropdown
                menu={{ items: nodeContextMenuItems }}
                trigger={["contextMenu"]}
                getPopupContainer={() => document.body}
              >
                <Tree<TreeNode>
                  showLine
                  showIcon
                  multiple
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
                  onKeyDown={handleKeyDown}
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
          )}
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
