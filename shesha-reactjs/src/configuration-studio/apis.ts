import { HttpClientApi } from "@/providers";
import { FlatTreeNode, ItemTypeBackendDefinition } from "./models";
import { IAjaxResponse } from "@/interfaces";
import { IAbpWrappedResponse } from "@/interfaces/gql";
import { AxiosResponse } from "axios";
import qs from "qs";

export const CS_URLS = {
    GET_FLAT_TREE: '/api/services/app/ConfigurationStudio/GetFlatTree',
    FOLDER_CREATE: '/api/services/app/ConfigurationStudio/CreateFolder',
    FOLDER_DELETE: '/api/services/app/ConfigurationStudio/DeleteFolder',
    MOVE_NODE_TO_FOLDER: '/api/services/app/ConfigurationStudio/MoveNodeToFolder',
    REORDER_NODE: '/api/services/app/ConfigurationStudio/ReorderNode',
    GET_ITEM_TYPES: '/api/services/app/ConfigurationStudio/GetAvailableItemTypes',
    ITEM_DELETE: '/api/services/app/ConfigurationStudio/DeleteItem',
    ITEM_DUPLICATE: '/api/services/app/ConfigurationStudio/DuplicateItem',
    GET_ITEM_REVISION_HISTORY: '/api/services/app/ConfigurationStudio/GetItemRevisions',
};

//#region Reorder node
export type ReorderNodePayload = {
    nodeType: number;
    dragNodeId: string;
    dropNodeId: string;
    dropPosition: number;
};

export const reorderTreeNodeAsync = (httpClient: HttpClientApi, payload: ReorderNodePayload): Promise<IAbpWrappedResponse<MoveNodeResponse>> => {
    return httpClient.post<ReorderNodePayload, AxiosResponse<IAbpWrappedResponse<MoveNodeResponse>>>(CS_URLS.REORDER_NODE, payload).then(response => response.data);
};
//#endregion

//#region Move Tree Node
export type MoveNodePayload = {
    nodeType: number;
    nodeId: string;
    folderId?: string;
};
export type MoveNodeResponse = {

};

export const moveTreeNodeAsync = (httpClient: HttpClientApi, payload: MoveNodePayload): Promise<IAbpWrappedResponse<MoveNodeResponse>> => {
    return httpClient.post<MoveNodePayload, AxiosResponse<IAbpWrappedResponse<MoveNodeResponse>>>(CS_URLS.MOVE_NODE_TO_FOLDER, payload).then(response => response.data);
};
//#endregion

//#region Delete Folder
export type DeleteFolderPayload = {
    folderId: string;
};
export type DeleteFolderResponse = {

};

export const deleteFolderAsync = (httpClient: HttpClientApi, payload: DeleteFolderPayload): Promise<IAbpWrappedResponse<DeleteFolderResponse>> => {
    const url = `${CS_URLS.FOLDER_DELETE}?${qs.stringify(payload)}`;
    return httpClient.delete<DeleteFolderPayload, AxiosResponse<IAbpWrappedResponse<DeleteFolderResponse>>>(url).then(response => response.data);
};
//#endregion

//#region Load Flat Tree

export const fetchFlatTreeAsync = async (httpClient: HttpClientApi): Promise<FlatTreeNode[]> => {
    const response = await httpClient.get<IAjaxResponse<FlatTreeNode[]>>(CS_URLS.GET_FLAT_TREE);
    return response.data.result;
};

//#endregion

//#region Delete Configuration Item

export type DeleteCIPayload = {
    itemId: string;
};
export type DeleteCIResponse = {

};

export const deleteConfigurationItemAsync = (httpClient: HttpClientApi, payload: DeleteCIPayload): Promise<IAbpWrappedResponse<DeleteCIResponse>> => {
    const url = `${CS_URLS.ITEM_DELETE}?${qs.stringify(payload)}`;
    return httpClient.delete<DeleteCIPayload, AxiosResponse<IAbpWrappedResponse<DeleteCIResponse>>>(url).then(response => response.data);
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
    return httpClient.post<DuplicateItemPayload, AxiosResponse<IAbpWrappedResponse<DuplicateItemResponse>>>(CS_URLS.ITEM_DUPLICATE, payload).then(response => response.data);
};
//#endregion

export const fetchItemTypesAsync = async (httpClient: HttpClientApi): Promise<ItemTypeBackendDefinition[]> => {
    const response = await httpClient.get<IAjaxResponse<ItemTypeBackendDefinition[]>>(CS_URLS.GET_ITEM_TYPES);
    return response.data.result;
};