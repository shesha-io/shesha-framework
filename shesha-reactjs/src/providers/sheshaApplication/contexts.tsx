import IRequestHeaders from '@/interfaces/requestHeaders';
import { IDictionary, IToolboxComponentGroup } from '@/interfaces';
import { createNamedContext } from '@/utils/react';

export interface ISheshaRoutes {
  formsDesigner: string;
}

export interface IHttpHeadersDictionary {
  [key: string]: string;
}

export interface ISheshaApplicationStateContext {
  applicationName?: string;
  applicationKey?: string;
  backendUrl: string;
  httpHeaders: IHttpHeadersDictionary;
  formDesignerComponentGroups?: IToolboxComponentGroup[];
  routes: ISheshaRoutes;
  globalVariables?: { [key in string]: any };
  formDesignerComponentRegistrations: IDictionary<IToolboxComponentGroup[]>;
}

export const DEFAULT_SHESHA_ROUTES: ISheshaRoutes = {
  formsDesigner: '/shesha/forms-designer',
};

export const SHESHA_APPLICATION_CONTEXT_INITIAL_STATE: ISheshaApplicationStateContext = {
  backendUrl: '',
  httpHeaders: {},
  formDesignerComponentGroups: [],
  routes: DEFAULT_SHESHA_ROUTES,
  formDesignerComponentRegistrations: {},
};

export interface ISheshaApplicationActionsContext {
  changeBackendUrl?: (backendUrl: string) => void;
  setRequestHeaders?: (headers: IRequestHeaders) => void;
  anyOfPermissionsGranted?: (permissions: string[]) => boolean;
  setGlobalVariables?: (values: { [x: string]: any }) => void;
  registerFormDesignerComponents: (owner: string, components: IToolboxComponentGroup[]) => void;
}

export type ISheshaApplication = ISheshaApplicationStateContext & ISheshaApplicationActionsContext;

export const DEFAULT_ACCESS_TOKEN_NAME = 'xDFcxiooPQxazdndDsdRSerWQPlincytLDCarcxVxv';

export const SheshaApplicationStateContext = createNamedContext<ISheshaApplicationStateContext>(
  SHESHA_APPLICATION_CONTEXT_INITIAL_STATE,
  'SheshaApplicationStateContext',
);

export const SheshaApplicationActionsContext = createNamedContext<ISheshaApplicationActionsContext | undefined>(
  undefined,
  'SheshaApplicationActionsContext',
);
