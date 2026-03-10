import { IErrorInfo } from "@/interfaces";
import { MutableRefObject, ReactNode } from "react";
import { MoveNodePayload } from "../apis";
import {
  CloseDocumentResponse,
  ConfigItemTreeNode,
  FolderTreeNode,
  ForceRenderFunc,
  IDocumentInstance,
  ItemTypeDefinition,
  TreeNode,
} from "../models";
import { IConfigurationStudioEnvironment } from "../cs-environment/interfaces";

export type LoadingStatus = 'waiting' | 'loading' | 'ready' | 'failed';
export type CsSubscriptionType = 'tree' | 'tabs' | 'doc' | 'tree-dnd';

export interface ProcessingState {
  status: LoadingStatus;
  hint?: string | undefined;
  error?: IErrorInfo | unknown;
}

export type CreateFolderArgs = {
  moduleId: string;
  folderId?: string | undefined;
};

export type CreateItemArgs = {
  moduleId: string;
  folderId?: string | undefined;
  prevItemId?: string | undefined;
  itemType: string;
  discriminator: string;
};

export type ExposeArgs = {
  moduleId: string;
  folderId: string | undefined;
};

export type ImportPackageArgs = {
  moduleId: string;
  folderId: string | undefined;
};
export type ExportPackageArgs = {
  moduleId: string;
  folderId: string | undefined;
};

export type RenameRevisionArgs = {
  id: string;
  versionName: string | null;
};

export type RestoreRevisionArgs = {
  itemId: string;
  revisionId: string;
  revisionFriendlyName: string;
};

export type GetRevisionJsonAsyncArgs = {
  id: string;
};

export interface IConfigurationStudio {
  readonly csEnvironment: IConfigurationStudioEnvironment;
  readonly treeNodes: TreeNode[];
  readonly treeLoadingState: ProcessingState;
  readonly quickSearch: string | undefined;
  readonly treeExpandedKeys: React.Key[];
  readonly treeSelectedKeys: React.Key[];
  readonly treeSelectedNode: TreeNode | undefined;
  readonly treeSelectedItemNode: ConfigItemTreeNode | undefined;
  readonly isTreeDragging: boolean;
  readonly renderedDocs: Map<string, ReactNode>;
  readonly hasUnsavedChanges: boolean;

  confirmNavigation: (newUrl: string) => boolean;

  setIsTreeDragging: (isDragging: boolean) => void;

  readonly itemTypes: ItemTypeDefinition[];
  toolbarRef: MutableRefObject<HTMLDivElement>;
  setDocumentToolbarRerenderer: (itemId: string, forceRender: ForceRenderFunc) => void;

  onTreeNodeExpand: (expandedKeys: React.Key[]) => void;
  setQuickSearch: (value: string) => void;

  loadTreeAndDocsAsync: () => Promise<void>;
  moveTreeNodeAsync: (payload: MoveNodePayload) => Promise<void>;
  getTreeNodeById: (itemId: string) => TreeNode | undefined;
  subscribe(type: CsSubscriptionType, callback: () => void): () => void;

  //#region selection and tabs
  selectTreeNode: (node?: TreeNode) => void;
  clickTreeNode: (node: TreeNode) => void;

  docs: IDocumentInstance[];
  activeDocId: string | undefined;
  activeDocument: IDocumentInstance | undefined;

  navigateToDocumentAsync: (docId: string) => Promise<void>;
  activateDocumentById: (docId: string | undefined) => void;
  openDocumentByIdAsync: (docId: string) => Promise<void>;
  closeDocumentAsync: (docId: string, confirmUnsavedChanges: boolean, activateNextTab: boolean) => Promise<CloseDocumentResponse>;
  reloadDocumentAsync: (docId: string) => Promise<void>;
  closeMultipleDocumentsAsync: (predicate: (doc: IDocumentInstance, index: number) => boolean, confirmUnsavedChanges: boolean) => Promise<void>;
  reorderDocumentsAsync: (fromIndex: number, toIndex: number) => Promise<void>;
  //#endregion

  //#region crud operations
  deleteFolderAsync: (node: FolderTreeNode) => Promise<void>;
  renameFolderAsync: (node: FolderTreeNode) => Promise<void>;
  createFolderAsync: (args: CreateFolderArgs) => Promise<void>;

  createItemAsync: (args: CreateItemArgs) => Promise<void>;
  deleteItemAsync: (node: ConfigItemTreeNode) => Promise<void>;
  renameItemAsync: (node: ConfigItemTreeNode) => Promise<void>;
  duplicateItemAsync: (node: ConfigItemTreeNode) => Promise<void>;
  setDocumentModified: (docId: string, isModified: boolean) => void;

  showRevisionHistoryAsync: (node: ConfigItemTreeNode) => Promise<void>;
  hideRevisionHistoryAsync: (docId: string) => Promise<void>;

  exposeExistingAsync: (args: ExposeArgs) => Promise<void>;
  importPackageAsync: (args: ImportPackageArgs) => Promise<void>;
  exportPackageAsync: (args: ExportPackageArgs) => Promise<void>;

  renameItemRevisionAsync: (args: RenameRevisionArgs) => Promise<boolean>;
  restoreRevisionAsync: (args: RestoreRevisionArgs) => Promise<boolean>;

  downloadRevisionJsonAsync: (args: GetRevisionJsonAsyncArgs) => Promise<void>;
  //#endregion
}
