import React, { ReactNode } from "react";
import { ConfigItemTreeNode, CustomDocument, FlatTreeNode, FolderTreeNode, isConfigItemTreeNode, isTreeNode, ITEM_TYPES, ModuleTreeNode, SpecialTreeNode, TREE_NODE_TYPES, TreeNode, TreeNodeType } from "./models";
import { FileUnknownOutlined, FolderOpenOutlined, FolderOutlined, FormOutlined, HomeOutlined, MessageOutlined, NotificationOutlined, OrderedListOutlined, ProductOutlined, SafetyOutlined, SettingOutlined, TableOutlined, TeamOutlined } from "@ant-design/icons";

import { TreeNodeProps } from "antd";
import { CsTreeNode } from "./components/tree-node";
import { isDefined } from "@/utils/nullables";

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
      return expanded === true ? <FolderOpenOutlined /> : <FolderOutlined />;
    case TreeNodeType.Module:
      return <ProductOutlined />;
    default: return undefined;
  }
};
export const getCustomIcon = (doc: CustomDocument): ReactNode => {
  // TODO: move to document definition
  switch (doc.itemId) {
    case 'home': return <HomeOutlined />;
    case 'settings': return <SettingOutlined />;
    default: return undefined;
  }
};

const applyIcon = (node: TreeNode): void => {
  node.icon = (props: TreeNodeProps): ReactNode => {
    return getIcon(
      node.nodeType,
      isConfigItemTreeNode(node) ? node.itemType : undefined,
      props.expanded,
    );
  };
};

export const renderCsTreeNode = (node: TreeNode, displayText?: ReactNode): ReactNode => {
  return <CsTreeNode node={node}>{displayText ?? node.name}</CsTreeNode>;
};

export const flatNode2TreeNode = (node: FlatTreeNode): TreeNode => {
  const baseProps: TreeNode = {
    id: node.id,
    parentId: node.parentId ?? undefined,
    key: node.id,
    name: node.name,
    label: node.label,
    nodeType: node.nodeType,
    title: (node) => isTreeNode(node) ? renderCsTreeNode(node, undefined) : undefined,
    moduleId: node.moduleId,
    description: node.description ?? undefined,
  };

  switch (node.nodeType) {
    case TREE_NODE_TYPES.Special: {
      const specialNode: SpecialTreeNode = {
        ...baseProps,
        children: [],
      };
      applyIcon(specialNode);
      return specialNode;
    }
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
      if (!isDefined(node.itemType))
        throw new Error("Missing item type in node", { cause: node });
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
        lastModifierUser: node.lastModifierUser ?? undefined,
        lastModificationTime: node.lastModificationTime ?? undefined,
        baseModule: node.baseModule ?? undefined,
        moduleName: "",
      };
      applyIcon(itemNode);
      return itemNode;
    }
  }
  throw new Error(`Unknown type of configuration tree node: '${node.id}'`);
};
