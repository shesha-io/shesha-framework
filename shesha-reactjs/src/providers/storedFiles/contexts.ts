import { createContext } from 'react';
import { IFlagsSetters, IFlagsState } from '@/interfaces';
import { UploadFile } from 'antd/lib/upload/interface';

export type IFlagProgressFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'dowloadZip'
  | 'fetchFileList'
  | 'downloadZip'; /* NEW_IN_PROGRESS_FLAG_GOES_HERE */
export type IFlagSucceededFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'dowloadZip'
  | 'fetchFileList'
  | 'downloadZip'; /* NEW_SUCCEEDED_FLAG_GOES_HERE */
export type IFlagErrorFlags =
  | 'downloadFile'
  | 'uploadFile'
  | 'deleteFile'
  | 'dowloadZip'
  | 'fetchFileList'
  | 'downloadZip'; /* NEW_ERROR_FLAG_GOES_HERE */
export type IFlagActionedFlags = '__DEFAULT__'; /* NEW_ACTIONED_FLAG_GOES_HERE */

export interface IStoredFile extends UploadFile {
  error?: string | null;
  id?: string | null;
  fileCategory?: string | null;
  url?: string | null;
  temporary?: boolean;
}

export interface IRequestFilePayload {
  file: File;
  ownerId?: string;
  ownerType?: string;
  ownerName?: string;
}

export interface IUploadFilePayload extends IRequestFilePayload {}

export interface IDownloadZipPayload extends IRequestFilePayload {}

export interface IDownloadFilePayload {
  fileId: string;
  versionNo?: number;
  fileName: string;
}

export interface IStoredFilesStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  fileList?: IStoredFile[];
  newFile?: IStoredFile;
  fileIdToDelete?: string;
  url?: string;
}

export interface IStoredFilesActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  // downloadFileRequest: () => void
  // downloadFileSuccess: () => void
  // downloadFileError: () => void
  uploadFile: (payload: IUploadFilePayload) => void;
  deleteFile: (fileIdToDelete: string) => void;
  // dowloadZipFiles: () => void
  // dowloadZipSuccess: () => void
  // dowloadZipError: () => void
  // fetchFileListRequest: () => void
  // fetchFileListError: () => void
  downloadZipFile: (payload?: IDownloadZipPayload) => void;
  downloadFile: (payload: IDownloadFilePayload) => void;
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const STORED_FILES_CONTEXT_INITIAL_STATE: IStoredFilesStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
  fileList: [],
};

export const StoredFilesStateContext = createContext<IStoredFilesStateContext>(STORED_FILES_CONTEXT_INITIAL_STATE);

export const StoredFilesActionsContext = createContext<IStoredFilesActionsContext>(undefined);
