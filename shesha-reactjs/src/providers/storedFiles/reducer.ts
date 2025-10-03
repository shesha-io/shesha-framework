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
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    case StoredFilesActionEnums.DeleteFileSuccess:
    case StoredFilesActionEnums.OnFileDeleted:
      return {
        ...state,
        fileList: removeFile(payload.fileId, state.fileList),
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
    case StoredFilesActionEnums.DeleteFileError: {
      if (state.fileList?.some((x) => x.uid === payload.fileId && x.status === 'error'))
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
