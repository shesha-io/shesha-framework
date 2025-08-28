import { FormFullName, HttpClientApi } from "@/providers";
import { moveTreeNodeAsync, MoveNodePayload, reorderTreeNodeAsync, ReorderNodePayload, fetchFlatTreeAsync, deleteFolderAsync, fetchItemTypesAsync, deleteConfigurationItemAsync, duplicateItemAsync } from "../apis";
import { ConfigItemTreeNode, FolderTreeNode, ForceRenderFunc, IDocumentInstance, isConfigItemTreeNode, ItemTypeDefinition, TreeNode, TreeNodeType } from "../models";
import { IErrorInfo } from "@/interfaces";
import { DocumentDefinition, DocumentDefinitions, CIDocument, DocumentBase, StoredDocumentInfo } from "../models";
import { IAsyncStorage } from "../storage";
import { IModalApi } from "./modalApi";
import { flatNode2TreeNode, getIcon } from "../tree-utils";
import { INotificationApi } from "./notificationApi";
import { MutableRefObject } from "react";
import { getUnknownDocumentDefinition } from "../document-definitions/configurable-editor/genericDefinition";
import ConfigurationItemsExport, { IExportInterface } from "@/components/configurationFramework/itemsExport";
import React from "react";
import { ConfigurationItemsExportFooter } from "@/providers/sheshaApplication/configurable-actions/configuration-items-export";
import { createManualRef } from "./utils";
import ConfigurationItemsImport, { IImportInterface } from "@/components/configurationFramework/itemsImport";
import { ConfigurationItemsImportFooter } from "@/providers/sheshaApplication/configurable-actions/configuration-items-import";

export type LoadingStatus = 'waiting' | 'loading' | 'ready' | 'failed';
export interface ProcessingState {
    status: LoadingStatus;
    hint?: string;
    error?: IErrorInfo;
}

type DynamicProperties<K extends string | number | symbol, T> = {
    [P in K]: T;
};

type FormIds = 'CREATE_FOLDER' | 'RENAME_FOLDER' | 'EXPOSE_EXISTING';

const FORMS: DynamicProperties<FormIds, FormFullName> = {
    // TODO: move to metadata
    CREATE_FOLDER: { module: 'Shesha', name: 'cs-folder-create' },
    RENAME_FOLDER: { module: 'Shesha', name: 'cs-folder-rename' },
    EXPOSE_EXISTING: { module: 'Shesha', name: 'cs-expose-existing' },
};

const STORAGE_KEYS = {
    OPENED_DOCS: 'openedDocs',
    ACTIVE_DOC_ID: 'activeDocId',
    TREE_EXPANDED_KEYS: 'treeExpandedKeys',
    TREE_SELECTION: 'treeSelection',
};

interface CreateItemResponse {
    id: string;
};

export type CsSubscription = (cs: IConfigurationStudio) => void;
export type CsSubscriptionType = 'tree' | 'tabs' | 'doc';

export type CreateFolderArgs = {
    moduleId: string;
    folderId?: string;
};
export type CreateItemArgs = {
    moduleId: string;
    folderId?: string;
    prevItemId?: string;
    itemType: string;
};

export type ExposeArgs = {
    moduleId: string;
    folderId?: string;
};
export type ImportPackageArgs = {
    moduleId: string;
    folderId?: string;
};
export type ExportPackageArgs = {
    moduleId: string;
    folderId?: string;
};

export interface IConfigurationStudio {
    readonly treeNodes?: TreeNode[];
    readonly treeLoadingState: ProcessingState;
    readonly treeExpandedKeys: React.Key[];
    readonly treeSelectedKeys: React.Key[];
    readonly treeSelectedItemNode?: ConfigItemTreeNode;

    readonly itemTypes: ItemTypeDefinition[];
    toolbarRef?: MutableRefObject<any>;
    setDocumentToolbarRerenderer: (itemId: string, forceRender: ForceRenderFunc) => void;

    onTreeNodeExpand: (expandedKeys: React.Key[]) => void;

    loadTreeAsync: () => Promise<void>;
    moveTreeNodeAsync: (payload: MoveNodePayload) => Promise<void>;
    reorderTreeNodeAsync: (payload: ReorderNodePayload) => Promise<void>;
    subscribe(type: CsSubscriptionType, callback: () => void): () => void;

    //#region selection and tabs
    selectTreeNode: (node?: TreeNode) => void;
    docs: IDocumentInstance[];
    activeDocId?: string;
    activeDocument?: IDocumentInstance;

    openDocById: (docId?: string) => void;
    removeTabAsync: (docId?: string) => void;
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
    //#endregion

    //#region document definitions
    registerDocumentDefinition(definition: DocumentDefinition);
    unregisterDocumentDefinition(definition: DocumentDefinition);
    //#endregion
}

export type ForceUpdateTrigger = () => void;

interface ConfigurationStudioArguments {
    forceRootUpdate: ForceUpdateTrigger;
    httpClient: HttpClientApi;
    storage: IAsyncStorage;
    modalApi: IModalApi;
    notificationApi: INotificationApi;
}

export class ConfigurationStudio implements IConfigurationStudio {
    forceRootUpdate: ForceUpdateTrigger;
    private logEnabled: boolean;
    private httpClient: HttpClientApi;
    private modalApi: IModalApi;
    private notificationApi: INotificationApi;
    private storage: IAsyncStorage;
    private subscriptions: Map<CsSubscriptionType, Set<CsSubscription>>;

    toolbarRef?: MutableRefObject<any>;
    findDoc = (itemId?: string): IDocumentInstance | undefined => {
        return itemId
            ? this.docs.find(d => d.itemId === itemId)
            : undefined;
    };

    setDocumentToolbarRerenderer = (itemId: string, forceRender: ForceRenderFunc) => {
        const doc = this.findDoc(itemId);
        if (!doc)
            return;
        doc.toolbarForceRender = forceRender;
    };

    treeLoadingState: ProcessingState;

    private _selectedNodeId?: string;
    private _treeNodes: TreeNode[] = [];
    private _treeNodesMap: Map<string, TreeNode> = new Map<string, TreeNode>();
    private _treeExpandedKeys: React.Key[] = [];

    private _documentDefinitions: DocumentDefinitions;
    private _itemTypes: ItemTypeDefinition[];
    private _itemTypesMap: Map<string, ItemTypeDefinition> = new Map<string, ItemTypeDefinition>();

    docs: IDocumentInstance[] = [];
    activeDocId?: string;
    private getDocumenById = (id: string): IDocumentInstance | undefined => {
        return id
            ? this.docs.find(d => d.itemId === id)
            : undefined;
    };
    get activeDocument(): (IDocumentInstance | undefined) {
        return this.getDocumenById(this.activeDocId);
    };

    constructor(args: ConfigurationStudioArguments) {
        this.forceRootUpdate = args.forceRootUpdate;
        this.httpClient = args.httpClient;
        this.modalApi = args.modalApi;
        this.notificationApi = args.notificationApi;
        this.storage = args.storage;
        this.logEnabled = false;
        this.treeLoadingState = { status: 'waiting' };
        this.subscriptions = new Map<CsSubscriptionType, Set<CsSubscription>>();
        this._documentDefinitions = new Map<string, DocumentDefinition>();
    }

    registerDocumentDefinition = (definition: DocumentDefinition) => {
        // eslint-disable-next-line no-console
        console.log('LOG: register definition ✅', definition);
        this._documentDefinitions.set(definition.documentType, definition);
    };

    unregisterDocumentDefinition = (definition: DocumentDefinition) => {
        // eslint-disable-next-line no-console
        console.log('LOG: unregister definition 🟥', definition);
        this._documentDefinitions.delete(definition.documentType);
    };

    get treeExpandedKeys(): React.Key[] {
        return this._treeExpandedKeys;
    };
    get treeSelectedKeys(): React.Key[] {
        return this._selectedNodeId
            ? [this._selectedNodeId]
            : [];
    };

    get treeSelectedItemNode(): ConfigItemTreeNode | undefined {
        const node = this._selectedNodeId
            ? this._treeNodesMap.get(this._selectedNodeId)
            : undefined;
        return isConfigItemTreeNode(node) ? node : undefined;
    };

    private saveTreeExpandedNodesAsync = async () => {
        this.storage.setAsync(STORAGE_KEYS.TREE_EXPANDED_KEYS, this._treeExpandedKeys);
    };
    private saveTreeSelectionAsync = async () => {
        if (this._selectedNodeId)
            await this.storage.setAsync(STORAGE_KEYS.TREE_SELECTION, this._selectedNodeId.toString());
        else
            await this.storage.removeAsync(STORAGE_KEYS.TREE_SELECTION);
    };
    private loadTreeSelectionAsync = async () => {
        this._selectedNodeId = await this.storage.getAsync(STORAGE_KEYS.TREE_SELECTION);
    };
    private loadTreeExpandedNodesAsync = async () => {
        this._treeExpandedKeys = await this.storage.getAsync(STORAGE_KEYS.TREE_EXPANDED_KEYS) ?? [];
    };
    private loadTreeStateAsync = async () => {
        await this.loadTreeExpandedNodesAsync();
        await this.loadTreeSelectionAsync();
    };
    onTreeNodeExpand = (expandedKeys: React.Key[]) => {
        this._treeExpandedKeys = expandedKeys;
        this.saveTreeExpandedNodesAsync();
        this.notifySubscribers(['tree']);
    };

    doSelectTreeNodeAsync = async (node?: TreeNode) => {
        this._selectedNodeId = node?.key.toString();
        await this.saveTreeSelectionAsync();
        this.notifySubscribers(['tree']);
    };

    selectTreeNode = async (node?: TreeNode) => {
        this.log('selectTreeNode', node);

        await this.doSelectTreeNodeAsync(node);

        if (isConfigItemTreeNode(node) && this.activeDocId !== node.id) {
            const tab = this.findTabById(node.id);
            if (!tab) {
                // load item, add new tab and select
                const newTab = await this.createNewTabAsync(node);
                // select new tab
                this.selectTabAsync(newTab);
            } else {
                this.selectTabAsync(tab);
            }
            this.notifySubscribers(['tabs']);
        }
    };

    //#region documents

    private loadOpenedDocsAsync = async (): Promise<void> => {
        // TODO: check type of stored value, filter/proceess documents taking into account loaded tree nodes
        const docs = await this.storage.getAsync<StoredDocumentInfo[]>(STORAGE_KEYS.OPENED_DOCS) ?? [];

        this.log('Convert restored docs');
        const mappedDocs = docs.map<IDocumentInstance>(d => {
            const node = this.getTreeNodeById(d.itemId);
            if (!isConfigItemTreeNode(node))
                return undefined;

            const definition = this.getDocumentDefinition(node.itemType);
            if (!definition || !definition.documentInstanceFactory)
                return undefined;

            return definition.documentInstanceFactory({
                itemId: d.itemId,
                label: node.name,
            });
        })
            .filter(d => Boolean(d));

        this.docs = mappedDocs;
    };

    private loadDocSelectionAsync = async (): Promise<void> => {
        // TODO: check type of stored value, filter/proceess documents taking into account loaded tree nodes
        this.activeDocId = await this.storage.getAsync(STORAGE_KEYS.ACTIVE_DOC_ID);
    };

    private loadDocsStateAsync = async (): Promise<void> => {
        await this.loadOpenedDocsAsync();
        await this.loadDocSelectionAsync();
    };

    private saveOpenedDocsAsync = async () => {
        const storedData = this.docs.map<StoredDocumentInfo>(d => ({
            itemId: d.itemId,
            label: d.label,
            type: d.type,
        }));
        this.storage.setAsync(STORAGE_KEYS.OPENED_DOCS, storedData);
    };
    private saveDocSelectionAsync = async () => {
        if (this.activeDocId)
            await this.storage.setAsync(STORAGE_KEYS.ACTIVE_DOC_ID, this.activeDocId.toString());
        else
            await this.storage.removeAsync(STORAGE_KEYS.ACTIVE_DOC_ID);
    };

    //#endregion


    //#region tabs

    private createNewTabAsync = async (node: ConfigItemTreeNode): Promise<CIDocument> => {

        this.log(`create tab for item '${node.name}'`);

        const definition = this.getDocumentDefinition(node.itemType);
        if (!definition || !definition.documentInstanceFactory)
            throw new Error(`Unsupported item type: '${node.itemType}'`);

        const newDocument = definition.documentInstanceFactory({
            itemId: node.id,
            label: node.name,
            flags: node.flags,
        });

        this.docs = [...this.docs, newDocument];
        await this.saveOpenedDocsAsync();

        this.notifySubscribers(['tabs']);

        return newDocument;
    };

    private findTabById = (tabId: string): DocumentBase | undefined => {
        return this.docs.find(t => t.itemId === tabId);
    };

    doSelectTabAsync = async (tab?: DocumentBase): Promise<void> => {
        const selectedDocId = tab?.itemId;
        this.activeDocId = selectedDocId;
        await this.saveDocSelectionAsync();

        this.notifySubscribers(['tabs', 'doc']);
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
        if (selectedDocId && this._selectedNodeId !== selectedDocId) {
            const treeNode = this.getTreeNodeById(selectedDocId);
            if (isConfigItemTreeNode(treeNode)) {
                this.selectTreeNode(treeNode);
            }
        }
    };

    openDocById = async (docId?: string): Promise<void> => {
        const tab = docId ? this.findTabById(docId) : undefined;
        await this.selectTabAsync(tab);
    };

    removeTabAsync = async (tabId?: string): Promise<void> => {
        // TODO: check for unsaved changes, ask user to confirm
        // TODO: unload document
        this.docs = this.docs.filter(t => t.itemId !== tabId);
        await this.saveOpenedDocsAsync();
        this.notifySubscribers(['tabs']);
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

    private unsubscribe(type: CsSubscriptionType, callback: CsSubscription) {
        const callbacks = this.getSubscriptions(type);
        callbacks.delete(callback);
    }

    notifySubscribers(types: CsSubscriptionType[]) {
        const allSubscriptions = new Set<CsSubscription>();
        types.forEach(type => {
            const subscriptions = this.getSubscriptions(type);
            subscriptions.forEach(s => allSubscriptions.add(s));
        });

        allSubscriptions.forEach(s => (s(this)));
    }

    //#endregion

    log = (...args) => {
        if (this.logEnabled) {
            // Get the stack trace and extract the caller's location
            // const stack = new Error().stack?.split('\n')[2]?.trim() || '';
            // const normalizedStack = replaceAllSourceUrls(stack);
            //console.log(`%c[cs]`, 'color: blue; font-weight: bold', ...args, `\n${normalizedStack}`);

            // eslint-disable-next-line no-console
            console.trace(`%c[cs]`, 'color: blue; font-weight: bold', ...args);
        }
    };

    get itemTypes(): ItemTypeDefinition[] {
        return this._itemTypes;
    }
    getItemTypeDefinition = (itemType: string): ItemTypeDefinition | undefined => {
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
                    false
                ),
                editor: this._documentDefinitions.get(it.itemType),
            };
            this._itemTypes.push(definition);
            this._itemTypesMap.set(it.itemType, definition);
        });
    };

    loadTreeAsync = async () => {
        this.log('load tree');

        this.treeLoadingState = { status: 'loading', hint: 'Fetching data...', error: null };
        try {
            const flatTreeNodes = await fetchFlatTreeAsync(this.httpClient);
            const treeNodeMap = new Map<string, TreeNode>();
            const treeNodes: TreeNode[] = [];

            // First pass: create map and shallow copies
            flatTreeNodes.forEach(node => {
                treeNodeMap.set(node.id, flatNode2TreeNode(node));
            });

            // Second pass: build hierarchy
            flatTreeNodes.forEach(node => {
                const currentNode = treeNodeMap.get(node.id)!;

                if (node.parentId !== null) {
                    const parent = treeNodeMap.get(node.parentId);
                    if (parent) {
                        parent.children.push(currentNode);
                    }
                } else {
                    treeNodes.push(currentNode);
                }
            });

            this._treeNodes = treeNodes;
            this._treeNodesMap = treeNodeMap;

            this.loadTreeStateAsync();
            this.loadDocsStateAsync();

            this.treeLoadingState = { status: 'ready', hint: null, error: null };
        } catch (error) {
            this.treeLoadingState = { status: 'failed', hint: 'Failed to fetch tree', error: error };
        }

        this.notifySubscribers(['tree', 'tabs', 'doc']);

        this.log('CS: load tree - done');
    };

    moveTreeNodeAsync = async (payload: MoveNodePayload): Promise<void> => {
        await moveTreeNodeAsync(this.httpClient, payload);
    };

    reorderTreeNodeAsync = async (payload: ReorderNodePayload): Promise<void> => {
        await reorderTreeNodeAsync(this.httpClient, payload);
    };

    //#region crud operations

    createFolderAsync = async ({ moduleId, folderId }: CreateFolderArgs): Promise<void> => {
        await this.modalApi.showModalFormAsync({
            title: 'Create Folder',
            formId: FORMS.CREATE_FOLDER,
            formArguments: {
                moduleId: moduleId,
                folderId: folderId,
            }
        });
        await this.loadTreeAsync();
        // TODO: select created folder
    };

    deleteFolderAsync = async (node: FolderTreeNode) => {
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

    renameFolderAsync = async (node: FolderTreeNode) => {
        try {
            await this.modalApi.showModalFormAsync({
                title: 'Rename Folder',
                formId: FORMS.RENAME_FOLDER,
                formArguments: {
                    folderId: node.id,
                    name: node.name,
                }
            });

            await this.loadTreeAsync();
        } catch (error) {
            console.error(`Failed to rename folder '${node.name}' (id: '${node.id}')`, error);
        }
    };

    createItemAsync = async ({ moduleId, folderId, itemType, prevItemId }: CreateItemArgs): Promise<void> => {
        this.log(`create item of type '${itemType}'`, { moduleId, folderId });

        const definition = this.getItemTypeDefinition(itemType);

        const response = await this.modalApi.showModalFormAsync<CreateItemResponse>({
            title: `Create ${definition.friendlyName}`,
            formId: definition.createFormId,
            footerButtons: itemType == "form" ? 'none': 'default',
            formArguments: {
                moduleId: moduleId,
                folderId: folderId,
                prevItemId: prevItemId,
                itemType: itemType,
            }
        });
        await this.loadTreeAsync();

        if (response?.id) {
            const treeNode = this._treeNodesMap.get(response.id);

            if (treeNode && isConfigItemTreeNode(treeNode)) {
                if (treeNode.parentId && !(this._treeExpandedKeys.includes(treeNode.parentId))) {
                    this._treeExpandedKeys.push(treeNode.parentId);
                    this.notifySubscribers(['tree']);
                }

                // load item, add new tab and select
                const newTab = await this.createNewTabAsync(treeNode);
                // select new tab
                this.selectTabAsync(newTab);
            } else
                console.error(`Tree node not found for a new item with id = '${response.id}'. Item type = '${itemType}'`);
        } else
            console.error(`Item creation API didn't return expected id of a new item. Item type = '${itemType}'`);
    };

    deleteItemAsync = async (node: ConfigItemTreeNode): Promise<void> => {
        const definition = this.getItemTypeDefinition(node.itemType);
        if (!await this.modalApi.confirmYesNo({ title: 'Confirm Deletion', content: `Are you sure you want to delete ${definition.friendlyName} '${node.name}'?` }))
            return;

        try {
            await deleteConfigurationItemAsync(this.httpClient, { itemId: node.id });
            // TODO: change selection, update tabs if required (opened items may be deleted)
            await this.loadTreeAsync();
        } catch (error) {
            console.error(`Failed to delete ${definition.friendlyName} '${node.name}' (id: '${node.id}')`, error);
        }

    };

    renameItemAsync = async (node: ConfigItemTreeNode): Promise<void> => {
        try {
            const definition = this.getItemTypeDefinition(node.itemType);

            await this.modalApi.showModalFormAsync({
                title: `Rename ${definition.friendlyName}`,
                formId: definition.renameFormId,
                formArguments: {
                    itemId: node.id,
                    name: node.name,
                }
            });

            await this.loadTreeAsync();
        } catch (error) {
            console.error(`Failed to rename folder '${node.name}' (id: '${node.id}')`, error);
        }
    };

    duplicateItemAsync = async (node: ConfigItemTreeNode): Promise<void> => {
        const definition = this.getItemTypeDefinition(node.itemType);
        try {
            await duplicateItemAsync(this.httpClient, { itemId: node.id });
            await this.loadTreeAsync();
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
            }
        });
        await this.loadTreeAsync();
    };
    importPackageAsync = async (_args: ImportPackageArgs): Promise<void> => {
        const importerRef = createManualRef<IImportInterface>(undefined);

        const exported = await this.modalApi.showModalContentAsync<boolean>(({ resolve, removeModal }) => {
            const hideModal = () => {
                resolve(false);
                removeModal();
            };

            const onImported = () => {
                removeModal();
                resolve(true);
            };
            return {
                title: 'Import Configuration',
                content: <ConfigurationItemsImport onImported={onImported} importRef={importerRef} />,
                footer: <ConfigurationItemsImportFooter hideModal={hideModal} importerRef={importerRef} />
            };
        });

        if (exported)
            await this.loadTreeAsync();
    };
    exportPackageAsync = async (_args: ExportPackageArgs): Promise<void> => {
        const exporterRef = createManualRef<IExportInterface>(undefined);

        const exported = await this.modalApi.showModalContentAsync<boolean>(({ resolve, removeModal }) => {
            const hideModal = () => {
                resolve(false);
                removeModal();
            };

            const onExported = () => {
                removeModal();
                resolve(true);
            };
            return {
                title: 'Export Configuration',
                content: (<ConfigurationItemsExport exportRef={exporterRef} onExported={onExported} />),
                footer: (<ConfigurationItemsExportFooter hideModal={hideModal} exporterRef={exporterRef} />)
            };
        });

        if (exported)
            await this.loadTreeAsync();
    };

    //#endregion

    showError = (errorMessage: string, _error?: any) => {
        this.notificationApi.error({ message: errorMessage });
    };

    getTreeNodeById = (itemId: string): TreeNode | undefined => {
        return this._treeNodesMap.get(itemId);
    };

    get selectedNodeId(): string | null {
        return this._selectedNodeId;
    };
    get treeNodes(): TreeNode[] | null {
        return this._treeNodes;
    }

    init = async () => {
        this.log('CS: initialization');

        await this.loadItemTypesAsync();
        await this.loadTreeAsync();

        this.log('CS: initialization - done');
    };
}