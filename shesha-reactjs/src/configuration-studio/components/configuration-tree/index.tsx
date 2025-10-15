import { Dropdown, Input, MenuProps, Spin, Tree, TreeProps } from 'antd';
import React, { FC, useMemo, useState } from 'react';
import { MoveNodePayload } from '../../apis';
import { isConfigItemTreeNode, isFolderTreeNode, isModuleTreeNode, TreeNode } from '../../models';
import { DownOutlined } from '@ant-design/icons';
import { ValidationErrors } from '@/components';
import { useCsTree, useCsTreeDnd } from '../../cs/hooks';
import { useConfigurationStudio } from '../../cs/contexts';
import { buildNodeContextMenu } from '../../menu-utils';
import { useStyles } from '../../styles';
import { useFilteredTreeNodes } from './filter';
import { DndPreview } from './dndPreview';
import { DropPositions } from './models';
import { isDefined } from '@/utils/nullables';

export interface IConfigurationTreeProps {
  debugDnd?: boolean;
}
type OnSelectHandler = TreeProps<TreeNode>['onSelect'];
type OnClickHandler = TreeProps<TreeNode>['onClick'];
type IsDraggable = TreeProps<TreeNode>['draggable'];
type AllowDrop = TreeProps<TreeNode>['allowDrop'];
type OnDrop = TreeProps<TreeNode>['onDrop'];
type OnRightClick = TreeProps<TreeNode>['onRightClick'];
type MenuItems = MenuProps['items'];
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

export const ConfigurationTree: FC<IConfigurationTreeProps> = ({ debugDnd = false }) => {
  const cs = useConfigurationStudio();
  const { treeNodes, loadTreeAsync, treeLoadingState, expandedKeys, selectedKeys, onNodeExpand, quickSearch, setQuickSearch, getTreeNodeById } = useCsTree();
  const { setIsDragging } = useCsTreeDnd();
  const [contextNode, setContextNode] = useState<TreeNode | null>(null);
  const { styles } = useStyles();
  const [dndState, setDndState] = useState<DndState>();

  const filteredTreeNodes = useFilteredTreeNodes(treeNodes, quickSearch);

  const handleSelect: OnSelectHandler = (_keys, info) => {
    const selectedNode = handleSelect && info.selectedNodes.length === 1
      ? info.selectedNodes[0]
      : undefined;

    cs.selectTreeNode(selectedNode);
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
    return undefined;
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

    const movePayload: MoveNodePayload = {
      nodeType: dragNode.nodeType,
      nodeId: dragNode.id,
      folderId: newFolderId,
    };
    cs.moveTreeNodeAsync(movePayload).then(() => {
      loadTreeAsync();
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
    });
  }, [contextNode, cs]);

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

  const handleKeyDown: OnTreeKeyDown = (_e) => {
    // nop
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
      wrapperClassName={styles.csNavPanelSpinner}
    >
      {isDefined(treeNodes) && (
        <div className={styles.csNavPanelContent}>
          <div className={styles.csNavPanelHeader}>
            <Input.Search
              placeholder="Search"
              value={quickSearch}
              onChange={onSearchChange}
              allowClear
            />
          </div>
          <div className={styles.csNavPanelTree}>
            <Dropdown
              menu={{ items: nodeContextMenuItems }}
              trigger={["contextMenu"]}
            >
              <Tree<TreeNode>
                showLine
                showIcon
                switcherIcon={<DownOutlined />}

                treeData={filteredTreeNodes}
                blockNode /* required for correct dragging*/

                draggable={isNodeDraggable}
                allowDrop={allowNodeDropWrapper}
                onDrop={handleNodeDrop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onRightClick={handleNodeRightClick}
                expandedKeys={expandedKeys}

                onSelect={handleSelect}
                onClick={handleClick}
                selectedKeys={selectedKeys}
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
