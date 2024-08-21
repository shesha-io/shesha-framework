import IRequestHeaders from '@/interfaces/requestHeaders';
import { IDictionary, IPersistedFormProps, IToolboxComponentGroup } from '@/interfaces';
import { createNamedContext } from '@/utils/react';
import { HEADER_CONFIGURATION } from '@/components/mainLayout/constant';

export interface ISheshaRutes {
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
  routes: ISheshaRutes;
  globalVariables?: { [key in string]: any };
  formDesignerComponentRegistrations: IDictionary<IToolboxComponentGroup[]>;
  headerConfiguration?: IPersistedFormProps;
}

export const DEFAULT_SHESHA_ROUTES: ISheshaRutes = {
  formsDesigner: '/shesha/forms-designer',
};

export const SHESHA_APPLICATION_CONTEXT_INITIAL_STATE: ISheshaApplicationStateContext = {
  backendUrl: '',
  httpHeaders: {},
  formDesignerComponentGroups: [],
  routes: DEFAULT_SHESHA_ROUTES,
  formDesignerComponentRegistrations: {},
  headerConfiguration: { name: HEADER_CONFIGURATION.name, module: HEADER_CONFIGURATION.module },
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
  'SheshaApplicationStateContext'
);

export const SheshaApplicationActionsContext = createNamedContext<ISheshaApplicationActionsContext | undefined>(
  undefined,
  'SheshaApplicationActionsContext'
);
