import { createAction } from 'redux-actions';
import { IStoredFile, IStoredFileStateContext } from './contexts';

export enum StoredFileActionEnums {
  DownloadFileRequest = 'DOWNLOAD_FILE_REQUEST',
  DownloadFileSuccess = 'DOWNLOAD_FILE_SUCCESS',
  DownloadFileError = 'DOWNLOAD_FILE_ERROR',
  UploadFileRequest = 'UPLOAD_FILE_REQUEST',
  UploadFileSuccess = 'UPLOAD_FILE_SUCCESS',
  UploadFileError = 'UPLOAD_FILE_ERROR',
  DeleteFileRequest = 'DELETE_FILE_REQUEST',
  DeleteFileSuccess = 'DELETE_FILE_SUCCESS',
  DeleteFileError = 'DELETE_FILE_ERROR',

  FetchFileInfoRequest = 'FETCH_FILE_INFO_REQUEST',
  FetchFileInfoSuccess = 'FETCH_FILE_INFO_SUCCESS',
  FetchFileInfoError = 'FETCH_FILE_INFO_ERROR',
  FileViewRequest = 'FILE_VIEW_REQUEST',
  FileViewSuccess = 'FILE_VIEW_SUCCESS',
  FileViewError = 'FILE_VIEW_ERROR',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const downloadFileRequestAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.DownloadFileRequest,
  () => ({}),
);
export const downloadFileSuccessAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.DownloadFileSuccess,
  () => ({}),
);
export const downloadFileErrorAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.DownloadFileError,
  () => ({}),
);

export const uploadFileRequestAction = createAction<IStoredFileStateContext, IStoredFile>(
  StoredFileActionEnums.UploadFileRequest,
  (fileInfo) => ({ fileInfo }),
);
export const uploadFileSuccessAction = createAction<IStoredFileStateContext, IStoredFile>(
  StoredFileActionEnums.UploadFileSuccess,
  (fileInfo) => ({ fileInfo }),
);
export const uploadFileErrorAction = createAction<IStoredFileStateContext, IStoredFile>(
  StoredFileActionEnums.UploadFileError,
  (fileInfo) => ({ fileInfo }),
);

export const deleteFileRequestAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.DeleteFileRequest,
  () => ({}),
);

export const deleteFileSuccessAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.DeleteFileSuccess,
  () => ({}),
);
export const deleteFileErrorAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.DeleteFileError,
  () => ({}),
);

export const fetchFileInfoRequestAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.FetchFileInfoRequest,
  () => ({}),
);
export const fetchFileInfoSuccessAction = createAction<IStoredFileStateContext, IStoredFile>(
  StoredFileActionEnums.FetchFileInfoSuccess,
  (fileInfo) => ({ fileInfo }),
);
export const fetchFileInfoErrorAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.FetchFileInfoError,
  () => ({}),
);
export const fileViewRequestAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.FileViewRequest,
  () => ({}),
);
export const fileViewSuccessAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.FileViewSuccess,
  () => ({}),
);

export const fileViewErrorAction = createAction<IStoredFileStateContext>(
  StoredFileActionEnums.FileViewError,
  () => ({}),
);

/* NEW_ACTION_GOES_HERE */
