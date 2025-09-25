import { FormFullName } from "@/interfaces";
import { DataNode } from "antd/lib/tree";
import { PropsWithChildren, ReactNode } from "react";
import { isDefined } from "../utils/nullables";
import { ModalFooterButtons } from "@/providers/dynamicModal/models";

export type ForceRenderFunc = () => void;

export enum TreeNodeType {
  Module = 1,
  ConfigurationItem = 2,
  Folder = 3,
}

export type DocumentFlags = {
  isCodeBased: boolean;
  isCodegenPending: boolean;
  isUpdated: boolean;
  isUpdatedByMe: boolean;
  isExposed: boolean;
};

export type TreeNode = DataNode & {
  id: string;
  parentId?: string | null;
  moduleId: string;
  name: string;
  label: string;
  description?: string;
  nodeType: TreeNodeType;
};

export type ConfigItemTreeNode = TreeNode & {
  itemType: string;
  flags: DocumentFlags;
  lastModifierUser?: string;
  lastModificationTime?: string;
  moduleName: string;
  baseModule?: string;
};

export type NodeWithChilds = {
  children: TreeNode[];
};

export type ModuleTreeNode = TreeNode & NodeWithChilds & {
};

export type FolderTreeNode = TreeNode & NodeWithChilds & {
};

export type FlatTreeNode = DocumentFlags & {
  id: string;
  parentId?: string | null;
  moduleId: string;
  name: string;
  label: string;
  nodeType: number;
  itemType?: string;
  description?: string;
  lastModifierUser?: string;
  lastModificationTime?: string;
  baseModule?: string;
};

export const isTreeNode = (node?: DataNode): node is TreeNode => {
  const casted = node as TreeNode | undefined;
  return isDefined(casted?.nodeType);
};

export const isConfigItemTreeNode = (node?: DataNode): node is ConfigItemTreeNode => {
  return isTreeNode(node) && node.nodeType === TreeNodeType.ConfigurationItem;
};

export const isFolderTreeNode = (node?: DataNode): node is FolderTreeNode => {
  return isTreeNode(node) && node.nodeType === TreeNodeType.Folder;
};

export const isModuleTreeNode = (node?: DataNode): node is ModuleTreeNode => {
  return isTreeNode(node) && node.nodeType === TreeNodeType.Module;
};

export const isNodeWithChildren = (node?: DataNode): node is ModuleTreeNode | FolderTreeNode => {
  return isModuleTreeNode(node) || isFolderTreeNode(node);
};

export const TREE_NODE_TYPES = {
  Module: 1,
  ConfigurationItem: 2,
  Folder: 3,
};

export const ITEM_TYPES = {
  FORM: 'form',
  ROLE: 'role',
  ENTITY: 'entity',
  PERMISSION: 'permission-definition',
  REFLIST: 'reference-list',
  SETTING: 'setting-configuration',
  NOTIFICATION: 'notification-type',
  NOTIFICATION_CHANNEL: 'notification-channel',
};

export type ItemTypeBackendDefinition = {
  itemType: string;
  entityClassName: string;
  friendlyName: string;
  createFormId: FormFullName | null;
  renameFormId: FormFullName | null;
};

export type ItemTypeDefinition = ItemTypeBackendDefinition & {
  // front-end specific
  editor: DocumentDefinition | undefined;
  icon: ReactNode | undefined;
};

export type LoadingStatus = 'waiting' | 'loading' | 'ready' | 'failed';

export type DocumentType = 'ci' | 'custom';

export type StoredDocumentInfo = {
  itemId: string;
  label: string;
  type: DocumentType;
};

export type DocumentBase = StoredDocumentInfo;

export type CIDocument = DocumentBase & {
  itemType: string;
  definition: DocumentDefinition;
  loadingState: LoadingStatus;
  isHistoryVisible: boolean;
  flags: DocumentFlags;
  moduleId: string;
  moduleName: string;
};

export const isCIDocument = (doc?: StoredDocumentInfo): doc is CIDocument => {
  return isDefined(doc) && doc.type === 'ci';
};

export type ItemEditorProps<TDoc extends IDocumentInstance = IDocumentInstance> = {
  doc: TDoc;
};
export type ItemEditorRenderer<TDoc extends IDocumentInstance> = (props: ItemEditorProps<TDoc>) => ReactNode;

export type ProviderRendererProps<TDoc extends IDocumentInstance = IDocumentInstance> = PropsWithChildren<ItemEditorProps<TDoc>>;
export type ProviderRenderer<TDoc extends IDocumentInstance> = (props: ProviderRendererProps<TDoc>) => ReactNode;

export interface IDocumentInstance extends CIDocument {
  // state
  toolbarForceRender?: ForceRenderFunc;
};

export type DocumentInstanceFactoryArgs = {
  itemId: string;
  label: string;
  moduleId: string;
  moduleName: string;
  flags?: DocumentFlags;
};
export type DocumentInstanceFactory = (args: DocumentInstanceFactoryArgs) => IDocumentInstance;

export type DocumentDefinition<TDoc extends IDocumentInstance = IDocumentInstance> = {
  documentType: string;
  Editor: ItemEditorRenderer<TDoc>;
  Provider: ProviderRenderer<TDoc>;
  Toolbar: ItemEditorRenderer<TDoc>;
  documentInstanceFactory: DocumentInstanceFactory;
  createModalFooterButtons?: ModalFooterButtons;
};

export type DocumentDefinitions = Map<string, DocumentDefinition>;
