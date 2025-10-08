import { createAction } from 'redux-actions';
import { IToolboxComponentGroup } from '@/interfaces';
import IRequestHeaders from '@/interfaces/requestHeaders';

export enum SheshaApplicationActionEnums {
  SetRequestHeaders = 'SET_REQUEST_HEADERS',
  SetBackendUrl = 'SET_BACKEND_URL',
  SetGlobalVariables = 'SET_GLOBAL_VARIABLES',
  RegisterFormDesignerComponents = 'REGISTER_FORM_DESIGNER_COMPONENTS',
}

export const setHeadersAction = createAction<IRequestHeaders, IRequestHeaders>(
  SheshaApplicationActionEnums.SetRequestHeaders,
  (p) => p,
);

export const setBackendUrlAction = createAction<string, string>(SheshaApplicationActionEnums.SetBackendUrl, (p) => p);

export const setGlobalVariablesAction = createAction<{ [x: string]: any }, { [x: string]: any }>(
  SheshaApplicationActionEnums.SetGlobalVariables,
  (p) => p,
);

export interface RegisterFormDesignerComponentsActionPayload {
  owner: string;
  components: IToolboxComponentGroup[];
}
export const registerFormDesignerComponentsAction = createAction<RegisterFormDesignerComponentsActionPayload, RegisterFormDesignerComponentsActionPayload>(
  SheshaApplicationActionEnums.RegisterFormDesignerComponents,
  (p) => p,
);
