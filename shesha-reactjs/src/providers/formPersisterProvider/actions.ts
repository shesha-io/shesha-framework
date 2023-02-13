import { createAction } from 'redux-actions';
import { IErrorInfo } from '../../interfaces/errorInfo';
import { IFlatComponentsStructure, IFormSettings } from '../form/models';
import {
  ILoadRequestPayload,
} from './contexts';
import { IPersistedFormProps } from './models';

export enum FormPersisterActionEnums {
  SaveRequest = 'SAVE_REQUEST',
  SaveSuccess = 'SAVE_SUCCESS',
  SaveError = 'SAVE_ERROR',

  LoadRequest = 'LOAD_REQUEST',
  LoadSuccess = 'LOAD_SUCCESS',
  LoadError = 'LOAD_ERROR',
  ChangeMarkup = 'CHANGE_MARKUP',

  UpdateFormSettings = 'UPDATE_FORM_SETTINGS',
}

export const loadRequestAction = createAction<ILoadRequestPayload, ILoadRequestPayload>(FormPersisterActionEnums.LoadRequest, p => p);
export const loadSuccessAction = createAction<IPersistedFormProps, IPersistedFormProps>(FormPersisterActionEnums.LoadSuccess, p => p);
export const loadErrorAction = createAction<IErrorInfo, IErrorInfo>(FormPersisterActionEnums.LoadError, p => p);
export const changeMarkupAction = createAction<IFlatComponentsStructure, IFlatComponentsStructure>(
  FormPersisterActionEnums.ChangeMarkup,
  p => p
);

export const saveRequestAction = createAction(FormPersisterActionEnums.SaveRequest, () => ({}));
export const saveSuccessAction = createAction(FormPersisterActionEnums.SaveSuccess, () => ({}));
export const saveErrorAction = createAction<IErrorInfo, IErrorInfo>(FormPersisterActionEnums.SaveError, p => p);

export const updateFormSettingsAction = createAction<IFormSettings, IFormSettings>(
  FormPersisterActionEnums.UpdateFormSettings,
  p => p
);