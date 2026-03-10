import { createAction } from 'redux-actions';
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
export const loadSuccessAction = createAction<IComponentLoadSuccessPayload, IComponentLoadSuccessPayload>(
  ConfigurableComponentActionEnums.LoadSuccess,
  (p) => p,
);
export const loadErrorAction = createAction<IComponentLoadErrorPayload, IComponentLoadErrorPayload>(
  ConfigurableComponentActionEnums.LoadError,
  (p) => p,
);

export const saveRequestAction = createAction(ConfigurableComponentActionEnums.SaveRequest);
export const saveSuccessAction = createAction<IComponentSaveSuccessPayload, IComponentSaveSuccessPayload>(
  ConfigurableComponentActionEnums.SaveSuccess,
  (p) => p,
);
export const saveErrorAction = createAction<IComponentSaveErrorPayload, IComponentSaveErrorPayload>(
  ConfigurableComponentActionEnums.SaveError,
  (p) => p,
);

/* NEW_ACTION_GOES_HERE */
