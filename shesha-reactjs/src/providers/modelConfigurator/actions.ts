import { createAction } from 'redux-actions';
import { ModelConfigurationDto, ErrorInfo } from '../../apis/modelConfigurations';

export enum ModelActionEnums {
  CreateNew = 'CREATE_NEW',

  ChangeModelId = 'CHANGE_MODEL',

  LoadRequest = 'LOAD_REQUEST',
  LoadSuccess = 'LOAD_SUCCESS',
  LoadError = 'LOAD_ERROR',
  
  SaveRequest = 'SAVE_REQUEST',
  SaveSuccess = 'SAVE_SUCCESS',
  SaveError = 'SAVE_ERROR',

  DeleteRequest = 'DELETE_REQUEST',
  DeleteSuccess = 'DELETE_SUCCESS',
  DeleteError = 'DELETE_ERROR',

  SetModelSettings = 'SET_MODEL_SETTINGS',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const createNewAction = createAction<ModelConfigurationDto, ModelConfigurationDto>(ModelActionEnums.CreateNew, p => p);

export const changeModelIdAction = createAction<string>(ModelActionEnums.ChangeModelId);

export const loadRequestAction = createAction(ModelActionEnums.LoadRequest);
export const loadSuccessAction = createAction<ModelConfigurationDto, ModelConfigurationDto>(ModelActionEnums.LoadSuccess, p => p);
export const loadErrorAction = createAction<ErrorInfo, ErrorInfo>(ModelActionEnums.LoadError, p => p);

export const saveRequestAction = createAction(ModelActionEnums.SaveRequest);
export const saveSuccessAction = createAction(ModelActionEnums.SaveSuccess);
export const saveErrorAction = createAction<ErrorInfo, ErrorInfo>(ModelActionEnums.SaveError, p => p);

export const deleteRequestAction = createAction(ModelActionEnums.DeleteRequest);
export const deleteSuccessAction = createAction(ModelActionEnums.DeleteSuccess);
export const deleteErrorAction = createAction<ErrorInfo, ErrorInfo>(ModelActionEnums.DeleteError, p => p);

/* NEW_ACTION_GOES_HERE */
