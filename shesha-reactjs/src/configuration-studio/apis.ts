import { HttpClientApi, useHttpClient } from "@/providers";
import { FlatTreeNode, isConfigItemTreeNode, ItemTypeBackendDefinition, TreeNode } from "./models";
import { IAjaxResponse } from "@/interfaces";
import { IAbpWrappedResponse } from "@/interfaces/gql";
import { AxiosResponse } from "axios";
import qs from "qs";
import { useCallback } from "react";
import useSWR, { SWRResponse } from "swr";
import { flatNode2TreeNode } from "./tree-utils";
import { isDefined } from "@/utils/nullables";
import { extractAjaxResponse } from "@/interfaces/ajaxResponse";
import { getFileNameFromResponse } from "@/utils/fetchers";
import FileSaver from "file-saver";

export const CS_URLS = {
  GET_FLAT_TREE: '/api/services/app/ConfigurationStudio/GetFlatTree',
  FOLDER_CREATE: '/api/services/app/ConfigurationStudio/CreateFolder',
  FOLDER_DELETE: '/api/services/app/ConfigurationStudio/DeleteFolder',
  MOVE_NODE_TO_FOLDER: '/api/services/app/ConfigurationStudio/MoveNodeToFolder',
  GET_ITEM_TYPES: '/api/services/app/ConfigurationStudio/GetAvailableItemTypes',
  ITEM_DELETE: '/api/services/app/ConfigurationStudio/DeleteItem',
  ITEM_DUPLICATE: '/api/services/app/ConfigurationStudio/DuplicateItem',
  GET_ITEM_REVISION_HISTORY: '/api/services/app/ConfigurationStudio/GetItemRevisions',
  ITEM_REVISION_RESTORE: '/api/services/app/ConfigurationStudio/RestoreItemRevision',
  REVISION_GET_JSON: '/api/services/app/ConfigurationStudio/GetRevisionJson',
};

//#region Move Tree Node
export type MoveNodePayload = {
  nodeType: number;
  nodeId: string;
  folderId?: string | undefined;
};
export type MoveNodeResponse = void;

export const moveTreeNodeAsync = (httpClient: HttpClientApi, payload: MoveNodePayload): Promise<IAbpWrappedResponse<MoveNodeResponse>> => {
  return httpClient.post<MoveNodePayload, AxiosResponse<IAbpWrappedResponse<MoveNodeResponse>>>(CS_URLS.MOVE_NODE_TO_FOLDER, payload).then((response) => response.data);
};
//#endregion

//#region Delete Folder
export type DeleteFolderPayload = {
  folderId: string;
};
export type DeleteFolderResponse = void;

export const deleteFolderAsync = (httpClient: HttpClientApi, payload: DeleteFolderPayload): Promise<IAbpWrappedResponse<DeleteFolderResponse>> => {
  const url = `${CS_URLS.FOLDER_DELETE}?${qs.stringify(payload)}`;
  return httpClient.delete<DeleteFolderPayload, AxiosResponse<IAbpWrappedResponse<DeleteFolderResponse>>>(url).then((response) => response.data);
};
//#endregion

//#region Load Flat Tree

export const fetchFlatTreeAsync = async (httpClient: HttpClientApi): Promise<FlatTreeNode[]> => {
  const response = await httpClient.get<IAjaxResponse<FlatTreeNode[]>>(CS_URLS.GET_FLAT_TREE);
  return extractAjaxResponse(response.data, "Failed to load tree");
};

export type TreeState = {
  treeNodeMap: Map<string, TreeNode>;
  treeNodes: TreeNode[];
};
const convertFlatTreeToExportTree = (flatTreeNodes: FlatTreeNode[]): TreeState => {
  try {
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

    return {
      treeNodes: treeNodes,
      treeNodeMap: treeNodeMap,
    };
  } catch (error) {
    throw new Error('Failed to convert tree', { cause: error });
  }
};

export const useTreeForExport = (): SWRResponse<TreeState, Error> => {
  const httpClient = useHttpClient();

  const fetcher = useCallback(async (): Promise<TreeState> => {
    const flatTree = await fetchFlatTreeAsync(httpClient);
    return convertFlatTreeToExportTree(flatTree);
  }, [httpClient]);

  const url = CS_URLS.GET_FLAT_TREE;
  return useSWR(url, fetcher, { refreshInterval: 0, revalidateOnFocus: false });
};

//#endregion

//#region Delete Configuration Item

export type DeleteCIPayload = {
  itemId: string;
};
export type DeleteCIResponse = void;

export const deleteConfigurationItemAsync = (httpClient: HttpClientApi, payload: DeleteCIPayload): Promise<IAbpWrappedResponse<DeleteCIResponse>> => {
  const url = `${CS_URLS.ITEM_DELETE}?${qs.stringify(payload)}`;
  return httpClient.delete<DeleteCIPayload, AxiosResponse<IAbpWrappedResponse<DeleteCIResponse>>>(url).then((response) => response.data);
};

//#endregion

//#region Duplicate Item
export type DuplicateItemPayload = {
  itemId: string;
};
export type DuplicateItemResponse = {
  itemId: string;
};

export const duplicateItemAsync = (httpClient: HttpClientApi, payload: DuplicateItemPayload): Promise<IAbpWrappedResponse<DuplicateItemResponse>> => {
  return httpClient.post<DuplicateItemPayload, AxiosResponse<IAbpWrappedResponse<DuplicateItemResponse>>>(CS_URLS.ITEM_DUPLICATE, payload).then((response) => response.data);
};
//#endregion

export const fetchItemTypesAsync = async (httpClient: HttpClientApi): Promise<ItemTypeBackendDefinition[]> => {
  const response = await httpClient.get<IAjaxResponse<ItemTypeBackendDefinition[]>>(CS_URLS.GET_ITEM_TYPES);
  return extractAjaxResponse(response.data);
};

export type RestoreItemRevisionPayload = {
  itemId: string;
  revisionId: string;
};

export const restoreItemRevisionAsync = async (httpClient: HttpClientApi, payload: RestoreItemRevisionPayload): Promise<void> => {
  await httpClient.post<RestoreItemRevisionPayload, IAjaxResponse<void>>(CS_URLS.ITEM_REVISION_RESTORE, payload);
};

export const getRevisionJsonAsync = async (httpClient: HttpClientApi, payload: { id: string }): Promise<void> => {
  const url = `${CS_URLS.REVISION_GET_JSON}?id=${payload.id}`;
  const response = await httpClient.get(url, { responseType: 'blob' });
  const fileName = getFileNameFromResponse(response) ?? 'revision.json';
  FileSaver.saveAs(new Blob([response.data]), fileName);
};
