import { createContext } from 'react';
import { IConfigurableActionArguments, IConfigurableActionConfiguration, IConfigurableActionDescriptor, IConfigurableActionIdentifier } from '../../interfaces/configurableAction';
import { GenericDictionary } from '../form/models';
import { IConfigurableActionGroupDictionary } from './models';

export interface IConfigurableActionDispatcherStateContext {
}

export interface IGetConfigurableActionPayload {
  owner: string;
  name: string;
}

export interface IExecuteActionPayload {
  actionConfiguration: IConfigurableActionConfiguration;
  argumentsEvaluationContext: GenericDictionary;
}

export interface IRegisterActionPayload<TArguments = IConfigurableActionArguments, TReponse = any> extends IConfigurableActionDescriptor<TArguments, TReponse> {
}

export interface RegisterActionType {
  <TArguments = IConfigurableActionArguments, TResponse = any>(arg: IRegisterActionPayload<TArguments, TResponse>): void;
}


export interface IConfigurableActionDispatcherActionsContext {
  getConfigurableAction: (payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor;
  getConfigurableActionOrNull: (payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor | null;
  getActions: () => IConfigurableActionGroupDictionary;
  registerAction: RegisterActionType;
  unregisterAction: (actionIdentifier: IConfigurableActionIdentifier) => void;
  prepareArguments: (actionArguments: any) => void;
  executeAction: (payload: IExecuteActionPayload) => Promise<void>;
}

/** initial state */
export const CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE: IConfigurableActionDispatcherStateContext = {
};

export const ConfigurableActionDispatcherStateContext = createContext<IConfigurableActionDispatcherStateContext>(CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE);

export const ConfigurableActionDispatcherActionsContext = createContext<IConfigurableActionDispatcherActionsContext>(undefined);