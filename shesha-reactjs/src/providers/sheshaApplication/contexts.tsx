import { createContext } from 'react';
import { IToolboxComponentGroup } from '../..';
import IRequestHeaders from '../../interfaces/requestHeaders';

export interface ISheshaRutes {
  formsDesigner: string;
}

export interface ISheshaApplicationStateContext {
  applicationName?: string;
  applicationKey?: string;
  backendUrl: string;
  httpHeaders: { [key: string]: string };
  toolboxComponentGroups?: IToolboxComponentGroup[];
  routes: ISheshaRutes;
}

export const DEFAULT_SHESHA_ROUTES: ISheshaRutes = {
  formsDesigner: '/shesha/forms-designer',
};

export const SHESHA_APPLICATION_CONTEXT_INITIAL_STATE: ISheshaApplicationStateContext = {
  backendUrl: '',
  httpHeaders: {},
  toolboxComponentGroups: [],
  routes: DEFAULT_SHESHA_ROUTES,
};

export interface ISheshaApplicationActionsContext {
  changeBackendUrl?: (backendUrl: string) => void;
  setRequestHeaders?: (headers: IRequestHeaders) => void;
  anyOfPermissionsGranted?: (permissions: string[]) => boolean;
}

export const DEFAULT_ACCESS_TOKEN_NAME = 'xDFcxiooPQxazdndDsdRSerWQPlincytLDCarcxVxv';

export const SheshaApplicationStateContext = createContext<ISheshaApplicationStateContext>(
  SHESHA_APPLICATION_CONTEXT_INITIAL_STATE
);

export const SheshaApplicationActionsContext = createContext<ISheshaApplicationActionsContext | undefined>(undefined);
