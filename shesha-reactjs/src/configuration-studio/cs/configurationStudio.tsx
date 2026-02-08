import ConfigurationItemsExport, { IExportInterface } from "@/components/configurationFramework/itemsExport";
import { ConfigurationItemsImport, IImportInterface } from "@/components/configurationFramework/itemsImport";
import { IAjaxResponse } from "@/interfaces";
import { FormFullName, HttpClientApi } from "@/providers";
import { IShaRouter } from "@/providers/shaRouting/contexts";
import { ConfigurationItemsExportFooter } from "@/providers/sheshaApplication/configurable-actions/configuration-items-export";
import { ConfigurationItemsImportFooter } from "@/providers/sheshaApplication/configurable-actions/configuration-items-import";
import { buildUrl } from "@/utils/url";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import React, { MutableRefObject, ReactNode } from "react";
import { isDefined, isNullOrWhiteSpace } from "../../utils/nullables";
import { deleteConfigurationItemAsync, deleteFolderAsync, duplicateItemAsync, fetchFlatTreeAsync, fetchItemTypesAsync, getRevisionJsonAsync, MoveNodePayload, moveTreeNodeAsync, restoreItemRevisionAsync } from "../apis";
import { confirmSaveDocumentAsync } from "../components/save-confirmation";
import {
  CIDocument,
  CloseDocumentResponse,
  ConfigItemTreeNode,
  DocumentBase,
  FolderTreeNode,
  ForceRenderFunc,
  IDocumentInstance,
  isCIDocument,
  isConfigItemTreeNode,
  isFolderTreeNode, isModuleTreeNode, isSpecialTreeNode, ItemTypeDefinition,
  SaveDocumentResponse,
  SpecialTreeNode,
  StoredDocumentInfo,
  TreeNode,
  TreeNodeType,
} from "../models";
import { IAsyncStorage } from "../storage";
import { flatNode2TreeNode, getIcon } from "../tree-utils";
import { CreateFolderArgs, CreateItemArgs, CsSubscriptionType, ExportPackageArgs, ExposeArgs, GetRevisionJsonAsyncArgs, IConfigurationStudio, ImportPackageArgs, ProcessingState, RenameRevisionArgs, RestoreRevisionArgs } from "./interfaces";
import { IModalApi } from "./modalApi";
import { INotificationApi } from "./notificationApi";
import { createManualRef } from "./utils";
import { IConfigurationStudioEnvironment } from "../cs-environment/interfaces";

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
    itemType: 'home',
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
    itemType: 'settings',
  },
};

type IndexedItem<T> = {
  value: T;
  originalIndex: number;
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

export type ForceUpdateTrigger = () => void;

interface ConfigurationStudioArguments {
  forceRootUpdate: ForceUpdateTrigger;
  csEnvironment: IConfigurationStudioEnvironment;
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

  csEnvironment: IConfigurationStudioEnvironment;

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
    this.csEnvironment = args.csEnvironment;
    this.httpClient = args.httpClient;
    this.modalApi = args.modalApi;
    this.notificationApi = args.notificationApi;
    this.storage = args.storage;
    // eslint-disable-next-line no-console
    this.log = args.logEnabled ? console.log : () => {};
    this.treeLoadingState = { status: 'waiting' };
    this.subscriptions = new Map<CsSubscriptionType, Set<CsSubscription>>();
    this.toolbarRef = args.toolbarRef;
    this.shaRouter = args.shaRouter;
    this.rootPath = this.shaRouter.router.path;
  }

  get hasUnsavedChanges(): boolean {
    return this.docs.some((doc) => doc.isDataModified);
  };

  confirmNavigation = (newUrl: string): boolean => {
    const csRoute = this.shaRouter.router.path;
    const leaveCs = !newUrl.startsWith(csRoute);

    const confirmationRequired = this.hasUnsavedChanges && leaveCs;
    return !confirmationRequired || window.confirm("You have unsaved changes that will be lost.");
  };

  reorderDocumentsAsync = async (fromIndex: number, toIndex: number): Promise<void> => {
    const doc = this.docs[fromIndex];
    if (!doc)
      throw new Error("Could not find document to move");

    const newDocs = [...this.docs];
    newDocs.splice(fromIndex, 1);
    newDocs.splice(toIndex, 0, doc);
    this.docs = newDocs;
    this.notifySubscribers(["tabs"]);

    await this.saveOpenedDocsAsync();
  };

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
    if (!await this.modalApi.confirmYesNoAsync({ title: 'Confirm Revision Restore', content: `Are you sure you want to restore revision '${args.revisionFriendlyName}'?` }))
      return false;
    await restoreItemRevisionAsync(this.httpClient, { itemId: args.itemId, revisionId: args.revisionId });
    return true;
  };

  downloadRevisionJsonAsync = async (args: GetRevisionJsonAsyncArgs): Promise<void> => {
    await getRevisionJsonAsync(this.httpClient, { id: args.id });
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
        const definition = this.csEnvironment.getDocumentDefinition(node.itemType);
        if (!definition)
          return undefined;

        return definition.documentInstanceFactory({
          // cs: this,
          itemId: d.itemId,
          discriminator: node.discriminator,
          label: node.name,
          moduleId: node.moduleId,
          moduleName: node.moduleName,
          flags: node.flags,
        });
      }

      if (isSpecialTreeNode(node)) {
        const definition = this.csEnvironment.getDocumentDefinition(node.id);
        if (!definition)
          return undefined;

        return definition.documentInstanceFactory({
          itemId: d.itemId,
          discriminator: node.itemType,
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

    const definition = this.csEnvironment.getDocumentDefinition(node.itemType);
    if (!definition)
      throw new Error(`Unsupported item type: '${node.itemType}'`);

    const newDocument = definition.documentInstanceFactory({
      itemId: node.id,
      discriminator: node.discriminator,
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

    const definition = this.csEnvironment.getDocumentDefinition(node.id);
    if (!definition)
      throw new Error(`Unknown special document: '${node.id}'`);

    const newDocument = definition.documentInstanceFactory({
      itemId: node.id,
      discriminator: node.itemType,
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

  closeDocumentAsync = async (docId: string, confirmUnsavedChanges: boolean, activateNextTab: boolean): Promise<CloseDocumentResponse> => {
    if (!this.isDocOpened(docId))
      return 'closed';

    if (confirmUnsavedChanges) {
      const doc = this.findDocumentById(docId);
      if (isDefined(doc) && isCIDocument(doc) && doc.isDataModified) {
        await this.navigateToDocumentAsync(doc.itemId);
        const result = await this.confirmSaveDocumentAsync(doc.itemId);
        if (result === 'cancel')
          return 'cancelled';
      }
    }

    const index = this.docs.findIndex((t) => t.itemId === docId);
    const isActive = this.activeDocId === docId;

    this.docs = this.docs.filter((t) => t.itemId !== docId);

    await this.saveOpenedDocsAsync();
    this.notifySubscribers(['tabs', 'doc']);

    // if the document was active - activate next if available
    if (activateNextTab || isActive) {
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
    return 'closed';
  };

  closeMultipleDocumentsAsync = async (predicate: (doc: IDocumentInstance, index: number) => boolean, confirmUnsavedChanges: boolean): Promise<void> => {
    const activeDoc = this.activeDocument;
    // build list of reversed docs with active one on top of it
    const indexedDocs = this.docs.map<IndexedItem<IDocumentInstance>>((d, idx) => ({ value: d, originalIndex: idx }));
    if (activeDoc) {
      const activeDocIndex = indexedDocs.findIndex((d) => d.value === activeDoc);
      const [activeDocElement] = indexedDocs.splice(activeDocIndex, 1);
      if (activeDocElement)
        indexedDocs.push(activeDocElement);
    }
    indexedDocs.reverse();

    const docsToClose = indexedDocs.filter((item) => predicate(item.value, item.originalIndex)).map((item) => item.value);

    const last = docsToClose.at(-1);
    for (const doc of docsToClose) {
      const closeResponse = await this.closeDocumentAsync(doc.itemId, confirmUnsavedChanges, doc === last);
      if (closeResponse === 'cancelled')
        return;
    }
  };

  confirmSaveDocumentAsync = async (docId: string): Promise<SaveDocumentResponse | undefined> => {
    const doc = this.findDoc(docId);
    if (doc && doc.isDataModified) {
      return await confirmSaveDocumentAsync(doc, this.modalApi);
    }
    return undefined;
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
      const frontEndDefinition = this.csEnvironment.getDocumentDefinition(it.itemType);
      const definition: ItemTypeDefinition = {
        itemType: it.itemType,
        discriminator: it.discriminator,
        entityClassName: it.entityClassName,
        friendlyName: it.friendlyName,
        createFormId: it.createFormId,
        renameFormId: it.renameFormId,
        // front-end specific
        icon: getIcon(
          this.csEnvironment,
          TreeNodeType.ConfigurationItem,
          it.itemType,
          false,
        ),
        editor: frontEndDefinition,
      };
      this._itemTypes.push(definition);
      this._itemTypesMap.set(it.discriminator, definition);
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
        treeNodeMap.set(node.id, flatNode2TreeNode(this.csEnvironment, node));
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
    if (node.children.length > 0) {
      await this.modalApi.warning({
        title: 'Delete Folder',
        content: (
          <div>
            The folder &quot;{node.name}&quot; cannot be deleted while it contains items.
          </div>
        ),
      });
      return;
    }
    if (!await this.modalApi.confirmYesNoAsync({ title: 'Confirm Deletion', content: `Are you sure you want to delete '${node.name}'?` }))
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

  createItemAsync = async ({ moduleId, folderId, itemType, discriminator, prevItemId }: CreateItemArgs): Promise<void> => {
    this.log(`create item of type '${itemType}'`, { moduleId, folderId });

    const definition = this.getItemTypeDefinition(discriminator);
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
        discriminator: discriminator,
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
    const definition = this.getItemTypeDefinition(node.discriminator);
    if (!await this.modalApi.confirmYesNoAsync({ title: 'Confirm Deletion', content: `Are you sure you want to delete ${definition.friendlyName} '${node.name}'?` }))
      return;

    const docId = node.id;
    try {
      await deleteConfigurationItemAsync(this.httpClient, { itemId: docId });

      if (this.isDocOpened(docId))
        await this.closeDocumentAsync(docId, false, true);

      await this.loadTreeAsync();
    } catch (error) {
      console.error(`Failed to delete ${definition.friendlyName} '${node.name}' (id: '${docId}')`, error);
    }
  };

  renameItemAsync = async (node: ConfigItemTreeNode): Promise<void> => {
    try {
      const definition = this.getItemTypeDefinition(node.discriminator);
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
    const definition = this.getItemTypeDefinition(node.discriminator);
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

  setDocumentModified = (docId: string, isModified: boolean): void => {
    const doc = this.getDocumenById(docId);
    if (doc && doc.isDataModified !== isModified) {
      doc.isDataModified = isModified;
      this.notifySubscribers(['doc', 'tabs']);
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
