import { ReactNode } from "react";
import { ConfigItemTreeNode, CustomDocument, FlatTreeNode, FolderTreeNode, FrontEndAppDto, isConfigItemTreeNode, isTreeNode, ModuleTreeNode, SpecialTreeNode, TREE_NODE_TYPES, TreeNode, TreeNodeType } from "./models";
import { FileUnknownOutlined, FolderOpenOutlined, FolderOutlined, HomeOutlined, ProductOutlined, SettingOutlined } from "@ant-design/icons";

import { TreeNodeProps } from "antd";
import { CsTreeNode } from "./components/tree-node";
import { isDefined } from "@/utils/nullables";
import { IConfigurationStudioEnvironment } from "./cs-environment/interfaces";

export const getIcon = (csEnvironment: IConfigurationStudioEnvironment, nodeType: TreeNodeType, itemType?: string, expanded?: boolean): ReactNode => {
  switch (nodeType) {
    case TreeNodeType.ConfigurationItem: {
      const definition = itemType ? csEnvironment.getDocumentDefinition(itemType) : undefined;
      return definition ? definition.icon : <FileUnknownOutlined />;
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

const applyIcon = (csEnvironment: IConfigurationStudioEnvironment, node: TreeNode): void => {
  node.icon = (props: TreeNodeProps): ReactNode => {
    return getIcon(
      csEnvironment,
      node.nodeType,
      isConfigItemTreeNode(node) ? node.itemType : undefined,
      props.expanded,
    );
  };
};

export const renderCsTreeNode = (node: TreeNode, displayText?: ReactNode): ReactNode => {
  return <CsTreeNode node={node}>{displayText ?? node.name}</CsTreeNode>;
};

export const flatNode2TreeNode = async (csEnvironment: IConfigurationStudioEnvironment, node: FlatTreeNode): Promise<TreeNode> => {
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


  let applicationsMap: Promise<Map<string, FrontEndAppDto>> | undefined;
  const getApplicationNameAsync = async (applicationId: string): Promise<string> => {
    try {
      const map = await (applicationsMap ??= csEnvironment.getFrontEndAppsMapAsync());
      return map.get(applicationId)?.name ?? "unknown";
    } catch {
      return "unknown";
    }
  };

  switch (node.nodeType) {
    case TREE_NODE_TYPES.Special: {
      if (!isDefined(node.itemType))
        throw new Error("Missing item type in node", { cause: node });
      const specialNode: SpecialTreeNode = {
        ...baseProps,
        itemType: node.itemType,
        children: [],
      };
      applyIcon(csEnvironment, specialNode);
      return specialNode;
    }
    case TREE_NODE_TYPES.Module: {
      const moduleNode: ModuleTreeNode = {
        ...baseProps,
        children: [],
      };
      applyIcon(csEnvironment, moduleNode);
      return moduleNode;
    }
    case TREE_NODE_TYPES.Folder: {
      const folderNode: FolderTreeNode = {
        ...baseProps,
        children: [],
      };
      applyIcon(csEnvironment, folderNode);
      return folderNode;
    }
    case TREE_NODE_TYPES.ConfigurationItem: {
      if (!isDefined(node.itemType))
        throw new Error("Missing item type in node", { cause: node });
      if (!isDefined(node.discriminator))
        throw new Error("Missing discriminator in node", { cause: node });

      const applicationName = isDefined(node.applicationId)
        ? await getApplicationNameAsync(node.applicationId)
        : undefined;

      const itemNode: ConfigItemTreeNode = {
        ...baseProps,
        itemType: node.itemType,
        discriminator: node.discriminator,
        flags: {
          isCodeBased: node.isCodeBased,
          isCodegenPending: node.isCodegenPending,
          isUpdated: node.isUpdated,
          isExposed: node.isExposed,
          isUpdatedByMe: node.isUpdatedByMe,
        },
        lastModifierUser: node.lastModifierUser ?? undefined,
        lastModificationTime: node.lastModificationTime ?? undefined,
        moduleName: "",
        baseModule: node.baseModule ?? undefined,
        applicationId: node.applicationId ?? undefined,
        applicationName: applicationName,
      };
      applyIcon(csEnvironment, itemNode);
      return itemNode;
    }
  }
  throw new Error(`Unknown type of configuration tree node: '${node.id}'`);
};
