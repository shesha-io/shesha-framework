import { createAction } from 'redux-actions';
import { IStoredFile, IStoredFilesStateContext } from './contexts';

export enum StoredFilesActionEnums {
  DownloadFileRequest = 'DOWNLOAD_FILE_REQUEST',
  DownloadFileSuccess = 'DOWNLOAD_FILE_SUCCESS',
  DownloadFileError = 'DOWNLOAD_FILE_ERROR',
  UploadFileRequest = 'UPLOAD_FILE_REQUEST',
  UploadFileSuccess = 'UPLOAD_FILE_SUCCESS',
  UploadFileError = 'UPLOAD_FILE_ERROR',
  DeleteFileRequest = 'DELETE_FILE_REQUEST',
  DeleteFileSuccess = 'DELETE_FILE_SUCCESS',
  DeleteFileError = 'DELETE_FILE_ERROR',
  DowloadZipRequest = 'DOWLOAD_ZIP_REQUEST',
  DowloadZipSuccess = 'DOWLOAD_ZIP_SUCCESS',
  DowloadZipError = 'DOWLOAD_ZIP_ERROR',
  FetchFileListRequest = 'FETCH_FILE_LIST_REQUEST',
  FetchFileListSuccess = 'FETCH_FILE_LIST_SUCCESS',
  FetchFileListError = 'FETCH_FILE_LIST_ERROR',
  DownloadZipRequest = 'DOWNLOAD_ZIP_REQUEST',
  DownloadZipSuccess = 'DOWNLOAD_ZIP_SUCCESS',
  DownloadZipError = 'DOWNLOAD_ZIP_ERROR',
  OnFileAdded = 'ON_FILE_ADDED',
  OnFileDeleted = 'ON_FILE_REMOVED',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const downloadFileRequestAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadFileRequest,
  () => ({})
);
export const downloadFileSuccessAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadFileSuccess,
  () => ({})
);
export const downloadFileErrorAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadFileError,
  () => ({})
);

export const uploadFileRequestAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.UploadFileRequest,
  (newFile) => ({ newFile })
);
export const uploadFileSuccessAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.UploadFileSuccess,
  (newFile) => ({ newFile })
);
export const uploadFileErrorAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.UploadFileError,
  (newFile) => ({ newFile })
);

export const deleteFileRequestAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.DeleteFileRequest,
  (fileIdToDelete) => ({ fileIdToDelete })
);

export const deleteFileSuccessAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.DeleteFileSuccess,
  (fileIdToDelete) => ({ fileIdToDelete })
);
export const deleteFileErrorAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.DeleteFileError,
  (fileIdToDelete) => ({ fileIdToDelete })
);

export const dowloadZipRequestAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DowloadZipRequest,
  () => ({})
);
export const dowloadZipSuccessAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DowloadZipSuccess,
  () => ({})
);
export const dowloadZipErrorAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DowloadZipError,
  () => ({})
);

export const fetchFileListRequestAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.FetchFileListRequest,
  () => ({})
);
export const fetchFileListSuccessAction = createAction<IStoredFilesStateContext, IStoredFile[]>(
  StoredFilesActionEnums.FetchFileListSuccess,
  (fileList) => ({ fileList })
);
export const fetchFileListErrorAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.FetchFileListError,
  () => ({})
);

export const downloadZipRequestAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadZipRequest,
  () => ({})
);
export const downloadZipSuccessAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadZipSuccess,
  () => ({})
);
export const downloadZipErrorAction = createAction<IStoredFilesStateContext>(
  StoredFilesActionEnums.DownloadZipError,
  () => ({})
);

export const onFileAddedAction = createAction<IStoredFilesStateContext, IStoredFile>(
  StoredFilesActionEnums.OnFileAdded,
  (newFile) => ({ newFile })
);

export const onFileDeletedAction = createAction<IStoredFilesStateContext, string>(
  StoredFilesActionEnums.OnFileDeleted,
  (fileIdToDelete) => ({ fileIdToDelete })
);

/* NEW_ACTION_GOES_HERE */
