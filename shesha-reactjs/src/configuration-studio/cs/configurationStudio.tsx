import ConfigurationItemsExport, { IExportInterface } from "@/components/configurationFramework/itemsExport";
import { ConfigurationItemsImport, IImportInterface } from "@/components/configurationFramework/itemsImport";
import { IAjaxResponse, IErrorInfo } from "@/interfaces";
import { FormFullName, HttpClientApi } from "@/providers";
import { IShaRouter } from "@/providers/shaRouting/contexts";
import { ConfigurationItemsExportFooter } from "@/providers/sheshaApplication/configurable-actions/configuration-items-export";
import { ConfigurationItemsImportFooter } from "@/providers/sheshaApplication/configurable-actions/configuration-items-import";
import { buildUrl } from "@/utils/url";
import React, { MutableRefObject, ReactNode } from "react";
import { isDefined, isNullOrWhiteSpace } from "../../utils/nullables";
import { deleteConfigurationItemAsync, deleteFolderAsync, duplicateItemAsync, fetchFlatTreeAsync, fetchItemTypesAsync, getRevisionJsonAsync, MoveNodePayload, moveTreeNodeAsync, restoreItemRevisionAsync } from "../apis";
import { getUnknownDocumentDefinition } from "../document-definitions/configurable-editor/genericDefinition";
import {
  CIDocument,
  ConfigItemTreeNode,
  DocumentBase,
  DocumentDefinition, DocumentDefinitions,
  FolderTreeNode,
  ForceRenderFunc,
  IDocumentInstance,
  isConfigItemTreeNode,
  isFolderTreeNode, isModuleTreeNode, isSpecialTreeNode, ItemTypeDefinition,
  SpecialTreeNode,
  StoredDocumentInfo,
  TreeNode, TreeNodeType,
} from "../models";
import { IAsyncStorage } from "../storage";
import { flatNode2TreeNode, getIcon } from "../tree-utils";
import { IModalApi } from "./modalApi";
import { INotificationApi } from "./notificationApi";
import { createManualRef } from "./utils";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";

export type LoadingStatus = 'waiting' | 'loading' | 'ready' | 'failed';
export interface ProcessingState {
  status: LoadingStatus;
  hint?: string | undefined;
  error?: IErrorInfo | unknown;
}

export const SPECIAL_NODES: { HOME: SpecialTreeNode; SETTINGS: SpecialTreeNode } = {
  HOME: {
    id: 'home',
    key: 'home',
    moduleId: '',
    name: 'Home',
    label: 'Home',
    nodeType: TreeNodeType.Special,
    title: "Home",
    icon: <HomeOutlined />,
    description: '',
  },
  SETTINGS: {
    id: 'settings',
    key: 'settings',
    moduleId: '',
    name: 'Settings',
    label: 'Settings',
    nodeType: TreeNodeType.Special,
    title: "Settings",
    icon: <SettingOutlined />,
    description: '',
  },
};

type DynamicProperties<K extends string | number | symbol, T> = {
  [P in K]: T;
};

type FormIds = 'CREATE_FOLDER' | 'RENAME_FOLDER' | 'EXPOSE_EXISTING' | 'RENAME_REVISION';

const FORMS: DynamicProperties<FormIds, FormFullName> = {
  // TODO: move to metadata
  CREATE_FOLDER: { module: 'Shesha', name: 'cs-folder-create' },
  RENAME_FOLDER: { module: 'Shesha', name: 'cs-folder-rename' },
  EXPOSE_EXISTING: { module: 'Shesha', name: 'cs-expose-existing' },
  RENAME_REVISION: { module: 'Shesha', name: 'cs-revision-rename' },
};

const STORAGE_KEYS = {
  OPENED_DOCS: 'openedDocs',
  ACTIVE_DOC_ID: 'activeDocId',
  TREE_EXPANDED_KEYS: 'treeExpandedKeys',
  // TREE_SELECTION: 'treeSelection',
  QUICK_SEARCH: 'quickSearch',
};

interface CreateItemResponse {
  id: string;
};

export type CsSubscription = (cs: IConfigurationStudio) => void;
export type CsSubscriptionType = 'tree' | 'tabs' | 'doc' | 'tree-dnd';

export type CreateFolderArgs = {
  moduleId: string;
  folderId?: string | undefined;
};
export type CreateItemArgs = {
  moduleId: string;
  folderId?: string | undefined;
  prevItemId?: string | undefined;
  itemType: string;
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

export type GetRevisionJsonAsyncArgs = {
  id: string;
};

export type RestoreRevisionArgs = {
  itemId: string;
  revisionId: string;
  revisionFriendlyName: string;
};

export interface IConfigurationStudio {
  readonly treeNodes: TreeNode[];
  readonly treeLoadingState: ProcessingState;
  readonly quickSearch: string | undefined;
  readonly treeExpandedKeys: React.Key[];
  readonly treeSelectedKeys: React.Key[];
  readonly treeSelectedNode: TreeNode | undefined;
  readonly treeSelectedItemNode: ConfigItemTreeNode | undefined;
  readonly isTreeDragging: boolean;
  readonly renderedDocs: Map<string, ReactNode>;

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
  closeDocumentAsync: (docId: string) => Promise<void>;
  reloadDocumentAsync: (docId: string) => Promise<void>;
  closeMultipleDocumentsAsync: (predicate: (doc: IDocumentInstance, index: number) => boolean) => Promise<void>;
  //#endregion

  //#region crud operations
  deleteFolderAsync: (node: FolderTreeNode) => Promise<void>;
  renameFolderAsync: (node: FolderTreeNode) => Promise<void>;
  createFolderAsync: (args: CreateFolderArgs) => Promise<void>;

  createItemAsync: (args: CreateItemArgs) => Promise<void>;
  deleteItemAsync: (node: ConfigItemTreeNode) => Promise<void>;
  renameItemAsync: (node: ConfigItemTreeNode) => Promise<void>;
  duplicateItemAsync: (node: ConfigItemTreeNode) => Promise<void>;

  showRevisionHistoryAsync: (node: ConfigItemTreeNode) => Promise<void>;
  hideRevisionHistoryAsync: (docId: string) => Promise<void>;

  exposeExistingAsync: (args: ExposeArgs) => Promise<void>;
  importPackageAsync: (args: ImportPackageArgs) => Promise<void>;
  exportPackageAsync: (args: ExportPackageArgs) => Promise<void>;

  renameItemRevisionAsync: (args: RenameRevisionArgs) => Promise<boolean>;
  restoreRevisionAsync: (args: RestoreRevisionArgs) => Promise<boolean>;

  downloadRevisionJsonAsync: (args: GetRevisionJsonAsyncArgs) => Promise<void>;
  //#endregion

  //#region document definitions
  registerDocumentDefinition: (definition: DocumentDefinition) => void;
  unregisterDocumentDefinition: (definition: DocumentDefinition) => void;
  //#endregion
}

export type ForceUpdateTrigger = () => void;

interface ConfigurationStudioArguments {
  forceRootUpdate: ForceUpdateTrigger;
  httpClient: HttpClientApi;
  storage: IAsyncStorage;
  modalApi: IModalApi;
  notificationApi: INotificationApi;
  toolbarRef: MutableRefObject<HTMLDivElement>;
  shaRouter: IShaRouter;
  logEnabled?: boolean;
}

export class ConfigurationStudio implements IConfigurationStudio {
  forceRootUpdate: ForceUpdateTrigger;

  private httpClient: HttpClientApi;

  private modalApi: IModalApi;

  private shaRouter: IShaRouter;

  private rootPath: string;

  private notificationApi: INotificationApi;

  private storage: IAsyncStorage;

  private subscriptions: Map<CsSubscriptionType, Set<CsSubscription>>;

  readonly renderedDocs: Map<string, ReactNode>;

  toolbarRef: MutableRefObject<HTMLDivElement>;

  findDoc = (itemId?: string): IDocumentInstance | undefined => {
    return isDefined(itemId)
      ? this.docs.find((d) => d.itemId === itemId)
      : undefined;
  };

  setDocumentToolbarRerenderer = (itemId: string, forceRender: ForceRenderFunc): void => {
    const doc = this.findDoc(itemId);
    if (!doc)
      return;
    doc.toolbarForceRender = forceRender;
  };

  treeLoadingState: ProcessingState;

  private _selectedNodeId: string | undefined;

  private _isTreeDragging: boolean = false;

  private _treeNodes: TreeNode[] = [];

  private _treeNodesMap: Map<string, TreeNode> = new Map<string, TreeNode>();

  private _treeExpandedKeys: React.Key[] = [];

  private _quickSearch?: string;

  private _documentDefinitions: DocumentDefinitions;

  private _itemTypes: ItemTypeDefinition[] = [];

  private _itemTypesMap: Map<string, ItemTypeDefinition> = new Map<string, ItemTypeDefinition>();

  _docs: IDocumentInstance[] = [];

  get docs(): IDocumentInstance[] {
    return this._docs;
  }

  set docs(value: IDocumentInstance[]) {
    this._docs = value;
  }

  activeDocId: string | undefined;

  private getDocumenById = (id: string): IDocumentInstance | undefined => {
    return id
      ? this.docs.find((d) => d.itemId === id)
      : undefined;
  };

  get activeDocument(): (IDocumentInstance | undefined) {
    return isDefined(this.activeDocId)
      ? this.getDocumenById(this.activeDocId)
      : undefined;
  };

  constructor(args: ConfigurationStudioArguments) {
    this.renderedDocs = new Map<string, ReactNode>();
    this.forceRootUpdate = args.forceRootUpdate;
    this.httpClient = args.httpClient;
    this.modalApi = args.modalApi;
    this.notificationApi = args.notificationApi;
    this.storage = args.storage;
    // eslint-disable-next-line no-console
    this.log = args.logEnabled ? console.log : () => {};
    this.treeLoadingState = { status: 'waiting' };
    this.subscriptions = new Map<CsSubscriptionType, Set<CsSubscription>>();
    this._documentDefinitions = new Map<string, DocumentDefinition>();
    this.toolbarRef = args.toolbarRef;
    this.shaRouter = args.shaRouter;
    this.rootPath = this.shaRouter.router.path;
  }

  renameItemRevisionAsync = async (args: RenameRevisionArgs): Promise<boolean> => {
    const response = await this.modalApi.showModalFormAsync<IAjaxResponse<void>>({
      title: 'Name Revision',
      formId: FORMS.RENAME_REVISION,
      formArguments: {
        id: args.id,
        versionName: args.versionName,
      },
    });
    return response?.success === true;
  };

  restoreRevisionAsync = async (args: RestoreRevisionArgs): Promise<boolean> => {
    if (!await this.modalApi.confirmYesNo({ title: 'Confirm Revision Restore', content: `Are you sure you want to restore revision '${args.revisionFriendlyName}'?` }))
      return false;
    await restoreItemRevisionAsync(this.httpClient, { itemId: args.itemId, revisionId: args.revisionId });
    return true;
  };

  downloadRevisionJsonAsync = async (args: GetRevisionJsonAsyncArgs): Promise<void> => {
    await getRevisionJsonAsync(this.httpClient, { id: args.id });
  };

  registerDocumentDefinition = (definition: DocumentDefinition): void => {
    this._documentDefinitions.set(definition.documentType, definition);
  };

  unregisterDocumentDefinition = (definition: DocumentDefinition): void => {
    this._documentDefinitions.delete(definition.documentType);
  };

  get quickSearch(): string | undefined {
    return this._quickSearch;
  }

  setQuickSearch = (value: string): void => {
    this._quickSearch = value;
    this.saveQuickSearchAsync();
    this.notifySubscribers(['tree']);
  };

  get treeExpandedKeys(): React.Key[] {
    return this._treeExpandedKeys;
  };

  get treeSelectedKeys(): React.Key[] {
    return isDefined(this._selectedNodeId)
      ? [this._selectedNodeId]
      : [];
  };

  get treeSelectedNode(): TreeNode | undefined {
    return isDefined(this._selectedNodeId)
      ? this._treeNodesMap.get(this._selectedNodeId)
      : undefined;
  };

  get isTreeDragging(): boolean {
    return this._isTreeDragging;
  };

  setIsTreeDragging = (value: boolean): void => {
    this._isTreeDragging = value;
    this.notifySubscribers(['tree-dnd']);
  };

  get treeSelectedItemNode(): ConfigItemTreeNode | undefined {
    const node = this.treeSelectedNode;
    return isConfigItemTreeNode(node) ? node : undefined;
  };

  private saveTreeExpandedNodesAsync = async (): Promise<void> => {
    await this.storage.setAsync(STORAGE_KEYS.TREE_EXPANDED_KEYS, this._treeExpandedKeys);
  };

  private saveQuickSearchAsync = async (): Promise<void> => {
    await this.storage.setAsync(STORAGE_KEYS.QUICK_SEARCH, this._quickSearch);
  };

  private loadTreeExpandedNodesAsync = async (): Promise<void> => {
    this._treeExpandedKeys = await this.storage.getAsync(STORAGE_KEYS.TREE_EXPANDED_KEYS) ?? [];
  };

  private loadQuickSearchAsync = async (): Promise<void> => {
    this._quickSearch = await this.storage.getAsync<string>(STORAGE_KEYS.QUICK_SEARCH) ?? "";
  };

  private loadTreeStateAsync = async (): Promise<void> => {
    await this.loadQuickSearchAsync();
    await this.loadTreeExpandedNodesAsync();
    // await this.loadTreeSelectionAsync();
  };

  onTreeNodeExpand = (expandedKeys: React.Key[]): void => {
    this._treeExpandedKeys = expandedKeys;
    this.saveTreeExpandedNodesAsync();
    this.notifySubscribers(['tree']);
  };

  clearDocumentSelectionAsync = async (): Promise<void> => {
    this._selectedNodeId = undefined;
    this.activeDocId = undefined;

    this.notifySubscribers(['tree', 'tabs', 'doc']);
    await Promise.resolve();
  };

  doSelectTreeNodeAsync = async (node?: TreeNode): Promise<void> => {
    this._selectedNodeId = node?.key.toString();
    this.notifySubscribers(['tree']);
    await Promise.resolve();
  };

  isTreeNodeExpanded = (nodeId: string): boolean => this._treeExpandedKeys.includes(nodeId);

  toggleTreeNode = (nodeId: string, expanded: boolean): void => {
    const current = this.isTreeNodeExpanded(nodeId);
    if (current === expanded)
      return;

    if (expanded)
      this._treeExpandedKeys = [...this._treeExpandedKeys, nodeId];
    else
      this._treeExpandedKeys = this._treeExpandedKeys.filter((key) => key !== nodeId);
    this.notifySubscribers(['tree']);
  };

  expandTreeNode = (nodeId: string): void => {
    this.toggleTreeNode(nodeId, true);
  };

  clickTreeNode = (node: TreeNode): void => {
    if (isFolderTreeNode(node) || isModuleTreeNode(node)) {
      const expanded = this.isTreeNodeExpanded(node.id);
      this.toggleTreeNode(node.id, !expanded);
    }
  };

  navigateToRoot = (): void => {
    this.shaRouter.router.push(this.rootPath);
  };

  navigateToDocumentAsync = async (docId: string): Promise<void> => {
    const currentDocId = this.getDocIdFromRoute();

    if (currentDocId === docId)
      return;

    const url = this.getDocumentUrl(docId);
    await this.shaRouter.goingToRoute(url);
  };

  openDocumentByIdAsync = async (docId: string): Promise<void> => {
    const node = this._treeNodesMap.get(docId);
    if (node)
      await this.openDocumentByNodeAsync(node);
  };

  openDocumentByNodeAsync = async (node: TreeNode): Promise<void> => {
    if (isConfigItemTreeNode(node) && this.activeDocId !== node.id) {
      const tab = this.findDocumentById(node.id);
      if (!tab) {
        // load item, add new tab and select
        const newTab = await this.createNewCiTabAsync(node);
        this.notifySubscribers(['tabs']);
        // select new tab
        this.selectTabAsync(newTab);
        this.notifySubscribers(['tabs']);
      } else {
        this.selectTabAsync(tab);
        this.notifySubscribers(['tabs']);
      }
    } else
      if (isSpecialTreeNode(node) && this.activeDocId !== node.id) {
        const tab = this.findDocumentById(node.id);
        if (!tab) {
          // load item, add new tab and select
          const newTab = await this.createNewSpecialTabAsync(node);
          // select new tab
          this.selectTabAsync(newTab);
        } else {
          this.selectTabAsync(tab);
        }
        this.notifySubscribers(['tabs']);
      }
  };

  selectTreeNode = async (node?: TreeNode): Promise<void> => {
    await this.doSelectTreeNodeAsync(node);

    if (isDefined(node))
      await this.navigateToDocumentAsync(node.id);
  };

  //#region documents

  private loadOpenedDocsAsync = async (): Promise<void> => {
    // TODO: check type of stored value, filter/proceess documents taking into account loaded tree nodes
    const docs = await this.storage.getAsync<StoredDocumentInfo[]>(STORAGE_KEYS.OPENED_DOCS) ?? [];

    this.log('Convert restored docs');
    const mappedDocs = docs.map<IDocumentInstance | undefined>((d) => {
      const node = this.getTreeNodeById(d.itemId);
      if (isConfigItemTreeNode(node)) {
        const definition = this.getDocumentDefinition(node.itemType);
        if (!definition)
          return undefined;

        return definition.documentInstanceFactory({
          itemId: d.itemId,
          label: node.name,
          moduleId: node.moduleId,
          moduleName: node.moduleName,
          flags: node.flags,
        });
      }

      if (isSpecialTreeNode(node)) {
        const definition = this.getDocumentDefinition(node.id);
        if (!definition)
          return undefined;

        return definition.documentInstanceFactory({
          itemId: d.itemId,
          label: node.name,
          moduleId: node.moduleId,
          moduleName: "",
        });
      }

      return undefined;
    })
      .filter((d) => isDefined(d));

    this.docs = mappedDocs;
  };

  private loadDocsStateAsync = async (): Promise<void> => {
    await this.loadOpenedDocsAsync();
  };

  private saveOpenedDocsAsync = async (): Promise<void> => {
    const storedData = this.docs.map<StoredDocumentInfo>((d) => ({
      itemId: d.itemId,
      label: d.label,
      type: d.type,
    }));
    await this.storage.setAsync(STORAGE_KEYS.OPENED_DOCS, storedData);
  };

  //#endregion

  //#region tabs

  private createNewCiTabAsync = async (node: ConfigItemTreeNode): Promise<CIDocument> => {
    this.log(`create CI tab for item '${node.name}'`);

    const definition = this.getDocumentDefinition(node.itemType);
    if (!definition)
      throw new Error(`Unsupported item type: '${node.itemType}'`);

    const newDocument = definition.documentInstanceFactory({
      itemId: node.id,
      label: node.name,
      moduleId: node.moduleId,
      moduleName: node.moduleName,
      flags: node.flags,
    });

    this.docs = [...this.docs, newDocument];
    await this.saveOpenedDocsAsync();

    this.notifySubscribers(['tabs']);

    return newDocument;
  };

  private createNewSpecialTabAsync = async (node: SpecialTreeNode): Promise<CIDocument> => {
    this.log(`create special tab for item '${node.name}'`);

    const definition = this.getDocumentDefinition(node.id);
    if (!definition)
      throw new Error(`Unknown special document: '${node.id}'`);

    const newDocument = definition.documentInstanceFactory({
      itemId: node.id,
      label: node.name,
      moduleId: node.moduleId,
      moduleName: "",
    });

    this.docs = [...this.docs, newDocument];
    await this.saveOpenedDocsAsync();

    this.notifySubscribers(['tabs']);

    return newDocument;
  };

  private findDocumentById = (tabId: string): DocumentBase | undefined => {
    return this.docs.find((t) => t.itemId === tabId);
  };

  doSelectTabAsync = async (tab?: DocumentBase): Promise<void> => {
    const selectedDocId = tab?.itemId;
    this.activeDocId = selectedDocId;
    this.notifySubscribers(['tabs', 'doc']);
    await Promise.resolve();
  };

  selectTabAsync = async (tab?: DocumentBase): Promise<void> => {
    // force render old tab
    const prevDoc = this.activeDocument;

    const selectedDocId = tab?.itemId;

    await this.doSelectTabAsync(tab);
    const doc = this.findDoc(tab?.itemId);

    prevDoc?.toolbarForceRender?.();
    doc?.toolbarForceRender?.();

    // sync selection with tree when CI is selected
    if (isDefined(selectedDocId) && this._selectedNodeId !== selectedDocId) {
      const treeNode = this.getTreeNodeById(selectedDocId);
      if (isConfigItemTreeNode(treeNode)) {
        this.selectTreeNode(treeNode);
      }
    }
  };

  getDocumentUrl = (docId?: string): string => {
    return isNullOrWhiteSpace(docId)
      ? this.rootPath
      : buildUrl(this.rootPath, { docId: docId });
  };

  activateDocumentById = async (docId: string | undefined): Promise<void> => {
    if (this.activeDocId === docId)
      return;

    const doc = isDefined(docId) ? this.findDocumentById(docId) : undefined;
    await this.selectTabAsync(doc);
  };

  isDocOpened = (docId: string): boolean => {
    return this.docs.some((t) => t.itemId === docId);
  };

  closeDocumentAsync = async (docId: string): Promise<void> => {
    if (!this.isDocOpened(docId))
      return;

    // TODO: check for unsaved changes, ask user to confirm
    // TODO: unload document
    const index = this.docs.findIndex((t) => t.itemId === docId);
    const isActive = this.activeDocId === docId;

    this.docs = this.docs.filter((t) => t.itemId !== docId);

    await this.saveOpenedDocsAsync();
    this.notifySubscribers(['tabs', 'doc']);

    // if the document was active - activate next if available
    if (isActive) {
      const indexToSwitch = this.docs.length - 1 >= index
        ? index
        : index - 1;
      const docToSwitchTo = indexToSwitch >= 0
        ? this.docs[indexToSwitch]
        : undefined;
      if (docToSwitchTo)
        await this.navigateToDocumentAsync(docToSwitchTo.itemId);
      else {
        this.navigateToRoot();
        await this.clearDocumentSelectionAsync();
      }
    }
  };

  closeMultipleDocumentsAsync = async (predicate: (doc: IDocumentInstance, index: number) => boolean): Promise<void> => {
    // TODO: check for unsaved changes, ask user to confirm
    const docsToClose = this.docs.filter(predicate);
    for (const doc of docsToClose) {
      await this.closeDocumentAsync(doc.itemId);
    }
  };

  getDocumentDefinition = (itemType: string): DocumentDefinition | undefined => {
    const definition = this._documentDefinitions.get(itemType);
    return definition ?? getUnknownDocumentDefinition(itemType);
  };

  //#endregion

  //#region subscriptions

  private getSubscriptions = (type: CsSubscriptionType): Set<CsSubscription> => {
    const existing = this.subscriptions.get(type);
    if (existing)
      return existing;

    const subscriptions = new Set<CsSubscription>();
    this.subscriptions.set(type, subscriptions);
    return subscriptions;
  };

  subscribe(type: CsSubscriptionType, callback: CsSubscription): () => void {
    const callbacks = this.getSubscriptions(type);
    callbacks.add(callback);

    return () => this.unsubscribe(type, callback);
  }

  private unsubscribe(type: CsSubscriptionType, callback: CsSubscription): void {
    const callbacks = this.getSubscriptions(type);
    callbacks.delete(callback);
  }

  notifySubscribers(types: CsSubscriptionType[]): void {
    const allSubscriptions = new Set<CsSubscription>();
    types.forEach((type) => {
      const subscriptions = this.getSubscriptions(type);
      subscriptions.forEach((s) => allSubscriptions.add(s));
    });

    allSubscriptions.forEach((s) => (s(this)));
  }

  //#endregion

  log = (..._args: unknown[]): void => {
    // noop
  };

  get itemTypes(): ItemTypeDefinition[] {
    return this._itemTypes;
  }

  getItemTypeDefinition = (itemType: string): ItemTypeDefinition => {
    const definition = this._itemTypesMap.get(itemType);
    if (!definition)
      throw new Error(`Item type '${itemType}' is not registered`);
    return definition;
  };

  loadItemTypesAsync = async (): Promise<void> => {
    this.log('Fetch item types');
    const backEndItemTypes = await fetchItemTypesAsync(this.httpClient);
    this.log('Fetch item types - done', backEndItemTypes);

    this._itemTypesMap.clear();
    this._itemTypes = [];

    backEndItemTypes.forEach((it) => {
      const definition: ItemTypeDefinition = {
        itemType: it.itemType,
        entityClassName: it.entityClassName,
        friendlyName: it.friendlyName,
        createFormId: it.createFormId,
        renameFormId: it.renameFormId,
        // front-end specific
        icon: getIcon(
          TreeNodeType.ConfigurationItem,
          it.itemType,
          false,
        ),
        editor: this._documentDefinitions.get(it.itemType),
      };
      this._itemTypes.push(definition);
      this._itemTypesMap.set(it.itemType, definition);
    });
  };

  loadTreeAsync = async (): Promise<void> => {
    this.treeLoadingState = { status: 'loading', hint: 'Fetching data...', error: null };
    try {
      this.log('LOG: loadTreeAsync');
      const flatTreeNodes = await fetchFlatTreeAsync(this.httpClient);
      const treeNodeMap = new Map<string, TreeNode>();
      const treeNodes: TreeNode[] = [];

      // First pass: create map and shallow copies
      flatTreeNodes.forEach((node) => {
        treeNodeMap.set(node.id, flatNode2TreeNode(node));
      });

      // Second pass: build hierarchy
      flatTreeNodes.forEach((node) => {
        const currentNode = treeNodeMap.get(node.id)!;

        if (node.moduleId && isConfigItemTreeNode(currentNode))
          currentNode.moduleName = treeNodeMap.get(node.moduleId)?.name ?? "";

        if (isDefined(node.parentId)) {
          const parent = treeNodeMap.get(node.parentId);
          if (parent) {
            parent.children ??= [];
            parent.children.push(currentNode);
          }
        } else {
          treeNodes.push(currentNode);
        }
      });

      this._treeNodes = treeNodes;
      this._treeNodesMap = treeNodeMap;
      this.addSpecialTreeNodes();

      this.treeLoadingState = { status: 'ready', hint: undefined, error: null };
    } catch (error) {
      this.treeLoadingState = { status: 'failed', hint: 'Failed to fetch tree', error: error };
    }

    this.notifySubscribers(['tree', 'tabs', 'doc']);
  };

  addSpecialTreeNodes = (): void => {
    this._treeNodes = [SPECIAL_NODES.HOME, ...this._treeNodes, SPECIAL_NODES.SETTINGS];
    this._treeNodesMap.set(SPECIAL_NODES.HOME.id, SPECIAL_NODES.HOME);
    this._treeNodesMap.set(SPECIAL_NODES.SETTINGS.id, SPECIAL_NODES.SETTINGS);
  };

  loadTreeAndDocsAsync = async (): Promise<void> => {
    await this.loadTreeAsync();
    await this.loadTreeStateAsync();
    await this.loadDocsStateAsync();

    this.notifySubscribers(['tree', 'tabs', 'doc']);
  };

  moveTreeNodeAsync = async (payload: MoveNodePayload): Promise<void> => {
    await moveTreeNodeAsync(this.httpClient, payload);
  };

  //#region crud operations

  createFolderAsync = async ({ moduleId, folderId }: CreateFolderArgs): Promise<void> => {
    await this.modalApi.showModalFormAsync({
      title: 'Create Folder',
      formId: FORMS.CREATE_FOLDER,
      formArguments: {
        moduleId: moduleId,
        folderId: folderId,
      },
    });
    await this.loadTreeAsync();
    // TODO: select created folder
  };

  deleteFolderAsync = async (node: FolderTreeNode): Promise<void> => {
    if (!await this.modalApi.confirmYesNo({ title: 'Confirm Deletion', content: `Are you sure you want to delete '${node.name}'?` }))
      return;

    try {
      await deleteFolderAsync(this.httpClient, { folderId: node.id });
      // TODO: change selection, update tabs if required (opened items may be deleted)
      await this.loadTreeAsync();
    } catch (error) {
      console.error(`Failed to delete folder '${node.name}' (id: '${node.id}')`, error);
    }
  };

  renameFolderAsync = async (node: FolderTreeNode): Promise<void> => {
    try {
      await this.modalApi.showModalFormAsync({
        title: 'Rename Folder',
        formId: FORMS.RENAME_FOLDER,
        formArguments: {
          folderId: node.id,
          name: node.name,
        },
      });

      await this.loadTreeAsync();
    } catch (error) {
      console.error(`Failed to rename folder '${node.name}' (id: '${node.id}')`, error);
    }
  };

  reloadDocumentAsync = async (docId: string): Promise<void> => {
    const doc = this.getDocumenById(docId);
    if (!doc)
      return;

    this.log('reloadItemAsync', docId);
    await doc.reloadDocumentAsync();
  };

  createItemAsync = async ({ moduleId, folderId, itemType, prevItemId }: CreateItemArgs): Promise<void> => {
    this.log(`create item of type '${itemType}'`, { moduleId, folderId });

    const definition = this.getItemTypeDefinition(itemType);
    if (!definition.createFormId)
      throw new Error(`Create form is not specified for item type '${itemType}'`);

    const response = await this.modalApi.showModalFormAsync<CreateItemResponse>({
      title: `Create ${definition.friendlyName}`,
      formId: definition.createFormId,
      footerButtons: definition.editor?.createModalFooterButtons ?? 'default',
      formArguments: {
        moduleId: moduleId,
        folderId: folderId,
        prevItemId: prevItemId,
        itemType: itemType,
      },
    });
    await this.loadTreeAsync();

    if (!isNullOrWhiteSpace(response?.id)) {
      const treeNode = this._treeNodesMap.get(response.id);

      if (treeNode && isConfigItemTreeNode(treeNode)) {
        if (isDefined(treeNode.parentId) && !(this.isTreeNodeExpanded(treeNode.parentId))) {
          this.expandTreeNode(treeNode.parentId);
        }

        // load item, add new tab and select
        const newTab = await this.createNewCiTabAsync(treeNode);

        // select new tab
        await this.selectTabAsync(newTab);
        this.notifySubscribers(['tabs']);
      } else
        console.error(`Tree node not found for a new item with id = '${response.id}'. Item type = '${itemType}'`);
    } else
      console.error(`Item creation API didn't return expected id of a new item. Item type = '${itemType}'`);
  };

  deleteItemAsync = async (node: ConfigItemTreeNode): Promise<void> => {
    const definition = this.getItemTypeDefinition(node.itemType);
    if (!await this.modalApi.confirmYesNo({ title: 'Confirm Deletion', content: `Are you sure you want to delete ${definition.friendlyName} '${node.name}'?` }))
      return;

    const docId = node.id;
    try {
      await deleteConfigurationItemAsync(this.httpClient, { itemId: docId });

      if (this.isDocOpened(docId))
        this.closeDocumentAsync(docId);

      await this.loadTreeAsync();
    } catch (error) {
      console.error(`Failed to delete ${definition.friendlyName} '${node.name}' (id: '${docId}')`, error);
    }
  };

  renameItemAsync = async (node: ConfigItemTreeNode): Promise<void> => {
    try {
      const definition = this.getItemTypeDefinition(node.itemType);
      if (!isDefined(definition.renameFormId))
        throw new Error("Rename form is not configured for item type '" + node.itemType + "'");

      await this.modalApi.showModalFormAsync({
        title: `Rename ${definition.friendlyName}`,
        formId: definition.renameFormId,
        formArguments: {
          itemId: node.id,
          name: node.name,
        },
      });

      await this.loadTreeAndDocsAsync();
    } catch (error) {
      console.error(`Failed to rename folder '${node.name}' (id: '${node.id}')`, error);
    }
  };

  duplicateItemAsync = async (node: ConfigItemTreeNode): Promise<void> => {
    const definition = this.getItemTypeDefinition(node.itemType);
    try {
      const response = await duplicateItemAsync(this.httpClient, { itemId: node.id });
      if (!response.success)
        return;

      await this.loadTreeAsync();
      const duplicateId = response.result?.itemId;

      if (!isNullOrWhiteSpace(duplicateId)) {
        const treeNode = this._treeNodesMap.get(duplicateId);

        if (treeNode && isConfigItemTreeNode(treeNode)) {
          if (isDefined(treeNode.parentId) && !(this.isTreeNodeExpanded(treeNode.parentId))) {
            this.expandTreeNode(treeNode.parentId);
          }

          // load item, add new tab and select
          const newTab = await this.createNewCiTabAsync(treeNode);

          // select new tab
          await this.selectTabAsync(newTab);
          this.notifySubscribers(['tabs']);
        } else
          console.error(`Tree node not found for a new item with id = '${duplicateId}'. Item type = '${node.itemType}'`);
      } else
        console.error(`Item creation API didn't return expected id of a new item. Item type = '${node.itemType}'`);
    } catch (error) {
      this.showError(`Failed to duplicate ${definition.friendlyName} '${node.name}'`, error);
    }
  };

  showRevisionHistoryAsync = (node: ConfigItemTreeNode): Promise<void> => {
    const doc = this.getDocumenById(node.id);
    if (!doc)
      return Promise.reject(`Document with id = '${node.id}' not found`);

    doc.isHistoryVisible = true;
    this.notifySubscribers(['doc']);

    return Promise.resolve();
  };

  hideRevisionHistoryAsync = (docId: string): Promise<void> => {
    const doc = this.getDocumenById(docId);
    if (!doc)
      return Promise.reject(`Document with id = '${docId}' not found`);

    doc.isHistoryVisible = false;
    this.notifySubscribers(['doc']);

    return Promise.resolve();
  };

  exposeExistingAsync = async ({ moduleId, folderId }: ExposeArgs): Promise<void> => {
    await this.modalApi.showModalFormAsync({
      title: 'Expose Configuration',
      formId: FORMS.EXPOSE_EXISTING,
      formArguments: {
        moduleId: moduleId,
        folderId: folderId,
      },
    });
    await this.loadTreeAsync();
  };

  importPackageAsync = async (_args: ImportPackageArgs): Promise<void> => {
    const importerRef = createManualRef<IImportInterface | undefined>(undefined);

    const exported = await this.modalApi.showModalContentAsync<boolean>(({ resolve, removeModal }) => {
      const hideModal = (): void => {
        resolve(false);
        removeModal();
      };

      const onImported = (): void => {
        removeModal();
        resolve(true);
      };
      return {
        title: 'Import Configuration',
        content: <ConfigurationItemsImport onImported={onImported} importRef={importerRef} />,
        footer: <ConfigurationItemsImportFooter hideModal={hideModal} importerRef={importerRef} />,
      };
    });

    if (exported === true)
      await this.loadTreeAsync();
  };

  exportPackageAsync = async (_args: ExportPackageArgs): Promise<void> => {
    const exporterRef = createManualRef<IExportInterface | undefined>(undefined);

    const exported = await this.modalApi.showModalContentAsync<boolean>(({ resolve, removeModal }) => {
      const hideModal = (): void => {
        resolve(false);
        removeModal();
      };

      const onExported = (): void => {
        removeModal();
        resolve(true);
      };
      return {
        title: 'Export Configuration',
        content: (<ConfigurationItemsExport exportRef={exporterRef} onExported={onExported} />),
        footer: (<ConfigurationItemsExportFooter hideModal={hideModal} exporterRef={exporterRef} />),
      };
    });

    if (exported === true)
      await this.loadTreeAsync();
  };

  //#endregion

  showError = (errorMessage: string, _error?: unknown): void => {
    this.notificationApi.error({ message: errorMessage });
  };

  getTreeNodeById = (itemId: string): TreeNode | undefined => {
    return this._treeNodesMap.get(itemId);
  };

  get selectedNodeId(): string | undefined {
    return this._selectedNodeId;
  };

  get treeNodes(): TreeNode[] {
    return this._treeNodes;
  }

  getDocIdFromRoute = (): string | undefined => {
    const { docId } = this.shaRouter.router.query;
    return docId && typeof (docId) === 'string' && !isNullOrWhiteSpace(docId)
      ? docId
      : undefined;
  };

  navigateAfterInitAsync = async (): Promise<void> => {
    // get id of the document from the router and open tab
    const docId = this.getDocIdFromRoute();
    if (docId) {
      // open document
      await this.openDocumentByIdAsync(docId);
    } else {
      // if docId is not provided - check opened tabs and select first one
      const doc = this.docs.at(0);
      if (doc) {
        await this.navigateToDocumentAsync(doc.itemId);
      } else {
        // open home page
        // await this.openDocById('home');
      }
    }
  };

  init = async (): Promise<void> => {
    this.log('CS: initialization');

    await this.loadItemTypesAsync();
    await this.loadTreeAndDocsAsync();
    await this.navigateAfterInitAsync();

    this.log('CS: initialization - done');
  };
}
