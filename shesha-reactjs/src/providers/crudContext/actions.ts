import { IErrorInfo } from 'interfaces/errorInfo';
import { createAction } from 'redux-actions';
import { CrudMode } from './models';

export enum CrudActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  SwitchMode = 'SWITCH_MODE',
  SetAllowEdit = 'SET_ALLOW_EDIT',
  SetAllowDelete = 'SET_ALLOW_DELETE',
  SetLastError = 'SET_LAST_ERROR',
}

/* NEW_ACTION_GOES_HERE */

export const switchModeAction = createAction<CrudMode, CrudMode>(
  CrudActionEnums.SwitchMode,
  p => p
);

export const setIsReadonlyAction = createAction<boolean, boolean>(
  CrudActionEnums.SetAllowEdit,
  p => p
);

export const setAllowDeleteAction = createAction<boolean, boolean>(
  CrudActionEnums.SetAllowDelete,
  p => p
);

export const setLastErrorAction = createAction<IErrorInfo, IErrorInfo>(
  CrudActionEnums.SetLastError,
  p => p
);