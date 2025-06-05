import { FormIdentifier, IDictionary, IErrorInfo, IToolboxComponentGroup } from '@/interfaces';
import { IRouter } from '../shaRouting';
import { ThemeProviderProps } from '../theme';
import { DEFAULT_SHESHA_ROUTES, IHttpHeadersDictionary, ISheshaRoutes } from './contexts';
import IRequestHeaders from '@/interfaces/requestHeaders';
import React, { MutableRefObject } from 'react';
import { createNamedContext } from '@/utils/react';
import { FRONTEND_DEFAULT_APP_KEY } from '@/components/settingsEditor/provider/models';
import { IAuthProviderRefProps } from '../auth';
import { FRONT_END_APP_HEADER_NAME } from './models';

export interface IShaApplicationArgs {
  backendUrl: string;
  /**
   * Unique identifier (key) of the front-end application, is used to separate some settings and application parts when use multiple front-ends
   */
  applicationKey?: string;
  applicationName?: string;
  accessTokenName?: string;

  themeProps?: ThemeProviderProps;

  router?: IRouter;
  routes?: ISheshaRoutes;
  getFormUrlFunc?: (formId: FormIdentifier) => string;
  authorizer: MutableRefObject<IAuthProviderRefProps>;
  buildHttpRequestHeaders?: () => IHttpHeadersDictionary;
}

export type InitializationAction = (application: ISheshaApplicationInstance) => Promise<void>;

export interface ISheshaApplicationInstance {
  backendUrl: string;
  httpHeaders: IHttpHeadersDictionary;
  setRequestHeaders: (headers: IRequestHeaders) => void;

  applicationKey?: string;
  applicationName?: string;

  routes: ISheshaRoutes;

  globalVariables: Record<string, any>;
  setGlobalVariables?: (values: Record<string, any>) => void;

  formDesignerComponentGroups: IToolboxComponentGroup[];
  formDesignerComponentRegistrations: IDictionary<IToolboxComponentGroup[]>;
  registerFormDesignerComponents: (owner: string, components: IToolboxComponentGroup[]) => void;

  anyOfPermissionsGranted: (permissions: string[]) => boolean;

  init: () => Promise<void>;
  initializationState: ApplicationInitializationState;
  registerInitialization: (uid: string, action: InitializationAction) => void;
  buildHttpRequestHeaders?: () => IHttpHeadersDictionary;
}

type RerenderTrigger = () => void;

export type AppInitializationStatus = 'waiting' | 'inprogress' | 'ready' | 'failed';
export interface ApplicationInitializationState {
  status: AppInitializationStatus;
  hint?: string;
  error?: IErrorInfo;
}

export class SheshaApplicationInstance implements ISheshaApplicationInstance {
  #initializationState: ApplicationInitializationState;
  #backendUrl: string;
  #httpHeaders: IHttpHeadersDictionary;
  #applicationKey?: string;
  #applicationName?: string;
  #routes?: ISheshaRoutes;
  #getFormUrlFunc?: (formId: FormIdentifier) => string;
  #buildHttpRequestHeaders?: () => IHttpHeadersDictionary;
  #authorizer: MutableRefObject<IAuthProviderRefProps>;
  #formDesignerComponentRegistrations: IDictionary<IToolboxComponentGroup[]>;
  #formDesignerComponentGroups?: IToolboxComponentGroup[];
  #globalVariables: Record<string, any>;
  #rerender: RerenderTrigger;

  get backendUrl() {
    return this.#backendUrl;
  }
  get applicationKey() {
    return this.#applicationKey;
  }
  get applicationName() {
    return this.#applicationName;
  }
  get getFormUrlFunc() {
    return this.#getFormUrlFunc;
  }
  get formDesignerComponentGroups() {
    return this.#formDesignerComponentGroups;
  }

  get formDesignerComponentRegistrations() {
    return this.#formDesignerComponentRegistrations;
  }

  get routes() {
    return this.#routes;
  }

  get httpHeaders() {
    return this.#httpHeaders;
  }

  get buildHttpRequestHeaders() {
    return this.#buildHttpRequestHeaders;
  }

  constructor(args: IShaApplicationArgs, forceRootUpdate: RerenderTrigger) {
    this.#initializationState = {
      status: 'waiting',
    };
    this.#backendUrl = args.backendUrl;
    this.#applicationKey = args.applicationKey ?? FRONTEND_DEFAULT_APP_KEY;
    this.#applicationName = args.applicationName;
    this.#routes = args.routes ?? DEFAULT_SHESHA_ROUTES;
    this.#getFormUrlFunc = args.getFormUrlFunc;
    this.#buildHttpRequestHeaders = args.buildHttpRequestHeaders;
    this.#formDesignerComponentRegistrations = {};
    this.#formDesignerComponentGroups = [];

    this.#authorizer = args.authorizer;

    this.#globalVariables = {};
    this.#httpHeaders = { [FRONT_END_APP_HEADER_NAME]: this.#applicationKey };

    this.#rerender = forceRootUpdate;
  }

  #initializationActions: Record<string, InitializationAction> = {};
  registerInitialization = (uid: string, action: InitializationAction) => {
    this.#initializationActions[uid] = action;
  };

  get initializationState() {
    return this.#initializationState;
  }
  init = async (): Promise<void> => {
    this.#initializationState = { status: 'inprogress', hint: 'Initializing...', error: undefined };
    this.#rerender();

    try {
      // do initialization actions...
      // wait all dependencies
      for (const uid in this.#initializationActions) {
        if (!this.#initializationActions[uid]) continue;
        const action = this.#initializationActions[uid];
        await action(this);
      }

      this.#initializationState = { status: 'ready', hint: undefined };
      this.#rerender();
    } catch (error) {
      console.error('Application initialization failed', error);
      this.#initializationState = { status: 'failed', error: error as IErrorInfo };
      this.#rerender();
    }
  };

  setRequestHeaders = (headers: IRequestHeaders) => {
    this.#httpHeaders = {
      ...this.#httpHeaders,
      ...this.#buildHttpRequestHeaders?.(),
      ...headers,
      [FRONT_END_APP_HEADER_NAME]: this.#applicationKey,
    };
    this.#rerender();
  };

  get globalVariables() {
    return this.#globalVariables;
  }
  setGlobalVariables = (values: Record<string, any>) => {
    this.#globalVariables = { ...(this.#globalVariables || {}), ...values };
    this.#rerender();
  };

  anyOfPermissionsGranted = (permissions: string[]) => {
    if (permissions?.length === 0) return true;

    const authorizer = this.#authorizer?.current?.anyOfPermissionsGranted;
    return authorizer && authorizer(permissions);
  };

  registerFormDesignerComponents = (owner: string, components: IToolboxComponentGroup[]) => {
    const registrations = { ...this.#formDesignerComponentRegistrations, [owner]: components };
    const componentGroups: IToolboxComponentGroup[] = [];
    for (const key in registrations) {
      if (registrations.hasOwnProperty(key) && registrations[key]) componentGroups.push(...registrations[key]);
    }
    this.#formDesignerComponentRegistrations = registrations;
    this.#formDesignerComponentGroups = componentGroups;
    this.#rerender();
  };
}

export const useSheshaApplicationInstance = (args: IShaApplicationArgs): ISheshaApplicationInstance => {
  const appRef = React.useRef<ISheshaApplicationInstance>();
  const [, forceUpdate] = React.useState({});

  if (!appRef.current) {
    const forceReRender = () => {
      forceUpdate({});
    };

    const instance = new SheshaApplicationInstance(args, forceReRender);

    appRef.current = instance;
  }

  return appRef.current;
};

export const SheshaApplicationInstanceContext = createNamedContext<ISheshaApplicationInstance>(
  undefined,
  'SheshaApplicationInstanceContext'
);
