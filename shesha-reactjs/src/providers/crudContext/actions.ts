import { createAction } from '@reduxjs/toolkit';
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

export const switchModeAction = createAction<ISwitchModeActionPayload>(CrudActionEnums.SwitchMode);

export const setAutoSaveAction = createAction<boolean>(CrudActionEnums.SetAutoSave);

export const setInitialValuesLoadingAction = createAction<boolean>(CrudActionEnums.SetInitialValuesLoading);

export const setInitialValuesAction = createAction<object>(CrudActionEnums.SetInitialValues);

export const setAllowEditAction = createAction<boolean>(CrudActionEnums.SetAllowEdit);

export const setAllowDeleteAction = createAction<boolean>(CrudActionEnums.SetAllowDelete);

export const resetErrorsAction = createAction<void>(CrudActionEnums.ResetErrors);

export const saveStartedAction = createAction<void>(CrudActionEnums.SaveStarted);

export const saveFailedAction = createAction<IErrorInfo>(CrudActionEnums.SaveFailed);

export const saveSuccessAction = createAction<void>(CrudActionEnums.SaveSuccess);

export const deleteStartedAction = createAction<void>(CrudActionEnums.DeleteStarted);

export const deleteFailedAction = createAction<IErrorInfo>(CrudActionEnums.DeleteFailed);

export const deleteSuccessAction = createAction<void>(CrudActionEnums.DeleteSuccess);
