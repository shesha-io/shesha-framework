import { createContext } from 'react';
import { IFlagsState, IFlagsSetters } from 'models';
import { BackupDataDto } from 'api/maintenance';

export type IFlagProgressFlags =
  | 'getBackupData'
  | 'getBackup'
  | 'getRestore'
  | 'getDelete' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags =
  | 'getBackupData'
  | 'getBackup'
  | 'getRestore'
  | 'getDelete' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = 'getBackupData' | 'getBackup' | 'getRestore' | 'getDelete' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface IBackupDataStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  readonly backupData?: BackupDataDto;
  readonly backupResponse?: BackupDataDto;
  readonly restoreResponse?: BackupDataDto;
  readonly deleteResponse?: BackupDataDto;
}

export interface IBackupDataActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  getBackupData: () => void;
  getBackup: (filename) => void;
  getRestore: (filename) => void;
  getDelete: (filename) => void;
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const BACKUP_CONTEXT_INITIAL_STATE: IBackupDataStateContext = {
  backupData: { backupPath: '' },
  backupResponse: { backupPath: '' },
  restoreResponse: { backupPath: '' },
  deleteResponse: { backupPath: '' },
};

export const BackupDataStateContext = createContext<IBackupDataStateContext>(BACKUP_CONTEXT_INITIAL_STATE);

export const BackupDataActionsContext = createContext<IBackupDataActionsContext>(undefined);
