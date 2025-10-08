import flagsReducer from '../utils/flagsReducer';
import { StoredFileActionEnums } from './actions';
import { IStoredFileStateContext } from './contexts';

export function storedFilesReducer(
  incomingState: IStoredFileStateContext,
  action: ReduxActions.Action<IStoredFileStateContext>,
): IStoredFileStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case StoredFileActionEnums.DownloadFileRequest:
    case StoredFileActionEnums.DownloadFileSuccess:
    case StoredFileActionEnums.DownloadFileError:
    case StoredFileActionEnums.FetchFileInfoSuccess:
    case StoredFileActionEnums.DeleteFileRequest:
    case StoredFileActionEnums.FetchFileInfoRequest:
    case StoredFileActionEnums.FetchFileInfoError:
    case StoredFileActionEnums.UploadFileRequest:
    case StoredFileActionEnums.UploadFileError:
    case StoredFileActionEnums.UploadFileSuccess:
    case StoredFileActionEnums.UploadFileError:
    case StoredFileActionEnums.FileViewRequest:
    case StoredFileActionEnums.FileViewSuccess:
    case StoredFileActionEnums.FileViewError:
    /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    case StoredFileActionEnums.DeleteFileSuccess:
      return {
        ...state,
        fileInfo: null,
      };
    case StoredFileActionEnums.DeleteFileError: {
      if (state.fileInfo?.status === 'error')
        return {
          ...state,
          fileInfo: null,
        };

      return state;
    }
    default: {
      return state;
    }
  }
}
