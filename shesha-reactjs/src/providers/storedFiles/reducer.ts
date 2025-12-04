import flagsReducer from '../utils/flagsReducer';
import { StoredFilesActionEnums } from './actions';
import { IStoredFilesStateContext } from './contexts';
import { addFile, removeFile, updateAllFilesDownloaded, updateDownloadedAFile } from './utils';

export function storedFilesReducer(
  incomingState: IStoredFilesStateContext,
  action: ReduxActions.Action<IStoredFilesStateContext>
): IStoredFilesStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action) as IStoredFilesStateContext;

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case StoredFilesActionEnums.DownloadFileRequest:
    case StoredFilesActionEnums.DownloadFileSuccess:
    case StoredFilesActionEnums.DownloadFileError:
    case StoredFilesActionEnums.FetchFileListSuccess:
    case StoredFilesActionEnums.DeleteFileRequest:
    case StoredFilesActionEnums.FetchFileListRequest:
    case StoredFilesActionEnums.FetchFileListError:
    case StoredFilesActionEnums.DownloadZipRequest:
    case StoredFilesActionEnums.DownloadZipSuccess:
    case StoredFilesActionEnums.DownloadZipError:
    case StoredFilesActionEnums.InitializeFileList:
    case StoredFilesActionEnums.InitializeFileList:
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    case StoredFilesActionEnums.DeleteFileSuccess:
    case StoredFilesActionEnums.OnFileDeleted:
      return {
        ...state,
        fileList: removeFile( state.fileList, payload.fileId),
      };
    case StoredFilesActionEnums.UploadFileRequest:
      return {
        ...state,
        fileList: [...(state.fileList ?? []), payload.newFile],
      };
    case StoredFilesActionEnums.UploadFileSuccess: {
      const { fileList } = state;
      const { newFile } = payload;

      return {
        ...state,
        fileList: addFile(newFile, fileList),
      };
    }
    case StoredFilesActionEnums.OnFileAdded: {
      const { fileList } = state;
      const { newFile } = payload;

      const foundFile = fileList.find(({ id }) => id === newFile.id);

      if (foundFile) {
        return state;
      }

      return {
        ...state,
        fileList: [newFile, ...fileList],
      };
    }
    case StoredFilesActionEnums.UploadFileError: {
      const { fileList } = state;
      const { newFile } = payload;

      return {
        ...state,
        fileList: fileList.map((file) => {
          if (file.uid === newFile.uid) {
            return {
              ...newFile,
            };
          } else {
            return file;
          }
        }),
      };
    }
    case StoredFilesActionEnums.ReplaceFileRequest: {
      const fileList = state.fileList ?? [];
      const { fileId } = payload;

      return {
        ...state,
        fileList: fileList.map((file) => {
          if (file.id === fileId || file.uid === fileId) {
            return {
              ...file,
              status: 'uploading' as const,
            };
          }
          return file;
        }),
      };
    }
    case StoredFilesActionEnums.ReplaceFileSuccess: {
      const fileList = state.fileList ?? [];
      const { originalFileId, newFile } = payload;

      return {
        ...state,
        originalFileId,
        fileList: fileList.map((file) => {
          if (file.id === originalFileId || file.uid === originalFileId) {
            return {
              ...newFile,
              uid: newFile.id,
              status: 'done' as const,
            };
          }
          return file;
        }),
      };
    }
    case StoredFilesActionEnums.ReplaceFileError: {
      const fileList = state.fileList ?? [];
      const { fileId } = payload;

      return {
        ...state,
        fileList: fileList.map((file) => {
          if (file.id === fileId || file.uid === fileId) {
            return {
              ...file,
              status: 'error' as const,
            };
          }
          return file;
        }),
      };
    }
    case StoredFilesActionEnums.DeleteFileError: {
      if (state.fileList?.find(x => x.uid === payload.fileId || x.id === payload.fileId)?.status === 'error')
        return {
          ...state,
          fileList: state.fileList.filter(
            (x) => !(x.uid === payload.fileId && x.status === 'error')
          ),
        };

      return state;
    }

    case StoredFilesActionEnums.UpdateIsDownloadedSuccess: {
      const { fileId } = payload;

      return {
        ...state,
        fileList: updateDownloadedAFile(state.fileList, fileId) ?? state.fileList,
      };
    }

    case StoredFilesActionEnums.UpdateAllFilesDownloadedSuccess: {
      return {
        ...state,
        fileList: updateAllFilesDownloaded(state.fileList) ?? state.fileList,
      };
    }

    default: {
      return state;
    }
  }
}