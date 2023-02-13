import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import { BackupDataStateContext, BackupDataActionsContext, BACKUP_CONTEXT_INITIAL_STATE } from './context';
import { backupDataReducer } from './reducer';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  getBackupDataRequestAction,
  getBackupDataSuccessAction,
  getBackupDataErrorAction,
  getBackupRequestAction,
  getBackupSuccessAction,
  getBackupErrorAction,
  getRestoreRequestAction,
  getRestoreSuccessAction,
  getRestoreErrorAction,
  getDeleteRequestAction,
  getDeleteSuccessAction,
  getDeleteErrorAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import {
  useMaintenanceGetBackupData,
  useMaintenanceBackupDB,
  useMaintenanceRestoreDb,
  useMaintenanceDeleteBackup,
} from 'src/api/maintenance';

const MaintenanceProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [state, dispatch] = useReducer(backupDataReducer, BACKUP_CONTEXT_INITIAL_STATE);

  const {
    loading: isFetchingBackupData,
    data: backupDataResponse,
    error: backupDataError,
    refetch: fetchBackupDataHttp,
  } = useMaintenanceGetBackupData({
    lazy: true,
  });

  const {
    loading: isFetchingBackup,
    data: backupResponse,
    error: backupError,
    refetch: fetchBackupHttp,
  } = useMaintenanceBackupDB({
    lazy: true,
  });

  const {
    loading: isFetchingRestore,
    data: restoreResponse,
    error: restoreError,
    refetch: fetchRestoreHttp,
  } = useMaintenanceRestoreDb({
    lazy: true,
  });

  const {
    loading: isFetchingDelete,
    data: deleteResponse,
    error: deleteError,
    refetch: fetchDeleteHttp,
  } = useMaintenanceDeleteBackup({
    lazy: true,
  });

  useEffect(() => {
    if (backupDataResponse && !isFetchingBackupData && !backupDataError) {
      dispatch(getBackupDataSuccessAction(backupDataResponse.result));
    } else if (backupDataError) {
      dispatch(getBackupDataErrorAction());
    }
  }, [isFetchingBackupData]);

  useEffect(() => {
    if (backupResponse && !isFetchingBackup && !backupError) {
      dispatch(getBackupSuccessAction(backupResponse.result));
    } else if (backupError) {
      dispatch(getBackupErrorAction());
    }
  }, [isFetchingBackup]);

  useEffect(() => {
    if (restoreResponse && !isFetchingRestore && !restoreError) {
      dispatch(getRestoreSuccessAction(restoreResponse.result));
    } else if (restoreError) {
      dispatch(getRestoreErrorAction());
    }
  }, [isFetchingRestore]);

  useEffect(() => {
    if (deleteResponse && !isFetchingDelete && !deleteError) {
      dispatch(getDeleteSuccessAction(deleteResponse.result));
    } else if (deleteError) {
      dispatch(getDeleteErrorAction());
    }
  }, [isFetchingDelete]);

  const getBackupData = () => {
    dispatch(getBackupDataRequestAction());
    fetchBackupDataHttp();
  };

  const getBackup = (fileName: string) => {
    dispatch(getBackupRequestAction());
    fetchBackupHttp({ queryParams: { fileName } });
  };

  const getRestore = (fileName: string) => {
    dispatch(getRestoreRequestAction());
    fetchRestoreHttp({ queryParams: { fileName } });
  };

  const getDelete = (fileName: string) => {
    dispatch(getDeleteRequestAction());
    fetchDeleteHttp({ queryParams: { fileName } });
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <BackupDataStateContext.Provider value={state}>
      <BackupDataActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          getBackupData,
          getBackup,
          getRestore,
          getDelete,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </BackupDataActionsContext.Provider>
    </BackupDataStateContext.Provider>
  );
};

function useBackupDataState() {
  const context = useContext(BackupDataStateContext);

  if (context === undefined) {
    throw new Error('useBackupDataState must be used within a MaintenanceProvider');
  }

  return context;
}

function useBackupDataActions() {
  const context = useContext(BackupDataActionsContext);

  if (context === undefined) {
    throw new Error('useBackupDataActions must be used within a MaintenanceProvider');
  }

  return context;
}

function useBackupData() {
  return { ...useBackupDataState(), ...useBackupDataActions() };
}

export { MaintenanceProvider, useBackupDataState, useBackupDataActions, useBackupData };
