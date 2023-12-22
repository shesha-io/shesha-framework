import { createAction } from 'redux-actions';
import { IToolboxComponentGroup } from '@/interfaces';
import IRequestHeaders from '@/interfaces/requestHeaders';

export enum SheshaApplicationActionEnums {
  SetRequestHeaders = 'SET_REQUEST_HEADERS',
  SetBackendUrl = 'SET_BACKEND_URL',
  SetGlobalVariables = 'SET_GLOBAL_VARIABLES',
  SetSetToolboxComponents = 'SET_TOOLBOX_COMPONENTS',
  UpdateToolboxComponentGroups = 'UPDATE_TOOLBOX_COMPONENT_GROUPS',
}

export const setHeadersAction = createAction<IRequestHeaders, IRequestHeaders>(
  SheshaApplicationActionEnums.SetRequestHeaders,
  (p) => p
);

export const setBackendUrlAction = createAction<string, string>(SheshaApplicationActionEnums.SetBackendUrl, (p) => p);

export const setGlobalVariablesAction = createAction<{ [x: string]: any }, { [x: string]: any }>(
  SheshaApplicationActionEnums.SetGlobalVariables,
  (p) => p
);

export const updateToolboxComponentGroupsAction = createAction<IToolboxComponentGroup[], IToolboxComponentGroup[]>(
  SheshaApplicationActionEnums.UpdateToolboxComponentGroups,
  (p) => p
);
