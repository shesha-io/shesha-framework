import { createAction } from 'redux-actions';
import { IStoredFile, IStoredFilesStateContext } from './contexts';

export enum StoredFilesActionEnums {
  DownloadFileRequest = 'DOWNLOAD_FILE_REQUEST',
  DownloadFileSuccess = 'DOWNLOAD_FILE_SUCCESS',
  DownloadFileError = 'DOWNLOAD_FILE_ERROR',
  UploadFileRequest = 'UPLOAD_FILE_REQUEST',
  UploadFileSuccess = 'UPLOAD_FILE_SUCCESS',
  UploadFileError = 'UPLOAD_FILE_ERROR',
  ReplaceFileRequest = 'REPLACE_FILE_REQUEST',
  ReplaceFileSuccess = 'REPLACE_FILE_SUCCESS',
  ReplaceFileError = 'REPLACE_FILE_ERROR',
  DeleteFileRequest = 'DELETE_FILE_REQUEST',
  DeleteFileSuccess = 'DELETE_FILE_SUCCESS',
  DeleteFileError = 'DELETE_FILE_ERROR',
  FetchFileListRequest = 'FETCH_FILE_LIST_REQUEST',
  FetchFileListSuccess = 'FETCH_FILE_LIST_SUCCESS',
  FetchFileListError = 'FETCH_FILE_LIST_ERROR',
  DownloadZipRequest = 'DOWNLOAD_ZIP_REQUEST',
  DownloadZipSuccess = 'DOWNLOAD_ZIP_SUCCESS',
  DownloadZipError = 'DOWNLOAD_ZIP_ERROR',
  OnFileAdded = 'ON_FILE_ADDED',
  OnFileDeleted = 'ON_FILE_REMOVED',
  InitializeFileList = 'INITIALIZE_FILE_LIST',
  UpdateIsDownloadedSuccess = 'UPDATE_IS_DOWNLOADED_SUCCESS',
  UpdateAllFilesDownloadedSuccess = 'UPDATE_ALL_FILES_DOWNLOADED_SUCCESS',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const downloadFileRequestAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadFileRequest,
  (): IStoredFilesStateContext => ({}),
);
export const downloadFileSuccessAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadFileSuccess,
  (): IStoredFilesStateContext => ({}),
);
export const downloadFileErrorAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadFileError,
  (): IStoredFilesStateContext => ({}),
);

export const uploadFileRequestAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.UploadFileRequest,
  (newFile: IStoredFile): { newFile: IStoredFile } => ({ newFile }),
);
export const uploadFileSuccessAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.UploadFileSuccess,
  (newFile: IStoredFile): { newFile: IStoredFile } => ({ newFile }),
);
export const uploadFileErrorAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.UploadFileError,
  (newFile: IStoredFile): { newFile: IStoredFile } => ({ newFile }),
);

export const replaceFileRequestAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.ReplaceFileRequest,
  (fileId: string): { fileId: string } => ({ fileId }),
);
export const replaceFileSuccessAction = createAction<IStoredFilesStateContext, { originalFileId: string; newFile: IStoredFile }>(
  StoredFilesActionEnums.ReplaceFileSuccess,
  (payload: { originalFileId: string; newFile: IStoredFile }): { originalFileId: string; newFile: IStoredFile } => payload,
);
export const replaceFileErrorAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.ReplaceFileError,
  (fileId: string): { fileId: string } => ({ fileId }),
);

export const deleteFileRequestAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.DeleteFileRequest,
  (fileIdToDelete: string): { fileId: string } => ({ fileId: fileIdToDelete }),
);

export const deleteFileSuccessAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.DeleteFileSuccess,
  (fileIdToDelete: string): { fileId: string } => ({ fileId: fileIdToDelete }),
);
export const deleteFileErrorAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.DeleteFileError,
  (fileIdToDelete: string): { fileId: string } => ({ fileId: fileIdToDelete }),
);

export const fetchFileListRequestAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.FetchFileListRequest,
  (): IStoredFilesStateContext => ({}),
);
export const fetchFileListSuccessAction = createAction<IStoredFilesStateContext, IStoredFile[]>(
  StoredFilesActionEnums.FetchFileListSuccess,
  (fileList: IStoredFile[]): { fileList: IStoredFile[] } => ({ fileList }),
);
export const fetchFileListErrorAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.FetchFileListError,
  (): IStoredFilesStateContext => ({}),
);

export const downloadZipRequestAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadZipRequest,
  (): IStoredFilesStateContext => ({}),
);
export const downloadZipSuccessAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadZipSuccess,
  (): IStoredFilesStateContext => ({}),
);
export const downloadZipErrorAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadZipError,
  (): IStoredFilesStateContext => ({}),
);

export const onFileAddedAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.OnFileAdded,
  (newFile: IStoredFile): { newFile: IStoredFile } => ({ newFile }),
);

export const onFileDeletedAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.OnFileDeleted,
  (fileIdToDelete: string): { fileId: string } => ({ fileId: fileIdToDelete }),
);

export const initializeFileListAction = createAction<IStoredFilesStateContext, IStoredFile[]>(
  StoredFilesActionEnums.InitializeFileList,
  (fileList: IStoredFile[]): { fileList: IStoredFile[] } => ({ fileList }),
);

export const updateIsDownloadedByCurrentUser = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.UpdateIsDownloadedSuccess,
  (fileId: string): { fileId: string } => ({ fileId }),
);

export const updateAllFilesDownloadedByCurrentUser = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.UpdateAllFilesDownloadedSuccess,
  (): IStoredFilesStateContext => ({}),
);

/* NEW_ACTION_GOES_HERE */
