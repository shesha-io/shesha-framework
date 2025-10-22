export interface IValidationErrorInfo {
  message?: string | null;
  members?: string | null;
}

export interface IErrorInfo {
  code?: number | null;
  message?: string | null;
  details?: string | null;
  validationErrors?: IValidationErrorInfo[] | null;
}

export interface IFlagsState<
  ProgressFlags extends string,
  SucceededFlags extends string,
  ErrorFlags extends string,
  ActionedFlags extends string,
> {
  readonly isInProgress?: { [key in ProgressFlags]?: boolean };
  readonly succeeded?: { [key in SucceededFlags]?: boolean };
  readonly error?: { [key in ErrorFlags]?: boolean | string | IErrorInfo };
  readonly actioned?: { [key in ActionedFlags]?: boolean };
}

export type IFlagProgressFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'fetchFileList'
  | 'downloadZip'; /* NEW_IN_PROGRESS_FLAG_GOES_HERE */
export type IFlagSucceededFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'fetchFileList'
  | 'downloadZip'; /* NEW_SUCCEEDED_FLAG_GOES_HERE */
export type IFlagErrorFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'fetchFileList'
  | 'downloadZip'; /* NEW_ERROR_FLAG_GOES_HERE */
export type IFlagActionedFlags = '__DEFAULT__'; /* NEW_ACTIONED_FLAG_GOES_HERE */

export type UploadFileStatus = 'error' | 'done' | 'uploading' | 'removed';

export interface UploadFile<T = any> {
    uid: string;
    size?: number;
    name: string;
    fileName?: string;
    lastModified?: number;
    lastModifiedDate?: Date;
    url?: string;
    status?: UploadFileStatus;
    percent?: number;
    thumbUrl?: string;
    response?: T;
    error?: any;
    linkProps?: any;
    type?: string;
    xhr?: T;
    preview?: string;
}

export interface IStoredFile extends UploadFile {
  error?: string | null;
  id?: string | null;
  fileCategory?: string | null;
  url?: string | null;
  temporary?: boolean;
  userHasDownloaded?: boolean;
}

export interface IFileListContextApi
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  fileList?: IStoredFile[];
  newFile?: IStoredFile;
  fileId?: string;
  url?: string;
}