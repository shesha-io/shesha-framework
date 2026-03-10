import { createAction } from 'redux-actions';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { CrudMode } from './models';

export enum CrudActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  SwitchMode = 'SWITCH_MODE',
  SetAllowEdit = 'SET_ALLOW_EDIT',
  SetAllowDelete = 'SET_ALLOW_DELETE',
  ResetErrors = 'RESET_ERRORS',
  SetInitialValuesLoading = 'SET_INITIAL_VALUES_LOADING',
  SetInitialValues = 'SET_INITIAL_VALUES',
  SetAutoSave = 'SET_AUTO_SAVE',
  SaveStarted = 'SAVE_STARTED',
  SaveFailed = 'SAVE_FAILED',
  SaveSuccess = 'SAVE_SUCCESS',
  DeleteStarted = 'DELETE_STARTED',
  DeleteFailed = 'DELETE_FAILED',
  DeleteSuccess = 'DELETE_SUCCESS',
}

/* NEW_ACTION_GOES_HERE */

export interface ISwitchModeActionPayload {
  mode: CrudMode;
  allowChangeMode: boolean;
}

export const switchModeAction = createAction<ISwitchModeActionPayload, ISwitchModeActionPayload>(
  CrudActionEnums.SwitchMode,
  (p) => p,
);

export const setAutoSaveAction = createAction<boolean, boolean>(CrudActionEnums.SetAutoSave, (p) => p);

export const setInitialValuesLoadingAction = createAction<boolean, boolean>(
  CrudActionEnums.SetInitialValuesLoading,
  (p) => p,
);

export const setInitialValuesAction = createAction<object, object>(CrudActionEnums.SetInitialValues, (p) => p);

export const setAllowEditAction = createAction<boolean, boolean>(CrudActionEnums.SetAllowEdit, (p) => p);

export const setAllowDeleteAction = createAction<boolean, boolean>(CrudActionEnums.SetAllowDelete, (p) => p);

export const resetErrorsAction = createAction<void, void>(CrudActionEnums.ResetErrors, (p) => p);

export const saveStartedAction = createAction<void, void>(CrudActionEnums.SaveStarted, (p) => p);

export const saveFailedAction = createAction<IErrorInfo, IErrorInfo>(CrudActionEnums.SaveFailed, (p) => p);

export const saveSuccessAction = createAction<void, void>(CrudActionEnums.SaveSuccess, (p) => p);

export const deleteStartedAction = createAction<void, void>(CrudActionEnums.DeleteStarted, (p) => p);

export const deleteFailedAction = createAction<IErrorInfo, IErrorInfo>(CrudActionEnums.DeleteFailed, (p) => p);

export const deleteSuccessAction = createAction<void, void>(CrudActionEnums.DeleteSuccess, (p) => p);
