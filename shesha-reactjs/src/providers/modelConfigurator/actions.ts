import { ModelConfigurationDto } from '@/apis/modelConfigurations';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { IPropertyErrors } from './contexts';
import { createAction } from '@reduxjs/toolkit';

export enum ModelActionEnums {
  LoadRequest = 'LOAD_REQUEST',
  LoadSuccess = 'LOAD_SUCCESS',
  LoadError = 'LOAD_ERROR',

  SaveRequest = 'SAVE_REQUEST',
  SaveSuccess = 'SAVE_SUCCESS',
  SaveError = 'SAVE_ERROR',

  SetErrors = 'SET_ERRORS',
  SetShowErrors = 'SET_SHOW_ERRORS',

  SetModelSettings = 'SET_MODEL_SETTINGS',

  SetModified = 'SET_MODIFIED',
}

export const loadRequestAction = createAction(ModelActionEnums.LoadRequest);
export const loadSuccessAction = createAction<ModelConfigurationDto>(ModelActionEnums.LoadSuccess);
export const loadErrorAction = createAction<IErrorInfo>(ModelActionEnums.LoadError);

export const saveRequestAction = createAction(ModelActionEnums.SaveRequest);
export const saveSuccessAction = createAction<ModelConfigurationDto>(ModelActionEnums.SaveSuccess);
export const saveErrorAction = createAction<IErrorInfo>(ModelActionEnums.SaveError);

export const setModifiedAction = createAction<boolean>(ModelActionEnums.SetModified);
export const setErrorsAction = createAction<(IPropertyErrors | string)[]>(ModelActionEnums.SetErrors);
export const setShowErrorsAction = createAction<boolean>(ModelActionEnums.SetShowErrors);
