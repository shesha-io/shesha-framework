import { BranchesOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import { MenuProps } from "antd";
import React from "react";
import { ConfigItemTreeNode, FolderTreeNode, isConfigItemTreeNode, isFolderTreeNode, isModuleTreeNode, ModuleTreeNode, TreeNode, TreeNodeType } from "./models";
import { getIcon } from "./tree-utils";
import { IConfigurationStudio } from "./cs/configurationStudio";
import { isDefined } from "../utils/nullables";

type MenuItemType = NonNullable<MenuProps["items"]>[number];

const getDivider = (): MenuItemType => {
  return {
    type: 'divider',
  };
};

export type BuildNodeMenuArgs<TNode extends TreeNode = TreeNode> = {
  configurationStudio: IConfigurationStudio;
  node?: TNode;
};

const buildConfiguraitonItemActionsMenu = ({ configurationStudio, node }: BuildNodeMenuArgs<ConfigItemTreeNode>): MenuItemType[] => {
  if (!node)
    return [];
  return [
    {
      label: "Rename",
      key: "rename",
      onClick: async (): Promise<void> => {
        await configurationStudio.renameItemAsync(node);
      },
    },
    {
      label: "Duplicate",
      key: "duplicate",
      onClick: async (): Promise<void> => {
        await configurationStudio.duplicateItemAsync(node);
      },
    },
    {
      label: "Delete",
      key: "delete",
      onClick: async (): Promise<void> => {
        await configurationStudio.deleteItemAsync(node);
      },
    },
    {
      label: "Version History",
      key: "versionHistory",
      onClick: async (): Promise<void> => {
        await configurationStudio.showRevisionHistoryAsync(node);
      },
    },
    {
      label: "View Json Config",
      key: "viewJsonConfig",
    },
  ];
};

const buildFolderActionsMenu = ({ configurationStudio, node }: BuildNodeMenuArgs<FolderTreeNode>): MenuItemType[] => {
  if (!node)
    return [];
  return [
    {
      label: "Rename",
      key: "rename",
      onClick: async (): Promise<void> => {
        await configurationStudio.renameFolderAsync(node);
      },
    },
    {
      label: "Delete",
      key: "delete",
      onClick: async (): Promise<void> => {
        await configurationStudio.deleteFolderAsync(node);
      },
    },
  ];
};

const buildExposeAndImportExportMenu = ({ configurationStudio: cs, node }: BuildNodeMenuArgs<TreeNode>): MenuItemType[] => {
  if (!isFolderTreeNode(node) && !isModuleTreeNode(node))
    return [];

  const moduleId = node.moduleId;
  const folderId = isFolderTreeNode(node) ? node.id : undefined;

  return [
    {
      label: "Expose Existing",
      key: "expose",
      icon: <BranchesOutlined />,
      onClick: async (): Promise<void> => {
        await cs.exposeExistingAsync({ moduleId, folderId });
      },
    },
    getDivider(),
    {
      label: "Import from Package",
      key: "importFromPackage",
      icon: <ImportOutlined />,
      onClick: async (): Promise<void> => {
        await cs.importPackageAsync({ moduleId, folderId });
      },
    },
    {
      label: "Export to Package",
      key: "exportToPackage",
      icon: <ExportOutlined />,
      onClick: async (): Promise<void> => {
        await cs.exportPackageAsync({ moduleId, folderId });
      },
    },
  ];
};

const buildCreateNewItemsMenu = ({ node, configurationStudio }: BuildNodeMenuArgs): MenuItemType[] => {
  if (!node)
    return [];
  const buildCreateCIMenuItem = (label: string, itemType: string): MenuItemType => {
    return {
      label: label,
      key: itemType,
      icon: getIcon(TreeNodeType.ConfigurationItem, itemType),
      onClick: async (): Promise<void> => {
        await configurationStudio.createItemAsync({
          moduleId: node.moduleId,
          folderId: isFolderTreeNode(node)
            ? node.id
            : isConfigItemTreeNode(node) && node.parentId !== node.moduleId && isDefined(node.parentId)
              ? node.parentId
              : undefined,
          prevItemId: isConfigItemTreeNode(node)
            ? node.id
            : undefined,
          itemType: itemType,
        });
      },
    };
  };

  const result: MenuItemType[] = [
    {
      label: "Folder",
      key: "folder",
      icon: getIcon(TreeNodeType.Folder),
      onClick: (): void => {
        configurationStudio.createFolderAsync({
          moduleId: node.moduleId,
          folderId: isFolderTreeNode(node)
            ? node.id
            : isConfigItemTreeNode(node) && isDefined(node.parentId)
              ? node.parentId
              : undefined,
        });
      },
    },
  ];

  configurationStudio.itemTypes.forEach((it) => {
    if (it.createFormId)
      result.push(buildCreateCIMenuItem(it.friendlyName, it.itemType));
  });

  return result;
};

export const buildConfiguraitonItemMenu = (args: BuildNodeMenuArgs<ConfigItemTreeNode>): MenuItemType[] => {
  return buildConfiguraitonItemActionsMenu(args);
};

const buildConfigurationItemNodeContextMenu = (args: BuildNodeMenuArgs<ConfigItemTreeNode>): MenuItemType[] => {
  const { configurationStudio, node } = args;
  const result: MenuItemType[] = [];
  if (node)
    result.push({
      label: "Open",
      key: "open",
      onClick: () => {
        configurationStudio.activateDocumentById(node.id);
      },
    });
  result.push({
    label: "New",
    key: "new",
    children: [
      ...buildCreateNewItemsMenu(args),
    ],
  },
  getDivider(),
  ...buildConfiguraitonItemActionsMenu(args),
  );

  return result;
};

const buildFolderNodeContextMenu = (args: BuildNodeMenuArgs<FolderTreeNode>): MenuItemType[] => {
  return [
    {
      label: "New",
      key: "new",
      children: [
        ...buildCreateNewItemsMenu(args),
      ],
    },
    getDivider(),
    ...buildFolderActionsMenu(args),
    getDivider(),
    ...buildExposeAndImportExportMenu(args),
  ];
};

const buildModuleNodeContextMenu = (args: BuildNodeMenuArgs<ModuleTreeNode>): MenuItemType[] => {
  return [
    {
      label: "New",
      key: "new",
      children: [
        ...buildCreateNewItemsMenu(args),
      ],
    },
    getDivider(),
    ...buildExposeAndImportExportMenu(args),
  ];
};

export const buildNodeContextMenu = (args: BuildNodeMenuArgs): MenuItemType[] => {
  if (isConfigItemTreeNode(args.node))
    return buildConfigurationItemNodeContextMenu({ ...args, node: args.node });

  if (isFolderTreeNode(args.node))
    return buildFolderNodeContextMenu({ ...args, node: args.node });

  if (isModuleTreeNode(args.node))
    return buildModuleNodeContextMenu({ ...args, node: args.node });

  return [];
};

export const buildCreateNewMenu = (args: BuildNodeMenuArgs<TreeNode>): MenuItemType[] => {
  const result = buildCreateNewItemsMenu(args);
  const serviceItems = buildExposeAndImportExportMenu(args);
  if (result.length > 0 && serviceItems.length > 0)
    result.push(getDivider());

  result.push(...serviceItems);
  return result;
};
