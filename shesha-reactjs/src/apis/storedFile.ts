import { useMutateForEndpoint } from '@/hooks';
import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';

export interface StoredFileDeleteQueryParams {
  /**
   * File Id
   */
  fileId: string;
  /**
   * Id of the owner entity
   */
  ownerId?: string;
  /**
   * Type short alias of the owner entity
   */
  ownerType?: string;
  /**
   * File category
   */
  fileCategory?: string;
  /**
   * Property name of the owner entity. Is used for direct links only (when owner references file using foreign key)
   */
  propertyName?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

/**
 * Stored File version info
 */
export interface StoredFileVersionInfoDto {
  id?: string;
  /**
   * Date of the upload
   */
  dateUploaded?: string | null;
  /**
   * File size
   */
  size?: number | null;
  /**
   * User uploaded this version
   */
  uploadedBy?: string | null;
  /**
   * File name
   */
  fileName?: string | null;
  /**
   * Version number
   */
  versionNo?: number;
  /**
   * Url for version downloading
   */
  url?: string | null;
}

/**
 * File replacement information
 */
export interface StoredFileReplacementDto {
  id?: string;
  newFileId?: string;
  replacedFileId?: string;
  replacedFileName?: string | null;
  replacedFileSize?: number;
  replacedFileType?: string | null;
  replacedFileUrl?: string | null;
  replacementDate?: string;
}

export interface StoredFileDto {
  error?: string | null;
  id?: string | null;
  name?: string | null;
  fileCategory?: string | null;
  url?: string | null;
  size?: number;
  type?: string | null;
  temporary?: boolean;
  isReplaced?: boolean;
  replacementHistory?: StoredFileReplacementDto[] | null;
}

export interface StoredFileGetQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type StoredFileDtoAjaxResponse = IAjaxResponse<StoredFileDto>;

export type UseStoredFileGetProps = Omit<
  UseGetProps<StoredFileDtoAjaxResponse, StoredFileGetQueryParams, void>,
  'path'
>;

export interface StoredFileGetEntityPropertyQueryParams {
  /**
   * Property name of the owner entity. Is used for direct links only (when owner references file using foreign key)
   */
  propertyName?: string;
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type short alias of the owner entity
   */
  ownerType: string;
  /**
   * File category 
   */
  fileCategory?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

/**
 * Get file by id
 */
export const useStoredFileGet = (props: UseStoredFileGetProps) =>
  useGet<StoredFileDtoAjaxResponse, IAjaxResponseBase, StoredFileGetQueryParams, void>(`/api/StoredFile`, props);

export type UseStoredFileGetEntityPropertyProps = Omit<
  UseGetProps<StoredFileDtoAjaxResponse, StoredFileGetEntityPropertyQueryParams, void>,
  'path'
>;

/**
 * Get file as property of the entity
 */
export const useStoredFileGetEntityProperty = (props: UseStoredFileGetEntityPropertyProps) =>
  useGet<StoredFileDtoAjaxResponse, IAjaxResponseBase, StoredFileGetEntityPropertyQueryParams, void>(
    `/api/StoredFile/EntityProperty`,
    props
  );

export interface StoredFileGetFileVersionsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export interface StoredFileGetFileVersionsPathParams {
  /**
   * Id of the file
   */
  fileId: string;
}

export type StoredFileVersionInfoDtoListAjaxResponse = IAjaxResponse<StoredFileVersionInfoDto[] | null>;
export type UseStoredFileGetFileVersionsProps = Omit<
  UseGetProps<
    StoredFileVersionInfoDtoListAjaxResponse,
    StoredFileGetFileVersionsQueryParams,
    StoredFileGetFileVersionsPathParams
  >,
  'path'
> &
  StoredFileGetFileVersionsPathParams;

/**
 * Get versions of the file with specified Id
 */
export const useStoredFileGetFileVersions = ({ fileId, ...props }: UseStoredFileGetFileVersionsProps) =>
  useGet<
    StoredFileVersionInfoDtoListAjaxResponse,
    IAjaxResponseBase,
    StoredFileGetFileVersionsQueryParams,
    StoredFileGetFileVersionsPathParams
  >(
    (paramsInPath: StoredFileGetFileVersionsPathParams) => `/api/StoredFile/StoredFile/${paramsInPath.fileId}/Versions`,
    { pathParams: { fileId }, ...props }
  );

export interface DeleteFileByIdInput {
  id: string;
}
export const useDeleteFileById = () =>
  useMutateForEndpoint<DeleteFileByIdInput>({ url: (data) => `/api/StoredFile?id=${data.id}`, httpVerb: 'DELETE' });

/**
 * Replace file input
 */
export interface ReplaceFileInput {
  fileId: string;
  file: File;
}

/**
 * Get replacement history query params
 */
export interface StoredFileGetReplacementHistoryQueryParams {
  'api-version'?: string;
}

/**
 * Get replacement history path params
 */
export interface StoredFileGetReplacementHistoryPathParams {
  fileId: string;
}

export type StoredFileReplacementDtoListAjaxResponse = IAjaxResponse<StoredFileReplacementDto[] | null>;

export type UseStoredFileGetReplacementHistoryProps = Omit<
  UseGetProps<
    StoredFileReplacementDtoListAjaxResponse,
    StoredFileGetReplacementHistoryQueryParams,
    StoredFileGetReplacementHistoryPathParams
  >,
  'path'
> &
  StoredFileGetReplacementHistoryPathParams;

/**
 * Get replacement history for a file
 */
export const useStoredFileGetReplacementHistory = ({ fileId, ...props }: UseStoredFileGetReplacementHistoryProps) =>
  useGet<
    StoredFileReplacementDtoListAjaxResponse,
    IAjaxResponseBase,
    StoredFileGetReplacementHistoryQueryParams,
    StoredFileGetReplacementHistoryPathParams
  >(
    (paramsInPath: StoredFileGetReplacementHistoryPathParams) =>
      `/api/StoredFile/StoredFile/${paramsInPath.fileId}/ReplacementHistory`,
    { pathParams: { fileId }, ...props }
  );
