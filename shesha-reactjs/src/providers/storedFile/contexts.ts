import { UploadFile } from 'antd/lib/upload/interface';
import { createContext } from 'react';
import { IFlagsSetters, IFlagsState } from '@/interfaces';
import { StoredFileGetQueryParams } from '@/apis/storedFile';

export type IFlagProgressFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'dowloadZip'
  | 'fetchFileInfo' 
  | 'getStoredFile'
  /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'dowloadZip'
  | 'fetchFileInfo' 
  | 'getStoredFile'
  /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'dowloadZip'
  | 'fetchFileInfo' 
  | 'getStoredFile'
  /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

// Pick<UploadFile, "uid" | "status" | "name" | "size" | "type">
export interface IStoredFile extends UploadFile {
  error?: string | null;
  id?: string | null;
  url?: string | null;
  temporary?: boolean | null;
}

interface IRequestFilePayload {
  file: File;
  // ownerId?: string;
  // ownerType?: string;
  // propertyName?: string;
  // fileId?: string;
}

export interface IUploadFilePayload extends IRequestFilePayload {}

export interface IDownloadFilePayload {
  fileId: string;
  versionNo?: number;
  fileName: string;
}

export interface IStoredFileStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  fileInfo?: IStoredFile;
  fileId?: string;
}

export interface IStoredFileActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  downloadFile: (payload: IDownloadFilePayload) => void;
  downloadFileSuccess: () => void;
  downloadFileError: () => void;
  uploadFile: (payload: IUploadFilePayload, callback?: (...args: any) => any) => void;
  deleteFile: () => void;
  fetchFileInfo: () => void;
  fetchFileInfoError: () => void;
  getStoredFile: (payload: StoredFileGetQueryParams) => Promise<string | unknown>;

  //fetchFileInfoError: () => void;
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const STORED_FILE_CONTEXT_INITIAL_STATE: IStoredFileStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
};

export const StoredFileStateContext = createContext<IStoredFileStateContext>(STORED_FILE_CONTEXT_INITIAL_STATE);

export const StoredFileActionsContext = createContext<IStoredFileActionsContext>(undefined);
