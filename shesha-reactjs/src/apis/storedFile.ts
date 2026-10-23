import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';

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
    (paramsInPath) => {
      return `/api/StoredFile/StoredFile/${paramsInPath?.fileId}/Versions`;
    },
    { pathParams: { fileId }, ...props }
  );
