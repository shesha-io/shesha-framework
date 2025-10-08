import { createAction } from 'redux-actions';
import { ModelConfigurationDto } from '@/apis/modelConfigurations';
import { IErrorInfo } from '@/interfaces/errorInfo';

export enum ModelActionEnums {
  CreateNew = 'CREATE_NEW',

  ChangeModelId = 'CHANGE_MODEL',

  LoadRequest = 'LOAD_REQUEST',
  LoadSuccess = 'LOAD_SUCCESS',
  LoadError = 'LOAD_ERROR',

  SaveRequest = 'SAVE_REQUEST',
  SaveSuccess = 'SAVE_SUCCESS',
  SaveError = 'SAVE_ERROR',

  Cancel = 'CANCEL_ACTION',

  DeleteRequest = 'DELETE_REQUEST',
  DeleteSuccess = 'DELETE_SUCCESS',
  DeleteError = 'DELETE_ERROR',

  SetModelSettings = 'SET_MODEL_SETTINGS',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const createNewAction = createAction<ModelConfigurationDto, ModelConfigurationDto>(
  ModelActionEnums.CreateNew,
  (p) => p,
);

export const changeModelIdAction = createAction<string>(ModelActionEnums.ChangeModelId);

export const loadRequestAction = createAction(ModelActionEnums.LoadRequest);
export const loadSuccessAction = createAction<ModelConfigurationDto, ModelConfigurationDto>(
  ModelActionEnums.LoadSuccess,
  (p) => p,
);
export const loadErrorAction = createAction<IErrorInfo, IErrorInfo>(ModelActionEnums.LoadError, (p) => p);

export const saveRequestAction = createAction(ModelActionEnums.SaveRequest);
export const saveSuccessAction = createAction(ModelActionEnums.SaveSuccess);
export const saveErrorAction = createAction<IErrorInfo, IErrorInfo>(ModelActionEnums.SaveError, (p) => p);

export const cancelAction = createAction(ModelActionEnums.Cancel);

export const deleteRequestAction = createAction(ModelActionEnums.DeleteRequest);
export const deleteSuccessAction = createAction(ModelActionEnums.DeleteSuccess);
export const deleteErrorAction = createAction<IErrorInfo, IErrorInfo>(ModelActionEnums.DeleteError, (p) => p);

/* NEW_ACTION_GOES_HERE */
