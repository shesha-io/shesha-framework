import { BranchesOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import { MenuProps } from "antd";
import React from "react";
import { ConfigItemTreeNode, FolderTreeNode, isConfigItemTreeNode, isFolderTreeNode, isModuleTreeNode, ModuleTreeNode, TreeNode, TreeNodeType } from "./models";
import { getIcon } from "./tree-utils";
import { IConfigurationStudio } from "./cs/configurationStudio";

type MenuItemType = MenuProps["items"][number];

const getDivider = (): MenuItemType => {
    return {
        type: 'divider'
    };
};

export type BuildNodeMenuArgs<TNode extends TreeNode = TreeNode> = {
    configurationStudio: IConfigurationStudio;
    node?: TNode;
};

const buildConfiguraitonItemActionsMenu = (args: BuildNodeMenuArgs<ConfigItemTreeNode>): MenuItemType[] => {
    return [
        {
            label: "Rename",
            key: "rename",
            onClick: async () => {
                await args.configurationStudio.renameItemAsync(args.node);
            },
        },
        {
            label: "Duplicate",
            key: "duplicate",
            onClick: async () => {
                await args.configurationStudio.duplicateItemAsync(args.node);
            },
        },
        {
            label: "Delete",
            key: "delete",
            onClick: async () => {
                await args.configurationStudio.deleteItemAsync(args.node);
            },
        },
        {
            label: "Version History",
            key: "versionHistory",
            onClick: async () => {
                await args.configurationStudio.showRevisionHistoryAsync(args.node);
            },
        },
        {
            label: "View Json Config",
            key: "viewJsonConfig",
        },
    ];
};

const buildFolderActionsMenu = (args: BuildNodeMenuArgs<FolderTreeNode>): MenuItemType[] => {
    return [
        {
            label: "Rename",
            key: "rename",
            onClick: async () => {
                await args.configurationStudio.renameFolderAsync(args.node);
            },
        },
        {
            label: "Delete",
            key: "delete",
            onClick: async () => {
                await args.configurationStudio.deleteFolderAsync(args.node);
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
            onClick: async () => {
                await cs.exposeExistingAsync({ moduleId, folderId });
            },
        },
        getDivider(),
        {
            label: "Import from Package",
            key: "importFromPackage",
            icon: <ImportOutlined />,
            onClick: async () => {
                await cs.importPackageAsync({ moduleId, folderId });
            },
        },
        {
            label: "Export to Package",
            key: "exportToPackage",
            icon: <ExportOutlined />,
            onClick: async () => {
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
            onClick: async () => {
                await configurationStudio.createItemAsync({
                    moduleId: node.moduleId,
                    folderId: isFolderTreeNode(node)
                        ? node.id
                        : isConfigItemTreeNode(node) && node.parentId !== node.moduleId
                            ? node.parentId
                            : undefined,
                    prevItemId: isConfigItemTreeNode(node)
                        ? node.id
                        : undefined,
                    itemType: itemType
                });
            },
        };
    };

    const result: MenuItemType[] = [
        {
            label: "Folder",
            key: "folder",
            icon: getIcon(TreeNodeType.Folder),
            onClick: () => {
                configurationStudio.createFolderAsync({
                    moduleId: node.moduleId,
                    folderId: isFolderTreeNode(node)
                        ? node.id
                        : isConfigItemTreeNode(node)
                            ? node.parentId
                            : undefined
                });
            },
        },
    ];

    if (configurationStudio.itemTypes) {
        configurationStudio.itemTypes.forEach((it) => {
            if (it.createFormId)
                result.push(buildCreateCIMenuItem(it.friendlyName, it.itemType));
        });
    }

    return result;
};

export const buildConfiguraitonItemMenu = (args: BuildNodeMenuArgs<ConfigItemTreeNode>): MenuItemType[] => {
    return [
        ...buildConfiguraitonItemActionsMenu(args),
    ];
};

const buildConfigurationItemNodeContextMenu = (args: BuildNodeMenuArgs<ConfigItemTreeNode>): MenuItemType[] => {
    const { configurationStudio, node } = args;
    return [
        {
            label: "Open",
            key: "open",
            onClick: () => {
                configurationStudio.openDocById(node.id);
            },
        },
        {
            label: "New",
            key: "new",
            children: [
                ...buildCreateNewItemsMenu(args),
            ],
        },
        getDivider(),
        ...buildConfiguraitonItemActionsMenu(args),
    ];
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
