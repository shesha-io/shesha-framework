/* eslint-disable no-console */
import { Dropdown, Input, MenuProps, Spin, Tree, TreeProps } from 'antd';
import React, { FC, useMemo, useState } from 'react';
import { MoveNodePayload, ReorderNodePayload } from '../../apis';
import { isConfigItemTreeNode, isFolderTreeNode, isModuleTreeNode, isTreeNode, TreeNode } from '../../models';
import { DownOutlined } from '@ant-design/icons';
import { ValidationErrors } from '@/components';
import { useCsTree } from '../../cs/hooks';
import { useConfigurationStudio } from '../../cs/contexts';
import { buildNodeContextMenu } from '../../menu-utils';
import { useStyles } from '../../styles';
import { useFilteredTreeNodes } from './filter';

export interface IConfigurationTreeProps {
}
type OnSelectHandler = TreeProps['onSelect'];
type IsDraggable = TreeProps<TreeNode>['draggable'];
type AllowDrop = TreeProps<TreeNode>['allowDrop'];
type OnDrop = TreeProps<TreeNode>['onDrop'];
type OnRightClick = TreeProps<TreeNode>['onRightClick'];
type MenuItems = MenuProps['items'];
const DropPositions = {
    Before: -1,
    Inside: 0,
    After: 1
};
type OnTreeKeyDown = TreeProps<TreeNode>['onKeyDown'];

const isNodeDraggable: IsDraggable = (node): boolean => {
    return isConfigItemTreeNode(node) || isFolderTreeNode(node);
};

const allowDropNode = (dragNode: TreeNode, dropNode: TreeNode, dropPosition: number): boolean => {
    switch (dropPosition) {
        case DropPositions.After:
        case DropPositions.Before:
        default: {
            return dragNode.moduleId === dropNode.moduleId;
        }
        case DropPositions.Inside: return (isFolderTreeNode(dropNode) || isModuleTreeNode(dropNode)) &&
            (isFolderTreeNode(dragNode) || isConfigItemTreeNode(dragNode)) &&
            dragNode.moduleId === dropNode.moduleId;
    }
};

const allowNodeDrop: AllowDrop = (options): boolean => {
    return allowDropNode(options.dragNode, options.dropNode, options.dropPosition);
};

export const ConfigurationTree: FC<IConfigurationTreeProps> = () => {
    const cs = useConfigurationStudio();
    const { treeNodes, loadTreeAsync, treeLoadingState, expandedKeys, selectedKeys, onNodeExpand, quickSearch, setQuickSearch } = useCsTree();
    const [contextNode, setContextNode] = useState<TreeNode>(null);
    const { styles } = useStyles();

    const filteredTreeNodes = useFilteredTreeNodes(treeNodes, quickSearch);

    const handleSelect: OnSelectHandler = (_keys, info) => {
        const selectedNode = handleSelect && info.selectedNodes.length === 1
            ? info.selectedNodes[0]
            : undefined;

        const node = isTreeNode(selectedNode) ? selectedNode : undefined;
        cs.selectTreeNode(node);
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

        if (info.dropToGap) {
            const reorderPayload: ReorderNodePayload = {
                nodeType: dragNode.nodeType,
                dragNodeId: dragNode.id,
                dropNodeId: dropNode.id,
                dropPosition,
            };

            cs.reorderTreeNodeAsync(reorderPayload).then(() => {
                loadTreeAsync();
            });
        } else {
            const movePayload: MoveNodePayload = {
                nodeType: dragNode.nodeType,
                nodeId: dragNode.id,
                folderId: isFolderTreeNode(dropNode) ? dropNode.id : undefined
            };

            cs.moveTreeNodeAsync(movePayload).then(() => {
                loadTreeAsync();
            });
        }
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
            configurationStudio: cs
        });
    }, [contextNode, cs]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setQuickSearch(value);
    };

    const handleKeyDown: OnTreeKeyDown = (e) => {
        console.log('LOG: key', e.key);
    };

    return (
        <Spin
            spinning={treeLoadingState.status === 'loading'}
            wrapperClassName={styles.csNavPanelSpinner}
        >
            {treeNodes && (
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

                                //treeData={treeNodes}
                                treeData={filteredTreeNodes}
                                blockNode /*required for correct dragging*/

                                draggable={isNodeDraggable}
                                allowDrop={allowNodeDrop}
                                onDrop={handleNodeDrop}
                                onRightClick={handleNodeRightClick}
                                expandedKeys={expandedKeys}

                                onSelect={handleSelect}
                                selectedKeys={selectedKeys}
                                onExpand={onNodeExpand}
                                onKeyDown={handleKeyDown}
                                tabIndex={0}
                            />
                        </Dropdown>
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