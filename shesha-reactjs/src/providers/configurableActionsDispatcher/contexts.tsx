import { createContext } from 'react';
import {
  IConfigurableActionArguments,
  IConfigurableActionConfiguration,
  IConfigurableActionDescriptor,
  IConfigurableActionIdentifier,
} from '@/interfaces/configurableAction';
import { GenericDictionary } from '../form/models';
import { IConfigurableActionGroupDictionary } from './models';

export interface IConfigurableActionDispatcherStateContext {
  callers: string[];
}

export interface IGetConfigurableActionPayload {
  owner: string;
  name: string;
}



export interface IExecuteActionPayload {
  actionConfiguration: IConfigurableActionConfiguration;
  argumentsEvaluationContext: GenericDictionary;
  success?: (actionResponse: any) => void;
  fail?: (error: any) => void;
}

export interface IRegisterActionPayload<TArguments = IConfigurableActionArguments, TReponse = any>
  extends IConfigurableActionDescriptor<TArguments, TReponse> { }

export interface RegisterActionType {
  <TArguments = IConfigurableActionArguments, TResponse = any>(
    arg: IRegisterActionPayload<TArguments, TResponse>
  ): void;
}

export type ConfigurableActionExecuter = (payload: IExecuteActionPayload) => Promise<void>;

export interface IConfigurableActionDispatcherActionsContext {
  getConfigurableAction: (payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor;
  getConfigurableActionOrNull: (payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor | null;
  getActions: () => IConfigurableActionGroupDictionary;
  registerAction: RegisterActionType;
  unregisterAction: (actionIdentifier: IConfigurableActionIdentifier) => void;
  prepareArguments: (actionArguments: any) => void;
  executeAction: ConfigurableActionExecuter;
  getExecuting: (callerId: string) => boolean;
}

/** initial state */
export const CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE: IConfigurableActionDispatcherStateContext = {
  callers: [],

  //activeButton: [],
};

export const ConfigurableActionDispatcherStateContext = createContext<IConfigurableActionDispatcherStateContext>(
  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE
);

export const ConfigurableActionDispatcherActionsContext =
  createContext<IConfigurableActionDispatcherActionsContext>(undefined);
