import {
  IConfigurableActionConfiguration,
  IConfigurableActionDescriptor,
  IConfigurableActionIdentifier,
} from '@/interfaces/configurableAction';
import { ActionParametersDictionary, GenericDictionary } from '../form/models';
import { IConfigurableActionGroupDictionary } from './models';
import { IApplicationApi } from '../sheshaApplication/publicApi';
import { IFormApi } from '../form/formApi';
import { createNamedContext } from '@/utils/react';

export interface IGetConfigurableActionPayload {
  owner: string;
  name: string;
}

export interface IArgumentsEvaluationContext extends GenericDictionary {
  form?: IFormApi;
  application?: IApplicationApi;
}

export interface IExecuteActionPayload<TResponse = unknown> {
  actionConfiguration: IConfigurableActionConfiguration;
  argumentsEvaluationContext: IArgumentsEvaluationContext;
  success?: ((actionResponse: TResponse) => void) | undefined;
  fail?: ((error: unknown) => void) | undefined;
}

export interface IPrepareActionArgumentsPayload<TArguments extends ActionParametersDictionary = ActionParametersDictionary> {
  actionConfiguration: IConfigurableActionConfiguration<TArguments>;
  argumentsEvaluationContext: IArgumentsEvaluationContext;
}

export interface IRegisterActionPayload<TArguments extends object = object, TReponse = unknown>
  extends IConfigurableActionDescriptor<TArguments, TReponse> {
  isPermament?: boolean;
}

export interface RegisterActionType {
  <TArguments extends object = object, TResponse = unknown>(
    arg: IRegisterActionPayload<TArguments, TResponse>
  ): void;
}

export type ConfigurableActionExecuter = (payload: IExecuteActionPayload) => Promise<void>;

export type ActionDynamicContextEvaluationHook = (actionConfig: IConfigurableActionConfiguration) => GenericDictionary;

export interface IConfigurableActionDispatcherActionsContext {
  getConfigurableAction: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments>;
  getConfigurableActionOrNull: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;
  getActions: () => IConfigurableActionGroupDictionary;
  registerAction: RegisterActionType;
  unregisterAction: (actionIdentifier: IConfigurableActionIdentifier) => void;
  prepareArguments: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IPrepareActionArgumentsPayload<TArguments>) => Promise<TArguments>;

  executeAction: ConfigurableActionExecuter;
  useActionDynamicContext: ActionDynamicContextEvaluationHook;
}

export const ConfigurableActionDispatcherActionsContext = createNamedContext<IConfigurableActionDispatcherActionsContext | undefined>(undefined, "ConfigurableActionDispatcherActionsContext");
