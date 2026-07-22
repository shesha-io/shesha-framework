import {
  IActionExecutionContext,
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

export interface IArgumentsEvaluationContext /* extends GenericDictionary*/ {
  form?: IFormApi | undefined;
  application?: IApplicationApi | undefined;
}

// IActionExecutionContext
export interface IExecuteActionPayload<TResponse = unknown, TContext extends IArgumentsEvaluationContext = IArgumentsEvaluationContext> {
  actionConfiguration: IConfigurableActionConfiguration;
  argumentsEvaluationContext: TContext;
  success?: ((actionResponse: TResponse) => void) | undefined;
  fail?: ((error: unknown) => void) | undefined;
}

export interface IPrepareActionArgumentsPayload<TArguments extends ActionParametersDictionary = ActionParametersDictionary> {
  actionConfiguration: IConfigurableActionConfiguration<TArguments>;
  argumentsEvaluationContext: IArgumentsEvaluationContext;
}

export interface IRegisterActionPayload<TArguments extends object = object, TReponse = unknown, TExecutionContext extends IActionExecutionContext = IActionExecutionContext>
  extends IConfigurableActionDescriptor<TArguments, TReponse, TExecutionContext> {
  isPermament?: boolean | undefined;
}

export interface RegisterActionType {
  <TArguments extends object = object, TResponse = unknown, TExecutionContext extends IActionExecutionContext = IActionExecutionContext>(
    arg: IRegisterActionPayload<TArguments, TResponse, TExecutionContext>
  ): void;
}

export type ActionDynamicContextEvaluationHook = (actionConfig: IConfigurableActionConfiguration | undefined) => GenericDictionary;

export interface IConfigurableActionDispatcherActionsContext {
  getConfigurableAction: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments>;
  getConfigurableActionOrNull: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;
  getActions: () => IConfigurableActionGroupDictionary;
  registerAction: RegisterActionType;
  unregisterAction: (actionIdentifier: IConfigurableActionIdentifier) => void;
  prepareArguments: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IPrepareActionArgumentsPayload<TArguments>) => Promise<TArguments | undefined>;

  executeAction: <TContext extends IArgumentsEvaluationContext = IArgumentsEvaluationContext>(payload: IExecuteActionPayload<unknown, TContext>) => Promise<void>;
  useActionDynamicContext: ActionDynamicContextEvaluationHook;
}

export const ConfigurableActionDispatcherActionsContext = createNamedContext<IConfigurableActionDispatcherActionsContext | undefined>(undefined, "ConfigurableActionDispatcherActionsContext");
