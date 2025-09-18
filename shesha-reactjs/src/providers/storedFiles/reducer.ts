import flagsReducer from '../utils/flagsReducer';
import { StoredFilesActionEnums } from './actions';
import { IStoredFilesStateContext } from './contexts';
import { removeFile, updateAllFilesDownloaded, updateDownloadedAFile, replaceFileByUid, addFileToList, findFile } from './utils';

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
    case StoredFilesActionEnums.DowloadZipRequest:
    case StoredFilesActionEnums.DowloadZipSuccess:
    case StoredFilesActionEnums.DeleteFileRequest:
    case StoredFilesActionEnums.DowloadZipError:
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
        fileList: removeFile(state.fileList, payload.fileId),
      };
    case StoredFilesActionEnums.UploadFileRequest:
      return {
        ...state,
        fileList: [...(state.fileList ?? []), payload.newFile],
      };
    case StoredFilesActionEnums.UploadFileSuccess: {
      const { fileList } = state;
      const { newFile } = payload;

      const updatedFile = {
        ...newFile,
        uid: newFile.id, // We want to reset the uid to the id because we use it to delete the file
      };

      return {
        ...state,
        fileList: replaceFileByUid(fileList, updatedFile),
      };
    }
    case StoredFilesActionEnums.OnFileAdded: {
      const { fileList } = state;
      const { newFile } = payload;

      return {
        ...state,
        fileList: addFileToList(fileList, newFile),
      };
    }
    case StoredFilesActionEnums.UploadFileError: {
      const { fileList } = state;
      const { newFile } = payload;

      return {
        ...state,
        fileList: replaceFileByUid(fileList, newFile),
      };
    }
    case StoredFilesActionEnums.DeleteFileError: {
      const errorFile = findFile(state.fileList, payload.fileId);
      if (errorFile?.status === 'error') {
        return {
          ...state,
          fileList: removeFile(state.fileList, payload.fileId),
        };
      }

      return state;
    }

    case StoredFilesActionEnums.UpdateIsDownloadedSuccess: {
      const { fileId } = payload;

      return {
        ...state,
        fileList: updateDownloadedAFile(state.fileList, fileId) || [],
      };
    }

    case StoredFilesActionEnums.UpdateAllFilesDownloadedSuccess: {
      return {
        ...state,
        fileList: updateAllFilesDownloaded(state.fileList) || [],
      };
    }

    default: {
      return state;
    }
  }
}
