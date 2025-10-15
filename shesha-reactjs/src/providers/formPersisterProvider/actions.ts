import { IErrorInfo } from '@/interfaces/errorInfo';
import { IFlatComponentsStructure, IFormSettings } from '../form/models';
import { ILoadRequestPayload } from './contexts';
import { UpToDateForm } from '../formManager/interfaces';
import { createAction } from '@reduxjs/toolkit';

export enum FormPersisterActionEnums {
  Reset = 'RESET',
  SaveRequest = 'SAVE_REQUEST',
  SaveSuccess = 'SAVE_SUCCESS',
  SaveError = 'SAVE_ERROR',

  LoadRequest = 'LOAD_REQUEST',
  LoadSuccess = 'LOAD_SUCCESS',
  LoadError = 'LOAD_ERROR',
  ChangeMarkup = 'CHANGE_MARKUP',

  UpdateFormSettings = 'UPDATE_FORM_SETTINGS',
}

export const resetAction = createAction(FormPersisterActionEnums.Reset);
export const loadRequestAction = createAction<ILoadRequestPayload>(FormPersisterActionEnums.LoadRequest);
export const loadSuccessAction = createAction<UpToDateForm>(FormPersisterActionEnums.LoadSuccess);
export const loadErrorAction = createAction<IErrorInfo>(FormPersisterActionEnums.LoadError);
export const changeMarkupAction = createAction<IFlatComponentsStructure>(FormPersisterActionEnums.ChangeMarkup);

export const saveRequestAction = createAction(FormPersisterActionEnums.SaveRequest);
export const saveSuccessAction = createAction(FormPersisterActionEnums.SaveSuccess);
export const saveErrorAction = createAction<IErrorInfo>(FormPersisterActionEnums.SaveError);

export const updateFormSettingsAction = createAction<IFormSettings>(FormPersisterActionEnums.UpdateFormSettings);
