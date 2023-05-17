import { createAction } from 'redux-actions';
import { IBackupDataStateContext } from './context';
import { BackupDataDto } from 'api/maintenance';

export enum BackupDataActionEnums {
  GetBackupDataRequest = 'GET_BACKUP_DATA_REQUEST',
  GetBackupDataSuccess = 'GET_BACKUP_DATA_SUCCESS',
  GetBackupDataError = 'GET_BACkUP_DATA_ERROR',

  GetBackupRequest = 'GET_BACKUP_REQUEST',
  GetBackupSuccess = 'GET_BACKUP_SUCCESS',
  GetBackupError = 'GET_BACkUP_ERROR',

  GetRestoreRequest = 'GET_RESTORE_REQUEST',
  GetRestoreSuccess = 'GET_RESTORE_SUCCESS',
  GetRestoreError = 'GET_RESTORE_ERROR',

  GetDeleteRequest = 'GET_DELETE_REQUEST',
  GetDeleteSuccess = 'GET_DELETE_SUCCESS',
  GetDeleteError = 'GET_DELETE_ERROR',

  /* NEW_ACTION_TYPE_GOES_HERE */
}
export const getBackupDataRequestAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetBackupDataRequest,
  () => ({})
);

export const getBackupDataSuccessAction = createAction<IBackupDataStateContext, BackupDataDto>(
  BackupDataActionEnums.GetBackupDataSuccess,
  backupData => ({ backupData })
);

export const getBackupDataErrorAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetBackupDataError,
  () => ({})
);

//-------

export const getBackupRequestAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetBackupRequest,
  () => ({})
);

export const getBackupSuccessAction = createAction<IBackupDataStateContext, BackupDataDto>(
  BackupDataActionEnums.GetBackupSuccess,
  backupResponse => ({ backupResponse })
);

export const getBackupErrorAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetBackupError,
  () => ({})
);

//-------

export const getRestoreRequestAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetRestoreRequest,
  () => ({})
);

export const getRestoreSuccessAction = createAction<IBackupDataStateContext, BackupDataDto>(
  BackupDataActionEnums.GetRestoreSuccess,
  restoreResponse => ({ restoreResponse })
);

export const getRestoreErrorAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetRestoreError,
  () => ({})
);

//-------

export const getDeleteRequestAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetDeleteRequest,
  () => ({})
);

export const getDeleteSuccessAction = createAction<IBackupDataStateContext, BackupDataDto>(
  BackupDataActionEnums.GetDeleteSuccess,
  deleteResponse => ({ deleteResponse })
);

export const getDeleteErrorAction = createAction<IBackupDataStateContext>(
  BackupDataActionEnums.GetDeleteError,
  () => ({})
);

/* NEW_ACTION_GOES_HERE */
