import flagsReducer from '../utils/flagsReducer';
import { StoredFilesActionEnums } from './actions';
import { IStoredFilesStateContext } from './contexts';

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
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    case StoredFilesActionEnums.DeleteFileSuccess:
    case StoredFilesActionEnums.OnFileDeleted:
      return {
        ...state,
        fileList: state.fileList.filter(
          ({ id, uid }) => id !== payload.fileIdToDelete && uid !== payload.fileIdToDelete
        ),
      };
    case StoredFilesActionEnums.UploadFileRequest:
      return {
        ...state,
        fileList: [...state.fileList, payload.newFile],
      };
    case StoredFilesActionEnums.UploadFileSuccess: {
      const { fileList } = state;
      const { newFile } = payload;

      return {
        ...state,
        fileList: fileList.map((file) => {
          if (file.uid === newFile.uid) {
            return {
              ...newFile,
              uid: newFile.id, // We want to reset the uid to the id because we use it to delete the file
            };
          } else {
            return file;
          }
        }),
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
      if (state.fileList.find(x => x.uid === payload.fileIdToDelete)?.status === 'error')
        return {
          ...state,
          fileList: state.fileList.filter(
            ({ id, uid }) => id !== payload.fileIdToDelete && uid !== payload.fileIdToDelete
          ),
        };
      
      return state;
    }

    default: {
      return state;
    }
  }
}
