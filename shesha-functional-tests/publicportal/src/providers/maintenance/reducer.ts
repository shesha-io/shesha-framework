import { BackupDataActionEnums } from './actions';
import flagsReducer from '../utils/flagsReducer';
import { IBackupDataStateContext } from './context';

export function backupDataReducer(
  incomingState: IBackupDataStateContext,
  action: ReduxActions.Action<IBackupDataStateContext>
): IBackupDataStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case BackupDataActionEnums.GetBackupDataRequest:
    case BackupDataActionEnums.GetBackupDataSuccess:
    case BackupDataActionEnums.GetBackupDataError:
    case BackupDataActionEnums.GetBackupRequest:
    case BackupDataActionEnums.GetBackupSuccess:
    case BackupDataActionEnums.GetBackupError:
    case BackupDataActionEnums.GetRestoreRequest:
    case BackupDataActionEnums.GetRestoreSuccess:
    case BackupDataActionEnums.GetRestoreError:
    case BackupDataActionEnums.GetDeleteRequest:
    case BackupDataActionEnums.GetDeleteSuccess:
    case BackupDataActionEnums.GetDeleteError:
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    default: {
      return state;
    }
  }
}
