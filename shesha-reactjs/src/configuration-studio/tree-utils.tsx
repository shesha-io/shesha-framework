import { ReactNode } from "react";
import { ConfigItemTreeNode, FlatTreeNode, FolderTreeNode, isConfigItemTreeNode, ITEM_TYPES, ModuleTreeNode, TREE_NODE_TYPES, TreeNode, TreeNodeType } from "./models";
import { FileUnknownOutlined, FolderOpenOutlined, FolderOutlined, FormOutlined, MessageOutlined, NotificationOutlined, OrderedListOutlined, ProductOutlined, SafetyOutlined, SettingOutlined, TableOutlined, TeamOutlined } from "@ant-design/icons";
import React from "react";
import { TreeNodeProps } from "antd";

export const getIcon = (nodeType: TreeNodeType, itemType?: string, expanded?: boolean): ReactNode => {
    switch (nodeType) {
        case TreeNodeType.ConfigurationItem: {
            switch (itemType) {
                case ITEM_TYPES.FORM: return <FormOutlined />;
                case ITEM_TYPES.ROLE: return <TeamOutlined />;
                case ITEM_TYPES.ENTITY: return <TableOutlined />;
                case ITEM_TYPES.PERMISSION: return <SafetyOutlined />;
                case ITEM_TYPES.REFLIST: return <OrderedListOutlined />;
                case ITEM_TYPES.SETTING: return <SettingOutlined />;
                case ITEM_TYPES.NOTIFICATION: return <MessageOutlined />;
                case ITEM_TYPES.NOTIFICATION_CHANNEL: return <NotificationOutlined />;
                default: return <FileUnknownOutlined />;
            }
        }
        case TreeNodeType.Folder:
            return expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
        case TreeNodeType.Module:
            return <ProductOutlined />;
        default: return undefined;
    }
};

const applyIcon = (node: TreeNode): void => {
    node.icon = (props: TreeNodeProps) => {
        return getIcon(
            node.nodeType,
            isConfigItemTreeNode(node) ? node.itemType : undefined,
            props.expanded
        );
    };
};

const renderNodeTitle = (node: TreeNode): ReactNode => {
    return node.label ?? node.name;
};

export const flatNode2TreeNode = (node: FlatTreeNode): TreeNode => {
    const baseProps: TreeNode = {
        id: node.id,
        parentId: node.parentId,
        key: node.id,
        name: node.name,
        label: node.label,
        nodeType: node.nodeType,
        title: renderNodeTitle,
        moduleId: node.moduleId,
    };

    switch (node.nodeType) {
        case TREE_NODE_TYPES.Module: {
            const moduleNode: ModuleTreeNode = {
                ...baseProps,
                children: [],
            };
            applyIcon(moduleNode);
            return moduleNode;
        }
        case TREE_NODE_TYPES.Folder: {
            const folderNode: FolderTreeNode = {
                ...baseProps,
                children: [],
            };
            applyIcon(folderNode);
            return folderNode;
        }
        case TREE_NODE_TYPES.ConfigurationItem: {
            const itemNode: ConfigItemTreeNode = {
                ...baseProps,
                itemType: node.itemType,
                flags: {
                    isCodeBased: node.isCodeBased,
                    isCodegenPending: node.isCodegenPending,
                    isUpdated: node.isUpdated,
                    isExposed: node.isExposed,
                    isUpdatedByMe: node.isUpdatedByMe,
                },
            };
            applyIcon(itemNode);
            return itemNode;
        }
    }
    throw new Error(`Unknown type of configuration tree node: '${node.id}'`);
};