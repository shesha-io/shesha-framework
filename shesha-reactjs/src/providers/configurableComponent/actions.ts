import { createAction } from '@reduxjs/toolkit';
import {
  IComponentLoadErrorPayload,
  IComponentLoadSuccessPayload,
  IComponentSaveErrorPayload,
  IComponentSaveSuccessPayload,
} from './contexts';

export enum ConfigurableComponentActionEnums {
  SaveRequest = 'SAVE_REQUEST',
  SaveSuccess = 'SAVE_SUCCESS',
  SaveError = 'SAVE_ERROR',

  LoadRequest = 'LOAD_REQUEST',
  LoadSuccess = 'LOAD_SUCCESS',
  LoadError = 'LOAD_ERROR',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const loadRequestAction = createAction(ConfigurableComponentActionEnums.LoadRequest);
export const loadSuccessAction = createAction<IComponentLoadSuccessPayload>(ConfigurableComponentActionEnums.LoadSuccess);
export const loadErrorAction = createAction<IComponentLoadErrorPayload>(ConfigurableComponentActionEnums.LoadError);

export const saveRequestAction = createAction(ConfigurableComponentActionEnums.SaveRequest);
export const saveSuccessAction = createAction<IComponentSaveSuccessPayload>(ConfigurableComponentActionEnums.SaveSuccess);
export const saveErrorAction = createAction<IComponentSaveErrorPayload>(ConfigurableComponentActionEnums.SaveError);

/* NEW_ACTION_GOES_HERE */
