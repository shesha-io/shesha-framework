import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { getEntityTypeIdentifierQueryParams, isEntityTypeIdentifier } from "../../providers/metadataDispatcher/entities/utils";
import { DeleteFileArgs, DownloadFileArgs, DownloadZipByIdsArgs, DownloadZipByOwnerArgs, FileListReference, FileReference, ReplaceFilePayload, STORED_FILE_URLS, UploadFileAsAttachmentArgs, UploadFileArgs } from "./models";
import { HttpClientApi, HttpResponse } from "@/publicJsApis/httpClient";
import { extractAjaxResponse, IAjaxResponse } from "@/interfaces";
import { buildUrl } from "@/utils";
import FileSaver from 'file-saver';
import * as FileApiModels from './api-models';
import { StoredFileDto } from "./api-models";
import { getFileNameFromResponse } from "@/utils/fetchers";
import { validateFileReference } from './utils';

const DEFAULT_ZIP_FILENAME = "files.zip";
const DEFAULT_FILENAME = "file";

export interface IStoredFileHelper {
  uploadFileAsync: (payload: UploadFileArgs) => Promise<StoredFileDto>;
  uploadFileAsAttachmentAsync: (payload: UploadFileAsAttachmentArgs) => Promise<StoredFileDto>;
  replaceFileAsync: (payload: ReplaceFilePayload) => Promise<StoredFileDto>;
  downloadZipByOwnerAsync: (payload: DownloadZipByOwnerArgs) => Promise<void>;
  downloadZipByIdsAsync: (payload: DownloadZipByIdsArgs) => Promise<void>;
  deleteFileByIdAsync: (fileId: string) => Promise<void>;
  deleteFileByReferenceAsync: (fileReference: FileReference) => Promise<void>;
  downloadFileAsync: (payload: DownloadFileArgs) => Promise<void>;
  downloadFileBase64Async: (fileId: string) => Promise<string>;
  fetchFilesListAsync: (filesReference: FileListReference) => Promise<StoredFileDto[]>;
  fetchFileInfoByIdAsync: (fileId: string) => Promise<StoredFileDto>;
  fetchFileInfoByReferenceAsync: (fileReference: FileReference) => Promise<StoredFileDto>;
}

export class StoredFileHelper implements IStoredFileHelper {
  #httpClient: HttpClientApi;

  constructor(httpClient: HttpClientApi) {
    this.#httpClient = httpClient;
  }

  uploadFileAsync = async (payload: UploadFileArgs): Promise<StoredFileDto> => {
    const { file, id, ownerId, ownerType, propertyName } = payload;

    const formData = new FormData();
    formData.append('file', file);

    if (isDefined(id))
      formData.append('id', id);
    if (isDefined(ownerId))
      formData.append('ownerId', ownerId);
    if (isDefined(ownerType)) {
      if (isEntityTypeIdentifier(ownerType)) {
        formData.append('ownerType.name', ownerType.name);
        formData.append('ownerType.module', ownerType.module ?? "");
      } else {
        formData.append('ownerType.entityType', ownerType);
      }
    }
    if (!isNullOrWhiteSpace(propertyName))
      formData.append('propertyName', propertyName);

    const response = await this.#httpClient.put<IAjaxResponse<StoredFileDto>>(STORED_FILE_URLS.UPLOAD_FILE, formData);
    const responseFile = extractAjaxResponse(response.data);
    return responseFile;
  };

  deleteFileByReferenceAsync = async (fileReference: FileReference): Promise<void> => {
    validateFileReference(fileReference);
    const url = buildUrl<FileApiModels.DeleteFileByReferencePayload>(STORED_FILE_URLS.DELETE_FILE_BY_REFERENCE, {
      ownerId: fileReference.ownerId,
      ownerType: fileReference.ownerType,
      propertyName: fileReference.propertyName,
    });
    const response = await this.#httpClient.delete<IAjaxResponse<void>>(url);
    extractAjaxResponse(response.data);
  };

  fetchFileInfoByIdAsync = async (fileId: string): Promise<StoredFileDto> => {
    if (isNullOrWhiteSpace(fileId))
      throw new Error('fileId is required');
    const url = buildUrl(STORED_FILE_URLS.GET_FILE_INFO_BY_ID, { id: fileId });
    const response = await this.#httpClient.get<IAjaxResponse<StoredFileDto>>(url);
    return extractAjaxResponse(response.data);
  };

  fetchFileInfoByReferenceAsync = async (fileReference: FileReference): Promise<StoredFileDto> => {
    validateFileReference(fileReference);

    const url = buildUrl<FileApiModels.GetFileInfoByReferencePayload>(STORED_FILE_URLS.GET_FILE_INFO_BY_REFERENCE, {
      ownerId: fileReference.ownerId,
      ownerType: getEntityTypeIdentifierQueryParams(fileReference.ownerType),
      propertyName: fileReference.propertyName,
    });
    const response = await this.#httpClient.get<IAjaxResponse<StoredFileDto>>(url);
    return extractAjaxResponse(response.data);
  };

  deleteFileByIdAsync = async (fileId: string): Promise<void> => {
    const url = buildUrl<DeleteFileArgs>(STORED_FILE_URLS.DELETE_FILE_BY_ID, { id: fileId });
    const response = await this.#httpClient.delete<IAjaxResponse<void>>(url);
    extractAjaxResponse(response.data);
  };

  uploadFileAsAttachmentAsync = async (payload: UploadFileAsAttachmentArgs): Promise<StoredFileDto> => {
    const { file, ownerId, ownerType, ownerName, filesCategory } = payload;

    const formData = new FormData();
    formData.append('file', file);

    if (isDefined(ownerId))
      formData.append('ownerId', ownerId);
    if (isDefined(ownerType)) {
      if (isEntityTypeIdentifier(ownerType)) {
        formData.append('ownerType.name', ownerType.name);
        formData.append('ownerType.module', ownerType.module ?? "");
      } else {
        formData.append('ownerType.entityType', ownerType);
      }
    }
    if (!isNullOrWhiteSpace(ownerName))
      formData.append('ownerName', ownerName);
    if (!isNullOrWhiteSpace(filesCategory))
      formData.append('filesCategory', `${filesCategory}`);

    const response = await this.#httpClient.post<IAjaxResponse<StoredFileDto>>(STORED_FILE_URLS.UPLOAD_FILE_AS_ATTACHMENT, formData);
    const responseFile = extractAjaxResponse(response.data);
    return responseFile;
  };

  replaceFileAsync = async (payload: ReplaceFilePayload): Promise<StoredFileDto> => {
    const { file, fileId } = payload;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', fileId);

    const response = await this.#httpClient.post<IAjaxResponse<StoredFileDto>>(STORED_FILE_URLS.REPLACE_FILE, formData);

    return extractAjaxResponse(response.data);
  };

  downloadZipByOwnerAsync = async ({ ownerId, ownerType, filesCategory, ownerName }: DownloadZipByOwnerArgs): Promise<void> => {
    const url = buildUrl(STORED_FILE_URLS.DOWNLOAD_ZIP, { ownerId, ownerType, filesCategory, ownerName });
    const response = await this.#httpClient.get(url, { responseType: 'blob' });
    this.saveFile(response, DEFAULT_ZIP_FILENAME);
  };

  saveFile = (response: HttpResponse, defaultFileName?: string): void => {
    const fileName = getFileNameFromResponse(response);
    FileSaver.saveAs(new Blob([response.data]), !isNullOrWhiteSpace(fileName) ? fileName : defaultFileName ?? DEFAULT_FILENAME);
  };

  downloadZipByIdsAsync = async (payload: DownloadZipByIdsArgs): Promise<void> => {
    const url = buildUrl<FileApiModels.DownloadZipByIdsPayload>(STORED_FILE_URLS.DOWNLOAD_ZIP, { filesId: payload.filesId });
    const response = await this.#httpClient.get(url, { responseType: 'blob' });
    this.saveFile(response, DEFAULT_ZIP_FILENAME);
  };

  downloadFileAsync = async (payload: DownloadFileArgs): Promise<void> => {
    const url = buildUrl<FileApiModels.DownloadFilePayload>(STORED_FILE_URLS.DOWNLOAD_FILE, { id: payload.fileId, versionNo: payload.versionNo });
    const response = await this.#httpClient.get(url, { responseType: 'blob' });
    this.saveFile(response, payload.fileName);
  };

  downloadFileBase64Async = async (fileId: string): Promise<string> => {
    const url = buildUrl<FileApiModels.DownloadFileBase64Payload>(STORED_FILE_URLS.DOWNLOAD_FILE_BASE64, { id: fileId });
    const response = await this.#httpClient.get<IAjaxResponse<FileApiModels.DownloadFileBase64Response>>(url);
    const responseData = extractAjaxResponse(response.data);
    return responseData.base64String;
  };

  fetchFilesListAsync = async (filesReference: FileListReference): Promise<StoredFileDto[]> => {
    const url = buildUrl<FileApiModels.FilesListPayload>(STORED_FILE_URLS.FILES_LIST, {
      ownerId: filesReference.ownerId,
      ownerType: getEntityTypeIdentifierQueryParams(filesReference.ownerType),
      ownerName: filesReference.ownerName,
      filesCategory: filesReference.filesCategory });

    const response = await this.#httpClient.get<IAjaxResponse<StoredFileDto[]>>(url);
    return extractAjaxResponse(response.data);
  };
}
